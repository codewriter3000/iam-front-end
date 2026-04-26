# Static Export Deployment

This project is configured to build a static export into `out/`.

## Local Preview

Do not open files in `out/` directly with `file://...`.

Serve the exported folder over HTTP instead:

```bash
npm run build
npx serve out -l 4173
```

## IIS Deployment

The CI/CD pipeline should publish the contents of `out/` to IIS.

If the site is hosted at the domain root, keep this empty:

```env
NEXT_PUBLIC_BASE_PATH=
```

If the site is hosted under an IIS application or virtual directory such as `/iam-carbon-react-ui`, set the same value before the build:

```env
NEXT_PUBLIC_BASE_PATH=/iam-carbon-react-ui
```

Then run the build in CI/CD so the exported HTML, scripts, and styles are generated with the correct asset paths.

The included `public/web.config` is copied into `out/web.config` during the export and provides:

- default document support for `index.html`
- SPA fallback rewriting to `index.html`
- static MIME mappings for modern asset types
