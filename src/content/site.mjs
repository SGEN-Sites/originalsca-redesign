// site.mjs: every store fact, link and line the build prints, in one place.
// Sources: the live site capture (audit/raw, audit/content-inventory.json) and facts/client-facts.json
// (the operator brief of 2026-11-11). Nothing here is typed from memory; each block names its source.
// Items marked confirm: true are rendered with a [CONFIRM WITH CLIENT] comment in the page source.

export const SITE = {
  name: 'Originals',
  names: ['Originals Factory & Weed Shop', 'Originals Family Farms'], // client-facts.brandNames
  origin: 'https://originalsca.com', // live origin; canonicals keep the live URLs
  licence: 'C10-0000367-LIC', // live footer "All Rights Reserved | C10-0000367-LIC"
  copyright: '© 2026 All Rights Reserved | C10-0000367-LIC', // live footer, verbatim
  liveTagline: 'Best Cultivators in California', // live home H1
  brandBehind: 'The Brand Behind The Brands', // client-facts.brandLines
  sdMission: 'The highest quality cannabis, grown by OGs, for the masses.', // client-facts.brandLines
  creed: ['Mastering Our Craft', 'Always Room For Improvement', 'Good, Better, Best', "California's Best"],
  tags: ['#beoriginal', '#comingforthecrown', '#grownbyogsforogs', '#yourockthecrown'],
  email: 'info@originalsca.com', // live /contact "INFO @ORIGINALSCA . COM" (the address it SHOWS)
  contactMailto: 'support@originalsca.com', // live /contact: every email link and the EMAIL button open this address
  jobsEmail: 'support@originalsca.com', // live /jobs "SUPPORT@ORIGINALSCA . COM"
};

// Store records. Hours: operator brief (matches the live /retail page). The live /los-angeles-store, /los-angeles and
// /faqs pages each show different LA hours; that conflict is a [CONFIRM WITH CLIENT] item (docs/PITCH-NOTES.md).
// Menus: LA runs on the Tymber menu at /menu/los-angeles/ (sitemap, categories-sitemap.xml). San Diego: the brief
// named https://www.originalssandiego.com/, but on 2026-11-11 www.originalssandiego.com has no DNS record and the
// apex 301s to originalsca.com (a page with no products), so San Diego links go to the store's own live online
// menu on Weedmaps ("Order online", "Add to bag"), which the live /retail page already links for San Diego.
const LA_MENU = 'https://originalsca.com/menu/los-angeles/';
const SD_MENU = 'https://weedmaps.com/dispensaries/originals-san-diego';
export const STORES = {
  la: {
    id: 'la',
    name: 'Originals Los Angeles',
    short: 'Los Angeles',
    code: 'LA',
    street: '6500 Stanford Ave',
    city: 'Los Angeles',
    region: 'CA',
    postal: '90001',
    phone: '(323) 696-9680',
    tel: '+13236969680',
    // 0 = Sunday ... 6 = Saturday, 24h "HH:MM"
    hours: { 0: ['08:00', '19:45'], 1: ['07:00', '21:45'], 2: ['07:00', '21:45'], 3: ['07:00', '21:45'], 4: ['07:00', '21:45'], 5: ['07:00', '21:45'], 6: ['07:00', '21:45'] },
    hoursText: [['Mon–Sat', '7AM–9:45PM'], ['Sun', '8AM–7:45PM']],
    liveHoursText: ['OPEN 7AM - 945PM (MON-SAT)', 'OPEN 8AM - 745PM (SUN)'], // live /retail, verbatim
    menu: LA_MENU,
    menuLabel: 'the Originals Los Angeles menu',
    cat: (slug) => LA_MENU + 'categories/' + slug + '/',
    maps: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Originals, 6500 Stanford Ave, Los Angeles, CA 90001'),
    weedmaps: 'https://weedmaps.com/dispensaries/originalslashop', // live footer WEEDMAPS
    deals: 'https://weedmaps.com/dispensaries/originalslashop', // live /deals WEEDMAPS DEALS
    page: '/los-angeles-store',
    attributes: [{ text: 'Veteran-owned', confirm: true, note: 'brief: the LA store identifies as veteran-owned' }],
    instagram: '@la__originals__shop',
    ftp: '30% OFF FTP', // live /deals, verbatim
  },
  sd: {
    id: 'sd',
    name: 'Originals San Diego',
    short: 'San Diego',
    code: 'SD',
    street: '6220 Federal Blvd',
    city: 'San Diego',
    region: 'CA',
    postal: '92114',
    phone: '(619) 310-5232',
    tel: '+16193105232',
    hours: { 0: ['09:00', '21:00'], 1: ['08:00', '21:00'], 2: ['08:00', '21:00'], 3: ['08:00', '21:00'], 4: ['08:00', '21:00'], 5: ['08:00', '21:00'], 6: ['08:00', '21:00'] },
    hoursText: [['Mon–Sat', '8AM–9PM'], ['Sun', '9AM–9PM']],
    liveHoursText: ['OPEN 8AM - 9PM (MON-SAT)', 'OPEN 9AM - 9PM (SUN)'],
    menu: SD_MENU,
    menuLabel: 'the Originals San Diego online menu',
    cat: (slug) => SD_MENU + '/' + slug,
    maps: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Originals San Diego, 6220 Federal Blvd, San Diego, CA 92114'),
    weedmaps: SD_MENU, // live /retail "VISIT SITE" for San Diego
    deals: SD_MENU + '/deals',
    page: '/san-diego-store',
    attributes: [{ text: 'Pets welcome', confirm: false, note: 'brief' }],
    instagram: '@originalssdshop',
    ftp: '50% OFF FTP',
  },
};
export const STORE_ORDER = ['la', 'sd'];

