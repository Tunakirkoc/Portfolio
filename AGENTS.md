# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Bun is the package manager. Node ≥ 22.12.0 required.

| Task             | Command           |
| ---------------- | ----------------- |
| Dev server       | `bun run dev`     |
| Production build | `bun run build`   |
| Preview build    | `bun run preview` |

Dev server runs at `localhost:4321`. Build output goes to `dist/`.

No test suite or linter is configured.

### Container and Kubernetes

- **Docker** — `Dockerfile` builds static assets with Bun, then serves `dist/` with `nginxinc/nginx-unprivileged` on port **8080**.
- **Build image** — `docker build -t portfolio:latest .`
- **Apply manifests** — Edit `k8s/deployment.yaml` `image:` (or `k8s/kustomization.yaml` `images:`) to your registry tag, then `kubectl apply -k k8s/`. Uncomment `ingress.yaml` in `kustomization.yaml` when ready and set `host` in `k8s/ingress.yaml` (and `ingressClassName` to match your cluster).

## Project Goal

Personal portfolio for Tuna KIRKOC — two distinct sections sharing a single Astro codebase:

- **Labs** — Homelab, IT projects and engineering. Minimalist Dark theme. Will live at `tuna.kirkoc.fr/labs`.
- **Lens** — Cinematography, photography, creative work. Colorful theme (TBD). Will live at `tuna.kirkoc.fr/lens`. Currently disabled on homepage (link commented out, design not started).

Root domain (`tuna.kirkoc.fr`) serves the shared landing page where users choose a side.

## Architecture

### Homepage (`src/pages/index.astro`)

Fullscreen, no navbar. Two zones stacked vertically:

1. **Hero** — Profile photo, name, bio, quote. Animated `DotGrid` React component as background (greyscale dots attracted to cursor via canvas).
2. **Split section** — Labs (left) | Lens (right). Each expands on hover. Lens link is currently a disabled `<div>` (not an `<a>`).

### Content Collections

Two Astro content collections driven by MDX files:

- `src/content/labs/` — IT/engineering project posts
- `src/content/lens/` — Photography/cinematography posts (no content yet)

### Routing

- `/` → `src/pages/index.astro` — Fullscreen landing with DotGrid hero + Labs/Lens split
- `/labs` → `src/pages/labs/index.astro` — Lists non-draft posts, emerald accent
- `/labs/[id]` → `src/pages/labs/[id].astro` — Renders MDX post with prose styles, ToC sidebar, per-post accent color
- `/lens` → `src/pages/lens/index.astro` — "coming soon" placeholder
- `/about` → `src/pages/about.astro` — Bio, skills, timeline, and contact links

`/lens/[id]` is not yet implemented (no content).

### Per-Post Accent Color System

Each post can set an `accent` field in frontmatter (e.g. `accent: "cyan"`). The `src/lib/accents.ts` module maps this to a set of Tailwind class strings (text, borders, backgrounds, hover states) used by `LabsPostCard.astro` and `labs/[id].astro`. Falls back to `emerald` when unset. Valid values are standard Tailwind color names (red through rose).

To pass the accent color to client-side `<script>` tags (which can't access Astro props), the post page uses a `data-toc-active` attribute on a parent element. Client JS reads this to apply the correct active-heading highlight class.

### Images

All images stored in `src/assets/` for Astro optimization. Use the `<Image />` component from `astro:assets`.

### TypeScript

Strict mode via `astro/tsconfigs/strict`. JSX is configured for React (`react-jsx`).

### Styling

Tailwind CSS v4 — configured via `@tailwindcss/vite` plugin (no `tailwind.config.`* file needed). Styles entrypoint: `src/styles/global.css`.

### Fonts

Inter and JetBrains Mono loaded from Google Fonts in `src/layouts/BaseLayout.astro`. Use `font-[Inter]` or `font-[JetBrains_Mono]` inline in Tailwind v4.

### Content Schema

Defined in `src/content.config.ts` (Astro 6 Content Layer API using `glob` loader). Both `labs` and `lens` collections share the same schema. MDX posts use frontmatter fields:

- `title` (string) — post title
- `description` (string) — short summary
- `date` (string) — ISO date string
- `tags` (string array) — displayed as pills
- `draft` (boolean, optional) — excluded from listing when true
- `accent` (enum, optional) — Tailwind color name for per-post theming, defaults to `emerald`

`@astrojs/mdx` is in `astro.config.mjs` integrations. `@tailwindcss/typography` is enabled via `@plugin "@tailwindcss/typography"` in `global.css` — use `prose prose-invert` on article elements. Code blocks use Shiki with `github-dark-default` theme (configured in `astro.config.mjs`).

### Interactive Components

- `DotGrid` (`src/components/DotGrid.tsx`) — React canvas component using `client:load`. Renders an animated grid of greyscale dots that are attracted toward the cursor. Used only on the homepage hero.
- `LabsPostCard` (`src/components/LabsPostCard.astro`) — Card component with CSS `::after` radial-gradient glare effect that follows the mouse. Uses `data-card` attribute for the effect.