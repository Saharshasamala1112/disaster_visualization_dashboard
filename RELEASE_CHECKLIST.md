# Release Checklist

Use this checklist for each tagged release.

## Pre-release

- [ ] Pull latest `main` and verify working tree is clean.
- [ ] Run install and validations locally:
  - [ ] `npm install`
  - [ ] `npm run build`
  - [ ] `npm test` (or `npm run test` if configured)
- [ ] Confirm README reflects current behavior and setup.
- [ ] Confirm demo video link works and "Last updated" date is current.
- [ ] Update [CHANGELOG.md](CHANGELOG.md) under the next version heading.

## Versioning

- [ ] Choose next version based on change type:
  - [ ] Patch: bug fixes
  - [ ] Minor: backward-compatible features
  - [ ] Major: breaking changes
- [ ] Replace `[Unreleased]` with new version and date in changelog.
- [ ] Commit release prep changes.

## Tag and Publish

- [ ] Create annotated tag: `git tag -a vX.Y.Z -m "release: vX.Y.Z"`
- [ ] Push commit and tags: `git push origin main --tags`
- [ ] Create GitHub Release notes from changelog.

## Post-release

- [ ] Add new empty `[Unreleased]` section at top of changelog.
- [ ] Verify production deployment health and smoke-test key routes.
- [ ] Announce release summary with highlights and known limitations.