// Shop by category. Labels: the live home tiles (FLOWER, EXTRACTS, CARTRIDGES, DRINKS, PREROLLS, TINCTURES, TOPICALS)
// plus EDIBLES and MERCH, which the live LA menu carries (categories-sitemap.xml). PILLS removed (ledger: no such
// category or product on either menu). la/sd: each store's own category slug; null = that menu has no such
// category, so the tile opens the store's full menu (which has products) and says so. Verified 2026-11-11
// (tools/verify-menus.mjs): San Diego's Weedmaps menu has no drinks, tinctures, topicals or merch shelf.
export const CATEGORIES = [
  { id: 'flower', label: 'Flower', live: 'FLOWER', img: 'cat-flower', la: 'flower', sd: 'flower' },
  { id: 'preroll', label: 'Pre-Rolls', live: 'PREROLLS', img: 'cat-preroll', la: 'preroll', sd: 'pre-roll' },
  { id: 'cartridge', label: 'Cartridges', live: 'CARTRIDGES', img: 'cat-vape', la: 'cartridge', sd: 'vape-pens' },
  { id: 'extract', label: 'Extracts', live: 'EXTRACTS', img: 'cat-extract', la: 'extract', sd: 'concentrates' },
  { id: 'edible', label: 'Edibles', live: null, img: 'cat-edible', la: 'edible', sd: 'edibles' },
  { id: 'beverage', label: 'Drinks', live: 'DRINKS', img: 'cat-drink', la: 'beverage', sd: null },
  { id: 'tincture', label: 'Tinctures', live: 'TINCTURES', img: 'cat-tincture', la: 'tincture', sd: null },
  { id: 'topical', label: 'Topicals', live: 'TOPICALS', img: 'cat-topical', la: 'topical', sd: null },
  { id: 'merch', label: 'Merch', live: null, img: 'merch', la: 'merch', sd: null },
];
export function catHref(storeId, cat) {
  const s = STORES[storeId];
  const slug = cat[storeId];
  return slug ? s.cat(slug) : s.menu;
}

// Shop by brand. The live home and /brands show six brand tiles (Jeeter, Stiiizy, West Coast Cure, Lime, Roach,
// Cannabiotix logos); the LA menu's brands-sitemap.xml lists every brand page. Originals leads (house brand).
const B = (name, slug, logo = null) => ({ name, la: LA_MENU + 'brands/' + slug + '/', logo });
export const BRANDS = [
  B('Originals', 'originals-61320'),
  B('Jeeter', 'jeeter-61405', 'jeeter'),
  B('STIIIZY', 'stiiizy-61331', 'stiiizy'),
  B('West Coast Cure', 'west-coast-cure-91619', 'wcc'),
  B('The Cure Company', 'the-cure-company-61318'),
  B('Raw Garden', 'raw-garden-61365'),
  B('Alien Labs', 'alien-labs-91626'),
  B('Caviar Gold', 'caviar-gold-61396'),
  B('Kanha', 'kanha-61343'),
  B('Wyld', 'wyld-61369'),
  B('Papa & Barkley', 'papa-barkley-61401'),
  B('Pacific Stone', 'pacific-stone-61426'),
  B('Maven Genetics', 'maven-genetics-813769'),
  B('Wizard Trees', 'wizard-trees-824116'),
  B('Heritage Hash Co.', 'heritage-hash-co-774181'),
  B('Rove', 'rove-61393'),
];

