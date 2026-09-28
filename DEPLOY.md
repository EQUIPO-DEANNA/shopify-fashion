# Deploying

The site and its API are one application. There is no second service to keep
alive, and no CORS to configure, because `/api/analyse` and `/api/brief` are
routes of this same app.

## What the build produces

`npm run build` writes `.vercel/output`, the Build Output API layout. That is
pinned in `vite.config.ts` rather than auto-detected — left alone, the build
defaults to `cloudflare-module`, which produces a layout Vercel cannot serve.
The failure mode is a deploy that builds cleanly and then 404s on every path,
which is a slow thing to diagnose. Do **not** set `NITRO_PRESET` in the hosting
platform's environment.

To run a production build locally instead:

```sh
NITRO_PRESET=node_server npm run build
node .output/server/index.mjs
```

## First deploy

1. Import `EQUIPO-DEANNA/shopify-fashion` as a new Vercel project.
2. Leave every build setting at its default. Vercel reads `.vercel/output`.
3. Environment variables: none are required. See `.env.example` for the
   optional ones, and add them for Production before the first deploy if you
   want them — they are read at request time, so adding them later works too,
   but only after a redeploy.
4. Deploy.

Check afterwards that the intake actually reads a shop, because that is the one
thing a green build does not prove:

```sh
curl -s -X POST https://<deployment>/api/analyse \
  -H 'content-type: application/json' \
  -d '{"storeUrl":"bumpersbrand.com"}' | head -c 400
```

You should get counts and families back, not an error.

## Connecting deannafashion.com

Once the deployment is the one we want:

1. Vercel → the project → Settings → Domains → add `deannafashion.com` and
   `www.deannafashion.com`.
2. At the registrar, point the records Vercel asks for. It will name them —
   usually an `A` record for the apex and a `CNAME` for `www`.
3. Wait for the certificate. Vercel issues it once DNS resolves.

Nothing in the code refers to the hostname, so the domain change needs no
redeploy.

## A note on function timeouts

`/api/analyse` reads a brand's whole Shopify feed. A 7,000-product catalogue
takes about twelve seconds; most take two or three. The route holds itself to
`ANALYSE_BUDGET_MS` (45s by default) and answers with a partial read rather than
letting the platform kill it, because a killed function returns a blank 504 that
tells the brand nothing. If the plan's limit is lower than 45s, lower this to
match.
