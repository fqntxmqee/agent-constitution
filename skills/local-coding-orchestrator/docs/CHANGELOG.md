# Changelog

## v2 scaffold

### Added
- persistent task schema and lifecycle model
- done policy evaluator
- retry brief generation
- role-based pipeline presets
- worker launch adapter
- synchronous and background execution modes
- TaskFile-based prompt handoff
- worker reconcile step
- environment failure classification
- supervisor auto-advance and auto-launch support
- summary cleaning and objective-check backfill framework
- docs index, capability map, script interface, usage guide, and status overview

### Improved
- clearer separation of supervisor vs worker responsibilities
- better product-style documentation and operator guidance
- stronger handling of environment-blocked runs

### Known rough edges
- background execution still depends on local CLI behavior
- result interpretation is partly heuristic
- objective checks still need deeper artifact-driven automation