// House strains (client-facts.houseStrains, plus Wedding Cake and Jack Herer, which the live site publishes as
// "by Originals"). post: the live article whose words the Strain Library quotes; from: where the excerpt starts
// (a strain-guide paragraph that opens with the strain's name). No article = name only + [CONFIRM WITH CLIENT].
export const STRAINS = [
  { id: 'originals-og', name: 'Originals OG', post: '/originals-weed-originals-factory-weed-shop-la', from: 'The Mac Daddy of OG Kush' },
  { id: 'king-louie', name: 'King Louie', post: '/king-louie-strain-originals' },
  { id: 'gelato', name: 'Gelato', post: '/gelato-strain-originals', img: 'gelato-jar' },
  { id: 'oaksterdam-og', name: 'Oaksterdam OG', post: '/oakstradam-og-strain' },
  { id: 'skywalker', name: 'Skywalker', post: null },
  { id: 'sfv-og', name: 'SFV OG', post: null },
  { id: 'paris-og', name: 'Paris OG', post: null },
  { id: 'wedding-cake', name: 'Wedding Cake', post: '/wedding-cake-strain-originals' },
  { id: 'jack-herer', name: 'Jack Herer', post: '/jack-herer-strain-originals' },
  { id: 'bussin', name: "Bussin'", post: null, page: '/bussin-merch' },
];

// Collabs: text only, every one [CONFIRM WITH CLIENT] (client-facts.collabs).
export const COLLABS = [
  { partner: 'Chris Brown', product: "Bussin'", with: 'OHB Farms' },
  { partner: 'Xzibit', product: 'Napalm' },
  { partner: 'Ice Cube', product: 'Caviar Gold' },
  { partner: 'Mike Tyson', product: 'Tyson Ranch' },
  { partner: 'Nipsey Hussle', product: 'Marathon OG' },
  { partner: 'Royal Blunts' },
  { partner: 'Beast Mode', recent: true },
  { partner: 'Dodi Oakland', recent: true },
];

// Past event highlights (client-facts.events). img: the brand's own flyer or photo when the site has one.
export const EVENTS = [
  { id: 'lowrider-super-show', name: 'Lowrider Magazine Super Show', kind: 'Car show', img: 'flyer-carshow' },
  { id: 'hall-of-flowers', name: 'Hall of Flowers', kind: 'Trade show', post: '/originals-hall-of-flowers-palm-springs-recap', img: 'hof-graphic' },
  { id: 'puffcon', name: 'PuffCon LA Block Party', kind: 'Block party' },
  { id: 'green-street', name: 'Green Street Festival', kind: 'Festival' },
  { id: '420', name: 'Private 4/20 events', kind: 'Private' },
  { id: 'takeover', name: 'Originals Takeover, Palm Springs', kind: 'Takeover', line: 'Coming to a city near you' },
  { id: 'bussin-release', name: "Bussin' strain release party", kind: 'Release party' },
  { id: 'appreciation', name: 'Employee appreciation night', kind: 'Family' },
  { id: 'big3', name: 'BIG3 basketball', kind: 'Support' },
  { id: 'fighters', name: 'Fighter sponsorships', kind: 'Sponsorship' },
];

