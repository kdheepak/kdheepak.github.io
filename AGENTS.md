# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/`: Astro routes (`blog`, `tags`, `rss`, `search`, `404`).
- `src/components/`: Reusable UI components.
- `src/layouts/`: Shared page layout wrappers.
- `src/data/blog/`: Post content folders (typically `index.md` plus local assets).
- `src/utils/`: Content/build helpers (remark/rehype utilities, post sorting/tag logic).
- `public/`: Static files served as-is.
- Generated output: `dist/`, `.astro/`, and `public/pagefind/` (do not edit manually).

## Build, Test, and Development Commands
- `pnpm dev`: Start the local Astro development server.
- `pnpm build`: Run `astro check`, build the site, generate Pagefind index, and copy search assets.
- `pnpm preview`: Preview the production build locally.
- `pnpm lint`: Run ESLint across the repository.
- `pnpm format:check`: Verify formatting with Prettier.
- `pnpm format`: Auto-format files.
- `pnpm sync`: Refresh Astro-generated types after schema/config updates.
- Always run `pnpn run build` before completing any task.

## Coding Style & Naming Conventions
- Use TypeScript strict mode and ES modules.
- Prettier is the formatting source of truth: 2-space indentation, semicolons, double quotes, 80-character line width.
- Tailwind class order is normalized by `prettier-plugin-tailwindcss`.
- Use PascalCase for Astro components/layouts (for example, `PostDetails.astro`) and camelCase for utility modules (for example, `getSortedPosts.ts`).
- Keep blog slug directories in `src/data/blog/` kebab-case and content entry files named `index.md`.

## Testing Guidelines
- Ignore git status discrepancies in files in the working directory because human may have dealt with some files manually.
- No dedicated unit/integration framework is configured currently.
- Required pre-PR validation: `pnpm format:check`, `pnpm lint`, and `pnpm build`.
- For UI/content updates, run `pnpm dev` and manually verify changed pages, tag archives, and search behavior.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (configured in `cz.yaml`), e.g. `feat: ...`, `fix(blog): ...`, `refactor(icons): ...`.
- Keep commits small and scoped to one logical change.
- PRs should include a short summary, linked issues (if any), and screenshots/recordings for visual changes.
- Confirm formatting, linting, and build checks passed before requesting review.

## Security & Configuration Tips
- Do not commit secrets or private credentials in content files.
- Only `PUBLIC_*` variables are client-exposed; this repo currently defines `PUBLIC_GOOGLE_SITE_VERIFICATION`.
