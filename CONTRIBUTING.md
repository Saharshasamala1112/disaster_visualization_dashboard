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

## Demo Video Expectations

When your change affects user-facing behavior, update the demo section in README and keep the walkthrough current.

Suggested demo flow (about 1-2 min):

1. Overview and mission snapshot
2. Live map plus signals
3. Action queue workflow
4. Incident feed and status changes
5. Analytics mode and exports
6. Mobile/tablet responsiveness

Keep one canonical Loom link in README and include a "Last updated" date under the video section.

## Reporting Issues

When filing an issue, include:

- Route/page affected
- Steps to reproduce
- Expected vs actual behavior
- Console/network errors
- Screenshot or recording
