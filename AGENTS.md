# Repository Guidelines

## Project Structure & Module Organization
- `layout/`: Theme layout entry points like `theme.liquid` and `password.liquid`.
- `templates/`: JSON/Liquid templates for routes (`product.json`, `collection.json`, `page.contact.json`).
- `sections/`: Modular page sections and section group definitions.
- `blocks/`: Reusable blocks inside sections.
- `snippets/`: Shared partials (UI fragments, utilities, forms).
- `assets/`: Front-end assets (CSS, JS, SVG). Base styles in `assets/base.css`.
- `config/`: Theme settings and schema (`settings_schema.json`, `settings_data.json`).
- `locales/`: Storefront translations.

## Build, Test, and Development Commands
This repo is a Shopify theme with no build/test scripts checked in.
- `shopify theme dev`: Local preview with live reload (Shopify CLI).
- `shopify theme push`: Upload changes to a store.
- `shopify theme pull`: Sync theme changes from a store.

## Coding Style & Naming Conventions
- Indentation: 2 spaces in Liquid, JSON, CSS, and JS.
- File naming: kebab-case for sections, blocks, snippets.
- Liquid: follow existing whitespace trimming and keep logic near templates it serves.
- CSS: prefer `assets/base.css` or a clearly named component CSS file.
- JS: keep in `assets/*.js`, avoid inline scripts unless layout-level.

## Testing Guidelines
No automated tests. Validate manually:
- Preview home, product, collection, cart, search, and account.
- Verify translations after `locales/*.json` edits.
- Check in the Shopify theme editor and on mobile.

## Commit & Pull Request Guidelines
- No enforced commit convention (history is generic). Use short, imperative messages.
- PRs: concise description, linked issue (if any), and screenshots for UI changes.

## Configuration & Security Tips
- Treat `config/settings_data.json` as environment-specific.
- Do not commit store credentials or Shopify CLI auth tokens.
