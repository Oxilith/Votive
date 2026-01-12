# Kubernetes Deployment Guide

This guide covers local development with kind and production deployment to Azure AKS.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Local Development (kind)](#local-development-kind)
- [E2E Testing](#e2e-testing)
- [Secret Management](#secret-management)
- [Data Persistence](#data-persistence)
- [Production Deployment (Azure)](#production-deployment-azure)
- [Publishing Images to GHCR](#publishing-images-to-ghcr)
- [Windows Deployment Workflow](#windows-deployment-workflow)
- [Network Policies](#network-policies)
- [Troubleshooting](#troubleshooting)
- [Make Targets Reference](#make-targets-reference)
- [File Structure](#file-structure)

## Prerequisites

### Required Tools

| Tool | Purpose | Install (macOS) | Install (Windows) |
|------|---------|--------------------|-------------------|
| Docker | Container runtime | `brew install --cask docker` | Docker Desktop |
| kind | Local K8s cluster | `brew install kind` | `choco install kind` |
| kubectl | K8s CLI | `brew install kubernetes-cli` | `choco install kubernetes-cli` |
| helm | K8s package manager | `brew install helm` | `choco install kubernetes-helm` |
| sops | Secret encryption | `brew install sops` | `choco install sops` |
| age | Encryption backend | `brew install age` | `choco install age.portable` |
| mkcert | Local SSL certs | `brew install mkcert` | `choco install mkcert` |
| yq | YAML processor | `brew install yq` | `choco install yq` |
| az | Azure CLI | `brew install azure-cli` | `choco install azure-cli` |
| gh | GitHub CLI | `brew install gh` | `choco install gh` |

**macOS:**
```bash
# Install all at once
brew install kind kubernetes-cli helm sops age mkcert yq azure-cli gh
```

**Windows (PowerShell as Administrator):**
```powershell
# Install Chocolatey if not present
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install all tools
choco install docker-desktop kind kubernetes-cli kubernetes-helm sops age.portable mkcert yq azure-cli gh -y

# Restart PowerShell after installation
```

### SOPS/Age Setup (One-time)

**macOS/Linux:**
```bash
# Generate age key
mkdir -p ~/.config/sops/age
age-keygen -o ~/.config/sops/age/keys.txt

# Add to shell profile (~/.zshrc or ~/.bashrc)
echo 'export SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt' >> ~/.zshrc
source ~/.zshrc

# Update .sops.yaml with your public key (from keys.txt)
```

**Windows (PowerShell):**
```powershell
# Create directory for age keys
New-Item -ItemType Directory -Force -Path "$env:APPDATA\sops\age"

# Generate age key
age-keygen -o "$env:APPDATA\sops\age\keys.txt"

# View your public key (needed for .sops.yaml)
Get-Content "$env:APPDATA\sops\age\keys.txt"

# Set environment variable permanently
[Environment]::SetEnvironmentVariable("SOPS_AGE_KEY_FILE", "$env:APPDATA\sops\age\keys.txt", "User")

# Set for current session
$env:SOPS_AGE_KEY_FILE = "$env:APPDATA\sops\age\keys.txt"
```

**Sharing keys between machines:**
To decrypt secrets on a new machine, copy your age key file:
- macOS/Linux: `~/.config/sops/age/keys.txt`
- Windows: `%APPDATA%\sops\age\keys.txt`

> ⚠️ **Security**: Keep your age private key secure. Anyone with this key can decrypt your secrets.

### mkcert Setup (One-time)

**macOS/Linux:**
```bash
mkcert -install
mkdir -p certs && cd certs && mkcert localhost 127.0.0.1 ::1
```

**Windows (PowerShell as Administrator):**
```powershell
mkcert -install
New-Item -ItemType Directory -Force -Path certs
Set-Location certs
mkcert localhost 127.0.0.1 ::1
```

## Architecture Overview

### Kubernetes Services

```
┌─────────────────────────────────────────────────────────────────┐
│                        Ingress (NGINX)                          │
│                   votive.127.0.0.1.nip.io                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                           App (nginx)                            │
│                    Static files + API proxy                      │
│                                                                  │
│  /               → Static React app                              │
│  /api/           → backend:3001                                  │
│  /api/user-auth/ → prompt-service:3002                          │
│  /admin          → prompt-service:3002                          │
└─────────────────────────────────────────────────────────────────┘
          │                                      │
          ▼                                      ▼
┌──────────────────────┐              ┌──────────────────────┐
│       Backend        │              │   Prompt Service     │
│     (port 3001)      │─────────────►│     (port 3002)      │
│  Claude API proxy    │   /resolve   │  User auth, prompts  │
└──────────────────────┘              └──────────────────────┘
                                                 │
                                                 ▼
                                      ┌──────────────────────┐
                                      │     PostgreSQL       │
                                      │     (port 5432)      │
                                      └──────────────────────┘
                                                 ▲
                                                 │
                                      ┌──────────────────────┐
                                      │       Worker         │
                                      │   (CronJob - hourly) │
                                      │   Token cleanup      │
                                      └──────────────────────┘
```

### Environment Overlays

| Environment | Namespace | Purpose | Secrets |
|-------------|-----------|---------|---------|
| `dev` | votive-dev | Local development with kind | SOPS encrypted |
| `test` | votive-test | E2E testing with mocked Claude API | Plain YAML (mock values) |
| `prod` | votive-prod | Production on Azure AKS | SOPS encrypted |

### Docker Images

K8s deployments use dedicated `Dockerfile.k8s` variants (no dotenvx dependency):

| Service | Dockerfile | Image Name |
|---------|------------|------------|
| prompt-service | `prompt-service/Dockerfile.k8s` | `ghcr.io/oxilith/votive-prompt-service` |
| backend | `backend/Dockerfile.k8s` | `ghcr.io/oxilith/votive-backend` |
| app | `app/Dockerfile.k8s` | `ghcr.io/oxilith/votive-app` |
| worker | `worker/Dockerfile.k8s` | `ghcr.io/oxilith/votive-worker` |

## Local Development (kind)

### Quick Start

```bash
# 1. Create cluster with ingress and cert-manager
make cluster-create

# 2. Build and load images
make build-and-load

# 3. Install PostgreSQL
make install-postgres-dev

# 4. Deploy application
make deploy-dev

# 5. Access application
open https://votive.127.0.0.1.nip.io
```

### Cluster Management

```bash
# Create cluster
make cluster-create

# Delete cluster (WARNING: loses all data)
make cluster-delete

# Check cluster status
kubectl cluster-info --context kind-votive

# Switch context (if using multiple clusters)
kubectl config use-context kind-votive
```

### Development Workflow

After making code changes:

```bash
# Rebuild single service (faster)
make rebuild-prompt-service
make rebuild-backend
make rebuild-app

# Rebuild all services
make redeploy-all

# Config-only changes (no rebuild needed)
kubectl apply -k k8s/overlays/dev
kubectl rollout restart deployment/<service> -n votive-dev
```

### Viewing Logs

```bash
# Prompt service logs
make logs-dev

# Backend logs
make logs-backend-dev

# Worker logs
make logs-worker-dev

# All pods
kubectl logs -n votive-dev -l app=<app-name> -f

# Previous container logs (after crash)
kubectl logs -n votive-dev <pod-name> --previous
```

### Debugging

```bash
# Check pod status
kubectl get pods -n votive-dev

# Describe pod (events, errors)
kubectl describe pod -n votive-dev <pod-name>

# Shell into container
kubectl exec -it -n votive-dev <pod-name> -- sh

# Port forward for direct access
kubectl port-forward -n votive-dev svc/prompt-service 3002:3002
kubectl port-forward -n votive-dev svc/backend 3001:3001
```

### Database Operations

```bash
# Connect to PostgreSQL
make db-shell-dev

# Or manually
kubectl exec -it -n votive-dev postgresql-0 -- psql -U votive -d votive

# Backup database
kubectl exec -n votive-dev postgresql-0 -- pg_dump -U votive votive > backup.sql

# Restore database
kubectl exec -i -n votive-dev postgresql-0 -- psql -U votive votive < backup.sql

# Check PostgreSQL logs
kubectl logs -n votive-dev postgresql-0

# Create manual backup job
make db-backup-dev
```

### Cleanup

```bash
# Remove dev deployment (keeps cluster)
make clean-dev

# Remove everything including cluster
make clean-all
```

## E2E Testing

### Two Testing Modes

The project supports E2E testing in two modes:

| Mode | Command | Uses | When to Use |
|------|---------|------|-------------|
| Docker Compose | `make test-e2e-full` | `docker-compose.test.yml` | CI/CD, quick local tests |
| Kubernetes | `make deploy-test` | `k8s/overlays/test` | Full K8s validation |

Both modes use the same configuration source: `k8s/overlays/test/secrets.yaml`

### Docker Compose E2E Testing

The Makefile extracts environment variables from K8s secrets using yq:

```bash
# All-in-one: start services, run tests, stop services
make test-e2e-full

# Or step-by-step:
make test-up           # Start Docker Compose environment
make test-e2e          # Run E2E tests (Playwright)
make test-down         # Stop and cleanup
```

**How it works:**

1. `yq` extracts `stringData` from `k8s/overlays/test/secrets.yaml`
2. Variables are exported to the shell environment
3. Docker Compose uses `${VARIABLE}` syntax to inject them
4. Services start with mocked Claude API (`MOCK_CLAUDE_API=true`)

### Kubernetes E2E Testing

```bash
# Deploy to test namespace (mocked Claude API)
make deploy-test

# Check status
make status-test

# View logs
make logs-test

# Run E2E tests against K8s
npm run test:e2e

# Cleanup
make clean-test
```

**Test overlay features:**

- Namespace: `votive-test`
- Single replicas for all services
- `MOCK_CLAUDE_API=true` - bypasses real Claude API
- Plain YAML secrets (safe to commit - mock values only)

### Test Configuration

The test secrets file (`k8s/overlays/test/secrets.yaml`) contains mock values:

```yaml
stringData:
  DATABASE_URL: "postgresql://votive:test_password@postgres:5432/votive"
  ANTHROPIC_API_KEY: "test-api-key-not-real"
  MOCK_CLAUDE_API: "true"
  JWT_ACCESS_SECRET: "test-access-secret-..."
  # ... other test-specific values
```

## Secret Management

### Secret Architecture

| File | Purpose | Commit? |
|------|---------|---------|
| `secrets.example.yaml` | Template with documentation | Yes |
| `secrets.yaml` | Unencrypted values (temporary) | **Never** |
| `secrets.enc.yaml` | SOPS-encrypted secrets | Yes |
| `postgresql-secret.enc.yaml` | Encrypted DB credentials | Yes |

### Creating Secrets (First Time)

```bash
# Copy template
cp k8s/overlays/dev/secrets.example.yaml k8s/overlays/dev/secrets.yaml

# Edit with real values
vim k8s/overlays/dev/secrets.yaml

# Encrypt
sops -e k8s/overlays/dev/secrets.yaml > k8s/overlays/dev/secrets.enc.yaml

# Remove plaintext (IMPORTANT!)
rm k8s/overlays/dev/secrets.yaml
```

### Editing Encrypted Secrets

```bash
# Edit directly (SOPS decrypts, opens editor, re-encrypts)
sops k8s/overlays/dev/secrets.enc.yaml

# Or decrypt, edit, re-encrypt
sops -d k8s/overlays/dev/secrets.enc.yaml > secrets.yaml
vim secrets.yaml
sops -e secrets.yaml > k8s/overlays/dev/secrets.enc.yaml
rm secrets.yaml
```

### Secret Structure

```yaml
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: votive-secrets
  namespace: votive-dev
type: Opaque
stringData:
  # Database
  DATABASE_URL: "postgresql://votive:password@postgresql:5432/votive"

  # Authentication (32+ chars each)
  JWT_ACCESS_SECRET: "..."
  JWT_REFRESH_SECRET: "..."
  SESSION_SECRET: "..."

  # Admin UI
  ADMIN_API_KEY: "..."

  # External Services
  ANTHROPIC_API_KEY: "sk-ant-..."

  # Optional: SMTP
  SMTP_HOST: "smtp.resend.com"
  SMTP_PORT: "587"
  SMTP_USER: "resend"
  SMTP_PASSWORD: "re_..."
  SMTP_FROM: "noreply@yourdomain.com"
```

### Required Secrets

| Secret | Description | Min Length |
|--------|-------------|------------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `ANTHROPIC_API_KEY` | Claude API key | - |
| `JWT_ACCESS_SECRET` | JWT access token signing | 32 chars |
| `JWT_REFRESH_SECRET` | JWT refresh token signing | 32 chars |
| `SESSION_SECRET` | Session signing | 32 chars |
| `ADMIN_API_KEY` | Admin UI access | 32 chars |

### PostgreSQL Secret

Separate secret for Helm chart compatibility:

```yaml
# postgresql-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgresql-secret
  namespace: votive-dev
type: Opaque
stringData:
  postgres-password: "admin_password"  # postgres superuser
  password: "app_password"             # votive user (must match DATABASE_URL)
```

## Data Persistence

### Local Development (kind)

| Scenario | Data Safe? |
|----------|------------|
| Pod restart | ✅ Yes |
| `kubectl delete pod postgresql-0` | ✅ Yes |
| `helm uninstall postgresql` | ⚠️ Only if PVC kept |
| `make cluster-delete` | ❌ **Data lost** |
| Docker restart | ✅ Usually yes |

**Backup before cluster deletion:**
```bash
kubectl exec -n votive-dev postgresql-0 -- pg_dump -U votive votive > backup.sql
```

### Production (Azure)

- Uses Azure Managed Disks (SSD)
- Reclaim policy: Retain
- Data survives pod/node failures
- Automatic snapshots recommended

### PostgreSQL Configuration

**Dev values** (`k8s/helm-values/postgresql-dev.yaml`):
- Storage: 10Gi standard
- Memory: 256Mi-512Mi
- CPU: 100m-500m
- Connections: 100

**Prod values** (`k8s/helm-values/postgresql-prod.yaml`):
- Storage: 20Gi SSD (`managed-csi-premium`)
- Memory: 512Mi-1Gi
- CPU: 250m-1000m
- Connections: 200
- Resource policy: keep (prevents accidental deletion)

## Production Deployment (Azure)

### Azure Resources Required

| Resource | Purpose | Recommended SKU |
|----------|---------|-----------------|
| Resource Group | Container for resources | - |
| AKS | Kubernetes cluster | Standard_B2s (2 nodes min) |
| ACR | Container registry | Basic |
| Azure DNS Zone | Custom domain (optional) | - |

### Initial Setup

```bash
# 1. Login to Azure
az login

# 2. Create resource group
az group create --name votive-rg --location westeurope

# 3. Create container registry
az acr create --resource-group votive-rg --name votiveacr --sku Basic

# 4. Create AKS cluster
az aks create \
  --resource-group votive-rg \
  --name votive-aks \
  --node-count 2 \
  --node-vm-size Standard_B2s \
  --attach-acr votiveacr \
  --generate-ssh-keys

# 5. Get credentials
az aks get-credentials --resource-group votive-rg --name votive-aks
```

### Push Images to ACR

```bash
# Login to ACR
az acr login --name votiveacr

# Tag and push images
for svc in app backend prompt-service worker; do
  docker tag ghcr.io/oxilith/votive-$svc:latest votiveacr.azurecr.io/votive-$svc:latest
  docker push votiveacr.azurecr.io/votive-$svc:latest
done
```

### Update Image References

Edit `k8s/overlays/prod/kustomization.yaml`:
```yaml
images:
  - name: ghcr.io/oxilith/votive-prompt-service
    newName: votiveacr.azurecr.io/votive-prompt-service
    newTag: latest
  # ... repeat for other images
```

### Deploy to Production

```bash
# 1. Install infrastructure
make install-ingress
make install-cert-prod  # Let's Encrypt
make install-postgres-prod

# 2. Deploy application
make deploy-prod

# 3. Check status
kubectl get pods -n votive-prod
kubectl get ingress -n votive-prod
```

### Configure Domain

1. Get ingress IP:
   ```bash
   kubectl get ingress -n votive-prod -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}'
   ```

2. Update DNS A record to point to this IP

3. Update `k8s/overlays/prod/patches/ingress.yaml` with your domain

4. Re-deploy to get SSL certificate:
   ```bash
   kubectl apply -k k8s/overlays/prod
   ```

## Publishing Images to GHCR

GitHub Container Registry (ghcr.io) is used for storing and distributing Docker images.

### Prerequisites

1. GitHub account with access to the `oxilith` organization
2. Personal Access Token (PAT) with `write:packages` scope
3. Docker installed and running

### Creating a GitHub PAT

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Set expiration and select scopes:
   - `write:packages` - Upload packages to GitHub Package Registry
   - `read:packages` - Download packages from GitHub Package Registry
   - `delete:packages` (optional) - Delete packages
4. Copy the token immediately (you won't see it again)

### Login to GHCR

**macOS/Linux:**
```bash
# Login using PAT
echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Or interactively
docker login ghcr.io
# Username: your-github-username
# Password: your-personal-access-token
```

**Windows (PowerShell):**
```powershell
# Login using PAT
"YOUR_GITHUB_PAT" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Or using GitHub CLI (recommended)
gh auth login
gh auth token | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### Build and Push Images

**macOS/Linux:**
```bash
# Set variables
export IMAGE_TAG=latest
export IMAGE_PREFIX=ghcr.io/oxilith

# Build all images (K8s variants)
docker build -t $IMAGE_PREFIX/votive-prompt-service:$IMAGE_TAG -f prompt-service/Dockerfile.k8s .
docker build -t $IMAGE_PREFIX/votive-backend:$IMAGE_TAG -f backend/Dockerfile.k8s .
docker build -t $IMAGE_PREFIX/votive-app:$IMAGE_TAG -f app/Dockerfile.k8s .
docker build -t $IMAGE_PREFIX/votive-worker:$IMAGE_TAG -f worker/Dockerfile.k8s .

# Push all images
docker push $IMAGE_PREFIX/votive-prompt-service:$IMAGE_TAG
docker push $IMAGE_PREFIX/votive-backend:$IMAGE_TAG
docker push $IMAGE_PREFIX/votive-app:$IMAGE_TAG
docker push $IMAGE_PREFIX/votive-worker:$IMAGE_TAG
```

**Windows (PowerShell):**
```powershell
# Set variables
$IMAGE_TAG = "latest"
$IMAGE_PREFIX = "ghcr.io/oxilith"

# Build all images (K8s variants)
docker build -t "$IMAGE_PREFIX/votive-prompt-service:$IMAGE_TAG" -f prompt-service/Dockerfile.k8s .
docker build -t "$IMAGE_PREFIX/votive-backend:$IMAGE_TAG" -f backend/Dockerfile.k8s .
docker build -t "$IMAGE_PREFIX/votive-app:$IMAGE_TAG" -f app/Dockerfile.k8s .
docker build -t "$IMAGE_PREFIX/votive-worker:$IMAGE_TAG" -f worker/Dockerfile.k8s .

# Push all images
docker push "$IMAGE_PREFIX/votive-prompt-service:$IMAGE_TAG"
docker push "$IMAGE_PREFIX/votive-backend:$IMAGE_TAG"
docker push "$IMAGE_PREFIX/votive-app:$IMAGE_TAG"
docker push "$IMAGE_PREFIX/votive-worker:$IMAGE_TAG"
```

### Tagging for Release

```bash
# Tag with version number
VERSION=v1.2.3
docker tag ghcr.io/oxilith/votive-prompt-service:latest ghcr.io/oxilith/votive-prompt-service:$VERSION
docker push ghcr.io/oxilith/votive-prompt-service:$VERSION
# Repeat for other images...
```

### Verify Images

```bash
# List images in GHCR (requires gh CLI)
gh api user/packages/container/votive-prompt-service/versions

# Or check in browser
# https://github.com/orgs/oxilith/packages
```

## Windows Deployment Workflow

Complete guide for deploying from a Windows machine to Azure AKS.

### Step 1: Install Prerequisites

Open PowerShell as Administrator:

```powershell
# Install Chocolatey (if not already installed)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install required tools
choco install docker-desktop git kubernetes-cli kubernetes-helm sops age.portable azure-cli gh -y

# Restart PowerShell after installation
```

### Step 2: Configure SOPS/Age

```powershell
# Create age key directory
New-Item -ItemType Directory -Force -Path "$env:APPDATA\sops\age"

# Option A: Copy existing key from Mac
# Copy your ~/.config/sops/age/keys.txt to %APPDATA%\sops\age\keys.txt

# Option B: Generate new key (requires updating .sops.yaml)
age-keygen -o "$env:APPDATA\sops\age\keys.txt"

# Set environment variable
[Environment]::SetEnvironmentVariable("SOPS_AGE_KEY_FILE", "$env:APPDATA\sops\age\keys.txt", "User")
$env:SOPS_AGE_KEY_FILE = "$env:APPDATA\sops\age\keys.txt"

# Verify setup
sops -d k8s/overlays/prod/secrets.enc.yaml
```

### Step 3: Clone Repository and Build Images

```powershell
# Clone repository
git clone https://github.com/Oxilith/Votive.git
cd Votive

# Login to GitHub Container Registry
gh auth login
$token = gh auth token
$token | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Build images
$IMAGE_PREFIX = "ghcr.io/oxilith"
$IMAGE_TAG = "latest"

docker build -t "$IMAGE_PREFIX/votive-prompt-service:$IMAGE_TAG" -f prompt-service/Dockerfile.k8s .
docker build -t "$IMAGE_PREFIX/votive-backend:$IMAGE_TAG" -f backend/Dockerfile.k8s .
docker build -t "$IMAGE_PREFIX/votive-app:$IMAGE_TAG" -f app/Dockerfile.k8s .
docker build -t "$IMAGE_PREFIX/votive-worker:$IMAGE_TAG" -f worker/Dockerfile.k8s .

# Push images
docker push "$IMAGE_PREFIX/votive-prompt-service:$IMAGE_TAG"
docker push "$IMAGE_PREFIX/votive-backend:$IMAGE_TAG"
docker push "$IMAGE_PREFIX/votive-app:$IMAGE_TAG"
docker push "$IMAGE_PREFIX/votive-worker:$IMAGE_TAG"
```

### Step 4: Connect to Azure AKS

```powershell
# Login to Azure
az login

# Get AKS credentials
az aks get-credentials --resource-group votive-rg --name votive-aks

# Verify connection
kubectl cluster-info
kubectl get nodes
```

### Step 5: Deploy to Production

```powershell
# Install ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

# Wait for ingress controller
kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=120s

# Install cert-manager
helm repo add jetstack https://charts.jetstack.io --force-update
helm upgrade --install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set crds.enabled=true --wait

# Apply Let's Encrypt issuer
kubectl apply -f k8s/base/cert-manager/letsencrypt-issuer.yaml

# Create namespace
kubectl create namespace votive-prod --dry-run=client -o yaml | kubectl apply -f -

# Apply secrets (decrypt and apply)
sops -d k8s/overlays/prod/secrets.enc.yaml | kubectl apply -f -
sops -d k8s/overlays/prod/postgresql-secret.enc.yaml | kubectl apply -f -

# Install PostgreSQL
helm repo add bitnami https://charts.bitnami.com/bitnami --force-update
helm upgrade --install postgresql bitnami/postgresql --namespace votive-prod -f k8s/helm-values/postgresql-prod.yaml --wait

# Deploy application
kubectl apply -k k8s/overlays/prod

# Wait for rollout
kubectl rollout status deployment/prompt-service -n votive-prod --timeout=180s
kubectl rollout status deployment/backend -n votive-prod --timeout=180s
kubectl rollout status deployment/app -n votive-prod --timeout=180s

# Check status
kubectl get pods -n votive-prod
kubectl get ingress -n votive-prod
```

### Step 6: Verify Deployment

```powershell
# Get external IP
kubectl get ingress -n votive-prod

# Check pod logs
kubectl logs -n votive-prod -l app=prompt-service --tail=50
kubectl logs -n votive-prod -l app=backend --tail=50

# Test health endpoints
$IP = kubectl get ingress -n votive-prod -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}'
curl "http://$IP/health"
```

### Windows-Specific Notes

1. **Line Endings**: Git may convert line endings. Ensure `.gitattributes` is configured:
   ```
   *.sh text eol=lf
   ```

2. **Docker Context**: Always run Docker commands from the repository root.

3. **Path Separators**: Use forward slashes in Dockerfile paths (`-f prompt-service/Dockerfile.k8s`).

4. **Environment Variables**: Use `$env:VAR` syntax in PowerShell, not `$VAR`.

5. **Make Alternative**: Windows doesn't have `make` by default. Either:
   - Install: `choco install make`
   - Or run commands directly from this guide

## Network Policies

Network policies restrict pod-to-pod communication:

| Policy | Allows |
|--------|--------|
| `default-deny-ingress` | Denies all ingress by default |
| `app-network-policy` | Ingress from internet |
| `backend-network-policy` | Ingress from app, egress to prompt-service + external |
| `prompt-service-network-policy` | Ingress from backend/app, egress to PostgreSQL |
| `worker-network-policy` | Egress to PostgreSQL |

### Traffic Flow

```
Internet → Ingress → App → Backend → Prompt Service → PostgreSQL
                                ↓
                          Claude API (external)

Worker (CronJob) → PostgreSQL (cleanup jobs)
```

## Troubleshooting

### Pod stuck in ImagePullBackOff

```bash
# Check if image exists locally
docker images | grep votive

# For kind, load images
make load-images

# Check imagePullPolicy (should be IfNotPresent for local)
kubectl get deployment -n votive-dev <name> -o yaml | grep imagePullPolicy
```

### Pod stuck in CrashLoopBackOff

```bash
# Check logs
kubectl logs -n votive-dev <pod-name>
kubectl logs -n votive-dev <pod-name> --previous

# Check events
kubectl describe pod -n votive-dev <pod-name>

# Common causes:
# - Missing environment variables
# - Database connection failed
# - Config validation errors
```

### Cannot connect to PostgreSQL

```bash
# Verify PostgreSQL is running
kubectl get pods -n votive-dev -l app.kubernetes.io/name=postgresql

# Check PostgreSQL is listening on all interfaces
kubectl exec -n votive-dev postgresql-0 -- netstat -tlnp | grep 5432
# Should show 0.0.0.0:5432, NOT 127.0.0.1:5432

# Fix: Update helm values with listen_addresses = '*' and upgrade
helm upgrade postgresql bitnami/postgresql -n votive-dev -f k8s/helm-values/postgresql-dev.yaml
```

### Ingress not working

```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress resource
kubectl describe ingress -n votive-dev votive-ingress

# Check certificate
kubectl get certificate -n votive-dev
```

### Service not reachable

```bash
# Check service endpoints
kubectl get endpoints -n votive-dev

# Check network policies
kubectl get networkpolicy -n votive-dev

# Temporarily disable network policies for debugging
kubectl delete networkpolicy --all -n votive-dev
```

### SOPS Decryption Errors

```bash
# Check age key exists
cat ~/.config/sops/age/keys.txt

# Check SOPS_AGE_KEY_FILE is set
echo $SOPS_AGE_KEY_FILE

# Verify you can decrypt
sops -d k8s/overlays/dev/secrets.enc.yaml
```

### Worker CronJob Issues

```bash
# Check CronJob status
kubectl get cronjobs -n votive-dev

# Check recent job runs
kubectl get jobs -n votive-dev --sort-by=.metadata.creationTimestamp | tail -5

# Check job logs
kubectl logs -n votive-dev -l app=worker --tail=100
```

## Make Targets Reference

### Cluster Management

| Target | Description |
|--------|-------------|
| `make cluster-create` | Create kind cluster with ingress + cert-manager |
| `make cluster-delete` | Delete kind cluster |

### Infrastructure

| Target | Description |
|--------|-------------|
| `make install-ingress` | Install NGINX Ingress Controller |
| `make install-cert` | Install cert-manager + mkcert (dev) |
| `make install-cert-prod` | Install cert-manager + Let's Encrypt (prod) |
| `make install-postgres-dev` | Install PostgreSQL (dev) |
| `make install-postgres-prod` | Install PostgreSQL (prod) |

### Build (for kind)

| Target | Description |
|--------|-------------|
| `make build-images` | Build all Docker images (K8s variant) |
| `make load-images` | Load images into kind cluster |
| `make build-and-load` | Build and load in one step |
| `make rebuild-prompt-service` | Rebuild and redeploy prompt-service |
| `make rebuild-backend` | Rebuild and redeploy backend |
| `make rebuild-app` | Rebuild and redeploy app |
| `make redeploy-all` | Rebuild and redeploy all services |

### Deployment

| Target | Description |
|--------|-------------|
| `make deploy-dev` | Deploy to votive-dev namespace |
| `make deploy-staging` | Deploy to votive-staging namespace |
| `make deploy-prod` | Deploy to votive-prod namespace |
| `make deploy-test` | Deploy to votive-test (mocked Claude API) |

### Operations

| Target | Description |
|--------|-------------|
| `make status-dev` | Show dev namespace status |
| `make status-test` | Show test namespace status |
| `make logs-dev` | Tail prompt-service logs |
| `make logs-backend-dev` | Tail backend logs |
| `make logs-worker-dev` | Tail worker logs |
| `make logs-test` | Tail test namespace logs |
| `make port-forward` | Show access instructions |
| `make db-shell-dev` | Connect to PostgreSQL |
| `make db-backup-dev` | Create manual backup job |

### E2E Testing (Docker Compose)

| Target | Description |
|--------|-------------|
| `make test-up` | Start Docker Compose test environment |
| `make test-down` | Stop Docker Compose test environment |
| `make test-e2e` | Run E2E tests (services must be running) |
| `make test-e2e-full` | Start services, run tests, stop services |

### Cleanup

| Target | Description |
|--------|-------------|
| `make clean-dev` | Remove dev deployment |
| `make clean-test` | Remove test deployment |
| `make clean-all` | Remove everything including cluster |

### Utilities

| Target | Description |
|--------|-------------|
| `make kustomize-build-dev` | Preview dev Kustomize output |
| `make validate-dev` | Dry-run validate dev manifests |
| `make help` | Show all available targets |

## File Structure

```
k8s/
├── kind/
│   └── cluster-config.yaml        # Kind cluster config (K8s v1.32.2)
├── base/
│   ├── kustomization.yaml         # Base Kustomization
│   ├── cert-manager/
│   │   ├── mkcert-issuer.yaml     # Local dev certificate issuer
│   │   └── letsencrypt-issuer.yaml# Production certificate issuer
│   ├── app/
│   │   ├── deployment.yaml        # App (nginx) deployment
│   │   ├── service.yaml           # ClusterIP service
│   │   └── configmap.yaml         # Nginx config (API proxying)
│   ├── backend/
│   │   ├── deployment.yaml        # Backend deployment
│   │   ├── service.yaml           # ClusterIP service
│   │   └── configmap.yaml         # Environment configuration
│   ├── prompt-service/
│   │   ├── deployment.yaml        # Prompt service + migrations
│   │   ├── service.yaml           # ClusterIP service
│   │   └── configmap.yaml         # Environment configuration
│   ├── worker/
│   │   └── cronjob.yaml           # Token cleanup CronJob
│   ├── ingress/
│   │   └── ingress.yaml           # NGINX Ingress with TLS
│   ├── network-policies/
│   │   ├── default-deny.yaml      # Deny all ingress by default
│   │   ├── app-policy.yaml        # App network rules
│   │   ├── backend-policy.yaml    # Backend network rules
│   │   ├── prompt-service-policy.yaml # Prompt service rules
│   │   └── worker-policy.yaml     # Worker network rules
│   └── postgresql/
│       └── backup-cronjob.yaml    # Database backup CronJob
├── overlays/
│   ├── dev/
│   │   ├── kustomization.yaml     # Dev overlay config
│   │   ├── namespace.yaml         # votive-dev namespace
│   │   ├── secrets.example.yaml   # Template (commit this)
│   │   ├── secrets.enc.yaml       # Encrypted secrets (commit)
│   │   ├── postgresql-secret.enc.yaml # Encrypted DB creds (commit)
│   │   └── patches/
│   │       ├── replicas.yaml      # Single replicas
│   │       └── image-pull-policy.yaml # IfNotPresent for kind
│   ├── test/
│   │   ├── kustomization.yaml     # Test overlay config
│   │   ├── namespace.yaml         # votive-test namespace
│   │   ├── secrets.yaml           # Plain mock secrets (safe to commit)
│   │   ├── postgresql-secret.yaml # Plain mock DB creds
│   │   └── patches/
│   │       ├── replicas.yaml      # Single replicas
│   │       └── mock-claude.yaml   # MOCK_CLAUDE_API=true
│   └── prod/
│       ├── kustomization.yaml     # Prod overlay config
│       ├── namespace.yaml         # votive-prod namespace
│       ├── secrets.enc.yaml       # Encrypted secrets
│       ├── postgresql-secret.enc.yaml # Encrypted DB creds
│       └── patches/
│           ├── replicas.yaml      # Multiple replicas
│           └── ingress.yaml       # Production domain
└── helm-values/
    ├── postgresql-dev.yaml        # PostgreSQL config (dev)
    └── postgresql-prod.yaml       # PostgreSQL config (prod)
```

## Configuration Reference

### Environment Variables

All services read configuration from Kubernetes ConfigMaps and Secrets.

**Backend ConfigMap** (`k8s/base/backend/configmap.yaml`):
- `NODE_ENV` - Environment (development/production)
- `PORT` - Service port (3001)
- `PROMPT_SERVICE_URL` - Internal URL for prompt-service
- `LOG_LEVEL` - Pino log level
- `CORS_ORIGIN` / `CORS_ORIGINS` - Allowed origins
- `THINKING_ENABLED` - Claude extended thinking mode

**Prompt Service ConfigMap** (`k8s/base/prompt-service/configmap.yaml`):
- `NODE_ENV` - Environment
- `PORT` - Service port (3002)
- `LOG_LEVEL` - Pino log level

**Secrets** (from `votive-secrets`):
- `DATABASE_URL` - PostgreSQL connection
- `ANTHROPIC_API_KEY` - Claude API key
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` - Auth tokens
- `SESSION_SECRET` - Session signing
- `ADMIN_API_KEY` - Admin UI access
- `SMTP_*` - Email configuration (optional)

### Kustomize Patching

The overlays use Kustomize patches to modify base resources:

**Image tags** (via `images` in kustomization.yaml):
```yaml
images:
  - name: ghcr.io/oxilith/votive-prompt-service
    newTag: v1.2.3
```

**Replicas** (via strategic merge patch):
```yaml
# patches/replicas.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prompt-service
spec:
  replicas: 3
```

**Environment variables** (via ConfigMap patch):
```yaml
# patches/mock-claude.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
data:
  MOCK_CLAUDE_API: "true"
```
