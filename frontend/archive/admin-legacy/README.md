# Admin legacy archive

This folder keeps the previous demo inventory/admin UI for future reference.

It is intentionally outside `src`, so Vite and TypeScript do not compile it.
Do not import files from this folder directly. When a module is rebuilt for the
real API, move only the needed components back into `src/components/admin/*` and
replace the old demo hooks/data dependencies first.
