# prcheck

> GitHub Action that enforces PR description templates and labels based on changed file paths

## Installation

```bash
npm install
npm run build
```

## Usage

Add the following to your workflow file (e.g. `.github/workflows/prcheck.yml`):

```yaml
name: PR Check

on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  prcheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: your-org/prcheck@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          config: '.github/prcheck.yml'
```

Define your rules in `.github/prcheck.yml`:

```yaml
rules:
  - paths:
      - 'src/api/**'
    labels:
      - 'api-change'
    template: '.github/templates/api_pr.md'
  - paths:
      - 'docs/**'
    labels:
      - 'documentation'
    template: '.github/templates/docs_pr.md'
```

When a PR is opened or updated, `prcheck` will inspect the changed file paths, apply the matching labels, and verify that the PR description follows the required template.

## Configuration

| Field | Required | Description |
|-------|----------|-------------|
| `token` | Yes | GitHub token used to read PR details and apply labels (`secrets.GITHUB_TOKEN` is sufficient) |
| `config` | No | Path to the rules config file. Defaults to `.github/prcheck.yml` |

## Contributing

Pull requests are welcome. Please open an issue first to discuss any major changes.

## License

[MIT](LICENSE)
