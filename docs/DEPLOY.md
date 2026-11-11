# Deployment

## Target

Preview: GitHub Pages, repository `SGEN-Sites/originalsca-redesign`, branch `gh-pages`, served at
https://sgen-sites.github.io/originalsca-redesign/ (every page `noindex, nofollow`, robots.txt `Disallow: /`).
Production: any static host (Netlify, Cloudflare Pages, S3 + CloudFront, nginx). **The `/menu/*` path on
originalsca.com belongs to the Tymber store and must keep routing to Tymber**: today one host serves the content
pages (Duda) and Tymber's menu on the same domain. Ask Tymber how the split is done and keep it.

## Build

```bash
node src/build.mjs                                   # dist/ (production canonicals: https://originalsca.com/...)
node ~/.claude/skills/site-reforge/scripts/sr-seo.mjs --project . --dir dist --site-url https://originalsca.com --apply
node src/build.mjs --preview --out dist-preview --base /originalsca-redesign/   # the Pages preview
```

Share cards (`og:image`, `twitter:image`) are absolute: `https://originalsca.com/...` for production and
`https://sgen-sites.github.io/originalsca-redesign/...` for the preview (`--origin <url>` overrides).

## DNS and redirects

Observed on the source (`audit/site-inventory.json`): `/deals` 308 to `/deals/`, `/brands` 308 to `/brands/` (Duda
adds the slash), and every `/menu/...` URL 308 to its trailing-slash form (Tymber, unchanged by this build).

| from | to | why |
|---|---|---|
| `/deals/` | `/deals` (301) | the rebuild serves the slashless URL; keep one canonical |
| `/brands/` | `/brands` (301) | same |
| `/category/*`, `/product/*` | `/` (301) or 410 | Duda template demo pages (bed linen, lamps), not rebuilt |
| `/menu/*` | Tymber (unchanged) | the live store menu and cart |

`/events` and `/wholesale` return 404 on the live site; both are real pages in the rebuild.

## Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: default-src 'self'; img-src 'self' data:; media-src 'self'; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'sha256-<hash of the inline pre-paint script in layout.mjs>'; connect-src 'self'; frame-ancestors 'self'; form-action 'self' <the form provider>
```

The page loads nothing from third parties: fonts, images, video, CSS and JS are all self-hosted. Outbound links
only: the two store menus (originalsca.com/menu, weedmaps.com), Google Maps directions, socials, the clothing shop
and the rewards enrolment (enrollnow.vip).

## Forms

The live forms posted to Duda's form service (no action attribute). The rebuild's preview forms submit by GET to
`/form-sent`, a page that says nothing was sent. Point them at the client's providers before launch
[CONFIRM WITH CLIENT]:

| form | page | fields |
|---|---|---|
| contact / la-contact | /contact, /los-angeles | name, email, phone, message |
| jobs | /jobs | the live application, field for field, resume upload |
| wholesale | /wholesale | name, company, email, phone, licence, state, message |
| drop list / newsletter | /, /deals, /faqs, /drops | email, phone (name, store) |
| opt-in | /membership_agreement | name, email, phone, opt-in consent |

## Post-deploy verification

```bash
node ~/.claude/skills/site-reforge/scripts/sr-parity.mjs --project . --new dist
node ~/.claude/skills/site-reforge/scripts/sr-decontaminate.mjs --project . --strict
node tools/verify-menus.mjs --dir dist          # every shop button lands on products with a cart
node tools/test-ui.mjs --dir dist               # gate, store dash, store switch, drawer
```
