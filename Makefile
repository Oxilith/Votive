# Votive Kubernetes Operations Makefile
# Usage: make help

.PHONY: help cluster-create cluster-delete install-ingress install-cert install-postgres-dev \
        deploy-dev deploy-staging deploy-prod deploy-test status-dev status-test \
        logs-dev logs-backend-dev logs-test port-forward clean-dev clean-test clean-all \
        test-up test-down test-e2e test-e2e-full

# Colors for output
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RESET := \033[0m

# Default target
help:
	@echo ""
	@echo "$(CYAN)Votive K8s Commands$(RESET)"
	@echo ""
	@echo "$(GREEN)Cluster:$(RESET)"
	@echo "  make cluster-create      Create kind cluster with ingress & cert-manager"
	@echo "  make cluster-delete      Delete kind cluster"
	@echo ""
	@echo "$(GREEN)Infrastructure:$(RESET)"
	@echo "  make install-ingress     Install NGINX Ingress Controller"
	@echo "  make install-cert        Install cert-manager + mkcert issuer"
	@echo "  make install-postgres-dev Deploy PostgreSQL to votive-dev namespace"
	@echo ""
	@echo "$(GREEN)Deployment:$(RESET)"
	@echo "  make deploy-dev          Deploy to votive-dev namespace"
	@echo "  make deploy-staging      Deploy to votive-staging namespace"
	@echo "  make deploy-prod         Deploy to votive-prod namespace"
	@echo "  make deploy-test         Deploy to votive-test (mocked Claude API)"
	@echo ""
	@echo "$(GREEN)Operations:$(RESET)"
	@echo "  make status-dev          Show dev namespace status"
	@echo "  make status-test         Show test namespace status"
	@echo "  make logs-dev            Tail prompt-service logs"
	@echo "  make logs-backend-dev    Tail backend logs"
	@echo "  make logs-test           Tail test namespace logs"
	@echo "  make port-forward        Show access instructions"
	@echo ""
	@echo "$(GREEN)Cleanup:$(RESET)"
	@echo "  make clean-dev           Remove dev deployment"
	@echo "  make clean-test          Remove test deployment"
	@echo "  make clean-all           Remove everything including cluster"
	@echo ""
	@echo "$(GREEN)E2E Testing (Docker Compose):$(RESET)"
	@echo "  make test-up             Start Docker Compose test environment"
	@echo "  make test-down           Stop Docker Compose test environment"
	@echo "  make test-e2e            Run E2E tests (services must be running)"
	@echo "  make test-e2e-full       Start services, run tests, stop services"
	@echo ""

# ============ Cluster ============

cluster-create:
	@echo "$(CYAN)Creating kind cluster...$(RESET)"
	kind create cluster --config k8s/kind/cluster-config.yaml --name votive
	@echo "$(CYAN)Installing ingress controller...$(RESET)"
	$(MAKE) install-ingress
	@echo "$(CYAN)Installing cert-manager...$(RESET)"
	$(MAKE) install-cert
	@echo "$(GREEN)Cluster ready!$(RESET)"

cluster-delete:
	@echo "$(YELLOW)Deleting kind cluster...$(RESET)"
	kind delete cluster --name votive

# ============ Infrastructure ============

install-ingress:
	@echo "$(CYAN)Installing NGINX Ingress Controller...$(RESET)"
	kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
	@echo "$(CYAN)Waiting for ingress controller to be ready...$(RESET)"
	kubectl wait --namespace ingress-nginx \
		--for=condition=ready pod \
		--selector=app.kubernetes.io/component=controller \
		--timeout=120s
	@echo "$(GREEN)Ingress controller ready!$(RESET)"

install-cert:
	@echo "$(CYAN)Adding Jetstack Helm repo...$(RESET)"
	helm repo add jetstack https://charts.jetstack.io --force-update
	@echo "$(CYAN)Installing cert-manager...$(RESET)"
	helm upgrade --install cert-manager jetstack/cert-manager \
		--namespace cert-manager --create-namespace \
		--set crds.enabled=true \
		--wait
	@echo "$(CYAN)Creating mkcert CA secret...$(RESET)"
	kubectl create secret tls mkcert-ca \
		--cert="$$(mkcert -CAROOT)/rootCA.pem" \
		--key="$$(mkcert -CAROOT)/rootCA-key.pem" \
		-n cert-manager --dry-run=client -o yaml | kubectl apply -f -
	@echo "$(CYAN)Applying mkcert ClusterIssuer...$(RESET)"
	kubectl apply -f k8s/base/cert-manager/mkcert-issuer.yaml
	@echo "$(GREEN)cert-manager ready!$(RESET)"

install-postgres-dev:
	@echo "$(CYAN)Creating votive-dev namespace...$(RESET)"
	kubectl create namespace votive-dev --dry-run=client -o yaml | kubectl apply -f -
	@echo "$(CYAN)Applying PostgreSQL secret...$(RESET)"
	sops -d k8s/overlays/dev/postgresql-secret.enc.yaml | kubectl apply -f -
	@echo "$(CYAN)Adding Bitnami Helm repo...$(RESET)"
	helm repo add bitnami https://charts.bitnami.com/bitnami --force-update
	@echo "$(CYAN)Installing PostgreSQL...$(RESET)"
	helm upgrade --install postgresql bitnami/postgresql \
		--namespace votive-dev \
		-f k8s/helm-values/postgresql-dev.yaml \
		--wait
	@echo "$(GREEN)PostgreSQL ready!$(RESET)"

# ============ Deployment ============

deploy-dev:
	@echo "$(CYAN)Deploying to votive-dev...$(RESET)"
	@echo "$(CYAN)Applying secrets...$(RESET)"
	sops -d k8s/overlays/dev/secrets.enc.yaml | kubectl apply -f -
	sops -d k8s/overlays/dev/postgresql-secret.enc.yaml | kubectl apply -f -
	@echo "$(CYAN)Applying Kustomize overlay...$(RESET)"
	kubectl apply -k k8s/overlays/dev
	@echo "$(CYAN)Waiting for deployments...$(RESET)"
	kubectl rollout status deployment/prompt-service -n votive-dev --timeout=120s
	kubectl rollout status deployment/backend -n votive-dev --timeout=120s
	kubectl rollout status deployment/app -n votive-dev --timeout=120s
	@echo "$(GREEN)Deployment complete!$(RESET)"
	@echo ""
	@echo "Access at: $(CYAN)https://votive.127.0.0.1.nip.io$(RESET)"

deploy-staging:
	@echo "$(CYAN)Deploying to votive-staging...$(RESET)"
	sops -d k8s/overlays/staging/secrets.enc.yaml | kubectl apply -f -
	sops -d k8s/overlays/staging/postgresql-secret.enc.yaml | kubectl apply -f -
	kubectl apply -k k8s/overlays/staging
	kubectl rollout status deployment/prompt-service -n votive-staging --timeout=120s
	kubectl rollout status deployment/backend -n votive-staging --timeout=120s
	kubectl rollout status deployment/app -n votive-staging --timeout=120s
	@echo "$(GREEN)Staging deployment complete!$(RESET)"

deploy-prod:
	@echo "$(YELLOW)Deploying to votive-prod...$(RESET)"
	sops -d k8s/overlays/prod/secrets.enc.yaml | kubectl apply -f -
	sops -d k8s/overlays/prod/postgresql-secret.enc.yaml | kubectl apply -f -
	kubectl apply -k k8s/overlays/prod
	kubectl rollout status deployment/prompt-service -n votive-prod --timeout=180s
	kubectl rollout status deployment/backend -n votive-prod --timeout=180s
	kubectl rollout status deployment/app -n votive-prod --timeout=180s
	@echo "$(GREEN)Production deployment complete!$(RESET)"

deploy-test:
	@echo "$(CYAN)Deploying to votive-test (mocked Claude API)...$(RESET)"
	@echo "$(CYAN)Applying test overlay (includes mock secrets)...$(RESET)"
	kubectl apply -k k8s/overlays/test
	@echo "$(CYAN)Waiting for deployments...$(RESET)"
	kubectl rollout status deployment/prompt-service -n votive-test --timeout=120s
	kubectl rollout status deployment/backend -n votive-test --timeout=120s
	kubectl rollout status deployment/app -n votive-test --timeout=120s
	@echo "$(GREEN)Test deployment complete!$(RESET)"
	@echo ""
	@echo "Access at: $(CYAN)https://votive.127.0.0.1.nip.io$(RESET)"
	@echo "Run E2E tests: $(CYAN)npm run test:e2e$(RESET)"

# ============ Operations ============

status-dev:
	@echo "$(CYAN)=== Pods ===$(RESET)"
	kubectl get pods -n votive-dev -o wide
	@echo ""
	@echo "$(CYAN)=== Services ===$(RESET)"
	kubectl get svc -n votive-dev
	@echo ""
	@echo "$(CYAN)=== Ingress ===$(RESET)"
	kubectl get ingress -n votive-dev
	@echo ""
	@echo "$(CYAN)=== CronJobs ===$(RESET)"
	kubectl get cronjobs -n votive-dev
	@echo ""
	@echo "$(CYAN)=== Recent Jobs ===$(RESET)"
	kubectl get jobs -n votive-dev --sort-by=.metadata.creationTimestamp | tail -5

status-test:
	@echo "$(CYAN)=== Pods (votive-test) ===$(RESET)"
	kubectl get pods -n votive-test -o wide
	@echo ""
	@echo "$(CYAN)=== Services ===$(RESET)"
	kubectl get svc -n votive-test
	@echo ""
	@echo "$(CYAN)=== Ingress ===$(RESET)"
	kubectl get ingress -n votive-test

logs-dev:
	kubectl logs -n votive-dev -l app=prompt-service --tail=50 -f

logs-backend-dev:
	kubectl logs -n votive-dev -l app=backend --tail=50 -f

logs-worker-dev:
	kubectl logs -n votive-dev -l app=worker --tail=50 -f

logs-test:
	kubectl logs -n votive-test --all-containers --tail=100 -f

port-forward:
	@echo ""
	@echo "$(GREEN)Access the application at:$(RESET)"
	@echo "  $(CYAN)https://votive.127.0.0.1.nip.io$(RESET)"
	@echo ""
	@echo "$(GREEN)Or use port-forward for debugging:$(RESET)"
	@echo "  kubectl port-forward svc/prompt-service 3002:3002 -n votive-dev"
	@echo "  kubectl port-forward svc/backend 3001:3001 -n votive-dev"
	@echo ""

# ============ Database ============

db-shell-dev:
	@echo "$(CYAN)Connecting to PostgreSQL...$(RESET)"
	kubectl exec -it -n votive-dev postgresql-0 -- psql -U votive -d votive

db-backup-dev:
	@echo "$(CYAN)Creating manual backup...$(RESET)"
	kubectl create job --from=cronjob/postgresql-backup manual-backup-$$(date +%s) -n votive-dev

# ============ Cleanup ============

clean-dev:
	@echo "$(YELLOW)Cleaning up votive-dev...$(RESET)"
	kubectl delete -k k8s/overlays/dev --ignore-not-found
	helm uninstall postgresql -n votive-dev --ignore-not-found || true
	@echo "$(GREEN)Cleanup complete!$(RESET)"

clean-test:
	@echo "$(YELLOW)Cleaning up votive-test...$(RESET)"
	kubectl delete -k k8s/overlays/test --ignore-not-found
	kubectl delete namespace votive-test --ignore-not-found || true
	@echo "$(GREEN)Test cleanup complete!$(RESET)"

clean-all:
	@echo "$(YELLOW)Cleaning up everything...$(RESET)"
	$(MAKE) clean-test
	$(MAKE) clean-dev
	kind delete cluster --name votive
	@echo "$(GREEN)Full cleanup complete!$(RESET)"

# ============ Utilities ============

kustomize-build-dev:
	@echo "$(CYAN)Building Kustomize manifests for dev...$(RESET)"
	kubectl kustomize k8s/overlays/dev

validate-dev:
	@echo "$(CYAN)Validating dev manifests...$(RESET)"
	kubectl kustomize k8s/overlays/dev | kubectl apply --dry-run=client -f -
	@echo "$(GREEN)Validation passed!$(RESET)"

# ============ E2E Testing (Docker Compose) ============
# Uses k8s/overlays/test/secrets.yaml as single source of truth
# Requires: yq (brew install yq)

# Helper to export env vars from K8s secrets.yaml
define load_test_env
	$$(yq -r '.stringData | to_entries | .[] | "export \(.key)=\"\(.value)\""' k8s/overlays/test/secrets.yaml)
endef

test-up:
	@echo "$(CYAN)Starting Docker Compose test environment...$(RESET)"
	@eval $(load_test_env) && \
		docker compose -f docker-compose.test.yml up -d --build --wait
	@echo "$(GREEN)Test environment ready!$(RESET)"
	@echo "Access at: $(CYAN)https://localhost$(RESET)"

test-down:
	@echo "$(YELLOW)Stopping Docker Compose test environment...$(RESET)"
	docker compose -f docker-compose.test.yml down -v
	@echo "$(GREEN)Test environment stopped!$(RESET)"

test-e2e:
	@echo "$(CYAN)Running E2E tests...$(RESET)"
	@eval $(load_test_env) && npm run e2e -w e2e
	@echo "$(GREEN)E2E tests complete!$(RESET)"

test-e2e-full:
	@echo "$(CYAN)Running full E2E test cycle...$(RESET)"
	$(MAKE) test-up
	@eval $(load_test_env) && npm run e2e -w e2e || ($(MAKE) test-down && exit 1)
	$(MAKE) test-down
	@echo "$(GREEN)Full E2E cycle complete!$(RESET)"
