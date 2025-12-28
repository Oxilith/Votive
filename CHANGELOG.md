## [1.1.0] - 2025-12-28

### Added
- BackgroundRefreshManager utility for background task management with queue limiting, retry logic, and exponential backoff
- fetchWithTimeout utility consolidating duplicated AbortController patterns
- Reusable icon components (15+ icons) with shared Icon wrapper and size system
- InsightCard component extracted for AI analysis display

### Changed
- PromptClientService now uses BackgroundRefreshManager for background cache refresh
- Icon system extended with 'xs' size variant (12px)
- Standardized all icon viewBoxes to 24x24 coordinate system

### Fixed
- Icon viewBox inconsistency (CheckIcon, ErrorCircleIcon now use 24x24)
- Removed !important CSS overrides in MultiSelectStep
- Error handling improvements in BackgroundRefreshManager callbacks

## [1.0.0] - 2025-12-28

### Added
- Claude GitHub Actions workflows for automated CI/CD
- Dependabot auto-merge workflow for dependency management
- HTTPS support with mkcert configuration
- Extended thinking feature flag
- Multi-architecture Docker support with OCI deployment
- Backend API proxy with shared types package
- Repository governance files and templates
- Manual workflow dispatch trigger for CI pipeline
- Windows PowerShell and mkcert setup instructions

### Changed
- Renamed application to Votive
- Restructured navigation header with view indicators and landing integration
- Unified health check routes and improved backend code quality
- Consolidated duplicated code into shared package
- Updated Docker configuration with latest image tags and path alias resolution
- Changed license to Votive Source Available License
- Updated README with multi-architecture Docker publishing and platform selection

### Fixed
- Critical code scanning security issues in workflows
- Go stdlib and npm vulnerabilities (CVE-2025-* series)
- Vite and Vitest esbuild vulnerability
- Shared package resolution and type inference issues
- Assessment navigation and stale analysis problems
- Nginx timeout configuration
- Backend lint errors and frontend test failures
- CI installation of shared package dependencies

### Other Changes
- Dependency updates: codecov/codecov-action, actions/setup-node, actions/checkout, actions/upload-artifact
- Added --passWithNoTests flag to backend test scripts
- Updated environment variable documentation
- Updated issue templates
- Relocated CLAUDE.md and added landing page design propositions