export const SOCIAL = [
  { label: 'Instagram @originalsfamilyfarms', short: '@originalsfamilyfarms', href: 'https://www.instagram.com/originalsfamilyfarms/', icon: 'ig' },
  { label: 'Instagram @la__originals__shop', short: '@la__originals__shop', href: 'https://www.instagram.com/la__originals__shop/', icon: 'ig' },
  { label: 'Instagram @originalssdshop', short: '@originalssdshop', href: 'https://www.instagram.com/originalssdshop/', icon: 'ig' },
  { label: 'Facebook', short: 'Facebook', href: 'https://www.facebook.com/OriginalsLAshop', icon: 'fb' },
  { label: 'Weedmaps (Los Angeles)', short: 'Weedmaps LA', href: 'https://weedmaps.com/dispensaries/originalslashop', icon: 'wm' },
  { label: 'Weedmaps (San Diego)', short: 'Weedmaps SD', href: 'https://weedmaps.com/dispensaries/originals-san-diego', icon: 'wm' },
  { label: 'Leafly', short: 'Leafly', href: 'https://www.leafly.com/dispensary-info/kvclosangeles', icon: 'lf' },
];

export const LINKS = {
  clothing: 'https://www.originalsclothingshop.com/', // live footer ORIGINALS CLOTHING
  rewardsJoin: 'https://enrollnow.vip/login/5229?location=originalslosangeles', // live "VIP Program Login/Join"
};

// Prop 65: the live /prop-65-warning page says only "Need info". The California retail warning for cannabis smoke
// and delta-9-THC is shown instead. [CONFIRM WITH CLIENT: exact wording with compliance counsel.]
export const PROP65 = 'WARNING: Products sold here can expose you to chemicals including cannabis smoke, which is known to the State of California to cause cancer, and delta-9-tetrahydrocannabinol (THC), which is known to the State of California to cause birth defects or other reproductive harm. For more information go to www.P65Warnings.ca.gov.';

// Primary navigation (desktop header + drawer). Live nav: SHOP, DEALS, BRANDS, LOCATIONS, NEWS, CONTACT, EVENTS.
export const NAV = [
  { label: 'Shop', href: '/shop', mega: 'shop' },
  { label: 'Deals', href: '/deals' },
  { label: 'Brands', href: '/brands' },
  { label: 'Strains', href: '/strains' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Locations', href: '/retail', mega: 'stores' },
  { label: 'Culture', href: '/events', mega: 'culture' },
];
export const CULTURE_LINKS = [
  { label: 'Events', href: '/events', note: 'Car shows, block parties, release nights' },
  { label: 'Collabs', href: '/collabs', note: 'The family we build with' },
  { label: 'Media', href: '/media', note: 'Film, flyers and the family album' },
  { label: 'Drops', href: '/drops', note: 'Get on the drop list' },
  { label: 'Cannablog', href: '/blog', note: 'Cannabis news and guides' },
  { label: 'Find Originals', href: '/find-originals', note: 'Our flower at other shops' },
];
export const MORE_LINKS = [
  { label: 'Rewards', href: '/rewards-program-and-opt-in' },
  { label: 'Wholesale', href: '/wholesale' },
  { label: 'Clothing', href: '/clothing' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Contact', href: '/contact' },
];
export const LEGAL_LINKS = [ // live footer LEGAL, plus the two live legal pages it did not list
  { label: 'Terms of Service', href: '/terms-of-service' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Prop 65 Warning', href: '/prop-65-warning' },
  { label: 'California Opt-in', href: '/california-opt-in' },
  { label: 'Rewards Program and Opt-in', href: '/rewards-program-and-opt-in' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Membership Agreement', href: '/membership_agreement' },
];

// [CONFIRM WITH CLIENT] items that live only in page source (never visible copy).
export const CONFIRM = {
  mirasol: '1450 Mirasol St, Los Angeles, CA 90023 is listed by the client; its role (office, cultivation, distribution) is unconfirmed, so it is not shown as a store.',
  massachusetts: 'A large cultivation facility is being built in Massachusetts; not shown as a store until confirmed.',
  sdMenu: 'San Diego online menu: https://www.originalssandiego.com/ has no DNS record and originalssandiego.com redirects to originalsca.com (2026-11-11); links use the store\'s live Weedmaps menu until the client confirms its own store site.',
  sdHours: 'Weedmaps showed San Diego "open until 10:00pm" on 2026-11-11; the brief and the live /retail page say Mon-Sat 8AM-9PM, Sun 9AM-9PM.',
  laHours: 'LA hours differ across the live site: /retail 7AM-9:45PM / Sun 8AM-7:45PM (used here), /los-angeles-store 9AM-9:45PM / Sun 10AM-7:45PM, /faqs 9AM-10PM / Sun 10AM-8PM.',
};
