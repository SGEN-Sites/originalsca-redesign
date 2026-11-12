# Pitch notes: the Originals redesign

A redesign concept for originalsca.com: kept exactly, new, and the questions for Originals. Every visible fact traces
to the live site or to the operator brief (`facts/client-facts.json`); anything uncertain is a `[CONFIRM WITH CLIENT]`
comment in the page source, never in the visible copy.

## Kept exactly from the live site

- **Every Cannablog article (21)** at its live URL, word for word, with its own images and its own
  "< Older Post / Newer Post >" links; each gets the H1 the live page lacked.
- **The Cannablog lists**: the /blog list and the recent-posts list under every article keep the live titles, author
  bars ("By Diogo Ribas • April 13, 2022") and excerpts.
- **The live form messages** ("Thank you for contacting us. We will get back to you as soon as possible.", "Oops,
  there was an error sending your message. Please try again later.", and the jobs and opt-in versions), kept in the
  form markup for the provider integration.
- **Legal and opt-in pages** word for word: Privacy Policy, Terms of Service, Cookie Policy, Disclaimer, California
  Opt-in, Rewards Program and Opt-in (with the VIP Program Login/Join link), Membership Agreement (with its consent text).
- **The home H1** "Best Cultivators in California", the shop-by-category intro, the shop-by-brand words, the Cannablog
  intro and the newsletter heading.
- **Every live deal line**: LA 30% OFF FTP, San Diego 50% OFF FTP, "(EXCLUDES ORIGINALS & DODI BRAND PRODUCTS)",
  First Time Patient Deals "30% - excludes Originals, Flight, & Dodi", Weedmaps deals "Changing weekly!".
- **All seven FAQs** (the hours answer rebuilt from the store records, see below).
- **Store details**: addresses, phones, hours, the contact form and the job application, field for field.
- **URLs**: `/`, `/deals`, `/brands`, `/retail`, `/blog`, `/faqs`, `/jobs`, `/contact`, `/los-angeles`,
  `/los-angeles-store`, `/san-diego-store`, `/bussin-merch`, every legal URL and every post URL.
- **Their media**: the hero film, the logo lockup (traced to vector), store photos, the car show and Hall of Flowers
  graphics, the Farmers Cup graphic, product photos, the crown and leaf pattern.

## New

- **Pages for the page types the site lacked**: Our Story, Strain Library (10 house strains, quoting the live strain
  articles), Collabs (text only), Media, Drops, Find Originals, Shop, Clothing; a real **Events** page and a real
  **Wholesale** page (both 404 on the live site); a 404 page.
- **One store system**: pick Los Angeles or San Diego anywhere (the header switch, the hero, the menu band, the sticky dash, the More panel);
  every Shop Now, category and brand button then opens that store's live menu, straight on products with its cart.
  Store pages keep their own store's links.
- **The sticky store dash** at the bottom of every page: store switch, Shop Now, Call, Directions and today's hours
  with live open/closed status (America/Los_Angeles).
- **21+ gate** with the 18+ medical recommendation option the Tymber menu allows (minimum 21 recreational, 18 medical).
- **Compliance footer**: licence C10-0000367-LIC, the Prop 65 warning, 21+ line, every legal page, the socials
  (@originalsfamilyfarms, @la__originals__shop, @originalssdshop, Facebook, Weedmaps LA and SD, Leafly).
- **SEO**: one H1 per page, canonicals on the live URLs, JSON-LD (Organization, WebSite, a Store per location with
  opening hours, BreadcrumbList, FAQPage, BlogPosting), sitemap.xml, llms.txt.
- **The design**, "Sunday Cruise" (docs/DESIGN.md): a shop bar header (the crown, the menu categories as quick links
  to the chosen store's menu, the LA/SD switch with live hours); a hero that dives through the giant ORIGINALS
  letters into the brand film; a showroom menu as a bento box of category cards, Happy Hour as a spotlight reel of deal
  title cards picked from tabs, a family album that develops,
  the Family Wall with a gallery light and autographs written by scroll, the farm, a lowrider cruising a sunset
  boulevard, the creed lit one line at a time on a stage, and a bandana-trimmed footer. The brand itself is flat
  black and white; photography and film keep their colour.

## Live-site defects found during the audit

1. **robots.txt blocks every search engine from the whole site** (`User-agent: * / Disallow: /`); a site: search
   returned no pages. This alone is worth the conversation.
2. The nav's EVENTS link opens `/bussin-merch`, a template placeholder ("This is paragraph text. Click it or hit the
   Manage Text button..."); `/events` and the footer's `/wholesale` return 404.
3. The home category tiles read "Lorem ipsim." and the Deals / Rewards / Events tiles "Lorem Ipsum"; Edibles is
   missing from the grid; a "Pills" tile opens a menu with no pills.
4. The footer's ORIGINALS SAN DIEGO link (www.originalssandiego.com) has no DNS record; originalssandiego.com
   redirects to originalsca.com; the San Diego store page's "Visit site" loops back. The only working San Diego menu
   link is on `/retail` (Weedmaps).
5. LA hours appear three ways: `/retail` 7AM to 9:45PM (Sun 8AM to 7:45PM), `/los-angeles-store` 9AM to 9:45PM (Sun
   10AM to 7:45PM), `/faqs` 9AM to 10PM every day (Sun 10AM to 8PM).
6. The San Diego address links to the same Google Maps short link as Los Angeles.
7. `/jobs` lists the placeholder phone 555.555.5555 and "3 STORES".
8. `/prop-65-warning` says only "Need info".
9. The contact, LA and jobs forms are headed "Wholesale Form".
10. 15 Duda template demo pages (bed linen, lamps, cutlery) are live and in the sitemap.
11. Two H1s on the home page; no H1 on any of the 21 posts.
12. Stock photography (Shutterstock, Unsplash, Pexels) on the category tiles; the shop-by-brand row renders empty.
13. Tymber's NewsGothic stylesheet host (app.tymber.me) serves a TLS certificate for another domain.
14. The same generic filler ("Shop the best dispensary in Los Angeles and have a top-level cannabis experience every
    time") repeats in every footer and several intros.
15. The Gelato strain profile post links "in California" to a WordPress admin edit screen
    (`/wp-admin/post.php?post=750&action=edit`), a dead link left from an older site. The rebuild keeps the words.
16. `/contact` shows INFO@ORIGINALSCA.COM, but every email link and the EMAIL button on it open
    support@originalsca.com.

## Questions for Originals: every [CONFIRM WITH CLIENT] item

1. **1450 Mirasol St, Los Angeles, CA 90023**: what is it (office, cultivation, distribution)? Not shown as a store.
2. **The Massachusetts cultivation facility**: when can it be mentioned? Not shown.
3. **San Diego online menu**: www.originalssandiego.com does not resolve, so every San Diego button opens the store's
   live Weedmaps menu (verified: products, Add to bag, a bag). Is there a San Diego store site to use instead?
4. **San Diego hours**: Weedmaps showed "open until 10:00pm" on 2026-11-11; the brief and `/retail` say 9PM.
5. **LA hours**: which of the three live versions is right? (The build uses Mon–Sat 7AM–9:45PM, Sun 8AM–7:45PM.)
6. **Veteran-owned** (LA store): confirm before it is shown.
7. **Collabs**, each one: Chris Brown (Bussin', with OHB Farms), Xzibit (Napalm), Ice Cube (Caviar Gold), Mike Tyson
   (Tyson Ranch), Nipsey Hussle (Marathon OG), Royal Blunts, Beast Mode, Dodi Oakland.
8. **Bussin'** page details and the release party.
9. **All-day Sunday happy hour**: which store(s), and the discount.
10. **San Diego daily deals**: which day-by-day deals to feature.
11. **Upcoming events** (three placeholder cards on /events): names, dates, venues, RSVP links.
12. **The next drop** (/drops).
13. **Strain notes** for Skywalker, SFV OG, Paris OG and Bussin' (the live site has no article for them).
14. **Find Originals retailer list**: the dispensaries in California and Massachusetts that carry Originals.
15. **Wholesale**: contact, process and product list.
16. **Prop 65 wording**: confirm with compliance counsel (the live page has none).
17. **Press and media contact** (the live site lists info@originalsca.com). Related: **the /contact email** shows
    info@ but links to support@ (kept as live); which address should customers use?
18. **Hiring contact** (the live page shows a placeholder phone).
19. **Form providers**: contact, jobs, wholesale, newsletter / drop list (SMS and email), opt-in. Preview forms do not send.
20. **The FAQ hours answer**, rebuilt from the store records.
21. **Fonts**: license ParaType News Gothic for web to bring the brand's own headline face back (open stand-ins now).
22. **Brand finish and accent colour**: the brand is flat black and white (logo, lettering, buttons), like the live
    site and its logo files; photography keeps its colour. The brief proposed Originals red #E11D2C with chrome
    lettering and coloured stage light. Does the client want an accent, and which? Add `?accent=red` to any preview
    URL to show them that version.
23. **A photo of the San Diego store**: the only storefront photo on the live site is a Google Street View capture
    (it carries a 2022 Google watermark), so the redesign does not use it. Since 2026-11-12 the San Diego store cards
    and the San Diego page's photo stack use the live /retail page's San Diego interior photo (the store's back wall,
    730 px; it had been mislabelled as the LA storefront), upscaled 2x with Topaz High Fidelity V2 (face enhancement
    off; owner OK 2026-11-12) and lightly graded. The San Diego page hero is still an illustration: the San Diego Google Maps listing
    has the business's own 4000 px exterior photo (Sep 2022) that could replace it. Confirm which to use.
    The home deals reel's San Diego card uses a golden-hour photo of the storefront (owner-supplied 2026-11-12,
    `store-sd-front`). It is labelled as generated until confirmed: its door lettering is garbled, as AI-made images
    often are, and its building number read 6240 where the store is 6220 Federal Blvd. The digit was corrected locally
    by copying the photo's own "2" (no AI). Its banner shows "$25 grams top shelf" and "Mondays: $10 off any 1/2 oz":
    confirm those deals are current, or the banner should be retouched. Confirm where the photo came from.
24. **First-time patient exclusions**: the live site lists the first-time patient deal as "30% - excludes Originals,
    Flight, & Dodi" in one place and the store deals as "(EXCLUDES ORIGINALS & DODI BRAND PRODUCTS)" in another.
    Which exclusions are right (with or without Flight), and does the 30% first-time deal apply in Los Angeles only?
25. **The Happy Hour photo** (owner-supplied, 2026-11-11, replaced 2026-11-12): the card now uses a second owner photo,
    a woman holding a leashed bulldog in front of a red 1963 Impala. It shows an identifiable person and a readable
    licence plate. Its left side is an AI generative extension of the building, sky and lot, made to fill the wide
    card; it is labelled as generated. Confirm the client owns the photo, has her permission, and accepts the extension
    before it is published (`private/gen/happy-hour-lowrider/jobs.json` records every step). The 2026-11-11 photo of
    two people at a car show is no longer used. An independent review failed the first version (garbled plate
    lettering, a visible seam); after the fix round its re-review rated it MINOR (2026-11-12).
26. **The Merch tile image** (owner-supplied, 2026-11-11): a folded zip hoodie with the ORIGINALS wordmark. Is it a
    real product photo, and is this hoodie in the clothing line? It is labelled as generated in the markup until
    confirmed otherwise.
27. **Category descriptions** (the front of each category card): drafts written for the redesign, since the live
    site's category tiles carry placeholder text. Confirm or replace the wording (no health or potency claims).
28. **The store-wall photo** behind the categories (owner-supplied, 2026-11-11; shown black and white and darkened): it is
    not among the live site's images and its screens show garbled text. Is it the client's own photo of the LA store, a
    customer's upload (which the brief rules out), or AI-made? Labelled as generated in the markup until confirmed.
29. **The "Our story" album photos** (owner-supplied 2026-11-12; the owner has not confirmed they are the client's):
    - a man with an Originals bag in front of a wall of black-and-white portraits (captioned "The family wall");
    - a man holding an Originals flower pouch between two women in fishnets;
    - a grower looking at a bud;
    - a grower in an Originals Family Farms shirt.
    All four show identifiable people. In the pouch photo the man appears to have a joint or cigarette in his mouth;
    check that against the client's own advertising rules. Confirm the source, the people's permission, and that the
    wall is the LA store's family wall. They were colour-matched and graded only (no AI).
30. **The stores' own Google Maps listing photos** (owner, 2026-11-12: "you may use some of the LA store interior
    images from here"): the LA store photos (the LA page hero and photo stack, the store cards, the /retail hero, the
    "Stanford Ave" storefront polaroid, the LA deals card) and the Family Wall's first three panels are the business's
    own "By owner" photos on its Google Maps listing (Originals Factory), downloaded at original size (5900-7000 px,
    Sony A7 III / A7 IV, professionally edited, 2021-2022); no AI. They were posted by the business itself, but a
    photographer took them: confirm the client's licence covers the website. In the sales-floor photos the shoppers are
    small and seen from behind, and one in-store screen shows a promo with two models. The family wall shows famous
    people (as the live site describes it), and panel 5 shows an identifiable man (an owner-supplied photo, source
    unconfirmed). The listing's holiday photos (Christmas tree, garlands, Halloween props) were skipped so the site
    does not look seasonal. Visitor photos on either listing were not used.
    The Family Wall section now shows a **digital replica of the wall print** (owner, 2026-11-12). One repeat of the
    print was rebuilt flat from those listing photos, with no AI and no swapped prints, and is shown repeated. It
    reproduces the wall's portraits of famous people themselves, not just a photo of the store, so the client must
    confirm they are cleared to show those images on the website.
31. **Brand logos on the home "Shop by brand" marquee** (owner, 2026-11-12: "use actual brand logos, source them
    online"). Thirteen real logos:
    - the brands' own website headers;
    - the client's own LA online menu: the image URLs were read from the project's saved copies of the menu pages,
      because originalsca.com's robots.txt disallows crawling.

    Caviar Gold, Wizard Trees and Heritage Hash Co. stay as name tiles: no official logo source was reachable.
    Rove's mark is its "Ten Years" anniversary version, so ask for the current one. Every source is listed in
    `private/client-media/brand-logos/provenance.json`. Confirm with the client that the brands are happy to have their
    marks shown, or get each brand's retailer marketing kit; the live site already shows six brand logos.
32. **The Daily deals card photo** (owner-supplied 2026-11-12): an ORIGINALS glass jar of flower on a counter, on the
    San Diego Daily card of the home deals reel and the /deals carousel. Confirm it is the client's own photo. Its
    vertical version (`daily-jar-tall`, also owner-supplied 2026-11-12, on every /deals slide and the phone card) is
    1024x1536, a standard AI image-generator size, so it is marked generated until the client confirms where it came
    from. The
    Gelato strain card now shows the client's own Gelato bud cut out on black (no generated pixels), to match the
    other strain cards; those other cards are AI illustrations, so real photos of each house strain would be better.
33. **The Save now photo** (owner-supplied 2026-11-12): a budtender in an Originals shirt helping customers at a store
    counter, behind the 30% first-time-patient tile on /deals. It shows identifiable staff and customers: confirm the
    client owns the photo and has the people's permission.
34. **Collab partner logos and names** (owner, 2026-11-12: "use actual brand logos here"): the home collab tape shows
    Beast Mode's and Royal Blunts' real logos, from their own websites. The other six keep their names, because no
    official logo source was reachable: Bussin', Napalm, Caviar Gold, Tyson Ranch (its site fails its security
    certificate), Marathon OG, Dodi Oakland (its site no longer resolves). Confirm written permission to show each
    partner's logo and each celebrity's name: Chris Brown, Xzibit, Ice Cube, Mike Tyson, Nipsey Hussle's estate,
    Marshawn Lynch. Ask for the partners' logo files.

## Verification on record

See `audit/menu-verification.json` (every shop destination), `audit/ui-test.json` (gate, store dash, store switch,
header and More panel), `audit/sweep-findings.json`, `audit/gate.json` and `audit/reports/`. Publishing record: `docs/PUBLISH.md`.
