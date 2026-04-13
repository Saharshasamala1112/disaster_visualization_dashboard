# Contributing Guide

Thanks for your interest in improving Disaster Visualization Dashboard.

## Development Setup

1. Fork and clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

4. Validate before pushing:

```bash
npm run build
```

## Branching

- Feature: `feature/<short-description>`
- Fix: `fix/<short-description>`
- Docs: `docs/<short-description>`

## Coding Standards

- Use TypeScript strict typing.
- Keep components focused and composable.
- Prefer existing UI primitives from `components/ui`.
- Preserve current visual language and interaction style.
- Avoid adding large dependencies without justification.

## Commit Style

Use conventional-style prefixes when possible:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only
- `refactor:` code improvements without behavior change
- `chore:` maintenance

Example:

```text
feat: add live cyclone wind ingestion via OpenWeather fallback
```

## Pull Request Checklist

- [ ] Build passes locally (`npm run build`)
- [ ] Changes are scoped and focused
- [ ] README updated when behavior or setup changes
- [ ] No secrets committed (`.env.local` excluded)
- [ ] Screenshots added for UI changes

## Reporting Issues

When filing an issue, include:

- Route/page affected
- Steps to reproduce
- Expected vs actual behavior
- Console/network errors
- Screenshot or recording
