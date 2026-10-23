# Icons ship as inline SVG components, not an SVG sprite

Each icon (and the Logo) is an SVGO-optimised, server-safe React component exported from its own subpath, rendered as inline `<svg>` that takes `currentColor`. We considered an external sprite with `<use href="sprite.svg#id">`, but the SVG spec forbids cross-origin `<use>`, so a sprite served from a CDN `assetPrefix` breaks, and the major icon sets (Octicons, Radix Icons, Lucide, MUI, Atlaskit, Polaris) all ship inline components. Per-icon subpaths keep unused icons out of the bundle.
