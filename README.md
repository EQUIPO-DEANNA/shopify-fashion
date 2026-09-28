# Deanna Fashion — the front door

The page a fashion brand lands on, and the form that turns them into a brief the
factory can build an AI try-on experience from.

**Live app**: https://pixel-perfect-render-9588.lovable.app
**Editor**: [Lovable](https://lovable.dev/projects/2debb98d-f9a6-462e-a836-df4007d5d955)

## What it does

Most of the page is marketing. The part that works is the setup section, and it
works for real:

1. A brand gives us their name and their shop's address.
2. We read their **public Shopify feed, live**, and tell them what we found —
   how many products, which of them can be put on a person, which complete a
   look, which we could not place, what budget bands their prices suggest, and
   anything about their catalogue that a human should look at.
3. They describe their world, their host and their scenes.
4. We produce the brief the [brand factory](https://github.com/EQUIPO-DEANNA/brand-factory)
   builds from, hand it to them, and pass it on.

## We store nothing

This is a constraint, not an accident, and it shapes the whole design.

No images are uploaded. No catalogue is copied. No submission is written to a
database. Shopify's product feed carries image URLs, and URLs are all the
experience ever needs — it resizes them through Shopify's own CDN at render
time. A reference photo for the host is taken as a **link**, never as a file.

The brief goes back to the brand's browser and onward to the factory. Neither
this app nor its host keeps a copy.

## The API

Both routes live in this app, so there is one deployment and no CORS.

| Route | Does |
| --- | --- |
| `POST /api/analyse` | `{ storeUrl }` → counts, picker families, budget bands, warnings |
| `POST /api/brief` | a submission → the factory's brief, plus what happens next |

`POST /api/brief` returns `422` with `{ errors: [{ field, message }] }` when a
submission does not validate, so the form can put each message under the input
that caused it. `src/lib/intake/brief.ts` is the only authority on what is
valid; the form mirrors part of it for speed, but the form can be bypassed.

Both are rate limited per caller. `/api/analyse` reads somebody else's
storefront, and an open endpoint that does that is a convenient way to hammer
it.

## Where the interesting code is

| File | Holds |
| --- | --- |
| `src/lib/intake/taxonomy.ts` | what counts as a garment, and which garment it is |
| `src/lib/intake/analyse.ts` | reading a Shopify feed and proposing a catalogue |
| `src/lib/intake/brief.ts` | validating a submission and shaping the brief |
| `src/components/landing/Setup.tsx` | the form |
| `src/routes/api.*.ts` | the two endpoints |

The taxonomy and the analysis are ported from the factory's own, and the
comments in them are worth reading before changing a pattern: nearly every rule
there exists because a real store broke without it, silently, in a way that
passed the typecheck and the tests and was found by a customer.

## Development

```sh
npm install
npm run dev     # http://localhost:8080
npm run lint
npm run build
```

Deploying, and pointing `deannafashion.com` at it: see [DEPLOY.md](DEPLOY.md).
Configuration: see [.env.example](.env.example). Nothing in it is required.

## Working with Lovable

Commits pushed to `main` sync back into the Lovable editor, so keep the branch
in a working state, and avoid rewriting published history — force pushing or
rebasing already-pushed commits rewrites it on Lovable's side too.
