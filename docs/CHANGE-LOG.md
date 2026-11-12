# Change log

One row per section of the source site, generated from `audit/change-control.json` by `tools/docs-changelog.mjs`.

## Legend

- **PRESERVE**: kept as-is; content and function unchanged
- **IMPROVE**: same content and meaning, better structure, hierarchy or design
- **REPLACE**: superseded by a better structure (reason required)
- **REMOVE**: deliberately dropped (reason required)
- **ADD**: new section that did not exist on the source

## Totals

1142 rows: REPLACE 5, IMPROVE 318, REMOVE 798, PRESERVE 4, ADD 17.

## Grouped decisions

| group | rows | decision | why |
|---|---|---|---|
| Live Tymber store menu (/menu/los-angeles/..., products, brands, categories) | 668 | REMOVE (not rebuilt) | Live Tymber store menu page (product, brand or category listing with the cart). It stays on the live store platform and every Shop, category and brand button on the redesign links straight to it, so the shopper lands on products with a working cart. It is not rebuilt as a static page. |
| Duda template demo pages (/category/*, /product/*) | 128 | REMOVE | Duda template demo page (bed linen, lamps, cutlery) left over from the site template; it has nothing to do with Originals and publishing it under the brand would mislead. Not rebuilt. |

## Decisions on the content pages

| page | section | decision | narrative slot | why |
|---|---|---|---|---|
| / | Shop at the best dispensary in Los Angeles and have a top-level cannab | REPLACE | value-proposition | Operator direction: drop the generic SEO filler ("top-level cannabis experience every time"). H1 "Best Cultivators in California" kept; the hero is rebuilt as the Showroom (the brand film behind giant chrome ORIGINALS letters on a reflective floor) with "The Brand Behind The Brands" from declared facts. |
| / | FLOWER | IMPROVE | benefits-solution | FLOWER tile kept; the "Lorem ipsim." placeholder removed; links straight to the selected store's Flower category with products and the cart. Home, 2026-11-12 (owner): shown on the bento category wall, which replaced the fan (the fan is in private/retired/2026-11-12-category-fan/). |
| / | EXTRACTS | IMPROVE | benefits-solution | EXTRACTS tile kept, placeholder removed, deep link to the store's extracts / concentrates category. Home, 2026-11-12 (owner): shown on the bento category wall, which replaced the fan (the fan is in private/retired/2026-11-12-category-fan/). |
| / | CARTRIDGES | IMPROVE | benefits-solution | CARTRIDGES tile kept, placeholder removed, deep link to the store's cartridges / vape pens category. Home, 2026-11-12 (owner): shown on the bento category wall, which replaced the fan (the fan is in private/retired/2026-11-12-category-fan/). |
| / | DRINKS | IMPROVE | benefits-solution | DRINKS tile kept, placeholder removed, deep link to the store's beverages category. Home, 2026-11-12 (owner): shown on the bento category wall, which replaced the fan (the fan is in private/retired/2026-11-12-category-fan/). |
| / | PREROLLS | IMPROVE | benefits-solution | PREROLLS tile kept, placeholder removed, deep link to the store's pre-roll category. EDIBLES (on the live menu but missing from the live home grid) added beside it. Home, 2026-11-12 (owner): shown on the bento category wall, which replaced the fan (the fan is in private/retired/2026-11-12-category-fan/). |
| / | TINCTURES | IMPROVE | benefits-solution | TINCTURES tile kept, placeholder removed, deep link to the store's tinctures category. Home, 2026-11-12 (owner): shown on the bento category wall, which replaced the fan (the fan is in private/retired/2026-11-12-category-fan/). |
| / | TOPICALS | IMPROVE | benefits-solution | TOPICALS tile kept, placeholder removed, deep link to the store's topicals category. Home, 2026-11-12 (owner): shown on the bento category wall, which replaced the fan (the fan is in private/retired/2026-11-12-category-fan/). |
| / | PILLS | REMOVE | benefits-solution | PILLS tile removed: no pills or capsules category or product exists on the live LA menu (0 of 581 products), and the live tile only opened the menu home. Showing it would send a shopper to a page without the products it names. |
| / | DEALS | IMPROVE | strategic-cta | DEALS tile kept, "Lorem Ipsum" placeholder removed; becomes the Happy Hour deals band linking to /deals. Home deals, 2026-11-12 (owner): the tab-driven Spotlight Reel, with the new Happy Hour, San Diego storefront and Daily jar photos. |
| / | REWARDS | IMPROVE | strategic-cta | REWARDS tile kept, placeholder removed; links to the Rewards Program page and its VIP enrolment. |
| / | EVENTS | IMPROVE | strategic-cta | EVENTS tile kept, placeholder removed; now links to the new /events page (the live Events link 404s or opens a placeholder). Home events, 2026-11-12 (owner): the three event cards turn over in a lenticular carousel (an original build of the effect), with the same links and labels. |
| / | SHOP BY BRAND | IMPROVE | trust-positioning | SHOP BY BRAND kept with its words; brand buttons deep link to each brand on the live menu; Originals house brand leads. Home brand marquee, 2026-11-12 (owner): white logos, no containers. |
| / | RECENT BLOGS | PRESERVE | benefits-solution | RECENT BLOGS (Cannablog) kept with its intro. |
| / | THC Extract For Fast Relief | PRESERVE | benefits-solution | Blog teaser kept. |
| / | Cannabis Books For Handy Reference | PRESERVE | benefits-solution | Blog teaser kept. |
| / | Cannabis Legal States And Economic Growth | PRESERVE | benefits-solution | Blog teaser kept. |
| / | SUBSCRIBE TO OUR NEWSLETTER AND GET THE LATEST UPDATE ON DEALS, EVENTS | IMPROVE | strategic-cta | Newsletter heading kept word for word as the drop list sign-up; preview form does not submit (no backend) [CONFIRM WITH CLIENT list provider]. Home drop list, 2026-11-12 (owner): made compact. |
| /affordable-cannabis-brands-originals-factory-weed-shop | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /affordable-cannabis-brands-originals-factory-weed-shop | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /affordable-cannabis-brands-originals-factory-weed-shop | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /affordable-cannabis-brands-originals-factory-weed-shop | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /affordable-cannabis-brands-originals-factory-weed-shop | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /affordable-cannabis-brands-originals-factory-weed-shop | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /affordable-cannabis-brands-originals-factory-weed-shop | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /affordable-cannabis-brands-originals-factory-weed-shop | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /affordable-cannabis-brands-originals-factory-weed-shop | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /affordable-cannabis-brands-originals-factory-weed-shop | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /affordable-cannabis-brands-originals-factory-weed-shop | Gelato Strain by Originals: Sweet, Doughy Terps and A Heavy Euphoria | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /blog | THC Extract For Fast Relief | IMPROVE | benefits-solution | Cannablog index entry kept (title, byline, date, excerpt) on /blog. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /blog | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Cannablog index entry kept (title, byline, date, excerpt) on /blog. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /blog | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Cannablog index entry kept (title, byline, date, excerpt) on /blog. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /blog | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Cannablog index entry kept (title, byline, date, excerpt) on /blog. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /blog | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Cannablog index entry kept (title, byline, date, excerpt) on /blog. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /blog | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Cannablog index entry kept (title, byline, date, excerpt) on /blog. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /blog | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Cannablog index entry kept (title, byline, date, excerpt) on /blog. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /blog | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Cannablog index entry kept (title, byline, date, excerpt) on /blog. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /blog | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Cannablog index entry kept (title, byline, date, excerpt) on /blog. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /blog | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Cannablog index entry kept (title, byline, date, excerpt) on /blog. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /brands | OUR BRANDS | IMPROVE | trust-positioning | OUR BRANDS kept with its words; the six live brand tiles become a brand wall with deep links per store (LA live menu brand pages; San Diego live menu). |
| /bussin-merch | section 1 | REPLACE | benefits-solution | The live page is a Duda placeholder ("This is paragraph text. Click it or hit the Manage Text button...") titled EVENTS. Replaced on the same URL by a real Bussin' page (the collab strain and the release party, from declared facts) linking to Originals Clothing; the nav Events link now opens /events. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /buying-originals-weed-at-originals-san-diego | COMPLETE GUIDE TO BUYING ORIGINALS WEED AT ORIGINALS SAN DIEGO | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /buying-originals-weed-at-originals-san-diego | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /buying-originals-weed-at-originals-san-diego | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /buying-originals-weed-at-originals-san-diego | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /buying-originals-weed-at-originals-san-diego | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /buying-originals-weed-at-originals-san-diego | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /buying-originals-weed-at-originals-san-diego | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /buying-originals-weed-at-originals-san-diego | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /buying-originals-weed-at-originals-san-diego | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /buying-originals-weed-at-originals-san-diego | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /buying-originals-weed-at-originals-san-diego | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /california-opt-in | section 1 | IMPROVE | strategic-cta | California Opt-in copy kept word for word. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /cannabis-books-for-handy-reference | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-books-for-handy-reference | Cannabis Books You’ll Love | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-books-for-handy-reference | 1. Great: A Field Guide to Marijuana | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-books-for-handy-reference | &zwnj; | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-books-for-handy-reference | 2. Grass Roots: The Rise and Fall and Rise of Marijuana in America | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-books-for-handy-reference | 3. Ask Ed: Marijuana Success | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-books-for-handy-reference | 3. Bong Appetit: Mastering the Art of Cooking with Weed | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-books-for-handy-reference | &zwnj; | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-books-for-handy-reference | 4. The Leafly Guide to Cannabis: A Handbook for the Modern Consumer | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-books-for-handy-reference | &zwnj; | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-books-for-handy-reference | 5. Stoned Beyond Belief | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-books-for-handy-reference | Cannabis Books Coming to a Coffee Table Near You | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-books-for-handy-reference | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-books-for-handy-reference | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-books-for-handy-reference | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-books-for-handy-reference | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-books-for-handy-reference | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-books-for-handy-reference | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-books-for-handy-reference | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-books-for-handy-reference | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-books-for-handy-reference | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-books-for-handy-reference | Gelato Strain by Originals: Sweet, Doughy Terps and A Heavy Euphoria | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-edibles-guide-originals-la | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-edibles-guide-originals-la | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-edibles-guide-originals-la | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-edibles-guide-originals-la | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-edibles-guide-originals-la | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-edibles-guide-originals-la | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-edibles-guide-originals-la | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-edibles-guide-originals-la | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-edibles-guide-originals-la | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-edibles-guide-originals-la | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-edibles-guide-originals-la | Gelato Strain by Originals: Sweet, Doughy Terps and A Heavy Euphoria | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-legal-states-and-economic-growth | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-legal-states-and-economic-growth | Legal Cannabis | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-legal-states-and-economic-growth | Economic Effects Realized By Cannabis Legal States | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-legal-states-and-economic-growth | Bringing in New Residents | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-legal-states-and-economic-growth | Creating Jobs | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-legal-states-and-economic-growth | Additional Tax Revenue | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-legal-states-and-economic-growth | Will Cannabis Ever Become Legal at the Federal Level? | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /cannabis-legal-states-and-economic-growth | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-legal-states-and-economic-growth | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-legal-states-and-economic-growth | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-legal-states-and-economic-growth | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-legal-states-and-economic-growth | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-legal-states-and-economic-growth | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-legal-states-and-economic-growth | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-legal-states-and-economic-growth | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-legal-states-and-economic-growth | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /cannabis-legal-states-and-economic-growth | Gelato Strain by Originals: Sweet, Doughy Terps and A Heavy Euphoria | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /contact | Wholesale Form | IMPROVE | strategic-cta | Contact form kept (Name, Email, Phone, How can we help?); its mislabelled "Wholesale Form" heading corrected; preview form does not submit [CONFIRM WITH CLIENT form provider]. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /contact | CONTACT INFO | IMPROVE | strategic-cta | CONTACT INFO kept. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /contact | (323) 696-9680 | IMPROVE | strategic-cta | LA phone kept. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /contact | INFO @ORIGINALSCA . COM | IMPROVE | strategic-cta | info@ email kept. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /contact | 2 STORES | IMPROVE | strategic-cta | "2 STORES / VIEW STORES" kept, linking to /retail. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /cookie-policy | section 1 | IMPROVE | footer | Cookie Policy kept word for word. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /deals | 30% OFF FTP | IMPROVE | strategic-cta | LA 30% OFF FTP kept. /deals, 2026-11-12 (owner): the deal plaques were replaced by the concave carousel; these words are kept word for word on its cards. |
| /deals | (EXCLUDES ORIGINALS & DODI BRAND PRODUCTS) | IMPROVE | strategic-cta | Exclusion line kept. /deals, 2026-11-12 (owner): the deal plaques were replaced by the concave carousel; these words are kept word for word on its cards. |
| /deals | 50% OFF FTP | IMPROVE | strategic-cta | San Diego 50% OFF FTP kept. /deals, 2026-11-12 (owner): the deal plaques were replaced by the concave carousel; these words are kept word for word on its cards. |
| /deals | (EXCLUDES ORIGINALS & DODI BRAND PRODUCTS) | IMPROVE | strategic-cta | Exclusion line kept. /deals, 2026-11-12 (owner): the deal plaques were replaced by the concave carousel; these words are kept word for word on its cards. |
| /deals | SAVE NOW | IMPROVE | strategic-cta | SAVE NOW kept; all-day Sunday happy hour and the San Diego daily deals added from declared facts, each linking to the live deals [CONFIRM WITH CLIENT days and discounts]. /deals, 2026-11-12 (owner): Save now is the bento (option A). |
| /deals | First Time Patient Deals | IMPROVE | strategic-cta | First Time Patient Deals kept. /deals, 2026-11-12 (owner): kept word for word on the redesigned page (the concave carousel and the Save now bento). |
| /deals | WEEDMAPS DEALS | IMPROVE | strategic-cta | WEEDMAPS DEALS kept, linking to each store's live Weedmaps deals. /deals, 2026-11-12 (owner): kept word for word on the redesigned page (the concave carousel and the Save now bento). |
| /deals | Changing weekly! | IMPROVE | strategic-cta | "Changing weekly!" kept. /deals, 2026-11-12 (owner): kept word for word on the redesigned page (the concave carousel and the Save now bento). |
| /deals | SUBSCRIBE TO OUR NEWSLETTER AND GET THE LATEST UPDATE ON DEALS, EVENTS | IMPROVE | strategic-cta | Newsletter heading kept as the drop list sign-up. |
| /disclaimer | section 1 | IMPROVE | footer | Disclaimer kept word for word. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /faqs | GENERAL FAQS | IMPROVE | objection-handling | GENERAL FAQS intro kept. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /faqs | What are your hours? | IMPROVE | objection-handling | Hours answer: the live FAQ lists 9 AM to 10 PM, which matches neither store; the answer now gives each store's hours from the store records [CONFIRM WITH CLIENT]. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /faqs | Do you take credit cards? | IMPROVE | objection-handling | Kept word for word. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /faqs | Do you deliver? | IMPROVE | objection-handling | Kept word for word. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /faqs | Do you offer any discounts? | IMPROVE | objection-handling | Kept word for word; Weedmaps and rewards links added. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /faqs | Do I need to show I.D. to purchase marijuana at Originals? | IMPROVE | objection-handling | Kept word for word. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /faqs | Is Originals hiring? | IMPROVE | objection-handling | Kept word for word; links to /jobs. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /faqs | What is Originals? | IMPROVE | trust-positioning | What is Originals? kept word for word (established 2006, indoor cultivation scale) and reused on Our Story. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /faqs | SUBSCRIBE TO OUR NEWSLETTER AND GET THE LATEST UPDATE ON DEALS, EVENTS | IMPROVE | strategic-cta | Newsletter heading kept as the drop list sign-up. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /gelato-oakstradam-og-originals | 5 Reasons Why Originals Gelato And Oakstradam OG Is The Best Weed In L | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /gelato-oakstradam-og-originals | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-oakstradam-og-originals | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-oakstradam-og-originals | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-oakstradam-og-originals | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-oakstradam-og-originals | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-oakstradam-og-originals | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-oakstradam-og-originals | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-oakstradam-og-originals | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-oakstradam-og-originals | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-oakstradam-og-originals | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-strain-originals | Gelato Strain by Originals: Sweet, Doughy Terps and A Heavy Euphoria | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /gelato-strain-originals | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-strain-originals | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-strain-originals | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-strain-originals | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-strain-originals | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-strain-originals | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-strain-originals | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-strain-originals | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-strain-originals | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /gelato-strain-originals | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /glass-house-farms-guide-originals-la | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /glass-house-farms-guide-originals-la | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /glass-house-farms-guide-originals-la | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /glass-house-farms-guide-originals-la | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /glass-house-farms-guide-originals-la | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /glass-house-farms-guide-originals-la | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /glass-house-farms-guide-originals-la | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /glass-house-farms-guide-originals-la | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /glass-house-farms-guide-originals-la | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /glass-house-farms-guide-originals-la | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /glass-house-farms-guide-originals-la | Gelato Strain by Originals: Sweet, Doughy Terps and A Heavy Euphoria | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /he-cure-company-flower-guide-originals-la | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /he-cure-company-flower-guide-originals-la | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /he-cure-company-flower-guide-originals-la | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /he-cure-company-flower-guide-originals-la | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /he-cure-company-flower-guide-originals-la | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /he-cure-company-flower-guide-originals-la | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /he-cure-company-flower-guide-originals-la | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /he-cure-company-flower-guide-originals-la | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /he-cure-company-flower-guide-originals-la | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /he-cure-company-flower-guide-originals-la | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /he-cure-company-flower-guide-originals-la | Gelato Strain by Originals: Sweet, Doughy Terps and A Heavy Euphoria | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jack-herer-strain-originals | Jack Herer Strain by Originals: Robust Fruity Flavors And Pure Sativa  | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /jack-herer-strain-originals | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jack-herer-strain-originals | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jack-herer-strain-originals | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jack-herer-strain-originals | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jack-herer-strain-originals | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jack-herer-strain-originals | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jack-herer-strain-originals | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jack-herer-strain-originals | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jack-herer-strain-originals | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jack-herer-strain-originals | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jeeter-brand-guide-originals-la | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /jeeter-brand-guide-originals-la | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jeeter-brand-guide-originals-la | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jeeter-brand-guide-originals-la | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jeeter-brand-guide-originals-la | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jeeter-brand-guide-originals-la | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jeeter-brand-guide-originals-la | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jeeter-brand-guide-originals-la | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jeeter-brand-guide-originals-la | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jeeter-brand-guide-originals-la | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jeeter-brand-guide-originals-la | Gelato Strain by Originals: Sweet, Doughy Terps and A Heavy Euphoria | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /jobs | Wholesale Form | IMPROVE | strategic-cta | Job application form kept field for field; its mislabelled "Wholesale Form" heading corrected; preview form does not submit [CONFIRM WITH CLIENT form provider]. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /jobs | CONTACT INFO | IMPROVE | strategic-cta | CONTACT INFO kept. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /jobs | 555.555.5555 | REPLACE | strategic-cta | The live page shows the placeholder phone 555.555.5555; replaced by the store phones from the store records [CONFIRM WITH CLIENT hiring contact]. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /jobs | SUPPORT@ORIGINALSCA . COM | IMPROVE | strategic-cta | support@ email kept. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /jobs | 3 STORES | REPLACE | strategic-cta | The live page says "3 STORES"; Originals has two stores (Los Angeles, San Diego), so it reads "2 STORES" as on /contact. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /king-louie-strain-originals | The King Louie Strain By Originals Has A Funky Lemon Stench And Royal  | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /king-louie-strain-originals | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /king-louie-strain-originals | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /king-louie-strain-originals | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /king-louie-strain-originals | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /king-louie-strain-originals | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /king-louie-strain-originals | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /king-louie-strain-originals | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /king-louie-strain-originals | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /king-louie-strain-originals | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /king-louie-strain-originals | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /los-angeles | Wholesale Form | IMPROVE | strategic-cta | Dispensary Downtown LA contact page kept with its form and store details; hours from the store records (the live page shows a third set of LA hours) [CONFIRM WITH CLIENT]. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /los-angeles-store | section 1 | IMPROVE | trust-positioning | Los Angeles store page kept and expanded: address, phone, hours, directions, the LA menu by category, the warehouse and the family wall from declared facts. |
| /membership_agreement | OPT IN to RECEIVE EXCLUSIVE DEALS & EVENT INFO | IMPROVE | strategic-cta | Opt-in form and consent terms kept word for word; preview form does not submit. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /oakstradam-og-strain | The Oakstradam OG Strain by Originals Is One Of California’s Strongest | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /oakstradam-og-strain | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /oakstradam-og-strain | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /oakstradam-og-strain | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /oakstradam-og-strain | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /oakstradam-og-strain | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /oakstradam-og-strain | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /oakstradam-og-strain | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /oakstradam-og-strain | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /oakstradam-og-strain | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /oakstradam-og-strain | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-gelato-strain-profile | The Popular Gelato Strain by Originals Is Sweet, Doughy, And Strong | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /originals-gelato-strain-profile | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-gelato-strain-profile | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-gelato-strain-profile | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-gelato-strain-profile | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-gelato-strain-profile | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-gelato-strain-profile | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-gelato-strain-profile | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-gelato-strain-profile | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-gelato-strain-profile | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-gelato-strain-profile | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-hall-of-flowers-palm-springs-recap | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /originals-hall-of-flowers-palm-springs-recap | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-hall-of-flowers-palm-springs-recap | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-hall-of-flowers-palm-springs-recap | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-hall-of-flowers-palm-springs-recap | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-hall-of-flowers-palm-springs-recap | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-hall-of-flowers-palm-springs-recap | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-hall-of-flowers-palm-springs-recap | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-hall-of-flowers-palm-springs-recap | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-hall-of-flowers-palm-springs-recap | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-hall-of-flowers-palm-springs-recap | Gelato Strain by Originals: Sweet, Doughy Terps and A Heavy Euphoria | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-san-diego-cannabis-dispensary | Originals San Diego Is Now Open For Business! | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /originals-san-diego-cannabis-dispensary | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-san-diego-cannabis-dispensary | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-san-diego-cannabis-dispensary | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-san-diego-cannabis-dispensary | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-san-diego-cannabis-dispensary | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-san-diego-cannabis-dispensary | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-san-diego-cannabis-dispensary | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-san-diego-cannabis-dispensary | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-san-diego-cannabis-dispensary | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-san-diego-cannabis-dispensary | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-weed-originals-factory-weed-shop-la | COMPLETE GUIDE TO BUYING ORIGINALS WEED AT ORIGINALS FACTORY & WEED SH | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /originals-weed-originals-factory-weed-shop-la | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-weed-originals-factory-weed-shop-la | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-weed-originals-factory-weed-shop-la | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-weed-originals-factory-weed-shop-la | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-weed-originals-factory-weed-shop-la | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-weed-originals-factory-weed-shop-la | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-weed-originals-factory-weed-shop-la | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-weed-originals-factory-weed-shop-la | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-weed-originals-factory-weed-shop-la | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /originals-weed-originals-factory-weed-shop-la | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /pre-roll-stocking-stuffer-gift-guide | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /pre-roll-stocking-stuffer-gift-guide | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /pre-roll-stocking-stuffer-gift-guide | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /pre-roll-stocking-stuffer-gift-guide | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /pre-roll-stocking-stuffer-gift-guide | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /pre-roll-stocking-stuffer-gift-guide | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /pre-roll-stocking-stuffer-gift-guide | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /pre-roll-stocking-stuffer-gift-guide | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /pre-roll-stocking-stuffer-gift-guide | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /pre-roll-stocking-stuffer-gift-guide | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /pre-roll-stocking-stuffer-gift-guide | Gelato Strain by Originals: Sweet, Doughy Terps and A Heavy Euphoria | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /privacy-policy | section 1 | IMPROVE | footer | Privacy Policy kept word for word. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /prop-65-warning | section 1 | IMPROVE | footer | The live page says only "Need info"; the California Prop 65 cannabis warning is shown here and in every footer [CONFIRM WITH CLIENT compliance wording]. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /retail | section 1 | IMPROVE | trust-positioning | OUR STORES / OUR LOCATIONS kept: both stores with address, phone, hours, directions and their own menus; SHOP MERCH (OPEN 24/7) kept for Originals Clothing. |
| /rewards-program-and-opt-in | section 1 | IMPROVE | strategic-cta | "Join our Rewards Program Today!" and the VIP Program Login/Join link kept. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /san-diego-store | section 1 | IMPROVE | trust-positioning | San Diego store page kept and expanded: address, phone, hours, directions, the San Diego menu by category (its live online menu), pets welcome. |
| /sugar-free-edibles-originals-la | Four Sugar-Free Cannabis Edibles Worth Trying At Originals LA | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /sugar-free-edibles-originals-la | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /sugar-free-edibles-originals-la | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /sugar-free-edibles-originals-la | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /sugar-free-edibles-originals-la | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /sugar-free-edibles-originals-la | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /sugar-free-edibles-originals-la | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /sugar-free-edibles-originals-la | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /sugar-free-edibles-originals-la | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /sugar-free-edibles-originals-la | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /sugar-free-edibles-originals-la | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /terms-of-service | section 1 | IMPROVE | footer | Terms of Service kept word for word. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /thc-extract-for-fast-relief | THC Extract For Fast Relief | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /thc-extract-for-fast-relief | What’s THC Extract? | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /thc-extract-for-fast-relief | Types of THC Extracts | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /thc-extract-for-fast-relief | Ways to Use THC Extracts | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /thc-extract-for-fast-relief | Dab Rig | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /thc-extract-for-fast-relief | Vaping | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /thc-extract-for-fast-relief | Adding a Bit to a Joint or Bowl | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /thc-extract-for-fast-relief | Mixing into Edibles | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /thc-extract-for-fast-relief | Try THC Extract for Fast, Effective Relief | IMPROVE | benefits-solution | Article section kept word for word. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /thc-extract-for-fast-relief | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /thc-extract-for-fast-relief | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /thc-extract-for-fast-relief | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /thc-extract-for-fast-relief | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /thc-extract-for-fast-relief | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /thc-extract-for-fast-relief | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /thc-extract-for-fast-relief | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /thc-extract-for-fast-relief | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /thc-extract-for-fast-relief | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /thc-extract-for-fast-relief | Gelato Strain by Originals: Sweet, Doughy Terps and A Heavy Euphoria | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /wedding-cake-strain-originals | The Wedding Cake Strain by Originals Has Tart, Vanilla Flavors And Hig | IMPROVE | benefits-solution | Article kept word for word at its own URL, with the H1 the live page lacked. Post template redesign, 2026-11-12 (owner; in progress): the article kept word for word on the new template. |
| /wedding-cake-strain-originals | THC Extract For Fast Relief | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /wedding-cake-strain-originals | Cannabis Books For Handy Reference | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /wedding-cake-strain-originals | Cannabis Legal States And Economic Growth | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /wedding-cake-strain-originals | Jeeter Brand Guide: Extremely Flavorful And Potent Infused Pre-Rolls,  | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /wedding-cake-strain-originals | Originals Factory & Weed Shop’s Pre-Roll Stocking Stuffer Gift Guide | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /wedding-cake-strain-originals | The Complete Guide To Buying The Cure Company Flower At Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /wedding-cake-strain-originals | Best-Selling Affordable Cannabis Brands At Originals Factory & Weed Sh | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /wedding-cake-strain-originals | The Complete Guide To Buying Glass House Farms at Originals LA | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /wedding-cake-strain-originals | Originals Official Hall of Flowers Palm Springs Recap | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /wedding-cake-strain-originals | The Complete Guide to Buying Edibles At Originals Factory & Weed Shop | IMPROVE | benefits-solution | Related-posts list kept as a "Keep reading" rail under the article. |
| /our-story | /our-story | ADD | trust-positioning | Our Story (the live site has no About page): the block, the family, since 2006, awards, in-house cultivation, from declared facts and the live FAQ. 2026-11-12 (owner): its creed band is removed (the creed text stays in the site data). |
| /strains | /strains | ADD | benefits-solution | Strain Library of the house genetics (Originals OG, King Louie, Skywalker, Oaksterdam OG, Gelato, SFV OG, Paris OG, Bussin'), linking to the live menu and the existing strain articles. |
| /collabs | /collabs | ADD | trust-positioning | Collabs, text only, no artist photos [CONFIRM WITH CLIENT every partner]. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /media | /media | ADD | benefits-solution | Media: the brand film and the brand's own event flyers and imagery; press contact. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /drops | /drops | ADD | strategic-cta | Drop list: new strain and merch drops sign-up (preview form does not submit) [CONFIRM WITH CLIENT next drop]. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /find-originals | /find-originals | ADD | strategic-cta | Find Originals: the house brand at other dispensaries in California and Massachusetts (retailer list [CONFIRM WITH CLIENT]) plus the two Originals stores. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /events | /events | ADD | trust-positioning | Events (the live Events link 404s or opens a placeholder): past highlights from declared facts and an upcoming section held as [CONFIRM WITH CLIENT] placeholders. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /wholesale | /wholesale | ADD | strategic-cta | Wholesale (the live footer link 404s): The Brand Behind The Brands, retailer inquiry form (preview does not submit) [CONFIRM WITH CLIENT]. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /shop | /shop | ADD | benefits-solution | Shop hub: pick Los Angeles or San Diego, then every category and brand links straight to that store's live menu with the cart. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /clothing | /clothing | ADD | benefits-solution | Originals Clothing: the online clothing shop (open 24/7) and merch, linking to originalsclothingshop.com. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /404.html | /404.html | ADD | footer | Not-found page. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| /form-sent | /form-sent | ADD | strategic-cta | Preview form target: every preview form submits here (GET, nothing stored) and the page says plainly that nothing was sent; replaced by the client's form provider at launch [CONFIRM WITH CLIENT]. Page redesign, 2026-11-12 (owner; in progress): the same words and links on a new layout. |
| / | Home: Our story | ADD | trust-positioning | Home "Our story" section (owner, 2026-11-12): its album shows four of the owner's photos. |
| / | Home: Family Wall | ADD | trust-positioning | Home Family Wall (owner, 2026-11-12): a digital replica of the store's family photo wall, a sideways strip on a white band beside the texts; it replaced the salon frames. |
| / | Home: Sunday Cruise, The Roadside Sign | ADD | benefits-solution | Home Sunday Cruise, "The Roadside Sign" (owner pick, 2026-11-12): a lit roadside pole sign on the boulevard lists the ten house strains, each a link, under the arched ORIGINALS wordmark, with the Strain library panel; the lowrider pulls up in front of its pole as you scroll. "From the farm" is merged in (next row). |
| / | Home: From the farm | IMPROVE |  | Home "From the farm" (owner, 2026-11-12): merged into the Sunday Cruise; its kicker, title and lede and the ten house-strain links are kept word for word there (the separate grow band is retired: private/retired/2026-11-12-farm-section/). |
| / | Home: the Creed | REMOVE |  | Owner, 2026-11-12: "I don't think we need the creed at all". The home creed section, the creed band on /our-story and the creed line in the footer are removed; the creed text stays in the site data (src/content/site.mjs). Retired markup: private/retired/2026-11-12-creed-section/. |
| / | Home: Stores, Editorial | ADD | trust-positioning | Home stores, "Editorial" (owner pick, option C, 2026-11-12): Los Angeles, San Diego and Clothing as a third column, in a sideways scroller. |
| / | Home: Culture (events and collabs) | ADD | trust-positioning | Home Culture (owner, 2026-11-12): the event cards as a lenticular carousel (an original build of the effect), the collab tape with partner logos, and the Events and Collabs buttons. |
| / | Site footer | REPLACE | footer | Owner pick, option C, 2026-11-12: the editorial footer replaces the old footer layout on every page, with no creed line (the old footer's links are checked by tools/test-ui.mjs). |

## Copy that changed

AI may tighten wording. It may not change meaning, and it may not add a fact. Every rewrite keeps its original here.

| where | original | rewritten | reason |
|---|---|---|---|
| / hero intro | Shop at the best dispensary in Los Angeles and have a top-level cannabis experience every time. We source our products from popular California brands offering the ultimate in customer satisfaction. | Removed; the hero carries the live H1 "Best Cultivators in California." and "The Brand Behind The Brands" (declared fact). | Operator direction: drop generic SEO filler. |
| footer tagline (every page) | Shop the best dispensary in Los Angeles and have a top-level cannabis experience every time. | Removed. The footer first carried the creed "Mastering Our Craft – Always Room For Improvement – Good, Better, Best – California's Best." (declared fact) as its sign-off; on 2026-11-12 the owner dropped the creed everywhere, so the editorial footer opens with the store and link columns. | Operator direction: drop generic SEO filler; owner, 2026-11-12: "I don't think we need the creed at all". |
| / category tiles | "Lorem ipsim." under each category; "Lorem Ipsum" under DEALS / REWARDS / EVENTS | Placeholder text removed; tiles carry their label and the store they open. | Template placeholder text. |
| /retail intro | Shop the best dispensary in Los Angeles and have a top-level cannabis experience every time. | Two stores in Southern California, one family. Pick yours, check today's hours and shop its menu. | Operator direction: drop generic SEO filler (neutral glue, no claims). |
| /faqs "What are your hours?" | Monday to Saturday 9:00 AM - 10:00 PM, Sunday 10:00 AM - 8:00 PM | Each store's hours from the store records (LA Mon–Sat 7AM–9:45PM, Sun 8AM–7:45PM; SD Mon–Sat 8AM–9PM, Sun 9AM–9PM). | The live answer matches neither store [CONFIRM WITH CLIENT]. |
| /jobs contact | 555.555.5555 · 3 STORES | The two store phones · 2 STORES | Placeholder phone and wrong store count on the live page [CONFIRM WITH CLIENT]. |
| /contact, /jobs, /los-angeles form heading | Wholesale Form | Contact form / job application (no heading text) | The live heading mislabels the form. |
| /prop-65-warning | Need info | The California Prop 65 cannabis warning | Placeholder text on a compliance page [CONFIRM WITH CLIENT wording]. |
| /bussin-merch | This is paragraph text. Click it or hit the Manage Text button to change the font, color, size, format, and more. To set up site-wide paragraph and title styles, go to Site Theme. | A Bussin' page from declared facts | Template placeholder text [CONFIRM WITH CLIENT]. |
| blog posts | unlinked "Button" placeholders, share widgets | Removed; the posts' own "< Older Post" / "Newer Post >" links kept as the post navigation | Template and platform residue. |

## Imagery

Per-asset decisions for the live site are in `audit/image-inventory.json`. The redesign's own media registry is `src/content/images.json`. Generated images (fal: FLUX1.1 [pro] ultra stills, BiRefNet cut-outs, Kling 2.5 Turbo Pro loops) depict no real person, place or result: they are mood and illustration only, carry IPTC `trainedAlgorithmicMedia` in their XMP and `data-ai="generated"` on the page. Prompts, seeds and request ids: `docs/MEDIA.md` and `private/gen/*.result.json`.

| id | depicts | files |
|---|---|---|
| warehouse | an empty brick warehouse at dusk, tall arched windows glowing gold above a mirror-polished concrete floor | img/warehouse-3136.webp |
| arches | shafts of light through tall arched warehouse windows onto a concrete floor | img/arches-1792.webp |
| boulevard | a palm-lined Los Angeles boulevard at sunset under an orange, pink and violet sky | img/boulevard-3136.webp |
| sd-palms | a palm-lined San Diego street at sunset | img/sd-palms-2400.webp, img/sd-palms-1200.webp |
| night-street | a Los Angeles warehouse street at night, wet asphalt glowing red and violet | img/night-street-2400.webp, img/night-street-1200.webp |
| grow-room | rows of flowering cannabis plants under magenta grow lights | img/grow-room-3136.webp |
| trichomes | macro view of cannabis trichomes in amber and violet light | img/trichomes-2400.webp, img/trichomes-1200.webp |
| stage | an empty stage lit by purple and pink spotlights through haze | img/stage-2400.webp, img/stage-1200.webp |
| stage-wide | an empty festival stage under a fan of purple and pink light beams | img/stage-wide-3136.webp |
| lowrider | a candy-red lowrider convertible with chrome trim and wire wheels | img/lowrider-2400.webp, img/lowrider-1200.webp, img/lowrider-640.webp |
| bud-a | a frosty cannabis flower | img/bud-a-1200.webp, img/bud-a-600.webp |
| bud-b | a lime-green cannabis flower with lavender tips | img/bud-b-1200.webp, img/bud-b-600.webp |
| bud-c | a deep purple cannabis flower dusted with frost | img/bud-c-1200.webp, img/bud-c-600.webp |
| cat-flower | a frosty cannabis flower on a black mirror | img/cat-flower-1200.webp, img/cat-flower-600.webp |
| cat-preroll | three cannabis pre-roll cones on black glass | img/cat-preroll-1200.webp, img/cat-preroll-600.webp |
| cat-vape | a blank vape cartridge of amber oil | img/cat-vape-1200.webp, img/cat-vape-600.webp |
| cat-extract | amber cannabis resin shards on slate | img/cat-extract-1200.webp, img/cat-extract-600.webp |
| cat-edible | squares of dark chocolate on slate | img/cat-edible-1200.webp, img/cat-edible-600.webp |
| cat-drink | a plain black beverage can with condensation | img/cat-drink-1200.webp, img/cat-drink-600.webp |
| cat-tincture | an amber dropper bottle | img/cat-tincture-1200.webp, img/cat-tincture-600.webp |
| cat-topical | an open jar of balm | img/cat-topical-1200.webp, img/cat-topical-600.webp |
| wall-gloves | boxing gloves hanging on a brick wall | img/wall-gloves-1200.webp, img/wall-gloves-600.webp |
| wall-mic | a vintage microphone in a spotlight | img/wall-mic-1200.webp, img/wall-mic-600.webp |
| wall-basketball | a basketball on an outdoor court | img/wall-basketball-1200.webp, img/wall-basketball-600.webp |
| wall-wheel | a chrome wire-spoke wheel | img/wall-wheel-1200.webp, img/wall-wheel-600.webp |
| wall-trumpet | a trumpet resting on a chair | img/wall-trumpet-1200.webp, img/wall-trumpet-600.webp |
| wall-brushes | paint brushes in a paint can | img/wall-brushes-1200.webp, img/wall-brushes-600.webp |
| wall-typewriter | a vintage typewriter | img/wall-typewriter-1200.webp, img/wall-typewriter-600.webp |
| wall-crown | an antique crown on velvet | img/wall-crown-1200.webp, img/wall-crown-600.webp |
| wall-records | vinyl records leaning on a turntable | img/wall-records-1200.webp, img/wall-records-600.webp |
| wall-reels | vintage film reels on a table | img/wall-reels-1200.webp, img/wall-reels-600.webp |
| wall-reels-alt | vintage film reels on a table | img/wall-reels-alt-1200.webp, img/wall-reels-alt-600.webp |
| loop-stage | first frame of a generated stage loop | img/loop-stage-1280.webp |
| loop-grow | first frame of a generated grow loop | img/loop-grow-1600.webp |
| loop-arches | first frame of a generated arches loop | img/loop-arches-720.webp |
| merch-hoodie | A folded taupe zip hoodie with the ORIGINALS wordmark and crown on the chest, resting on dark rock | img/merch-hoodie-1448.webp, img/merch-hoodie-800.webp |
| store-wall | An Originals store wall: the ORIGINALS sign between two crowns over wood panelling, three screens and glass display cases | img/store-wall-1535.webp, img/store-wall-900.webp |
| happy-hour-lowrider | A woman in a yellow top and sunglasses leans down holding a leashed bulldog in front of a red 1963 Chevrolet Impala lowrider and a long red brick building under a blue sky | img/happy-hour-lowrider-2400.webp, img/happy-hour-lowrider-1600.webp, img/happy-hour-lowrider-960.webp |
| store-sd-front | The Originals San Diego storefront on Federal Blvd at golden hour, under its ORIGINALS DISPENSARY sign | img/store-sd-front-2400.webp, img/store-sd-front-1600.webp, img/store-sd-front-960.webp |
| daily-jar-tall | An ORIGINALS glass jar of flower with a wooden lid on a reflective counter | img/daily-jar-tall-1024.webp, img/daily-jar-tall-800.webp, img/daily-jar-tall-640.webp |

Client media (resized only, never AI-altered): store-la-interior, store-la-floor, store-la-front, store-sd-building, sd-banner, sd-script, flyer-carshow, hof-graphic, hof-mixer, farmers-cup, gelato-box, gelato-jar, preroll-3, preroll-1, bud-box, grow-real, backdrop, clothing-shop, award-badge, crown-black, la-lockup, film-poster, logo-jeeter, logo-stiiizy, logo-wcc, logo-lime, logo-roach, logo-cbx, happy-hour-meet, story-family-wall, story-pouch, story-grower-bud, story-family-farms, wall-strip-1, wall-strip-2, wall-strip-3, wall-strip-4, wall-strip-5, wall-strip-6, store-la-wall, store-la-window, store-la-letters-bw, store-sd-interior, family-wall-unit, logo-originals, logo-the-cure-company, logo-raw-garden, logo-alien-labs, logo-kanha, logo-wyld, logo-papa-barkley, logo-pacific-stone, logo-maven-genetics, logo-rove, daily-jar, gelato-bud, logo-wyld-white, store-counter, logo-beast-mode, logo-royal-blunts, store-sd-exterior.

## Tool note

`sr-match --answer` splits `<rowId>=<presetId>` on the first "=", so the four live-menu rows whose ids carry a query string (`/menu/los-angeles?brand=...`) could not be answered through it. `tools/answer-match.mjs` applied the same answer with the same checks (preset exists in the index, row exists in the ledger), splitting on the last "=".
