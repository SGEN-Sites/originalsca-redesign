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
- **One store system**: pick Los Angeles or San Diego anywhere (header chip, hero, menu band, sticky dash, drawer);
  every Shop Now, category and brand button then opens that store's live menu, straight on products with its cart.
  Store pages keep their own store's links.
- **The sticky store dash** at the bottom of every page: store switch, Shop Now, Call, Directions and today's hours
  with live open/closed status (America/Los_Angeles).
- **21+ gate** with the 18+ medical recommendation option the Tymber menu allows (minimum 21 recreational, 18 medical).
- **Compliance footer**: licence C10-0000367-LIC, the Prop 65 warning, 21+ line, every legal page, the socials
  (@originalsfamilyfarms, @la__originals__shop, @originalssdshop, Facebook, Weedmaps LA and SD, Leafly).
- **SEO**: one H1 per page, canonicals on the live URLs, JSON-LD (Organization, WebSite, a Store per location with
  opening hours, BreadcrumbList, FAQPage, BlogPosting), sitemap.xml, llms.txt.
- **The design**, "Sunday Cruise" (docs/DESIGN.md): the brand film behind giant chrome 3D ORIGINALS letters on a
  reflective floor, crossing hashtag tapes, a showroom menu, neon Happy Hour with car-club deal plaques, a family
  album that develops, the Family Wall with a gallery light and autographs written by scroll, the farm, a lowrider
  cruising a sunset boulevard, the creed lit one line at a time on a stage, and a bandana-trimmed footer.

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

## Verification on record

See `audit/menu-verification.json` (every shop destination), `audit/ui-test.json` (gate, store dash, store switch,
drawer), `audit/sweep-findings.json`, `audit/gate.json` and `audit/reports/`. Publishing record: `docs/PUBLISH.md`.
