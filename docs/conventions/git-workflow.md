# Git Workflow

The shared branch flow is:

```text
feature/* -> develop -> main
```

Example branches:

- `feature/ui-foundation`
- `feature/ui-dai-auth-account`
- `feature/ui-huy-tutor-matching`
- `feature/ui-dat-job-market`
- `feature/ui-phuong-contract-payment`

## Rules

- Do not code directly on `main`.
- Open pull requests into `develop`.
- Require at least one reviewer before merging.
- Merge `develop` into `main` only after the integrated application runs successfully.
- Do not force-push shared branches.
- Pull the latest `develop` before starting a new feature branch.
