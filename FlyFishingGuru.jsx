import { useState, useEffect, useMemo } from "react";

const INLINE_CSS = `
:root {
  --bg:#0a1419; --bg2:#0e1d26; --bg3:#142230; --panel:#192d3c; --panel2:#1f3647; --card:#142230;
  --border:rgba(255,255,255,0.07); --border2:rgba(255,255,255,0.14);
  --teal:#2a9d8f; --teal-lt:#4dbfaf; --teal-dk:#1d6e64; --teal-dim:rgba(42,157,143,0.14);
  --gold:#e9c46a; --gold-dim:rgba(233,196,106,0.11); --rust:#e76f51;
  --slate:#8cacb9; --mist:#c4d8df; --cream:#f0ece4; --tdim:rgba(196,216,223,0.5);
  --dry-c:#e9c46a; --euro-c:#6b7fd4; --nymph-c:#4a9e6a; --str-c:#c0452a; --sight-c:#2a9d8f;
  --flow-low:#4db8a8; --flow-ok:#6ab764; --flow-med:#e9c46a; --flow-hi:#e76f51; --flow-flood:#d62828;
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{font-family:system-ui,-apple-system,sans-serif;background:#0a1419;color:#f0ece4;overflow-x:hidden;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:#0a1419;}
::-webkit-scrollbar-thumb{background:#2a9d8f;border-radius:2px;}
.fly-s{background:rgba(192,136,42,.18);color:#d4a855;}
.fly-e{background:rgba(107,127,212,.18);color:#8a9fdf;}
.fly-n{background:rgba(74,158,106,.18);color:#6fc48a;}
.fly-r{background:rgba(192,69,42,.18);color:#e08060;}
@keyframes fadeInUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
.anim-up{animation:fadeInUp .4s ease both;}

/* ── RESPONSIVE ── */
@media (max-width:768px){
  /* Nav */
  .nav-links{display:none!important;}
  .nav-hamburger{display:flex!important;}
  nav{padding:.75rem 1.2rem!important;}

  /* Hero */
  .hero-grid{grid-template-columns:1fr!important;min-height:auto!important;}
  .hero-left{padding:6.5rem 1.4rem 2.5rem!important;}
  .hero-right{display:none!important;}

  /* Intel steps - reduce padding */
  #intel>div{padding-left:1.2rem!important;padding-right:1.2rem!important;}
  #intel .step-water{flex-direction:column!important;align-items:flex-start!important;}

  /* Conditions panel */
  .intel-panel-grid{grid-template-columns:1fr!important;}
  .cond-3col{grid-template-columns:1fr 1fr!important;}
  .cond-2col{grid-template-columns:1fr!important;}

  /* Coaching */
  .coaching-grid{grid-template-columns:1fr!important;gap:2rem!important;}
  .coaching-wrap{padding:3rem 1.4rem!important;}
  .programs-grid{grid-template-columns:1fr 1fr!important;}

  /* Booking */
  .booking-options{grid-template-columns:1fr!important;}
  .booking-wrap{padding:3rem 1.4rem!important;}
  .form-2col{grid-template-columns:1fr!important;}

  /* Footer */
  .footer-inner{flex-direction:column!important;gap:.8rem!important;text-align:center!important;padding:1.5rem 1.2rem!important;}

  /* Fly modal */
  .fly-modal-grid{grid-template-columns:1fr!important;}

  /* Fly image comparison — stack vertically on narrow screens */
  .fly-compare-row{flex-direction:column!important;align-items:center!important;}
  .fly-compare-col{width:100%!important;display:flex!important;flex-direction:column!important;align-items:center!important;}
  /* Images go fluid inside their column so they never overflow */
  .fly-compare-col>div:first-child{width:clamp(80px,40vw,140px)!important;height:clamp(80px,40vw,140px)!important;}
  /* Hide the ↔ arrow divider when stacked */
  .fly-compare-row .fly-arrow-divider{display:none!important;}
  /* Progression stage row — stack photo above description on very small screens */

  /* Booking modal */
  .booking-modal-inner{width:95vw!important;padding:1.2rem 1rem!important;max-height:90vh!important;}
}

@media (max-width:480px){
  .cond-3col{grid-template-columns:1fr!important;}
  .programs-grid{grid-template-columns:1fr!important;}
  .booking-options{grid-template-columns:1fr!important;}
  /* Progression: also stack photo above description */
  .fly-stage-row{flex-direction:column!important;}
  .fly-stage-row>*{width:100%!important;}
}
`;

/* ═══════════════════════════════════════════════════════════
   INLINE STYLE HELPERS
═══════════════════════════════════════════════════════════ */
const S = {
  // Layout
  grid2:     (gap='.7rem') => ({ display:'grid', gridTemplateColumns:'1fr 1fr', gap }),
  labelMb:   { fontSize:'.64rem', letterSpacing:'.22em', textTransform:'uppercase', color:'var(--teal)', fontWeight:600, marginBottom:'.5rem' },
  cardCenter:{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:4, padding:'1rem 1.1rem', textAlign:'center' },
  bodyText:  { fontSize:'.76rem', color:'var(--mist)', lineHeight:1.55 },
  // Text
  label:     { fontSize:'.64rem', letterSpacing:'.22em', textTransform:'uppercase', color:'var(--teal)', fontWeight:600 },
  stepLabel: { fontSize:'.58rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--tdim)', fontWeight:500 },
  subLabel:  { fontSize:'.61rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--teal)', marginBottom:'.5rem' },
  serif:     { fontFamily:"'DM Serif Display',serif" },
  sans:      { fontFamily:"'Outfit',sans-serif" },
  // Box
  panel:     (alt=false) => ({ background: alt ? 'var(--bg2)' : 'var(--bg)', padding:'2rem 2.4rem', borderBottom:'1px solid var(--border)' }),
  card:      { background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:4, padding:'1rem 1.1rem' },
  tealBox:   { background:'var(--teal-dim)', borderLeft:'3px solid var(--teal)', borderRadius:'0 4px 4px 0', padding:'.7rem 1rem' },
  mb4:       { marginBottom:'1.4rem' },
  tealText:  { color:'var(--teal)' },
  tinyLabel: { fontSize:'.57rem', letterSpacing:'.12em', textTransform:'uppercase', display:'block' },
  infoCard:  { background:'var(--bg2)', padding:'2rem 2.4rem', borderBottom:'1px solid var(--border)', minHeight:260 },
};

/* ═══════════════════════════════════════════════════════════
   DATA — RIVER → SPECIES MAPPING
═══════════════════════════════════════════════════════════ */
const RIVER_SPECIES = {
  UT: {
    'Provo River':     ['rainbow','brown','cutthroat','whitefish'],
    'Green River':     ['rainbow','brown','cutthroat','whitefish'],
    'Logan River':     ['rainbow','brown','brook','cutthroat','whitefish'],
    'Strawberry River':['rainbow','cutthroat'],
    'Weber River':     ['rainbow','brown','cutthroat','whitefish'],
    'Fremont River':   ['rainbow','brown','cutthroat'],
    'Duchesne River':  ['rainbow','brown','cutthroat','brook','whitefish'],
    'Diamond Fork':    ['brown','rainbow','cutthroat'],
    'Sixth Water Creek':['cutthroat','brown','brook'],
  },
  ID: {
    "Henry's Fork":    ['rainbow','brown','cutthroat','whitefish'],
    'South Fork Snake': ['cutthroat','rainbow','brown','whitefish'],
    'Teton River':      ['cutthroat','rainbow','brown'],
    'Boise River':      ['rainbow','brown','whitefish'],
    'Big Wood River':   ['rainbow','brown','cutthroat'],
    'Silver Creek':     ['rainbow','brown','cutthroat'],
    'Salmon River':     ['steelhead','chinook','rainbow','cutthroat','whitefish'],
    'Clearwater River': ['steelhead','chinook','rainbow','cutthroat','whitefish'],
  },
  WY: {
    'Snake River (WY)':  ['cutthroat','rainbow','brown','whitefish'],
    'Green River (WY)':  ['rainbow','brown','cutthroat','whitefish'],
    'North Platte River':['rainbow','brown','cutthroat','whitefish'],
    'Hoback River':      ['cutthroat','brown','rainbow','whitefish'],
    "Ham's Fork":        ['brown','rainbow','cutthroat'],
    'Wind River':        ['rainbow','brown','cutthroat','whitefish'],
    'Shoshone River':    ['rainbow','brown','cutthroat','whitefish'],
    'Greys River':       ['cutthroat','brown','rainbow','whitefish'],
    'Yellowstone River (WY)':['cutthroat','rainbow','brown','whitefish'],
  },
  MT: {
    'Madison River':     ['rainbow','brown','cutthroat','whitefish'],
    'Yellowstone River': ['cutthroat','rainbow','brown','whitefish'],
    'Bighorn River':     ['rainbow','brown','whitefish'],
    'Gallatin River':    ['rainbow','brown','cutthroat','whitefish'],
    'Missouri River':    ['rainbow','brown','whitefish'],
    'Clark Fork':        ['rainbow','brown','bull','cutthroat','whitefish'],
    'Bitterroot River':  ['rainbow','brown','cutthroat','bull','whitefish'],
  },
  CO: {
    'Arkansas River':    ['rainbow','brown','cutthroat','cutbow'],
    'South Platte':      ['rainbow','brown','cutthroat','cutbow'],
    'Frying Pan River':  ['rainbow','brown'],
    'Blue River':        ['rainbow','brown','cutthroat','cutbow'],
    'Roaring Fork':      ['rainbow','brown','cutthroat','cutbow'],
    'Cache la Poudre':   ['rainbow','brown','cutthroat','cutbow'],
    'Clear Creek':       ['rainbow','brown','cutthroat','cutbow'],
    'Eagle River':       ['rainbow','brown','cutthroat','cutbow'],
    'Vail River':        ['rainbow','brown','cutthroat'],
  },
  OR: {
    'Deschutes River':   ['rainbow','steelhead','brown','whitefish'],
    'Rogue River':       ['rainbow','steelhead','chinook','coho'],
    'McKenzie River':    ['rainbow','cutthroat','brown'],
    'Sandy River':       ['steelhead','cutthroat','rainbow'],
    'John Day River':    ['rainbow','steelhead','cutthroat'],
    'Williamson River':  ['rainbow','brown','cutthroat'],
  },
  WA: {
    'Yakima River':      ['rainbow','brown','cutthroat','whitefish'],
    'Methow River':      ['steelhead','rainbow','cutthroat','whitefish'],
    'Skagit River':      ['steelhead','chinook','coho','cutthroat'],
    'Klickitat River':   ['steelhead','rainbow','cutthroat'],
    'Wenatchee River':   ['steelhead','rainbow','cutthroat','whitefish'],
    'Spokane River':     ['rainbow','brown','cutthroat','whitefish'],
  },
  rainbow: {
    name:'Rainbow Trout', emoji:'🌈', scientific:'Oncorhynchus mykiss',
    badge:'Acrobatic · Most Sought',
    temp:'52–65°F (11–18°C)', habitat:'Riffles, runs, seam lines, tailouts',
    feeding:'Opportunistic — insects, crustaceans, small fish',
    size:'12–22" typical, 26"+ in tailwaters and trophy fisheries',
    desc:'The most pursued trout in the Mountain West. Rainbows are aggressive, acrobatic fighters that take dry flies and nymphs alike. Tailwater populations grow fat on year-round midge and mayfly hatches. Wild fish are more selective than hatchery stock — match the hatch and use light tippet.',
    tactics:[
      'Indicator nymphing with midge larvae and PMD nymphs covers the most water efficiently',
      'Dry fly fishing is most productive during BWO and PMD hatches — watch for rising fish',
      'Euro nymphing close to structure produces consistent results in fast water',
      'Streamers fished on a swing or stripping retrieve can trigger aggressive takes from large fish',
    ],
    keyRigs:'Indicator nymph (4X–5X) / Dry fly (5X–6X) / Euro nymph (5X–6X)',
    spawnTiming: {
      window: 'February–May (peak March–April; varies by elevation)',
      waterTemp: '44–52°F (7–11°C)',
      location: 'Shallow gravel redds in riffle tails and runs with clean, oxygenated gravel; often the same locations as cutthroat spawn',
      signs: 'Females fanning gravel vigorously with tail; males holding nearby and competing; visible redd depressions in gravel; fish in very shallow, fast water — atypical holding positions',
      avoidGuidance: 'Spring is when many anglers are most eager to fish, but it coincides directly with rainbow spawn. Wade carefully and avoid walking through shallow gravel runs in March–April. Many tailwaters see their best hatches during spawn season — fish from the bank or wade the edges. Wild rainbow populations depend critically on successful spawning.',
      okToFish: 'Pre-spawn fish staging in deeper pools and runs below spawning areas are the most ethical target (February). Post-spawn fish drop back to feeding lies by late May and are hungry after the ordeal. Summer rainbows (June–September) are prime targets with no spawn concerns.',
    },
  },
  brown: {
    name:'Brown Trout', emoji:'🟤', scientific:'Salmo trutta',
    badge:'Technical · Pressure-Aware',
    temp:'55–65°F (13–18°C)', habitat:'Pools, undercut banks, woody debris',
    feeding:'Selective riser; ambush feeder at low light',
    size:'14–24" typical, 30"+ in trophy waters',
    desc:'The most challenging and rewarding trout in the Mountain West. Browns hold in heavy cover and demand precise presentations. Low-light periods unlock their aggressive side. Large browns actively hunt smaller fish.',
    tactics:[
      'Fish browns at first light and last light — most active outside bright sun',
      'Target undercut banks, log jams, and deep seams where they ambush prey',
      'Large articulated streamers stripped aggressively trigger reaction strikes',
      'Use long 5X–6X leaders and careful wading — browns spook at vibration',
    ],
    keyRigs:'Streamer (0X–1X, articulated) / Dry fly precision (5X–6X) / Dead-drift nymph',
    spawnTiming: {
      window: 'October–December (peak mid-October to mid-November)',
      waterTemp: '44–52°F (7–11°C)',
      location: 'Gravel redds in riffle tails, streamside shallows, and tributary mouths — often the same sites used year after year',
      signs: 'Males develop hooked jaw (kype) and vivid orange/rust flanks; females excavating gravel with tail; multiple browns visible near riffles; increased territorial aggression from both sexes',
      avoidGuidance: 'The fall brown trout spawn coincides with excellent dry fly and streamer conditions — making it tempting to fish hard. Resist the urge to wade into spawning areas. Give active redds a wide berth. Many large trophy fish (especially females) are physically depleted post-spawn; over-handling can be fatal. Consider voluntarily avoiding high-traffic redds even where regulations permit fishing.',
      okToFish: 'Pre-spawn fish (Sept–early Oct) staging near cover are the most prized targets and ethically sound to target. Post-spawn males can be targeted in December but handle with extreme care. Streamers fished in deep water away from redds are the most responsible approach during peak spawn.',
    },
  },
  cutthroat: {
    name:'Cutthroat Trout', emoji:'🔴', scientific:'Oncorhynchus clarkii',
    badge:'Willing Riser · Native',
    temp:'48–62°F (9–17°C)', habitat:'Mountain streams, high-elevation lakes',
    feeding:'Aggressive dry fly taker; less selective than rainbow or brown',
    size:'10–18" typical, 24"+ in select rivers',
    desc:'Native to the Mountain West, cutthroat are the most willing dry fly fish. They reward attractor patterns and bold presentations. Several subspecies exist — Bonneville (UT), Snake River (WY/ID), Yellowstone. Each has slightly different behavior.',
    tactics:[
      'Use visible attractor patterns — Elk Hair Caddis, Royal Wulff, Parachute Adams in size 14–16',
      "Cutthroat will rise to a fly that rainbows ignore — don't overlook splashy rises",
      'High-elevation streams in summer hold hungry fish with little pressure',
      'In tailwaters, cutthroat often hold in shallower riffles than browns or rainbows',
    ],
    keyRigs:'Dry fly attractor (4X–5X) / Dry-dropper / Indicator nymph',
    spawnTiming: {
      window: 'March–June (varies by subspecies and elevation)',
      waterTemp: '44–52°F (7–11°C)',
      location: 'Shallow gravel in tributary streams, spring creeks, and stream inlets to lakes; Yellowstone cutthroat run Yellowstone Lake tributaries May–June',
      signs: 'Vivid red slash marks deepen in color; males develop slight kype; fish congregate in headwater streams and lake inlets in spring; spawning activity visible in very shallow water',
      avoidGuidance: 'Many cutthroat tributaries — especially in Yellowstone NP and protected native fish zones — are closed January 1 through mid-June or mid-July to protect spawning fish. Check regulations carefully. Some subspecies (Bonneville, Lahontan, Greenback) are sensitive enough that entire drainages are closed year-round.',
      okToFish: 'Post-spawn cutthroat drop back to main-stem rivers and lakes by July and are prime targets through September. High-elevation fishing opens in July when snowmelt subsides. These fish are most willing in summer — a great time to target them without spawn-season concerns.',
    },
  },
  brook: {
    name:'Brook Trout', emoji:'💚', scientific:'Salvelinus fontinalis',
    badge:'Char · Cold Water Specialist',
    temp:'50–60°F (10–16°C)', habitat:'Headwater streams, beaver ponds, cold springs',
    feeding:'Opportunistic — most willing biter in cold conditions',
    size:'6–14" typical; rarely exceed 16" in streams',
    desc:'Brook trout are the most visually stunning salmonid. A native char, not a true trout. They thrive in small, cold headwaters. Their willingness can vanish if they sense pressure, but in remote areas they eat almost anything.',
    tactics:[
      'Small attractor dry flies (size 14–18) work excellently in headwater streams',
      'High-elevation lakes hold larger fish — try a bead-head woolly bugger through shoreline structure',
      'Brookies in September–October display vivid spawning colors and show aggression',
      "Use stealth — they're in small water and you can see them; they can see you too",
    ],
    keyRigs:'Small dry fly (5X–6X) / Micro nymph (6X) / Small streamer',
    spawnTiming: {
      window: 'September–November (peak October)',
      waterTemp: '40–50°F (4–10°C)',
      location: 'Shallow gravel in headwater streams, spring seeps, and lake shorelines with upwelling groundwater — often very small, intimate areas',
      signs: 'Males flush brilliant red-orange on belly with vivid blue halos on spots; fin edges turn vivid white-and-black; fish visible in pairs or small groups on very shallow gravel; tail-fanning behavior',
      avoidGuidance: 'Brook trout spawn in exceptionally small, sensitive habitats. Even a single angler wading carelessly can destroy an entire spawning site for a small population. In waters where brook trout are native or non-native but the only population, voluntary avoidance of spawning areas in October is strongly encouraged. The fish are most visually stunning now but also at their most vulnerable.',
      okToFish: 'Where regulations are open, brook trout are aggressive during spawn and will strike readily. Fish pools and runs away from visible redds. Barbless hooks are recommended. In high-elevation lakes, fall is the best time to catch large brook trout near the inlet and outlet areas — focus on deeper water structure rather than shallow spawning beaches.',
    },
  },
  bull: {
    name:'Bull Trout', emoji:'❄️', scientific:'Salvelinus confluentus',
    badge:'Char · Federally Threatened',
    temp:'Must be below 55°F at all times', habitat:'Deep cold pools, glacial tributaries',
    feeding:'Piscivorous — eats other fish',
    size:'14–28" typical; 10+ lbs possible',
    desc:'A federally threatened native char requiring the coldest water of any salmonid. Found in MT, ID, OR, WA. Bull trout are piscivorous. Fishing regulations are strict. Always use barbless hooks and release quickly in cold water.',
    tactics:[
      'Large (3–5") articulated streamers on Type 5–6 sinking lines — imitate sculpin or whitefish',
      'Fish tributary confluences in summer when bull trout concentrate',
      'Aggressive 10" strips followed by a pause — they ambush from below',
      'Barbless hooks mandatory; release in <30 seconds in cold, oxygenated water',
    ],
    keyRigs:'Large articulated streamer (0X–1X, Type 5–6 sinking)',
    spawnTiming: {
      window: 'August–November (peak September–October at high elevations)',
      waterTemp: '39–48°F (4–9°C)',
      location: 'Cold, clean headwater tributaries — often very small, remote streams above major rivers. Bull trout migrate considerable distances (50+ miles) to reach spawning tributaries.',
      signs: 'Males develop vivid orange-red belly coloration; fish staging at tributary confluences in August; upstream migration visible in shallow streams; pairs on clean cobble/gravel in headwaters',
      avoidGuidance: 'Bull trout are a federally threatened species. Extra-legal targeting of spawning bull trout is a serious offense. Many of their spawning tributaries are closed to all fishing. Even in open water, spawning bull trout should not be targeted — these fish represent some of the last remaining viable populations. Give staging fish at tributary mouths space and do not disturb them. Barbless hooks are mandatory in most bull trout waters regardless of season.',
      okToFish: 'Bull trout are best and most responsibly targeted in summer (June–August) in main-stem rivers as they migrate toward their tributaries. Large streamers stripped aggressively in cold, deep pools are most effective. Always verify specific regulations for the water you are fishing — many streams have zero-retention rules for bull trout year-round.',
    },
  },
  steel: {
    name:'Steelhead', emoji:'⚡', scientific:'Oncorhynchus mykiss (anadromous)',
    badge:'Sea-Run Rainbow · Premier Game Fish',
    temp:'38–52°F (3–11°C)', habitat:'Tailouts, seams, main-stem runs',
    feeding:'Memory/aggression strikes — not actively feeding in freshwater',
    size:'24–40"+ typical, exceptionally powerful',
    migratory: true,
    runTiming: {
      summer: { months:'June–October', desc:'Summer-run fish enter rivers while water is warm. They hold in deep, cold lies (springs, shaded pools) for months before spawning in late winter–spring. More aggressive and surface-oriented than winter fish.' },
      winter: { months:'November–March', desc:'Winter-run fish enter in cold water and move quickly toward spawning gravel. Less aggressive but highly sought. Nymphing often outperforms swinging in water under 42°F.' },
      spring: { months:'February–May', desc:'Spawning occurs in gravel redds in tributary streams and main-stem shallows. Fish are most accessible but stressed — handle with extreme care and minimize fight time.' },
      byRiver: {
        'Deschutes River':   'Summer run (June–Nov) and winter run (Dec–Mar). Peak: Sept–Oct for summer fish.',
        'North Umpqua':      'Summer run enters June; peak fishing July–October. Winter fish Dec–March.',
        'Rogue River':       'Half-pounders (jacks) arrive Aug–Sept. Full adults: Oct–Dec. Spring Chinook overlap.',
        'Salmon River (ID)': 'Summer steelhead enter July; peak Sept–Nov. B-run fish arrive Oct–Nov (larger fish).',
        'Clearwater River':  'A-run summer steelhead July–Sept. B-run giants Oct–Nov (avg 12–14 lbs).',
        'Methow River':      'Summer run arrives May–June; best fishing Sept–Oct. Catch-and-release only.',
        'Skagit River':      'Wild winter steelhead Feb–April. Highly protected — C&R only. Spey fishing tradition.',
      },
    },
    desc:'The ultimate freshwater challenge. Steelhead are sea-run rainbow trout that return to natal rivers to spawn. They require precise presentation, reading water, and patience. Run timing varies critically by river and run type — check current river-specific schedules before planning a trip.',
    tactics:[
      'Swung flies on a Spey or single-hand rod — slow, deep swings through tailouts and seams',
      'Nymphing with an indicator is more productive in cold water (under 42°F)',
      'Cover water systematically — wade in, cast, step down, cast again',
      'Chrome fish (fresh from ocean) are most aggressive; dark/colored fish are less cooperative',
      'Summer steelhead will take surface flies (dry flies, bombers) in low clear water',
    ],
    keyRigs:'Spey swing / Indicator nymph (2X–3X) / Single-hand streamer',
    spawnTiming: {
      window: 'February–May (varies by run type and river)',
      waterTemp: '42–52°F (6–11°C)',
      location: 'Gravel redds in riffle tails of tributary streams and main-stem shallows with clean, oxygenated gravel',
      signs: 'Fish move to very shallow, fast water with clean gravel; females tail-digging; males circling and competing; vivid coloration on both sexes; fish visible in water too shallow to fish effectively',
      avoidGuidance: 'Spawning steelhead are at the absolute physiological limit. Fighting a fish on spawning redds causes potentially lethal stress. Many rivers have spring closures specifically to protect spawning fish. Even on open water: if you see fish actively on redds, move downstream. The population depends on successful spawning far more than on any angler catching one more fish.',
      okToFish: 'The ethical window for steelhead is the migration phase — from when fish enter fresh water through when they reach holding water near spawning areas. Chrome, fresh-from-salt fish are strongest and most likely to survive release. Avoid targeting dark, colored fish near redd areas entirely. Post-spawn fish ("kelts") can be caught in spring on some rivers but are exhausted — minimize fight time to near zero.',
    },
  },
  salmon: {
    name:'Pacific Salmon', emoji:'🍊', scientific:'Oncorhynchus spp.',
    badge:'Anadromous · Seasonal',
    temp:'45–58°F (7–14°C)', habitat:'Main-stem rivers, near spawning tributaries',
    feeding:'Strikes from aggression/memory during spawn, not hunger',
    size:'18–36"+ depending on species',
    migratory: true,
    runTiming: {
      chinook: { months:'Spring: Mar–Jun / Fall: Aug–Nov', desc:'Spring Chinook ("Springers") are the most prized — bright, fat, aggressive. Fall Chinook are larger but darker. Spring fish enter rivers and hold for months; fall fish move faster to spawning beds.' },
      coho: { months:'September–November', desc:'Coho (Silver) salmon are the most fly-accessible Pacific salmon. They enter rivers Sept–Nov and remain aggressive longer than Chinook. Bright flies and swung wets work well.' },
      sockeye: { months:'July–August', desc:'Sockeye target specific rivers with lake systems (Redfish Lake, ID). They are notoriously difficult to catch on flies but respond to small red/orange patterns.' },
      chum: { months:'October–December', desc:'Chum (Dog) salmon are underrated fly fishing targets. They take bright flies readily and are extremely powerful. Enter Pacific NW rivers Oct–Dec.' },
      byRiver: {
        'North Umpqua':   'Spring Chinook Mar–May; Coho Oct–Nov; Summer steelhead overlap June–Oct.',
        'Rogue River':    'Spring Chinook Apr–June; Coho Sept–Nov; Half-pounder steelhead Aug–Sept.',
        'Salmon River (ID)': 'Spring Chinook May–July; Fall Chinook Aug–Sept; Coho Oct–Nov.',
        'Skagit River':   'Spring Chinook Apr–May; Coho Oct–Nov; Wild winter steelhead Feb–Apr.',
        'Stillaguamish':  'Coho Oct–Nov (wild); pink salmon Aug (odd years); chum Nov.',
      },
    },
    desc:'Chinook, Coho, Sockeye, and Chum return to natal streams following genetically programmed run timing. They do not feed actively but will strike aggressively from aggression and territorial instinct. Timing your visit to match the run is everything — fish move through quickly and peak windows can be as short as 2–3 weeks.',
    tactics:[
      'Bright, gaudy flies (orange, pink, chartreuse, red) trigger reaction strikes',
      'Swing large wet flies across current in main-stem holding water',
      'Egg patterns and large attractor nymphs work near and below spawning beds',
      'Time your trip to the specific run — check ODFW, IDFG, or WDFW weekly counts',
      'Fresh bright fish are most aggressive; dark spawned-out fish are near death — leave them',
    ],
    keyRigs:'Egg pattern / Swung wet fly (1X–2X) / Large streamer',
    spawnTiming: {
      window: 'Varies by species: Chinook (Oct–Nov), Coho (Oct–Dec), Sockeye (Aug–Sept), Chum (Oct–Dec)',
      waterTemp: '42–55°F (6–13°C)',
      location: 'Gravel redds in main-stem rivers and tributary stream mouths; salmon create large, clearly visible redd depressions in gravel',
      signs: 'Brilliant red and green coloration on males; females excavating gravel with tail; large, conspicuous redd depressions (2–6 ft diameter) visible in gravel; spawned-out carcasses on the bank indicate active spawning in the area',
      avoidGuidance: 'Dark, colored salmon actively on redds are at the end of their life. They will die within days regardless of fishing pressure. While regulations may permit targeting them, it is generally considered poor sportsmanship and conservation ethics to target spawned-out fish on redds. Their decomposing carcasses provide critical nutrients to the river ecosystem — let them complete the cycle. Wading through salmon redds also destroys their eggs.',
      okToFish: 'Fresh, bright fish entering rivers from the ocean are the most prized and ethical targets — they are strong, aggressive, and their fate post-release is much better than fish already on redds. Aim to intercept fish in lower river reaches before they reach spawning areas. Check weekly fish passage counts (NOAA, ODFW, IDFG) to time your trip to peak fresh-fish entry.',
    },
  },
  whitefish: {
    name:'Mountain Whitefish', emoji:'🩶', scientific:'Prosopium williamsoni',
    badge:'Native · Underrated Winter Target',
    temp:'40–58°F (4–14°C)', habitat:'Gravel runs, riffles, deep pools in cold rivers',
    feeding:'Insect-focused nymph feeder; midge and caddis specialist',
    size:'10–18" typical; 20"+ in large rivers',
    desc:'The most overlooked game fish in the Mountain West. Mountain whitefish are native to most Rocky Mountain river systems and fight hard in cold water. They are excellent nymph fishing targets in winter when trout are lethargic. Small flies and precise drifts required.',
    tactics:[
      'Small midges (size 18–24) and caddis larvae are the bread-and-butter pattern',
      'Whitefish feed heavily in winter — best fishing November through March',
      'Dead-drift nymphs along the bottom in gravel runs and slow pools',
      'Euro nymphing is deadly — whitefish sip flies subtly; watch the leader closely',
      'Found in the same water as trout; target fast riffle tails and gravel runs specifically',
    ],
    keyRigs:'Euro nymph (5X–6X) / Small indicator nymph / Midge cluster dry fly',
    spawnTiming: {
      window: 'October–January (peak November–December)',
      waterTemp: '34–42°F (1–6°C)',
      location: 'Shallow gravel riffles and riffle tails — often the same reaches used by brown trout spawn in fall. Whitefish spawn later, in very cold water.',
      signs: 'Fish congregate in shallow riffles in November; spawning activity visible at dawn in clear, cold water; males may show slight tubercles; fish in large groups unlike typical solo feeding behavior',
      avoidGuidance: 'Whitefish spawning areas overlap significantly with brown trout redds. Avoid wading these shallow gravel areas November–January. Whitefish are native fish with important ecological roles — they are forage for bull trout and osprey. Though often dismissed as "trash fish," they deserve the same respect as trout during the spawn.',
      okToFish: 'Whitefish are fantastic winter fishing targets in deeper runs and pools away from spawning riffles. January through March in tailwaters — when trout are least active — whitefish often dominate catches. Fish small midges and midge larvae dead-drift along the bottom.',
    },
  },
  kokanee: {
    name:'Kokanee Salmon', emoji:'🔵', scientific:'Oncorhynchus nerka (landlocked)',
    badge:'Landlocked Sockeye · Schooling',
    temp:'50–60°F (10–15°C)', habitat:'Open water, 20–60 ft depth; inlet streams in fall',
    feeding:'Plankton filter feeder — triggered by small bright flies and color',
    size:'10–18" typical; 20"+ in prime waters',
    migratory: true,
    runTiming: {
      spawn: { months:'September–November', desc:'Kokanee move from open lake water into inlet streams and shallow gravel near stream mouths to spawn in fall. Males turn brilliant red with green heads. They are most accessible and catchable in this staging/spawning phase. Fish die after spawning.' },
      byWater: {
        'Strawberry Reservoir': 'Sept–Oct spawn run into Strawberry River inlet. Fish stage near river mouth in Aug–Sept.',
        'Flaming Gorge':        'Fall spawn Oct–Nov; fish concentrate near Sheep Creek and other inlets.',
        'Blue Mesa Reservoir':  'Sept–Oct spawn; access Lake Fork and Soap Creek arms in fall.',
        'Flathead Lake':        'Limited kokanee; larger populations in nearby Hungry Horse Reservoir.',
      },
    },
    desc:'Landlocked sockeye salmon that complete their entire life cycle in freshwater lakes. Kokanee school in open water at specific depth bands and are best targeted by trolling or jigging in summer. In fall, spawning fish move toward stream inlets and become catchable on small bright flies from shore.',
    tactics:[
      'In open water: small bright flies (size 12–16 pink, orange, red) on a slow strip at 30–50 ft depth',
      'Fall staging fish near inlet streams respond to small egg patterns and bright soft hackles',
      'Kokanee school tightly — if you find one, there are dozens; work the same depth systematically',
      'Red and orange are the most effective colors; size 14–16 small streamers also work',
      'They have soft mouths — fight gently and use a fine-mesh net',
    ],
    keyRigs:'Small streamer/wet fly (4X–5X) / Egg pattern in fall / Chironomid at depth',
    spawnTiming: {
      window: 'September–November (peak October)',
      waterTemp: '40–50°F (4–10°C)',
      location: 'Inlet streams and shallow gravel near stream mouths; some lakes have beach spawning on fine gravel near shoreline structure',
      signs: 'Males turn brilliant crimson-red with vivid green heads; fish aggregate near inlet streams and river mouths in late September; spawning activity visible in very shallow water; fish die after spawning',
      avoidGuidance: 'Spawning kokanee are in their final days of life — they will not survive regardless of angler impact. However, disturbing spawning concentrations stresses fish unnecessarily and can scatter them from productive redds. More importantly, kokanee eggs in the gravel provide critical food resources for trout and other species throughout winter — wading through redd areas destroys this food source. Stay out of spawning shallows.',
      okToFish: 'Pre-spawn kokanee staging in open water (August–September) are the best fly fishing target. Fish bright flies at 15–40 ft depth near inlet areas. Post-spawn fish are at end of life and not worth targeting. Most reservoirs allow kokanee harvest — check limits, as they are often generous during the fall fishery.',
    },
  },
  lake: {
    name:'Lake Trout (Mackinaw)', emoji:'🫧', scientific:'Salvelinus namaycush',
    badge:'Char · Deep Water Predator',
    temp:'40–55°F (4–13°C) — deepwater in summer', habitat:'Deep open water, rocky shoals, inlet currents',
    feeding:'Piscivorous ambush predator',
    size:'18–36"+ typical; 40"+ possible in prime waters',
    desc:'Lake trout are a coldwater char that live in the deepest, coldest parts of large reservoirs and mountain lakes. In spring and fall they come shallow and become accessible to fly anglers. In summer, they retreat to depths of 60–100+ feet. Fly fishing is most productive in May–June and October–November when fish are near the surface.',
    tactics:[
      'Spring and fall are prime — fish shallows (10–30 ft) near rocky points and inlet currents',
      'Large articulated streamers (4–6") stripped fast trigger reaction strikes',
      'Use fast-sinking lines (Type 6–8) in summer to reach suspended fish at 40–80 ft',
      'Rocky shoals and underwater structure concentrate fish — look for points and submerged reefs',
      'Dawn and dusk feeding windows in spring; mid-day in fall when water cools',
    ],
    keyRigs:'Large articulated streamer (0X–1X, Type 6–8 sink) / Jig-style fly in deep water',
    spawnTiming: {
      window: 'October–December (peak late October–November)',
      waterTemp: '40–48°F (4–9°C)',
      location: 'Rocky shoals, reefs, and boulder fields at 5–30 ft depth — lake trout do not build redds; they broadcast eggs randomly over rocky substrate where eggs fall into crevices',
      signs: 'Fish move from deep summer water to shallow rocky points and reefs in October; multiple fish visible over the same rocky area; males become more aggressive; fish active at dawn in very shallow water near rocks',
      avoidGuidance: 'Lake trout spawn on open rocky substrate without building defined redds, which makes avoidance harder to define visually. However, heavily concentrating angling pressure on spawning aggregations is ethically questionable, especially for wild populations. In Flaming Gorge and other trophy waters, release large breeding-age fish (20"+) to protect the spawning stock.',
      okToFish: 'Fall is actually an excellent fly fishing window for lake trout — they come to the shallowest accessible depths of the year. Large streamers stripped over rocky points and reefs in October–November regularly produce the largest fish of the year. Practice selective harvest; many regulations have strict size or slot limits to protect spawning fish.',
    },
  },
  splake: {
    name:'Splake', emoji:'🟣', scientific:'Salvelinus fontinalis x namaycush',
    badge:'Brook x Lake Trout Hybrid · Stocked',
    temp:'45–58°F (7–14°C)', habitat:'Open water, rocky shoals, inlet areas',
    feeding:'Aggressive opportunistic predator',
    size:'12–22" typical; grows faster than either parent',
    desc:'A fertile hybrid cross between brook trout and lake trout, stocked primarily in Utah (Fish Lake) and select high-elevation waters. Splake combine the aggression of brook trout with the size potential of lake trout. They grow faster than either parent species and will take a wide range of flies.',
    tactics:[
      'Medium streamers (2–3") are most effective — leech and sculpin patterns',
      'More aggressive than lake trout and will rise to larger dry flies in calm conditions',
      'Target rocky shoals and inlet areas where they concentrate to feed',
      'Fish near structure — submerged rocks, drop-offs, and current seams in reservoirs',
      'Best in spring and fall when fish are shallow; summer fishing requires depth',
    ],
    keyRigs:'Medium streamer (1X–2X) / Leech on intermediate line / Dry fly in calm conditions',
    spawnTiming: {
      window: 'October–December (inherits fall spawning behavior from both parents)',
      waterTemp: '40–50°F (4–10°C)',
      location: 'Rocky shoals and inlet areas near stream mouths; attempts spawning on gravel/rock substrate but hybrid fertility is inconsistent — most splake fisheries are maintained by stocking',
      signs: 'Fish move shallow near rocky points and inlet streams in fall; more visible than lake trout parent due to brook trout behavioral inheritance; small aggregations near structure',
      avoidGuidance: 'Splake are stocked fish in most waters and do not form self-sustaining populations, so spawn-period conservation pressure is lower than for wild species. However, treating them with care during the spawn reinforces good angling habits. Release large fish to allow natural selection to occur within stocked populations.',
      okToFish: 'Fall through early winter is prime time for splake — they move into accessible shallow water and are aggressive. All seasons are generally productive given their aggressive nature. No special spawn-season restrictions typically apply to stocked splake fisheries, but always verify local regulations.',
    },
  },
  tiger: {
    name:'Tiger Trout', emoji:'🐯', scientific:'Salmo trutta x Salvelinus fontinalis',
    badge:'Brown x Brook Trout Hybrid · Aggressive',
    temp:'48–62°F (9–17°C)', habitat:'Pools, runs, reservoir structure',
    feeding:'Highly aggressive — strikes out of pure predatory instinct',
    size:'12–22" typical; 24"+ in reservoirs',
    desc:'A sterile hybrid cross between brown trout and brook trout. Tiger trout are stocked by Utah DWR (Pineview, Fish Lake) and select CO/MT waters specifically for their aggressive strikes and striking marbled/vermiculated coloration. They are the most willing strikers of any salmonid — they attack flies they cannot possibly eat.',
    tactics:[
      'Large streamers stripped fast trigger immediate, aggressive strikes',
      'Tigers do not require matching the hatch — bold, attractor patterns work best',
      'Target structure: undercut banks, boulder gardens, drop-offs near shore',
      'They fight hard and jump — use at least 3X tippet',
      'Mornings and evenings are peak windows but tigers feed throughout the day',
    ],
    keyRigs:'Large streamer (1X–2X) / Woolly Bugger (all colors) / Attractor dry fly',
    spawnTiming: {
      window: 'No spawning — tiger trout are sterile hybrids',
      waterTemp: 'N/A',
      location: 'N/A — tiger trout cannot reproduce',
      signs: 'No spawning behavior. Fish may show increased aggression in fall (Oct–Nov) as a vestigial instinct inherited from brown trout and brook trout parents, but do not form redds or reproduce.',
      avoidGuidance: 'Tiger trout require no spawn-season conservation considerations — they are sterile and cannot reproduce. There are no redds to protect, no egg-laden females to avoid. This is one of the advantages of a sterile stocked fishery from a management perspective.',
      okToFish: 'Tiger trout can be targeted year-round without spawn-season concerns. Fall aggression (Oct–Nov) often produces the most exciting strikes as they respond to territorial instincts without actually spawning. All methods work all year.',
    },
  },
  steelhead: {
    name:'Steelhead', emoji:'⚡', scientific:'Oncorhynchus mykiss (anadromous)',
    badge:'Sea-Run Rainbow · Premier Game Fish',
    temp:'38–52°F (3–11°C)', habitat:'Tailouts, seams, main-stem runs',
    feeding:'Memory/aggression strikes — not actively feeding in freshwater',
    size:'24–40"+ typical, exceptionally powerful',
    migratory: true,
    runTiming: {
      summer: { months:'June–October', desc:'Summer-run fish enter rivers while water is warm. They hold in deep, cold lies (springs, shaded pools) for months before spawning in late winter–spring. More aggressive and surface-oriented than winter fish.' },
      winter: { months:'November–March', desc:'Winter-run fish enter in cold water and move quickly toward spawning gravel. Less aggressive but highly sought. Nymphing often outperforms swinging in water under 42°F.' },
      spring: { months:'February–May', desc:'Spawning occurs in gravel redds in tributary streams and main-stem shallows. Fish are most accessible but stressed — handle with extreme care and minimize fight time.' },
      byRiver: {
        'Deschutes River':   'Summer run (June–Nov) and winter run (Dec–Mar). Peak: Sept–Oct for summer fish.',
        'North Umpqua':      'Summer run enters June; peak fishing July–October. Winter fish Dec–March.',
        'Rogue River':       'Half-pounders (jacks) arrive Aug–Sept. Full adults: Oct–Dec. Spring Chinook overlap.',
        'Salmon River (ID)': 'Summer steelhead enter July; peak Sept–Nov. B-run fish arrive Oct–Nov (larger fish).',
        'Clearwater River':  'A-run summer steelhead July–Sept. B-run giants Oct–Nov (avg 12–14 lbs).',
        'Methow River':      'Summer run arrives May–June; best fishing Sept–Oct. Catch-and-release only.',
        'Skagit River':      'Wild winter steelhead Feb–April. Highly protected — C&R only. Spey fishing tradition.',
      },
    },
    desc:'The ultimate freshwater challenge. Steelhead are sea-run rainbow trout that return to natal rivers to spawn. They require precise presentation, reading water, and patience. Run timing varies critically by river and run type — check current river-specific schedules before planning a trip.',
    tactics:[
      'Swung flies on a Spey or single-hand rod — slow, deep swings through tailouts and seams',
      'Nymphing with an indicator is more productive in cold water (under 42°F)',
      'Cover water systematically — wade in, cast, step down, cast again',
      'Chrome fish (fresh from ocean) are most aggressive; dark/colored fish are less cooperative',
      'Summer steelhead will take surface flies (dry flies, bombers) in low clear water',
    ],
    keyRigs:'Spey swing / Indicator nymph (2X–3X) / Single-hand streamer',
    spawnTiming: {
      window: 'February–May (varies by run type and river)',
      waterTemp: '42–52°F (6–11°C)',
      location: 'Gravel redds in riffle tails of tributary streams and main-stem shallows with clean, oxygenated gravel',
      signs: 'Fish move to very shallow, fast water with clean gravel; females tail-digging; males circling and competing; vivid coloration on both sexes; fish visible in water too shallow to fish effectively',
      avoidGuidance: 'Spawning steelhead are at the absolute physiological limit. Fighting a fish on spawning redds causes potentially lethal stress. Many rivers have spring closures specifically to protect spawning fish. Even on open water: if you see fish actively on redds, move downstream. The population depends on successful spawning far more than on any angler catching one more fish.',
      okToFish: 'The ethical window for steelhead is the migration phase — from when fish enter fresh water through when they reach holding water near spawning areas. Chrome, fresh-from-salt fish are strongest and most likely to survive release. Avoid targeting dark, colored fish near redd areas entirely. Post-spawn fish ("kelts") can be caught in spring on some rivers but are exhausted — minimize fight time to near zero.',
    },
  },
  chinook: {
    name:'Pacific Salmon', emoji:'🍊', scientific:'Oncorhynchus spp.',
    badge:'Anadromous · Seasonal',
    temp:'45–58°F (7–14°C)', habitat:'Main-stem rivers, near spawning tributaries',
    feeding:'Strikes from aggression/memory during spawn, not hunger',
    size:'18–36"+ depending on species',
    migratory: true,
    runTiming: {
      chinook: { months:'Spring: Mar–Jun / Fall: Aug–Nov', desc:'Spring Chinook ("Springers") are the most prized — bright, fat, aggressive. Fall Chinook are larger but darker. Spring fish enter rivers and hold for months; fall fish move faster to spawning beds.' },
      coho: { months:'September–November', desc:'Coho (Silver) salmon are the most fly-accessible Pacific salmon. They enter rivers Sept–Nov and remain aggressive longer than Chinook. Bright flies and swung wets work well.' },
      sockeye: { months:'July–August', desc:'Sockeye target specific rivers with lake systems (Redfish Lake, ID). They are notoriously difficult to catch on flies but respond to small red/orange patterns.' },
      chum: { months:'October–December', desc:'Chum (Dog) salmon are underrated fly fishing targets. They take bright flies readily and are extremely powerful. Enter Pacific NW rivers Oct–Dec.' },
      byRiver: {
        'North Umpqua':   'Spring Chinook Mar–May; Coho Oct–Nov; Summer steelhead overlap June–Oct.',
        'Rogue River':    'Spring Chinook Apr–June; Coho Sept–Nov; Half-pounder steelhead Aug–Sept.',
        'Salmon River (ID)': 'Spring Chinook May–July; Fall Chinook Aug–Sept; Coho Oct–Nov.',
        'Skagit River':   'Spring Chinook Apr–May; Coho Oct–Nov; Wild winter steelhead Feb–Apr.',
        'Stillaguamish':  'Coho Oct–Nov (wild); pink salmon Aug (odd years); chum Nov.',
      },
    },
    desc:'Chinook, Coho, Sockeye, and Chum return to natal streams following genetically programmed run timing. They do not feed actively but will strike aggressively from aggression and territorial instinct. Timing your visit to match the run is everything — fish move through quickly and peak windows can be as short as 2–3 weeks.',
    tactics:[
      'Bright, gaudy flies (orange, pink, chartreuse, red) trigger reaction strikes',
      'Swing large wet flies across current in main-stem holding water',
      'Egg patterns and large attractor nymphs work near and below spawning beds',
      'Time your trip to the specific run — check ODFW, IDFG, or WDFW weekly counts',
      'Fresh bright fish are most aggressive; dark spawned-out fish are near death — leave them',
    ],
    keyRigs:'Egg pattern / Swung wet fly (1X–2X) / Large streamer',
    spawnTiming: {
      window: 'Varies by species: Chinook (Oct–Nov), Coho (Oct–Dec), Sockeye (Aug–Sept), Chum (Oct–Dec)',
      waterTemp: '42–55°F (6–13°C)',
      location: 'Gravel redds in main-stem rivers and tributary stream mouths; salmon create large, clearly visible redd depressions in gravel',
      signs: 'Brilliant red and green coloration on males; females excavating gravel with tail; large, conspicuous redd depressions (2–6 ft diameter) visible in gravel; spawned-out carcasses on the bank indicate active spawning in the area',
      avoidGuidance: 'Dark, colored salmon actively on redds are at the end of their life. They will die within days regardless of fishing pressure. While regulations may permit targeting them, it is generally considered poor sportsmanship and conservation ethics to target spawned-out fish on redds. Their decomposing carcasses provide critical nutrients to the river ecosystem — let them complete the cycle. Wading through salmon redds also destroys their eggs.',
      okToFish: 'Fresh, bright fish entering rivers from the ocean are the most prized and ethical targets — they are strong, aggressive, and their fate post-release is much better than fish already on redds. Aim to intercept fish in lower river reaches before they reach spawning areas. Check weekly fish passage counts (NOAA, ODFW, IDFG) to time your trip to peak fresh-fish entry.',
    },
  },
  coho: {
    name:'Pacific Salmon', emoji:'🍊', scientific:'Oncorhynchus spp.',
    badge:'Anadromous · Seasonal',
    temp:'45–58°F (7–14°C)', habitat:'Main-stem rivers, near spawning tributaries',
    feeding:'Strikes from aggression/memory during spawn, not hunger',
    size:'18–36"+ depending on species',
    migratory: true,
    runTiming: {
      chinook: { months:'Spring: Mar–Jun / Fall: Aug–Nov', desc:'Spring Chinook ("Springers") are the most prized — bright, fat, aggressive. Fall Chinook are larger but darker. Spring fish enter rivers and hold for months; fall fish move faster to spawning beds.' },
      coho: { months:'September–November', desc:'Coho (Silver) salmon are the most fly-accessible Pacific salmon. They enter rivers Sept–Nov and remain aggressive longer than Chinook. Bright flies and swung wets work well.' },
      sockeye: { months:'July–August', desc:'Sockeye target specific rivers with lake systems (Redfish Lake, ID). They are notoriously difficult to catch on flies but respond to small red/orange patterns.' },
      chum: { months:'October–December', desc:'Chum (Dog) salmon are underrated fly fishing targets. They take bright flies readily and are extremely powerful. Enter Pacific NW rivers Oct–Dec.' },
      byRiver: {
        'North Umpqua':   'Spring Chinook Mar–May; Coho Oct–Nov; Summer steelhead overlap June–Oct.',
        'Rogue River':    'Spring Chinook Apr–June; Coho Sept–Nov; Half-pounder steelhead Aug–Sept.',
        'Salmon River (ID)': 'Spring Chinook May–July; Fall Chinook Aug–Sept; Coho Oct–Nov.',
        'Skagit River':   'Spring Chinook Apr–May; Coho Oct–Nov; Wild winter steelhead Feb–Apr.',
        'Stillaguamish':  'Coho Oct–Nov (wild); pink salmon Aug (odd years); chum Nov.',
      },
    },
    desc:'Chinook, Coho, Sockeye, and Chum return to natal streams following genetically programmed run timing. They do not feed actively but will strike aggressively from aggression and territorial instinct. Timing your visit to match the run is everything — fish move through quickly and peak windows can be as short as 2–3 weeks.',
    tactics:[
      'Bright, gaudy flies (orange, pink, chartreuse, red) trigger reaction strikes',
      'Swing large wet flies across current in main-stem holding water',
      'Egg patterns and large attractor nymphs work near and below spawning beds',
      'Time your trip to the specific run — check ODFW, IDFG, or WDFW weekly counts',
      'Fresh bright fish are most aggressive; dark spawned-out fish are near death — leave them',
    ],
    keyRigs:'Egg pattern / Swung wet fly (1X–2X) / Large streamer',
    spawnTiming: {
      window: 'Varies by species: Chinook (Oct–Nov), Coho (Oct–Dec), Sockeye (Aug–Sept), Chum (Oct–Dec)',
      waterTemp: '42–55°F (6–13°C)',
      location: 'Gravel redds in main-stem rivers and tributary stream mouths; salmon create large, clearly visible redd depressions in gravel',
      signs: 'Brilliant red and green coloration on males; females excavating gravel with tail; large, conspicuous redd depressions (2–6 ft diameter) visible in gravel; spawned-out carcasses on the bank indicate active spawning in the area',
      avoidGuidance: 'Dark, colored salmon actively on redds are at the end of their life. They will die within days regardless of fishing pressure. While regulations may permit targeting them, it is generally considered poor sportsmanship and conservation ethics to target spawned-out fish on redds. Their decomposing carcasses provide critical nutrients to the river ecosystem — let them complete the cycle. Wading through salmon redds also destroys their eggs.',
      okToFish: 'Fresh, bright fish entering rivers from the ocean are the most prized and ethical targets — they are strong, aggressive, and their fate post-release is much better than fish already on redds. Aim to intercept fish in lower river reaches before they reach spawning areas. Check weekly fish passage counts (NOAA, ODFW, IDFG) to time your trip to peak fresh-fish entry.',
    },
  },
  cutbow: {
    name:'Cutbow Trout', emoji:'🔶', scientific:'Oncorhynchus mykiss x clarkii',
    badge:'Rainbow x Cutthroat Hybrid · Colorado Native',
    temp:'50–65°F (10–18°C)', habitat:'Riffles, runs, reservoir shoals, inlet areas',
    feeding:'Aggressive opportunist — combines cutthroat willingness with rainbow selectivity',
    size:'14–24" typical, 28"+ in trophy stillwaters like Spinney Mountain',
    desc:'A naturally occurring and sometimes stocked hybrid between rainbow and cutthroat trout. Cutbows are prevalent throughout Colorado\'s Front Range tailwaters and high-elevation reservoirs. They display the red slash marks of a cutthroat alongside the lateral band of a rainbow. Often more aggressive than either parent — they combine the cutthroat\'s eagerness to rise with the rainbow\'s power. Spinney Mountain Reservoir is one of the premier cutbow fisheries in the West.',
    tactics:[
      'Cutbows rise willingly to dry flies — attractor patterns like Parachute Adams and Elk Hair Caddis work well',
      'In tailwaters, midge and BWO nymph rigs produce consistently year-round',
      'Large cutbows in stillwaters crush streamer and leech patterns stripped near inlet currents',
      'Scud and chironomid patterns are essential in high-elevation reservoirs like Spinney',
      'Use 5X tippet — they are strong fighters that will test lighter tippets in open water',
    ],
    keyRigs:'Dry fly attractor (4X–5X) / Indicator nymph midge/BWO (5X–6X) / Streamer (2X–3X)',
    spawnTiming: {
      window: 'February–May (variable — inherits timing from both parent species)',
      waterTemp: '44–52°F (7–11°C)',
      location: 'Shallow gravel redds in riffle tails and stream inlets; in reservoirs, cutbows move toward inlet streams and shallow gravel shorelines in spring',
      signs: 'Red slash marks brighten; lateral pink band intensifies; fish move to shallow gravel in riffle tails; females fanning redds; multiple fish visible in very shallow water',
      avoidGuidance: 'Spring spawn coincides with the best dry fly hatches on Colorado tailwaters. Wade carefully around shallow gravel riffles in March–April. In Spinney Mountain and Eleven Mile, fish staging near inlet streams in spring should be given space — large breeding-age cutbows are the foundation of the trophy fishery.',
      okToFish: 'Pre-spawn staging fish in deep runs and pools below spawning riffles are fair targets in late February. Post-spawn fish drop back to feeding lies by late May and are aggressive. Summer and fall are prime for cutbows in both rivers and reservoirs with no spawn concerns.',
    },
  },
};


/* ═══ TECHNIQUE DATA ════════════════════════════════════════ */
// Alias for species detail lookup (keyed by species id like 'rainbow', 'brown', etc.)

// River → technique IDs mapping (mirrors structure of RIVER_SPECIES)
const RIVER_TECHNIQUES = {
  UT: {
    'Provo River':      ['dry','euro','indicator','streamer'],
    'Green River':      ['dry','euro','indicator','streamer'],
    'Logan River':      ['dry','euro','indicator','streamer'],
    'Strawberry River': ['indicator','euro','dry','streamer'],
    'Weber River':      ['indicator','euro','dry','streamer'],
    'Fremont River':    ['dry','euro','indicator'],
    'Duchesne River':   ['indicator','euro','dry','streamer'],
    'Diamond Fork':     ['dry','euro','indicator'],
    'Sixth Water Creek':['dry','euro','indicator'],
  },
  ID: {
    "Henry's Fork":     ['dry','sight','euro','streamer'],
    'South Fork Snake': ['dry','streamer','euro','indicator'],
    'Teton River':      ['dry','euro','indicator'],
    'Boise River':      ['indicator','euro','dry'],
    'Big Wood River':   ['dry','euro','indicator'],
    'Silver Creek':     ['dry','sight','euro'],
    'Salmon River':     ['streamer','dry','indicator'],
    'Clearwater River': ['streamer','indicator','dry'],
  },
  WY: {
    'Snake River (WY)': ['dry','streamer','euro'],
    'Green River (WY)': ['dry','euro','indicator'],
    'North Platte River':['indicator','euro','dry','streamer'],
    'Shoshone River':   ['streamer','indicator','dry'],
    'Hoback River':     ['dry','euro','indicator'],
    'Yellowstone River':['dry','streamer','indicator'],
    "Ham's Fork":       ['dry','euro','indicator','streamer'],
    'Wind River':          ['dry','euro','indicator','streamer'],
    'Yellowstone River (WY)':['dry','streamer','euro'],
    'Greys River':          ['dry','euro','streamer'],
  },
  MT: {
    'Madison River':    ['dry','streamer','euro','indicator'],
    'Bighorn River':    ['indicator','euro','dry','streamer'],
    'Gallatin River':   ['dry','euro','indicator'],
    'Clark Fork':       ['dry','streamer','indicator'],
    'Missouri River':   ['indicator','euro','dry','sight'],
    'Yellowstone River':['dry','streamer','indicator'],
    'Bitterroot River': ['dry','euro','indicator'],
  },
  CO: {
    'Arkansas River':   ['indicator','euro','dry','streamer'],
    'South Platte':     ['euro','indicator','dry','sight'],
    'Frying Pan River': ['euro','indicator','dry','sight'],
    'Blue River':       ['euro','indicator','dry','streamer'],
    'Cache la Poudre':  ['dry','euro','indicator','streamer'],
    'Roaring Fork':     ['dry','euro','indicator','streamer'],
    'Clear Creek':      ['euro','indicator','dry','streamer'],
    'Eagle River':      ['indicator','euro','dry','streamer'],
    'Vail River':       ['euro','dry','indicator','sight'],
  },
  OR: {
    'Deschutes River':  ['dry','streamer','indicator'],
    'Rogue River':      ['streamer','dry','indicator'],
    'McKenzie River':   ['dry','streamer','euro'],
    'John Day River':   ['streamer','indicator','dry'],
    'Williamson River': ['dry','indicator','euro'],
    'Sandy River':      ['streamer','indicator'],
  },
  WA: {
    'Yakima River':     ['indicator','euro','dry','streamer'],
    'Methow River':     ['dry','streamer','indicator'],
    'Wenatchee River':  ['dry','streamer','indicator'],
    'Skagit River':     ['streamer','indicator'],
    'Klickitat River':  ['dry','streamer','indicator'],
    'Spokane River':    ['dry','euro','indicator','streamer'],
  },
};

const F = {
  Ant: {t:'n',n:'Ant'},
  ArticulatedLeech: {t:'r',n:'Articulated Leech'},
  BwoDry: {t:'s',n:'BWO (Dry)'},
  BwoEmerger: {t:'n',n:'BWO Emerger'},
  BwoNymph: {t:'n',n:'BWO Nymph'},
  BwoRs2: {t:'n',n:'BWO RS2'},
  Blowtorch: {t:'e',n:'Blowtorch'},
  BrownDrake: {t:'s',n:'Brown Drake'},
  CaddisLarva: {t:'n',n:'Caddis Larva'},
  CaddisPupa: {t:'s',n:'Caddis Pupa'},
  Callibaetis: {t:'n',n:'Callibaetis'},
  ChubbyChernobyl: {t:'s',n:'Chubby Chernobyl'},
  CircusPeanut: {t:'r',n:'Circus Peanut'},
  DrunkDisorderly: {t:'r',n:'Drunk & Disorderly'},
  ElkHairCaddis: {t:'n',n:'Elk Hair Caddis'},
  Frenchie: {t:'e',n:'Frenchie'},
  Hopper: {t:'n',n:'Hopper'},
  MidgeLarva: {t:'n',n:'Midge Larva'},
  MidgePupa: {t:'n',n:'Midge Pupa'},
  OctoberCaddis: {t:'s',n:'October Caddis'},
  OliveSculpin: {t:'r',n:'Olive Sculpin'},
  Pmd: {t:'n',n:'PMD'},
  PmdDry: {t:'n',n:'PMD (Dry)'},
  PmdNymph: {t:'n',n:'PMD Nymph'},
  PmdSparkleDun: {t:'n',n:'PMD Sparkle Dun'},
  Perdigon: {t:'e',n:'Perdigon'},
  PheasantTail: {t:'n',n:'Pheasant Tail'},
  PinkEgg: {t:'r',n:'Pink Egg'},
  RainbowWarrior: {t:'e',n:'Rainbow Warrior'},
  Salmonfly: {t:'s',n:'Salmonfly'},
  SalmonflyNymph: {t:'s',n:'Salmonfly Nymph'},
  SanJuanWorm: {t:'n',n:'San Juan Worm'},
  Scud: {t:'n',n:'Scud'},
  SkwalaNymph: {t:'s',n:'Skwala Nymph'},
  SkwalaStone: {t:'s',n:'Skwala Stone'},
  Slumpbuster: {t:'r',n:'Slumpbuster'},
  SoftHackleCaddis: {t:'n',n:'Soft Hackle Caddis'},
  SowBug: {t:'n',n:'Sow Bug'},
  Stimulator: {t:'s',n:'Stimulator'},
  StoneflyNymph: {t:'n',n:'Stonefly Nymph'},
  Trico: {t:'n',n:'Trico'},
  WoollyBugger: {t:'r',n:'Woolly Bugger'},
  YellowSally: {t:'s',n:'Yellow Sally'},
  ZebraMidge: {t:'n',n:'Zebra Midge'},
};

const TECHNIQUES = {
  dry: {
    name:'Dry Fly', color:'var(--dry-c)', level:'Intermediate', levelClass:'lv-int',
    short:'Surface presentation — matching natural insects on top',
    detail:'The most visually satisfying technique. Requires reading rise forms, matching the hatch, and achieving a perfect drag-free drift. Leader length (12–16ft) and tippet choice (4X–6X) are critical on spring creeks and tailwaters.',
    tip:'Watch the fish rise 2–3 times to confirm the pattern and rhythm before casting. Cast upstream at 45°, reach-mend immediately, and give the fly time to float through the lane.',
    rigs:['12–14ft tapered leader, 5X–6X tippet, size 14–20 dry fly','Caddis emerger on 4X in broken water','Size 22–26 midge on calm tailwater flats'],
  },
  euro: {
    name:'Euro Nymphing', color:'var(--euro-c)', level:'Intermediate', levelClass:'lv-int',
    short:'Tight-line contact nymphing — no indicator, direct feel',
    detail:"Eliminate all slack between rod tip and fly. A colored sighter replaces the indicator — you watch it, not the fly. The method is deadly in fast, broken water and allows you to feel subtle takes that an indicator would miss entirely.",
    tip:'Lead the fly at current speed — your rod tip tracks downstream at the same pace as the fly. When the sighter checks, pauses, or ticks slightly upstream: set the hook immediately.',
    rigs:['10–11ft rod, 20ft level nylon leader, sighter section, 2–3ft tippet (3X–5X)','Jig hook perdigon or tungsten bead nymph #14–18','Two-fly rig: heavy anchor nymph + lighter trailer'],
  },
  indicator: {
    name:'Indicator Nymphing', color:'var(--nymph-c)', level:'Beginner', levelClass:'lv-beg',
    short:'Floating indicator suspends nymphs at target depth',
    detail:'The most approachable nymphing method. A foam, yarn, or Thingamabobber indicator suspends flies at a set depth. You read the indicator for strikes — it dips, shoots sideways, or stops. Effective in medium-paced runs with 2–5ft of depth.',
    tip:'Set your indicator depth at 1.5× the water depth. Add weight to get flies to the bottom quickly. Strike every time the indicator does anything unexpected — trout strikes are often subtle.',
    rigs:['9ft 5wt, 9ft leader, Thingamabobber, split shot, 2ft tippet (4X)','Two-nymph rig: heavy stonefly + small midge dropper','Beadhead pheasant tail + soft hackle emerger'],
  },
  streamer: {
    name:'Streamer Fishing', color:'var(--str-c)', level:'Intermediate', levelClass:'lv-int',
    short:'Large flies imitating baitfish — aggressive strikes',
    detail:'Streamers target the largest, most predatory fish. Techniques range from dead-drift (effective in high water) to aggressive stripping (triggers reaction strikes). Sink-tip or full sinking lines get flies to depth. Best early morning, late evening, or in off-color water.',
    tip:'Vary your retrieve — a few short strips, pause, one long strip, pause. The pause is when most strikes happen. Keep the rod tip low and pointed at the fly to maximize hook-up ratio.',
    rigs:['7–8wt rod, Type 3–6 sinking line or 10–15ft sink tip','Articulated leech or sculpin pattern #2–6, 1X–2X tippet','Woolly Bugger on a 9ft leader for dead-drift in high water'],
  },
  sight: {
    name:'Sight Fishing', color:'var(--sight-c)', level:'Advanced', levelClass:'lv-adv',
    short:'Spot individual fish, deliver precise presentations',
    detail:"The most technical and rewarding approach. Requires Polaroid glasses, elevated vantage, and patience. You see the fish, identify what it's eating, and deliver a fly to its feeding lane. The approach must be silent, low, and from downstream.",
    tip:"Move slowly, keep your shadow behind you, and watch the fish's behavior before casting. A feeding trout tilts slightly and opens its white mouth. A nervous fish will drop to the bottom — wait for it to resume feeding before casting.",
    rigs:["Long, accurate leader (14–16ft), lightest tippet the fish will tolerate (5X–7X)","Pattern matched to what the fish is actively eating","Minimal false casts — no more than 2 before presenting"],
  },
};
/* ═══════════════════════════════════════════════════════════
   FLY / INSECT DETAIL DATABASE
   Keyed by normalized fly name → lifecycle, sizes, colors per technique
═══════════════════════════════════════════════════════════ */
const FLY_INFO = {
  /* ── MIDGES ── */
  'Zebra Midge': {
    insect: 'Chironomid (Midge)', type: 'midge',
    lifecycle: 'Midges live as larvae in stream substrate for weeks to months, then form pupae that migrate to the surface film. Adults emerge year-round but peak in winter and spring on tailwaters. Fish feed heavily on pupae in the film and larvae near the bottom.',
    stages: ['Larva (bottom)','Pupa (ascending)','Adult (surface)'],
    sizes: { dry: null, euro: '#18–22', indicator: '#18–22', streamer: null },
    colors: { euro: 'Red or black body, silver wire rib, black bead', indicator: 'Red/black with silver ribbing, tungsten bead' },
    notes: 'Most effective in tailwaters year-round. Fish slowly near the bottom or dead-drift in the film during emergence.',
    hatchTimes: { label:'All day — peaks mid-morning', start:8, end:14, peak:10, allDay:false, note:'Cold overcast days push emergence earlier; bright sun delays it.' },
  },
  'Midge Larva': {
    insect: 'Chironomid (Midge)', type: 'midge',
    lifecycle: 'Midge larvae are worm-like, living in bottom substrate. They breathe dissolved oxygen and drift freely in current. Multiple species create "bloodworm" red coloration from hemoglobin. Bottom-dwellers that fish pick off the substrate.',
    stages: ['Larva (substrate/drift)'],
    sizes: { dry: null, euro: '#18–24', indicator: '#20–24', streamer: null },
    colors: { euro: 'Red, cream, or olive thread body, small bead', indicator: 'Red "bloodworm" most productive in winter' },
    notes: 'Dead-drift tight to the bottom. Blood red most effective in tailwaters; olive/cream in spring creeks.',
    hatchTimes: { label:'All day subsurface', start:0, end:23, peak:10, allDay:true, note:'Larvae available 24/7 — no specific hatch window. Most effective during low-light periods.' },
  },
  'Midge Pupa': {
    insect: 'Chironomid (Midge)', type: 'midge',
    lifecycle: 'The pupal stage ascends through the water column to emerge at the surface. Fish feed aggressively on pupae hanging in the film — visible as "bulging" rises with no actual adult taken. This is the most important midge stage to imitate.',
    stages: ['Pupa (ascending)','Pupa (film)'],
    sizes: { dry: '#18–22', euro: '#18–22', indicator: '#18–22', streamer: null },
    colors: { dry: 'Gray/black with silver thorax', euro: 'Black, red, or olive with silver or pearl rib', indicator: 'Same as euro, slightly heavier bead' },
    notes: 'Fish just under or in the surface film. A slow, steady dead-drift is most effective.',
    hatchTimes: { label:'Mid-morning emergence', start:9, end:13, peak:11, allDay:false, note:'Bulging rises signal pupa in the film. Cold cloudy days extend the window significantly.' },
  },
  'Midge Cluster': {
    insect: 'Chironomid (Midge)', type: 'midge',
    lifecycle: 'Multiple adult midges clump together on the surface after emergence. Trout feeding on clusters take them as one larger meal — very efficient feeding. Common on calm tailwater flats and reservoirs.',
    stages: ['Adult cluster (surface)'],
    sizes: { dry: '#16–20', euro: null, indicator: null, streamer: null },
    colors: { dry: 'Gray hackle and thread, sometimes with CDC' },
    notes: 'Use a Griffin\'s Gnat or similar cluster pattern. Fish can be extremely selective to size.',
    hatchTimes: { label:'Late morning — calm water', start:10, end:14, peak:11, allDay:false, note:'Clusters form when multiple adults accumulate on the surface after emergence.' },
  },
  /* ── BWO / BAETIS ── */
  'BWO Nymph': {
    insect: 'Blue-Winged Olive (Baetis)', type: 'mayfly',
    lifecycle: 'Baetis are small mayflies that crawl and swim actively — unlike many nymphs they are strong swimmers. They live 3–6 weeks in the nymphal stage, preferring faster riffles and moderately-paced runs. Multiple broods per year make them available spring through fall.',
    stages: ['Nymph (riffle)','Emerger','Adult Dun','Spinner'],
    sizes: { dry: '#16–22', euro: '#16–22', indicator: '#16–22', streamer: null },
    colors: { euro: 'Olive/brown body, pheasant tail fibers, small copper or gold bead', indicator: 'Same, or Frenchie-style with hot spot' },
    notes: 'Best fished in riffles and runs. Strong swimmer — add a subtle swing at the end of drift.',
    hatchTimes: { label:'All day subsurface', start:0, end:23, peak:9, allDay:true, note:'Fish nymphs all day. Most active 1–2 hrs before the surface hatch begins.' },
  },
  'BWO Emerger': {
    insect: 'Blue-Winged Olive (Baetis)', type: 'mayfly',
    lifecycle: 'BWO emergence peaks on cold, cloudy, drizzly days — conditions that suppress wing drying and trap adults in the film longer. Fish rise aggressively during hatches. Emergers hanging in the film are the most vulnerable stage.',
    stages: ['Emerger (film)','Cripple'],
    sizes: { dry: '#16–22', euro: '#16–20', indicator: '#16–20', streamer: null },
    colors: { dry: 'Olive body, gray CDC or hackle, trailing shuck optional', euro: 'Olive thread, CDC or hackle fiber wingcase, brown wire rib' },
    notes: 'Overcast days with light rain are prime BWO conditions. Look for subtle, sipping rises near current seams.',
    hatchTimes: { label:'Mid-morning on overcast days', start:9, end:14, peak:11, allDay:false, note:'Best on cold, cloudy, drizzly days. Bright sun suppresses BWO emergence.' },
  },
  'BWO RS2': {
    insect: 'Blue-Winged Olive (Baetis) — Emerger', type: 'mayfly',
    lifecycle: 'RS2 imitates a Baetis emerger/stillborn trapped in the surface film. A Rim Chung classic from South Platte. One of the most effective tailwater patterns in the Rocky Mountain West, particularly in winter and spring.',
    stages: ['Emerger (film)','Stillborn'],
    sizes: { dry: '#18–22', euro: '#18–22', indicator: '#18–22', streamer: null },
    colors: { dry: 'Gray or olive dubbed body, white Antron wing, gray hackle fibers', indicator: 'Same with optional small bead' },
    notes: 'Fish in or just under the film. Highly effective in South Platte, Frying Pan, and similar tailwaters.',
    hatchTimes: { label:'During hatch — film fishing', start:9, end:14, peak:11, allDay:false, note:'Fish in or just under the film when bulging rises are visible.' },
  },
  /* ── PMD ── */
  'PMD Nymph': {
    insect: 'Pale Morning Dun (Ephemerella)', type: 'mayfly',
    lifecycle: 'PMDs are mid-summer mayflies on most Western freestone rivers, peaking June–August. Nymphs are robust clingers that live in moderate current. They are important food sources for weeks before hatching.',
    stages: ['Nymph','Emerger','Dun','Spinner'],
    sizes: { dry: '#14–18', euro: '#14–18', indicator: '#14–18', streamer: null },
    colors: { euro: 'Pale olive/yellow body, brown or olive pheasant tail, gold or copper bead', indicator: 'Same, or Hare\'s Ear in pale yellow' },
    notes: 'Hatch usually begins mid-morning on sunny days. Nymph fishing productive for 2–3 hours before emergence.',
    hatchTimes: { label:'Morning subsurface', start:7, end:11, peak:9, allDay:false, note:'Fish nymphs in riffles before the mid-morning hatch begins.' },
  },
  'PMD Sparkle Dun': {
    insect: 'Pale Morning Dun (Ephemerella) — Emerger', type: 'mayfly',
    lifecycle: 'PMD emergers hang in the film during peak summer hatches. The Sparkle Dun\'s trailing shuck imitates a nymph case — very effective on selective tailwater fish that key on impaired emergers rather than healthy adults.',
    stages: ['Emerger','Cripple'],
    sizes: { dry: '#14–18', euro: null, indicator: null, streamer: null },
    colors: { dry: 'Yellow/olive dubbed body, deer hair wing, Antron shuck in amber' },
    notes: 'Most effective during actual hatch windows on spring creeks and smooth tailwater flats. Size critical — match local insects.',
    hatchTimes: { label:'Mid-morning hatch', start:9, end:13, peak:10, allDay:false, note:'Fish during active emergence. Cripples/emergers outperform adult dries.' },
  },
  /* ── CADDIS ── */
  'Caddis Larva': {
    insect: 'Caddisfly (various — Trichoptera)', type: 'caddis',
    lifecycle: 'Caddis larvae are diverse — case-builders, free-roamers, and net-spinners all coexist. They live 10–12 months in the larval stage, providing year-round food. Case-builders drag their homes across the substrate; net-spinners filter the current.',
    stages: ['Larva','Pupa','Adult'],
    sizes: { dry: null, euro: '#12–16', indicator: '#12–16', streamer: null },
    colors: { euro: 'Chartreuse, olive, or cream body, brown thorax, bead optional', indicator: 'Same patterns, can add weight' },
    notes: 'Caddis larva patterns are year-round producers. Chartreuse or "electric green" caddis very effective in spring.',
    hatchTimes: { label:'All day subsurface', start:0, end:23, peak:10, allDay:true, note:'Larvae available year-round. No specific hatch window — consistent all-day producer.' },
  },
  'Caddis Pupa': {
    insect: 'Caddisfly (Trichoptera) — Pupa', type: 'caddis',
    lifecycle: 'Caddis pupae swim actively to the surface to emerge, often creating visible wakes just under the film. Fish slash aggressively at rising pupae. The "rising pupa" trigger is one of the most explosive strikes you\'ll see.',
    stages: ['Pupa (ascending)','Pupa (film)'],
    sizes: { dry: null, euro: '#12–16', indicator: '#12–16', streamer: null },
    colors: { euro: 'Tan, olive, or orange body, brown wingcase, soft hackle collar', indicator: 'Soft hackle wet fly in matching color' },
    notes: 'Fish a wet fly swing or rising dead-drift to imitate ascending pupae. Evening caddis hatches can be spectacular.',
    hatchTimes: { label:'Afternoon through evening', start:15, end:21, peak:18, allDay:false, note:'Ascending pupa most active during late afternoon and evening emergences.' },
  },
  'Elk Hair Caddis': {
    insect: 'Caddisfly (Trichoptera) — Adult', type: 'caddis',
    lifecycle: 'Adult caddis skitter across the surface to lay eggs — an active, erratic presentation often outperforms a dead drift. Elk Hair Caddis is the most versatile dry fly in the Mountain West, working across nearly every Western river.',
    stages: ['Adult (egg-laying)'],
    sizes: { dry: '#12–18', euro: null, indicator: null, streamer: null },
    colors: { dry: 'Tan, olive, or black body, elk hair wing, palmered hackle' },
    notes: 'Fish with occasional twitches or skitters across the current to imitate egg-laying adults. Size #16 olive is the most universal match.',
    hatchTimes: { label:'Evening — egg-laying adults', start:17, end:22, peak:19, allDay:false, note:'Adults skitter and egg-lay in the evening. Best light: 1 hour before dark.' },
  },
  'Soft Hackle Caddis': {
    insect: 'Caddisfly (Trichoptera) — Pupa/Wet Fly', type: 'caddis',
    lifecycle: 'Soft hackle wet flies imitate caddis pupae ascending through the water column. The pulsing hackle fibers mimic legs and motion. Swung across current, they produce explosive strikes during caddis emergence.',
    stages: ['Pupa (ascending)'],
    sizes: { dry: null, euro: '#12–16', indicator: '#14–16', streamer: null },
    colors: { euro: 'Partridge and orange, partridge and green, or starling and hare\'s ear' },
    notes: 'Classic wet fly swing downstream and across. Let it rise to the surface at the end — strikes often happen on the hang-down.',
    hatchTimes: { label:'Afternoon through dusk', start:15, end:21, peak:18, allDay:false, note:'Swing the soft hackle as light fades during evening caddis emergences.' },
  },
  /* ── STONEFLIES ── */
  'Skwala Stone': { 
    insect: 'Skwala Stonefly (Skwala parallela)', type: 'stonefly',
    lifecycle: 'Skwalas are early-season stoneflies hatching March–April on larger Western freestone rivers. Nymphs migrate to shore and crawl out of the water to hatch — adults blow back onto the water\'s surface. Their emergence coincides with the first warm days of spring.',
    stages: ['Nymph','Adult (clumsy surface flier)'],
    sizes: { dry: '#8–12', euro: '#8–12', indicator: '#10–14', streamer: null },
    colors: { dry: 'Olive/brown body, elk or deer hair wing', euro: 'Dark olive/brown bead head, rubber legs' },
    notes: 'Fish nymphs February–March before adult emergence. Dry fly action starts with first warm days — look for clumsy adults on the banks.',
    hatchTimes: { label:'Warm afternoons only', start:12, end:17, peak:14, allDay:false, note:'Only active on days above 50°F. Best noon–4pm when air temp peaks.' },
  },
  'Skwala Nymph': {
    insect: 'Skwala Stonefly (Skwala parallela) — Nymph', type: 'stonefly',
    lifecycle: 'Skwala nymphs are among the first large food items available in spring. They migrate toward the banks as emergence approaches, creating a drift of large protein. A heavy, dark stonefly nymph fished in February–April along the banks is extremely productive.',
    stages: ['Nymph (pre-emergence drift)'],
    sizes: { dry: null, euro: '#8–12', indicator: '#8–12', streamer: null },
    colors: { euro: 'Dark brown/olive, rubber legs, large tungsten bead (3.5–4.6mm)', indicator: 'Same, fish on point with smaller midge dropper' },
    notes: 'Hug the bank. Fish that move 3 feet for a streamer will move 5 feet for a Skwala nymph in March.',
    hatchTimes: { label:'All day — best morning', start:7, end:17, peak:9, allDay:false, note:'Nymphs migrate bankward all day Feb–Mar. Morning most productive.' },
  },
  'Salmonfly Nymph': {
    insect: 'Salmonfly (Pteronarcys californica) — Nymph', type: 'stonefly',
    lifecycle: 'Salmonflies have a 3–4 year nymphal life, making them among the largest and most important insects in Western rivers. Pre-emergence, nymphs (2–3") drift in the current — creating the most exciting big fish dry fly opportunity of the year.',
    stages: ['Nymph (2–3" long, multi-year)'],
    sizes: { dry: null, euro: '#4–8', indicator: '#4–8', streamer: null },
    colors: { euro: 'Black/brown, large rubber legs, 4.6mm+ tungsten bead', indicator: 'Kaufmann\'s Stonefly, Pat\'s Rubber Legs in black/brown' },
    notes: 'Fish large, heavy nymphs along the banks in May–June as hatch approaches. Pre-hatch nymph fishing is often better than the dry fly event.',
    hatchTimes: { label:'All day pre-hatch', start:0, end:23, peak:9, allDay:true, note:'Nymphs available year-round. Pre-hatch migration peaks in morning.' },
  },
  "Pat's Rubber Legs": {
    insect: 'Stonefly / Attractor Nymph', type: 'stonefly',
    lifecycle: "Pat's Rubber Legs is an impressionistic attractor nymph that suggests stonefly nymphs, crane fly larvae, and large aquatic invertebrates. Its rubber legs create movement in the current that triggers strikes even when no specific hatch is occurring.",
    stages: ['Attractor — imitates various large nymphs'],
    sizes: { dry: null, euro: '#6–10', indicator: '#6–10', streamer: null },
    colors: { euro: 'Black/brown with rubber legs (most common), tan variant, olive variant', indicator: 'Same — dead-drift near the bottom in heavier current' },
    notes: 'One of the most versatile nymph patterns. Year-round producer — especially effective as a point fly in high, turbid water.',
  },
  'Yellow Sally': {
    insect: 'Yellow Sally Stonefly (Isoperla)', type: 'yellowsally',
    lifecycle: 'Yellow Sally stoneflies are small (size 12–16) summer stoneflies that emerge mid-day on most Mountain West rivers. Adults are bright yellow and highly visible — fish rise readily when they\'re on the water. Often overlooked in favor of larger hatches.',
    stages: ['Nymph','Adult'],
    sizes: { dry: '#12–16', euro: '#12–16', indicator: null, streamer: null },
    colors: { dry: 'Yellow body, deer hair or elk hair wing, yellow hackle', euro: 'Yellow/chartreuse body, small bead, rubber legs' },
    notes: 'Often hatching simultaneously with PMDs in July. When fish ignore your PMD — try a Yellow Sally. The yellow color is unmistakable.',
    hatchTimes: { label:'Mid-day', start:10, end:15, peak:12, allDay:false, note:'Hatches during the warmest part of the day in summer. Often overlaps with PMD.' },
  },
  'October Caddis': {
    insect: 'October Caddis (Dicosmoecus gilvipes)', type: 'caddis',
    lifecycle: 'The largest caddis in the West — adults are the size of a large moth. They hatch in September–October on larger freestone rivers. Both nymphs and adults are important. The large orange/rust adult creates exciting dry fly fishing through fall.',
    stages: ['Larva (large, case-builder)','Pupa','Adult (large orange/rust)'],
    sizes: { dry: '#6–10', euro: '#6–10', indicator: '#6–10', streamer: null },
    colors: { dry: 'Orange body, elk hair wing, prominent — use a stimulator', euro: 'Orange/rust body, brown bead, rubber legs' },
    notes: 'Fall caddis can bring big fish to the surface even when nothing else is hatching. Don\'t miss October on larger rivers.',
    hatchTimes: { label:'Afternoon through dusk', start:14, end:20, peak:17, allDay:false, note:'Large adults most active late afternoon into evening in Sept–Oct.' },
  },
  /* ── HOPPERS & TERRESTRIALS ── */
  'Hopper': {
    insect: 'Grasshopper (terrestrial)', type: 'terrestrial',
    lifecycle: 'Grasshoppers are not aquatic insects — they are blown or jump into the water from streamside vegetation. Peak season: mid-July through September in most Mountain West locations. Hoppers are large, high-protein meals that trigger aggressive surface strikes.',
    stages: ['Adult (terrestrial — blown onto water)'],
    sizes: { dry: '#6–12', euro: null, indicator: null, streamer: null },
    colors: { dry: 'Tan, yellow, or olive body, rubber legs, elk hair or foam wing — Schroeder\'s Hopper, Parachute Hopper, Chubby Chernobyl' },
    notes: 'Fish banks and undercut edges in late morning and afternoon. A subtle twitch can trigger strikes that a dead drift won\'t. Prime season: July–September.',
    hatchTimes: { label:'Late morning through afternoon', start:10, end:17, peak:13, allDay:false, note:'Hoppers most active when air temp peaks. Best 10am–4pm on hot August days.' },
  },
  'Chubby Chernobyl': {
    insect: 'Stonefly / Hopper / Attractor Dry', type: 'terrestrial',
    lifecycle: 'The Chubby Chernobyl is a large foam attractor that suggests multiple things simultaneously — hopper, stonefly, and caddis. Its foam body creates exceptional flotation for dry-dropper rigs. A go-to summer attractor on any Western river.',
    stages: ['Attractor — suggests hopper, stonefly, or large caddis'],
    sizes: { dry: '#8–14', euro: null, indicator: null, streamer: null },
    colors: { dry: 'Tan/brown, chartreuse, orange/rust — foam body with rubber legs, para post' },
    notes: 'Exceptional dry-dropper indicator. Floats a heavy nymph easily. Works anywhere from late spring through early fall.',
    hatchTimes: { label:'Late morning through afternoon', start:10, end:17, peak:13, allDay:false, note:'Fish as hopper attractor or stonefly imitation all afternoon in summer.' },
  },
  /* ── EURO NYMPHS ── */
  'Frenchie': {
    insect: 'Generalist Attractor Nymph (Euro)', type: 'euro_nymph',
    lifecycle: 'The Frenchie is not a specific insect imitation — it is an attractor euro nymph that suggests multiple invertebrates simultaneously. The hot spot (fluorescent bead or dubbing collar) acts as a trigger. Highly effective year-round and across all water types.',
    stages: ['Attractor — general invertebrate'],
    sizes: { dry: null, euro: '#14–18', indicator: '#14–18', streamer: null },
    colors: { euro: 'Pheasant tail body, copper or gold bead, hot orange or pink collar (hot spot)', indicator: 'Same with split shot above' },
    notes: 'Universal euro nymph — fish it when you\'re not sure what the fish are eating. Orange hot spot in colored water; pink in clear. Keep it moving downstream at current speed.',
    hatchTimes: { label:'All day subsurface', start:0, end:23, peak:10, allDay:true, note:'Attractor nymph — effective all day. Slightly more active during hatch periods.' },
  },
  'Perdigon': {
    insect: 'Generalist Competition Euro Nymph', type: 'euro_nymph',
    lifecycle: 'A Spanish competition fly — "Perdigon" means "pellet" (describing its smooth, fast-sinking body). Coated in UV resin, it cuts through fast current to reach depth quickly. Not a specific insect imitation, but extremely effective in all conditions.',
    stages: ['Attractor nymph — fast-sinking'],
    sizes: { dry: null, euro: '#12–18', indicator: '#14–18', streamer: null },
    colors: { euro: 'Red, black, or olive thread body, gold bead, UV resin coat — various with hot collars', indicator: 'Same — works under indicator in heavy current' },
    notes: 'The fastest-sinking nymph available. Use when fish are holding deep in fast current. Point fly in a two-fly euro rig. Red perdigon is an all-time Rocky Mountain producer.',
    hatchTimes: { label:'All day subsurface', start:0, end:23, peak:10, allDay:true, note:'Fast-sinking attractor — fish whenever you need to reach depth quickly.' },
  },
  'Rainbow Warrior': {
    insect: 'Midge Pupa (Chironomidae)', type: 'midge',
    lifecycle: 'The Rainbow Warrior imitates a midge pupa rising toward the surface. Midge pupae are nearly impossible to photograph in the wild — the stage is brief and the insects are tiny and semi-transparent. The larva (bloodworm) shown here is what lives in the substrate and what the pupa transforms from. Its pearlescent body and red collar trigger strikes in cold, clear tailwater conditions year-round.',
    stages: ['Larva (bloodworm)', 'Pupa (rising)'],
    sizes: { dry: null, euro: '#16–22', indicator: '#16–22', streamer: null },
    colors: { euro: 'Pearl/mylar body, red hot spot, red wire rib, silver bead', indicator: 'Same' },
    notes: 'Outstanding winter and early spring nymph. Highly visible in off-color water. Fish it as a trailer behind a heavier anchor pattern.',
    hatchTimes: { label:'Morning — best in winter', start:8, end:14, peak:10, allDay:false, note:'Midge/Baetis attractor. Outstanding in cold, clear water on winter tailwaters.' },
  },
  'Pheasant Tail': {
    insect: 'Mayfly Nymph (general — Baetis, PMD, Callibaetis)', type: 'mayfly',
    lifecycle: 'Frank Sawyer\'s Pheasant Tail is one of the all-time classic nymphs. Its natural pheasant tail fibers suggest nearly any small mayfly nymph body. Works year-round and on virtually every trout stream in the world.',
    stages: ['Nymph (general mayfly)'],
    sizes: { dry: null, euro: '#14–20', indicator: '#14–20', streamer: null },
    colors: { euro: 'Natural pheasant tail, copper wire rib, copper bead (optional)', indicator: 'Same with or without bead' },
    notes: 'When in doubt, fish a Pheasant Tail. Copper bead version for euro nymphing; unweighted for soft-hackle wet fly swings.',
    hatchTimes: { label:'All day subsurface', start:0, end:23, peak:9, allDay:true, note:'Universal nymph — fish all day. Most productive before and during mayfly hatches.' },
  },
  "Jig Hare's Ear": {
    insect: 'Caddis Larva / Mayfly Nymph (general attractor)', type: 'caddis',
    lifecycle: "The Hare's Ear is the oldest attractor nymph in fly fishing. The buggy dubbing suggests legs, gills, and an unkempt living creature — it imitates caddis larvae, mayfly nymphs, and scuds. The jig hook version hangs hook-up in the current, reducing snags in euro nymphing.",
    stages: ['Generalist — mayfly, caddis, stonefly suggestion'],
    sizes: { dry: null, euro: '#12–16', indicator: '#12–16', streamer: null },
    colors: { euro: 'Hare\'s ear dubbing (natural), gold bead, gold rib', indicator: 'Same — one of the most reliable nymphs in any box' },
    notes: 'If you could only fish one nymph, this would be a strong candidate. Works in every season and water type.',
  },
  /* ── STREAMERS ── */
  'Woolly Bugger': {
    insect: 'Streamer — Leech/Baitfish', type: 'streamer',
    lifecycle: 'The Woolly Bugger is an all-purpose streamer suggesting leeches, crayfish, sculpin, and small baitfish. It is perhaps the most versatile fly in the Mountain West. Fish of every species and size eat Woolly Buggers at some point.',
    stages: ['N/A — attractor streamer'],
    sizes: { dry: null, euro: null, indicator: null, streamer: '#2–10' },
    colors: { streamer: 'Olive (most universal), black, brown, tan — marabou tail, palmered hackle body, cone or bead head' },
    notes: 'Start with olive size #6. Strip aggressively for browns; swing and strip for rainbows; dead-drift in high water. Never leave home without one.',
    hatchTimes: { label:'Early morning & evening', start:5, end:10, peak:7, allDay:false, note:'Low-light periods are prime for streamers. Also effective in off-color or high water.' },
  },
  'Articulated Leech': {
    insect: 'Streamer — Leech Imitation', type: 'streamer',
    lifecycle: 'Leeches are permanent residents of most trout streams and lakes. They swim with an undulating motion and are active in low-light conditions. Trout feed on leeches opportunistically. Articulated patterns have two hooks for better hook-up ratios on short-strikes.',
    stages: ['N/A — leech imitation'],
    sizes: { dry: null, euro: null, indicator: null, streamer: '#2–6' },
    colors: { streamer: 'Black, brown/olive, purple/black — long marabou with articulated body' },
    notes: 'Strip slowly with long pauses. Effective year-round but especially good in spring and fall on larger rivers.',
    hatchTimes: { label:'Low light — dawn & dusk', start:5, end:10, peak:7, allDay:false, note:'Leeches most active at low light. Fish dawn and dusk in rivers; any time in lakes.' },
  },
  'Slumpbuster': {
    insect: 'Streamer — Sculpin/Baitfish Imitation', type: 'streamer',
    lifecycle: 'The Slumpbuster imitates a sculpin — a bottom-hugging baitfish found in virtually all Mountain West trout streams. Sculpins are critical forage for large trout. They swim with quick darting movements and hold near the bottom.',
    stages: ['N/A — sculpin imitation'],
    sizes: { dry: null, euro: null, indicator: null, streamer: '#2–8' },
    colors: { streamer: 'Olive/brown pine squirrel zonker strip, cone head, gold flash — olive most common' },
    notes: 'Dead-drift first, then add aggressive strips. Bounce along the bottom in faster water. Excellent for big browns in autumn.',
    hatchTimes: { label:'Early morning & overcast days', start:5, end:11, peak:7, allDay:false, note:'Sculpin imitation. Dawn and overcast days when big browns are most aggressive.' },
  },
  'Circus Peanut': {
    insect: 'Streamer — Large Articulated Attractor', type: 'streamer',
    lifecycle: 'An articulated streamer designed for big trout. Not a specific imitation — it suggests a wounded baitfish or large meal. Large profile, multi-material construction, and articulated movement trigger reaction strikes from territorial or predatory fish.',
    stages: ['N/A — predator attractor'],
    sizes: { dry: null, euro: null, indicator: null, streamer: '#1–4' },
    colors: { streamer: 'Olive/white, black/purple, or tan/orange — two-hook articulated with rubber legs' },
    notes: 'For aggressive stripping in fast current. Excels for big brown trout in October–November. Use a stout 7–8wt rod.',
    hatchTimes: { label:'Dawn & dusk — fall best', start:5, end:10, peak:7, allDay:false, note:'Trophy streamer. Fall dawn fishing for large brown trout is prime.' },
  },
  'Drunk & Disorderly': {
    insect: 'Streamer — Large Articulated', type: 'streamer',
    lifecycle: 'Another large articulated streamer in the "meat rig" tradition. Designed to move a lot of water and trigger aggressive strikes. The head creates side-to-side movement that differs from traditional strip-retrieve patterns.',
    stages: ['N/A — attractor streamer'],
    sizes: { dry: null, euro: null, indicator: null, streamer: '#1–4' },
    colors: { streamer: 'Olive/white or black — large muddler head, rabbit strip body' },
    notes: 'Best in off-color or high water when fish rely on lateral line detection. Swing in big eddies and along undercut banks.',
    hatchTimes: { label:'Low light & off-color water', start:5, end:10, peak:7, allDay:false, note:'Best in off-color or high water. Dawn and dusk when big fish move shallow.' },
  },
  'Blowtorch': {
    insect: 'Attractor Euro Nymph — Hot Spot', type: 'euro_nymph',
    lifecycle: 'A highly visible competition-style nymph with fluorescent dubbing. Not a specific insect imitation. The bright colors (pink, orange, chartreuse) act as triggers. Particularly effective in cold, clear water where natural patterns may not be seen easily.',
    stages: ['Attractor nymph — general'],
    sizes: { dry: null, euro: '#14–18', indicator: '#14–18', streamer: null },
    colors: { euro: 'Hot pink or orange dubbing, tungsten bead, thin wire-wrapped body', indicator: 'Same — trailer behind heavier anchor' },
    notes: 'Excellent winter nymph. The hot pink version is a go-to on tailwaters when fish are finicky. Fish slowly near the bottom.',
    hatchTimes: { label:'All day — best cold mornings', start:7, end:14, peak:10, allDay:false, note:'Hot-spot attractor nymph. Excels in cold winter water on tailwaters.' },
  },
  /* ── STILLWATER ── */
  'Callibaetis': {
    insect: 'Callibaetis Mayfly (speckled-wing dun)', type: 'stillwater',
    lifecycle: 'Callibaetis are the primary stillwater mayfly across Mountain West lakes and ponds. They hatch from mid-morning to early afternoon on calm days, June–September. Unlike river mayflies, they hatch from open water — fish cruise and sip adults. Multiple broods per season.',
    stages: ['Nymph (substrate)','Emerger','Adult Dun','Spinner'],
    sizes: { dry: '#12–16', euro: null, indicator: '#12–16', streamer: null },
    colors: { dry: 'Speckled gray/olive body, gray hackle — Comparadun or parachute', indicator: 'Soft hackle or Callibaetis nymph in olive/gray' },
    notes: 'Watch for rising fish near weed edges in the morning. A Comparadun or parachute pattern works well. The spinner fall is equally important — gray/olive spent pattern.',
    hatchTimes: { label:'Mid-morning on calm days', start:9, end:14, peak:11, allDay:false, note:'Stillwater mayfly. Look for rising fish near weed edges on calm mornings.' },
  },
  'Damsel Nymph': {
    insect: 'Damselfly (Zygoptera) — Nymph', type: 'stillwater',
    lifecycle: 'Damselfly nymphs are among the most important stillwater food sources. They migrate toward shore through open water to emerge — creating a horizontal swimming motion that fish follow and ambush. Peak migration: June–July. Can trigger explosive dry fly action at emergence.',
    stages: ['Nymph (mid-water swimmer)','Adult (shoreline)'],
    sizes: { dry: null, euro: null, indicator: '#10–14', streamer: '#10–14' },
    colors: { indicator: 'Olive, tan, or gray — slim body, rubber or marabou tail; slow retrieve', streamer: 'Olive or tan, strip slowly through open water toward shore' },
    notes: 'Retrieve toward shore slowly to mimic migration. Early morning is best. Fish hold outside weed beds and ambush migrating nymphs.',
    hatchTimes: { label:'Early morning migration', start:6, end:11, peak:8, allDay:false, note:'Nymphs migrate toward shore at dawn in June–July. Be on the water early.' },
  },
  'Scud': {
    insect: 'Scud (freshwater shrimp — Amphipoda)', type: 'stillwater',
    lifecycle: 'Scuds are small freshwater crustaceans found in spring creeks, tailwaters, and mountain lakes. They are year-round food sources — fish eat them constantly. They swim in a curved C-shape through aquatic vegetation and along the bottom.',
    stages: ['Year-round — permanent residents'],
    sizes: { dry: null, euro: '#12–18', indicator: '#12–18', streamer: null },
    colors: { euro: 'Olive, gray, pink, or orange — curved body, scud back, small bead', indicator: 'Same — fish slowly along the bottom or weed edges' },
    notes: 'Pink and orange scuds become available when trout feed in scud-rich areas — observe fish color for clues on what they\'re eating.',
    hatchTimes: { label:'All day', start:0, end:23, peak:10, allDay:true, note:'Scuds are active 24/7 in still water and spring creeks.' },
  },
  'Stimulator':      { insect: 'Stonefly / Caddis Attractor Dry', type: 'stonefly',
    lifecycle: 'Broad-spectrum attractor imitating large stoneflies and caddis adults on the surface.',
    stage: 'Adult', sizes: { dry:'#6–10', euro:null, indicator:null, streamer:null },
    colors: { dry:'Orange/yellow body, elk hair wing, rubber legs', indicator:null },
    stages: ['Adult (surface attractor)'],
    season: 'Jun–Sep', technique: 'Dead drift or skated across riffles and pocket water.',
    hook: 'Dry fly — 2XL curved shank',
    hatchTimes: { label:'Afternoon–Evening', start:12, end:20, peak:15, allDay:false, note:'Fish all afternoon during summer stonefly and caddis activity.' },
    notes: 'Classic Western attractor. Works as a hopper, caddis, and stonefly imitation. Also a great dry-dropper anchor fly.' },
  'Salmonfly':       { insect: 'Pteronarcys californica (Adult)', type: 'stonefly',
    lifecycle: 'Adults crawl out onto bankside rocks and vegetation; blown onto water by wind.',
    stage: 'Adult', sizes: { dry:'#4–8', euro:null, indicator:null, streamer:null },
    colors: { dry:'Orange/black body, elk or deer hair wing, rubber legs', indicator:null },
    stages: ['Adult (bankside, blown onto water)'],
    season: 'May–Jun', technique: 'Fish the banks with a large bushy dry. Splat the fly on entry.',
    hook: 'Dry fly — 2XL or 3XL',
    hatchTimes: { label:'All Day (wind-driven)', start:9, end:20, peak:14, allDay:false, note:'Adults blow onto water throughout the day. Best on breezy afternoons.' },
    notes: 'The most famous hatch in the Mountain West. Fish the banks tight to overhanging vegetation. Bigger is better.' },
  'BWO (Dry)':       { insect: 'Baetis spp. (Adult Dun)', type: 'mayfly',
    lifecycle: 'Adult duns emerge at the surface, sit briefly while wings dry, then fly to streamside vegetation.',
    stage: 'Adult Dun', sizes: { dry:'#18–22', euro:null, indicator:null, streamer:null },
    colors: { dry:'Olive/gray body, gray wings, yellow/olive thorax', indicator:null },
    stages: ['Adult Dun (on surface)', 'Spinner (spent, flat in film)'],
    season: 'Mar–May, Sep–Nov', technique: 'Perfect drag-free drift in feeding lane. Long leader, 6X tippet.',
    hook: 'Dry fly — standard or curved',
    hatchTimes: { label:'10am–2pm', start:10, end:14, peak:11, allDay:false, note:'Best on cold, overcast, drizzly days. Bright sun shortens time on water.' },
    notes: 'Classic BWO dry fly fishing. When fish are rising, check for cripples/emergers first — often more effective than a dun.' },
  'PMD':             { insect: 'Ephemerella dorothea (Pale Morning Dun)', type: 'mayfly',
    lifecycle: 'PMD nymphs hatch mid-morning through noon in summer, emerging as pale yellow duns.',
    stage: 'Nymph', sizes: { dry:null, euro:'#14–18', indicator:'#14–18', streamer:null },
    colors: { euro:'Pale olive/tan body, pheasant tail or split-case', indicator:'Pale olive, yellow or tan' },
    stages: ['Nymph (pre-hatch)'],
    season: 'Jun–Aug', technique: 'Dead-drift near the bottom in riffles before the mid-morning hatch.',
    hook: 'Nymph — curved scud or standard',
    hatchTimes: { label:'7am–11am', start:7, end:11, peak:9, allDay:false, note:'Fish nymphs before the mid-morning hatch kicks off on summer days.' },
    notes: 'The PMD nymph fished before the hatch often outfishes the dry fly window.' },
  'PMD (Dry)':       { insect: 'Ephemerella dorothea (Adult Dun)', type: 'mayfly',
    lifecycle: 'Adults emerge mid-morning through noon, sitting on the surface while wings dry.',
    stage: 'Adult Dun', sizes: { dry:'#14–18', euro:null, indicator:null, streamer:null },
    colors: { dry:'Pale yellow body, gray or cream wings, yellow thorax', indicator:null },
    stages: ['Adult Dun (surface)', 'Spinner (rusty, evening)'],
    season: 'Jun–Aug', technique: 'Drag-free drift in feeding lanes. Long leader, 5X tippet minimum.',
    hook: 'Dry fly — standard',
    hatchTimes: { label:'9am–1pm', start:9, end:13, peak:11, allDay:false, note:'Mid-morning hatch window. Warm days shorten the dun time on the water.' },
    notes: 'The premiere summer dry fly hatch in the Mountain West. Evening spinner falls can be even more productive.' },
  'Brown Drake':     { insect: 'Brown Drake Mayfly (Ephemera simulans)', type: 'mayfly',
    lifecycle: 'Large burrowing mayfly — massive evening spinner falls on freestone rivers.',
    stage: 'Adult Dun', sizes: { dry:'#10–12', euro:null, indicator:null, streamer:null },
    colors: { dry:'Brown/yellow body, mottled brown wings', indicator:null },
    stages: ['Adult Dun (evening)', 'Spinner (dusk–dark)'],
    season: 'Jun–Jul', technique: 'Evening dry fly — fish rising fish during spinner falls at dusk.',
    hook: 'Dry fly — 2XL',
    hatchTimes: { label:'Dusk–Dark', start:19, end:23, peak:21, allDay:false, note:'Spinner falls happen right at last light and after dark.' },
    notes: 'Brown drake spinner falls can be epic on freestone rivers. Bring a headlamp.' },
  'Trico':           { insect: 'Tricorythodes spp. (Trico — tiny midge-like mayfly)', type: 'midge',
    lifecycle: 'Tiny mayfly with massive morning spinner falls — thousands of spent adults in the film.',
    stage: 'Spinner', sizes: { dry:'#20–24', euro:null, indicator:null, streamer:null },
    colors: { dry:'Black/white body, clear spent wings, white poly post', indicator:null },
    stages: ['Spinner (spent, morning)'],
    season: 'Jul–Sep', technique: 'Dead-drift spent spinner in calm flats. 6X–7X tippet.',
    hook: 'Dry fly — standard or Klinkhamer',
    hatchTimes: { label:'Early Morning 6–10am', start:6, end:10, peak:8, allDay:false, note:'Spinner falls happen in the morning calm. Wind disperses them quickly.' },
    notes: 'Trico spinner falls produce the most selective dry fly fishing of the year. Tiny fly, fine tippet, perfect drift required.' },
  'Stonefly Nymph':  { insect: 'Stonefly Nymph (Plecoptera)', type: 'stonefly',
    lifecycle: '1–3 year subsurface nymph stage. Migrates toward shore before hatching.',
    stage: 'Nymph', sizes: { dry:null, euro:'#8–14', indicator:'#8–14', streamer:null },
    colors: { euro:'Dark brown/black, rubber legs, tungsten bead', indicator:'Brown/olive with legs' },
    stages: ['Nymph (year-round subsurface)'],
    season: 'Year-round', technique: 'Dead-drift tight to the bottom with weight. Euro or heavy indicator rig.',
    hook: 'Nymph — 2XL curved',
    hatchTimes: { label:'All day subsurface', start:0, end:23, peak:9, allDay:true, note:'Nymphs available year-round. Most productive morning before adult flights.' },
    notes: 'A general stonefly nymph pattern works year-round. Before major stonefly hatches, fish tight to the banks.' },
  'Ant':             { insect: 'Ant (Formicidae)', type: 'terrestrial',
    lifecycle: 'Terrestrial — falls or blows into the water. High-protein meal for trout.',
    stage: 'Terrestrial', sizes: { dry:null, euro:'#14–18', indicator:'#14–18', streamer:null },
    colors: { euro:'Black or cinnamon, tungsten bead, segmented body', indicator:'Black/brown, segmented' },
    stages: ['Terrestrial (subsurface, wet)'],
    season: 'Jun–Sep', technique: 'Dead-drift near the bottom. Ant nymphs fish well all day in summer.',
    hook: 'Nymph — standard or scud',
    hatchTimes: { label:'All day summer', start:9, end:18, peak:13, allDay:false, note:'Terrestrials fall into the water throughout the day on summer streams.' },
    notes: 'Sunken ant patterns are often overlooked. A foam ant below a hopper indicator combo is deadly in summer.' },
  'Ant (Dry)':       { insect: 'Flying Ant (Formicidae)', type: 'terrestrial',
    lifecycle: 'Flying ants land on the water during mating flights — can trigger explosive surface feeding.',
    stage: 'Terrestrial', sizes: { dry:'#14–20', euro:null, indicator:null, streamer:null },
    colors: { dry:'Black or cinnamon body, clear or white wings', indicator:null },
    stages: ['Terrestrial (on surface)'],
    season: 'Jul–Sep', technique: 'Dead-drift on flat water. Flying ant falls can create intense selective rises.',
    hook: 'Dry fly — standard',
    hatchTimes: { label:'Midday–Afternoon', start:10, end:17, peak:13, allDay:false, note:'Flying ant falls happen unpredictably on warm summer afternoons.' },
    notes: 'Flying ant falls are sporadic but can create the most selective dry fly fishing of the year. Always carry a few.' },
  'Hopper (Dry)':    { insect: 'Grasshopper (Acrididae)', type: 'terrestrial',
    lifecycle: 'Falls or jumps from streamside grass. High-protein surface meal that draws large fish.',
    stage: 'Terrestrial', sizes: { dry:'#6–12', euro:null, indicator:null, streamer:null },
    colors: { dry:'Yellow/tan/olive foam body, tan or yellow legs', indicator:null },
    stages: ['Terrestrial (on surface)'],
    season: 'Jul–Sep', technique: 'Cast to the bank with a splat. Add occasional twitches to suggest struggle.',
    hook: 'Dry fly — 2XL or long shank',
    hatchTimes: { label:'10am–5pm', start:10, end:17, peak:13, allDay:false, note:'Hoppers are most active when air temperature peaks on hot dry days.' },
    notes: 'Fish tight to grassy banks. Windy days blow more hoppers onto the water. The splat entry is intentional.' },
  'Caddis Dry':      { insect: 'Caddisfly Adult (Trichoptera)', type: 'caddis',
    lifecycle: 'Adults return to water to lay eggs — skittering and diving on the surface at dusk.',
    stage: 'Adult (Egg-Laying)', sizes: { dry:'#14–18', euro:null, indicator:null, streamer:null },
    colors: { dry:'Tan/olive body, elk hair wing, brown hackle', indicator:null },
    stages: ['Adult (skittering, egg-laying)'],
    season: 'Apr–Oct', technique: 'Dead drift or add subtle twitches to imitate skittering egg-laying adults.',
    hook: 'Dry fly — standard or 1XL',
    hatchTimes: { label:'Evening 5pm–Dark', start:17, end:22, peak:19, allDay:false, note:'Caddis adults are most active at dusk during egg-laying activity.' },
    notes: 'Classic Western evening dry fly. Elk Hair Caddis works in sizes 14–18 for most species.' },
  'October Caddis (Dry)': { insect: 'Dicosmoecus spp. (October Caddis Adult)', type: 'caddis',
    lifecycle: 'Large fall caddis adults are important September–November on Mountain West rivers.',
    stage: 'Adult (Egg-Laying)', sizes: { dry:'#8–12', euro:null, indicator:null, streamer:null },
    colors: { dry:'Orange/rust body, mottled brown wing', indicator:null },
    stages: ['Adult (skittering, egg-laying)'],
    season: 'Sep–Nov', technique: 'Fish the banks and slow water. Occasional skitter triggers strikes.',
    hook: 'Dry fly — 2XL',
    hatchTimes: { label:'Afternoon–Evening', start:14, end:21, peak:17, allDay:false, note:'October caddis are most active on warm fall afternoons.' },
    notes: 'The October Caddis is the largest caddis in Western rivers. Big, orange, and impossible to miss on the water.' },
  'RS2':             { insect: 'Midge / BWO Emerger', type: 'mayfly',
    lifecycle: 'Imitates a variety of small emerging mayflies and midges in the surface film.',
    stage: 'Emerger / Cripple', sizes: { dry:null, euro:'#18–24', indicator:'#18–24', streamer:null },
    colors: { euro:'Gray or olive body, fine dubbing, split thread post', indicator:'Gray/olive with white post' },
    stages: ['Emerger (in film)'],
    season: 'Year-round', technique: 'Dead-drift in or just under the surface film. Use during BWO and midge hatches.',
    hook: 'Dry fly — curved or Klinkhamer #18–24',
    hatchTimes: { label:'9am–2pm', start:9, end:14, peak:11, allDay:false, note:'Most effective during BWO and midge emergence windows.' },
    notes: 'One of the most consistently productive tailwater flies. The RS2 imitates cripples and emergers — the stage fish eat most.' },
  'Pink Egg':        { insect: 'Trout / Salmon Egg (attractor)', type: 'attractor',
    lifecycle: 'Imitates drifting eggs during spawning season — a high-calorie opportunistic meal.',
    stage: 'Attractor', sizes: { dry:null, euro:'#10–14', indicator:'#10–14', streamer:null },
    colors: { euro:'Pink, orange, or chartreuse yarn ball', indicator:'Same' },
    stages: ['Attractor (egg imitation)'],
    season: 'Oct–Dec (spawning season)', technique: 'Dead-drift near the bottom in runs below spawning beds.',
    hook: 'Scud / egg hook #10–14',
    hatchTimes: { label:'All day subsurface', start:0, end:23, peak:10, allDay:true, note:'Egg patterns work any time during and after the spawn.' },
    notes: 'Highly effective during fall trout and spring spawning runs. Use below redds where eggs naturally drift downstream.' },
  'Sow Bug':         { insect: 'Aquatic Sow Bug (Isopoda / Asellidae)', type: 'stillwater',
    lifecycle: 'Permanent crustacean resident of spring creeks and tailwaters — always available.',
    stage: 'Nymph', sizes: { dry:null, euro:'#14–18', indicator:'#14–18', streamer:null },
    colors: { euro:'Gray, tan, or olive — flat, segmented body', indicator:'Same' },
    stages: ['Nymph (year-round)'],
    season: 'Year-round', technique: 'Dead-drift very slowly near the bottom. Sow bugs are sluggish — slow presentation matters.',
    hook: 'Scud hook #14–18',
    hatchTimes: { label:'All day subsurface', start:0, end:23, peak:10, allDay:true, note:'Available year-round with no hatch window — fish subsurface any time.' },
    notes: 'Critical food source on limestone spring creeks (Green River UT, Silver Creek). Small, gray, and realistic is the key.' },
  'Olive Sculpin':   { insect: 'Sculpin / Bottom Baitfish (Cottidae)', type: 'streamer',
    lifecycle: 'Bottom-dwelling baitfish imitation — targeted by large aggressive trout year-round.',
    stage: 'Sculpin / Bottom Baitfish', sizes: { dry:null, euro:null, indicator:null, streamer:'#4–8' },
    colors: { streamer:'Olive/brown with rubber legs, marabou tail, sculpin helmet or conehead' },
    stages: ['Sculpin / Bottom Baitfish'],
    season: 'Year-round', technique: 'Dead-drift along the bottom, then strip aggressively. Vary retrieve until strikes occur.',
    hook: 'Streamer — 3XL or articulated #4–8',
    hatchTimes: { label:'Dawn & Dusk', start:5, end:9, peak:7, allDay:false, note:'Sculpins are most vulnerable to predation at low light.' },
    notes: 'Bottom-hugging retrieve is key. Bounce the fly along the riverbed with short strips and frequent pauses.' },
  'San Juan Worm': {
    insect: 'Aquatic Worm (Annelida)', type: 'attractor',
    lifecycle: 'Aquatic worms (Annelida) are found in stream substrate across the Mountain West. After rainfall and runoff they get dislodged and drift freely — creating excellent San Juan Worm fishing. Worms are also present year-round in tailwaters below dams.',
    stages: ['Year-round drifter'],
    sizes: { dry: null, euro: '#10–14', indicator: '#10–14', streamer: null },
    colors: { euro: 'Red, pink, or tan chenille — simple loop body', indicator: 'Same — especially effective after rain or high water' },
    notes: 'Don\'t overlook this pattern. After any rain event it can be the most effective thing in the box. Use #12 red in tailwaters year-round.',
    hatchTimes: { label:'All day — best after rain', start:0, end:23, peak:10, allDay:true, note:'Most effective after rain or runoff when worms are flushed into the current.' },
  },
  "Walt's Worm": {
    insect: 'Caddis Larva / Scud / Sow Bug (multi-imitator)', type: 'caddis',
    lifecycle: "Walt's Worm is a sparse, buggy euro nymph that imitates caddis larvae, scuds, sow bugs, and small stonefly nymphs depending on color and size. The simple hare's ear body with a slender profile suggests countless aquatic invertebrates — a true generalist searching pattern.",
    stages: ['Larva / Nymph (subsurface)'],
    sizes: { dry: null, euro: '#12–16', indicator: '#12–16', streamer: null },
    colors: { euro: 'Natural hare\'s ear, olive, or tan — sparse body, copper or gold rib', indicator: 'Same — natural or olive most versatile' },
    notes: 'One of the most productive euro nymphs on Western rivers. The sparse profile and natural dubbing trigger strikes when more heavily dressed flies are refused.',
    hatchTimes: { label:'All day subsurface', start:0, end:23, peak:9, allDay:true, note:'Dead-drift near the bottom year-round. No specific emergence window.' },
  },
};

/* ═══════════════════════════════════════════════════════════
   HATCH FAMILIES
   Full progression for each insect family — stages in order,
   with timing tips and which patterns to fish at each stage.
   familyKey on FLY_INFO entries links a pattern to its family.
═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   FLY IMAGES  — insect stage search terms + FlyImage component
   Uses Wikimedia Commons API — free, no key, public domain
═══════════════════════════════════════════════════════════ */

// iNaturalist taxon names for insect stage photos
// keyed by "type|stage" or "type" — uses iNaturalist Taxa API (real photos, CC-licensed)
// iNat Life Stage term_value_ids: 2=Adult, 4=Pupa, 5=Nymph, 6=Larva, 16=Subimago(dun/emerger)
// Note: family-level taxa (Trichoptera, Chironomidae, Baetidae) return 0 annotated results —
// genus-level entries (Brachycentrus, Ephemerella, Chironomus) are used instead.
const INSECT_TAXON = {
  // ── MIDGE ──────────────────────────────────────────────────────────────────
  'midge':                          'Chironomus|6',
  'midge|Larva':                    'Chironomus|6',
  'midge|Larva (bloodworm)':        'Chironomus|6',
  'midge|Larva (bottom)':           'Chironomus|6',
  'midge|Larva (substrate/drift)':  'Chironomus|6',
  'midge|Pupa':                     'Chironomus|6',    // true pupa photos absent on iNat — larva is best proxy
  'midge|Pupa (rising)':            'Chironomus|6',
  'midge|Pupa (ascending)':         'Chironomus|6',
  'midge|Pupa (film)':              'Chironomus|6',
  'midge|Adult / Emerger':          'Chironomus plumosus|2',
  'midge|Adult (surface)':          'Chironomus plumosus|2',
  'midge|Adult cluster (surface)':  'Chironomus plumosus|2',
  'midge|Spinner':                  'Heptagenia|2',         // Trico fished as midge — show spent-wing posture
  'midge|Spinner (spent, morning)': 'Tricorythodes|2',      // Trico species specifically

  // ── MAYFLY ─────────────────────────────────────────────────────────────────
  'mayfly':                         'Ephemerella|5',
  'mayfly|Nymph':                   'Ephemerella|5',
  'mayfly|Nymph (riffle)':          'Ephemerella|5',
  'mayfly|Nymph (general mayfly)':  'Ephemerella|5',
  'mayfly|Nymph (pre-hatch)':       'Ephemerella|5',
  'mayfly|Emerger':                 'Baetis|16',
  'mayfly|Emerger / Cripple':       'Baetis|16',
  'mayfly|Emerger (film)':          'Baetis|16',
  'mayfly|Emerger (in film)':       'Baetis|16',
  'mayfly|Cripple':                 'Baetis|16',
  'mayfly|Stillborn':               'Baetis|16',
  'mayfly|Dun':                     'Baetis rhodani|16',
  'mayfly|Adult Dun':               'Baetis rhodani|16',
  'mayfly|Adult Dun (on surface)':  'Baetis rhodani|16',
  'mayfly|Adult Dun (surface)':     'Baetis rhodani|16',
  'mayfly|Adult Dun (evening)':     'Baetis rhodani|16',
  'mayfly|Spinner':                        'Heptagenia|2',  // spent-wing lateral posture — wings flat to sides
  'mayfly|Spinner (spent, flat in film)':  'Heptagenia|2',
  'mayfly|Spinner (rusty, evening)':       'Heptagenia|2',
  'mayfly|Spinner (dusk–dark)':            'Heptagenia|2',
  'mayfly|Spinner (spent, morning)':       'Heptagenia|2',

  // ── CADDIS ─────────────────────────────────────────────────────────────────
  'caddis':                                  'Brachycentrus|6',
  'caddis|Larva':                            'Brachycentrus|6', // peeking caddis — dark head, segmented body
  'caddis|Larva (case)':                     'Brachycentrus|6',
  'caddis|Larva (large, case-builder)':      'Brachycentrus|6',
  'caddis|Larva (free-living)':              'Rhyacophila|6',   // green rockworm — no case
  'caddis|Larva / Nymph (subsurface)':       'Brachycentrus|6',
  'caddis|Generalist — mayfly, caddis, stonefly suggestion': 'Brachycentrus|6',
  'caddis|Pupa':                             'Trichoptera|4',
  'caddis|Pupa (ascending)':                 'Trichoptera|4',
  'caddis|Pupa (film)':                      'Trichoptera|4',
  'caddis|Adult':                            'Trichoptera|2',
  'caddis|Adult (Egg-Laying)':               'Trichoptera|2',
  'caddis|Adult (egg-laying)':               'Trichoptera|2',
  'caddis|Adult (large orange/rust)':        'Dicosmoecus gilvipes|2',  // October Caddis
  'caddis|Adult (skittering, egg-laying)':   'Dicosmoecus gilvipes|2',  // October Caddis Dry

  // ── STONEFLY ───────────────────────────────────────────────────────────────
  'stonefly':                                   'Plecoptera|5',
  'stonefly|Nymph':                             'Plecoptera|5',
  'stonefly|Nymph (2–3 Year)':                  'Pteronarcys californica|5',
  'stonefly|Nymph (2–3" long, multi-year)':     'Pteronarcys californica|5',
  'stonefly|Nymph (Pre-Emergence)':             'Pteronarcys californica|5',
  'stonefly|Nymph (pre-emergence drift)':       'Pteronarcys californica|5',
  'stonefly|Nymph (year-round subsurface)':     'Plecoptera|5',
  'stonefly|Attractor — imitates various large nymphs': 'Plecoptera|5',
  'stonefly|Adult':                             'Pteronarcys californica|2',
  'stonefly|Adult (Egg-Laying)':                'Pteronarcys californica|2',
  'stonefly|Adult (bankside, blown onto water)':'Pteronarcys californica|2',
  'stonefly|Adult (clumsy surface flier)':      'Pteronarcys californica|2',
  'stonefly|Adult (surface attractor)':         'Pteronarcys californica|2',

  // ── YELLOW SALLY ───────────────────────────────────────────────────────────
  'yellowsally':        'Isoperla|5',
  'yellowsally|Nymph':  'Isoperla|5',
  'yellowsally|Adult':  'Isoperla|2',

  // ── TERRESTRIAL ────────────────────────────────────────────────────────────
  'terrestrial':                                          'Melanoplus|2',
  'terrestrial|Terrestrial (on water)':                  'Melanoplus|2',
  'terrestrial|Terrestrial (on surface)':                'Melanoplus|2',
  'terrestrial|Adult (terrestrial — blown onto water)':  'Melanoplus|2',
  'terrestrial|Terrestrial (subsurface, wet)':           'Melanoplus|2',
  'terrestrial|Attractor — suggests hopper, stonefly, or large caddis': 'Melanoplus|2',

  // ── STREAMER ───────────────────────────────────────────────────────────────
  'streamer':                               'Cottus',
  'streamer|Large Attractor / Baitfish':    'Cottus',
  'streamer|Sculpin / Bottom Baitfish':     'Cottus',
  'streamer|Leech':                         'Hirudinea',
  'streamer|N/A — attractor streamer':      'Cottus',
  'streamer|N/A — leech imitation':         'Hirudinea',
  'streamer|N/A — predator attractor':      'Cottus',
  'streamer|N/A — sculpin imitation':       'Cottus',

  // ── STILLWATER ─────────────────────────────────────────────────────────────
  'stillwater':                             'Callibaetis|5',
  'stillwater|Nymph':                       'Ephemerella|5',   // Callibaetis|5 returns 0 iNat results
  'stillwater|Nymph (substrate)':           'Ephemerella|5',
  'stillwater|Nymph (mid-water swimmer)':   'Ephemerella|5',
  'stillwater|Nymph (year-round)':          'Ephemerella|5',
  'stillwater|Year-round — permanent residents': 'Ephemerella|5',
  'stillwater|Emerger':                     'Callibaetis|16',
  'stillwater|Emerger / Cripple':           'Callibaetis|16',
  'stillwater|Adult Dun':                   'Callibaetis|16',
  'stillwater|Adult (shoreline)':           'Callibaetis|16',
  'stillwater|Spinner':                     'Heptagenia|2',
  'stillwater|Larva':                       'Chironomidae|6',
  'stillwater|Pupa':                        'Chironomidae|4',
  'stillwater|Adult / Emerger':             'Chironomus plumosus|2',

  // ── EURO NYMPH ─────────────────────────────────────────────────────────────
  'euro_nymph':                             'Ephemerella|5',
  'euro_nymph|Nymph':                       'Ephemerella|5',
  'euro_nymph|Larva':                       'Chironomidae|6',
  'euro_nymph|Attractor nymph — fast-sinking':  'Ephemerella|5',
  'euro_nymph|Attractor nymph — general':       'Ephemerella|5',
  'euro_nymph|Attractor — general invertebrate':'Ephemerella|5',
  'euro_nymph|Midge pupa / small mayfly':       'Ephemerella|5',

  // ── ATTRACTOR ──────────────────────────────────────────────────────────────
  'attractor':                              'Lumbricus terrestris',
  'attractor|Year-round drifter':           'Lumbricus terrestris',
  'attractor|Attractor (egg imitation)':    'Oncorhynchus mykiss',  // show trout eggs in context
};

// Artificial fly search terms keyed by fly name
// SVG placeholder fallback — artistic insect silhouette per type
const TYPE_SILHOUETTE = {
  midge:      'M10,50 Q30,20 50,50 Q70,80 90,50',
  mayfly:     'M50,80 L50,20 M30,35 Q50,15 70,35 M20,50 Q50,30 80,50',
  caddis:     'M20,60 Q50,20 80,60 L65,75 Q50,85 35,75 Z',
  stonefly:   'M15,55 Q50,25 85,55 L80,70 Q50,90 20,70 Z',
  terrestrial:'M30,50 Q50,30 70,50 L60,65 Q50,72 40,65 Z',
  streamer:   'M10,50 Q40,35 90,50 Q40,65 10,50 Z',
  euro_nymph: 'M20,50 Q50,30 80,50 Q50,70 20,50 Z',
  attractor:  'M50,15 L65,45 L95,45 L70,65 L80,95 L50,75 L20,95 L30,65 L5,45 L35,45 Z',
  stillwater: 'M15,50 Q35,25 50,40 Q65,25 85,50 Q65,75 50,60 Q35,75 15,50 Z',
};

// Single source of truth for insect type colors — used by InsectSVG and FlyDetailModal
const INSECT_TYPE_COLORS = {
  midge:      '#4db8a8',
  mayfly:     '#8a9fdf',
  caddis:     '#6fc48a',
  stonefly:   '#d4a855',
  yellowsally:'#d4a855',
  terrestrial:'#e9c46a',
  streamer:   '#e08060',
  euro_nymph: '#8a9fdf',
  attractor:  '#9ab870',
  stillwater: '#4db8a8',
};
const INSECT_TYPE_FALLBACK = '#4dbfaf';

function InsectSVG({ type }) {
  const path = TYPE_SILHOUETTE[type] || TYPE_SILHOUETTE.mayfly;
  const c = INSECT_TYPE_COLORS[type] || INSECT_TYPE_FALLBACK;
  return (
    <svg viewBox="0 0 100 100" style={{ width:'100%', height:'100%', opacity:.55 }}>
      <path d={path} fill="none" stroke={c} strokeWidth="3" strokeLinecap="round"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke={c} strokeWidth=".5" opacity=".3"/>
    </svg>
  );
}

// FlyImage component
// • Insect photos: iNaturalist Taxa API (free, no key, real species photos, CC-licensed)
// • Fly pattern photos: Wikimedia Commons bitmap-only search
// Falls back to InsectSVG silhouette if both fail

// Verified Wikimedia Commons filenames for artificial fly patterns
const FLY_FILES = {
  // Verified FlyFishFood.com product slugs — one entry per fly
  // Fetched at runtime: flyfishfood.com/products/{slug}.json → images[0].src
  'Zebra Midge': 'jig-zebra-midge-black',
  'Midge Larva': 'squirminator-jig',
  'Midge Pupa': 'black-mirage-zebra-midge',
  'Midge Cluster': 'griffiths-gnat',
  'BWO Nymph': 'pheasant-tail-slim',
  'BWO Emerger': 'bwo-parachute',
  'BWO RS2': 'rs2-gray',
  'BWO (Dry)': 'bwo-parachute',
  'Pheasant Tail': 'pheasant-tail-slim',
  'RS2': 'rs2-gray',
  'Frenchie': 'egans-frenchie',
  'Perdigon': 'perdigon-nymph-purple',
  'Rainbow Warrior': 'egans-rainbow-warrior-red',
  'Blowtorch': 'olsens-purple-blowtorch-barbless',         // bright hot-pink/purple attractor tail — the signature blowtorch look
  'PMD Nymph': 'tungsten-split-case-nymph-pmd',
  'PMD Sparkle Dun': 'biot-sparkle-dun-pmd',
  'PMD': 'tungsten-split-case-nymph-pmd',
  'PMD (Dry)': 'biot-sparkle-dun-pmd',
  'Caddis Larva': 'soft-hackle-caddis-pupa-tungsten-bead-head',
  'Caddis Pupa': 'soft-hackle-caddis-pupa-tungsten-bead-head',
  'Elk Hair Caddis': 'stimulator-orange',
  'Soft Hackle Caddis': 'soft-hackle-caddis-pupa-tungsten-bead-head',
  'October Caddis': 'stimulator-orange',
  'Caddis Dry': 'stimulator-orange',
  'October Caddis (Dry)': 'stimulator-orange',
  'Skwala Stone': 'fools-gold-skwala',                    // adult dry — correct
  'Skwala Nymph': 'tungsten-nemec-stone-nymph-brown',     // nymph stage — correct
  'Salmonfly Nymph': 'tungsten-nemec-stone-nymph-black',  // dark Pteronarcys nymph
  'Salmonfly': 'stimulator-orange',
  'Stimulator': 'stimulator-orange',
  'Yellow Sally': 'yellow-sally-cdc-elk',              // bright yellow body + elk hair wing — adult dry fallback
  "Yellow Sally|Nymph": 'tungsten-nemec-stone-nymph-yellow', // yellow stonefly nymph — matches nymph stage
  "Yellow Sally|Adult": 'yellow-sally-cdc-elk',              // bright yellow adult dry — matches adult stage
  'Stonefly Nymph': 'tungsten-pats-rubber-legs-black',   // nymph stage — correct
  'Hopper': 'chubby-chernobyl-tan',
  'Chubby Chernobyl': 'chubby-chernobyl-tan',
  'Hopper (Dry)': 'chubby-chernobyl-tan',
  'Ant': 'chubby-chernobyl-tan',
  'Ant (Dry)': 'chubby-chernobyl-tan',
  'Woolly Bugger': 'woolly-bugger-black-beadhead',
  'Articulated Leech': 'cheech-leech-black',                  // Cheech Leech — FFF articulated streamer collection, dark natural leech color
  'Slumpbuster': 'mayers-jig-mini-leech-lucent-black-red',    // Mayer's Jig Mini Leech — rabbit strip body, matches Slumpbuster construction
  'Circus Peanut': 'galloups-peanut-envy-olive',              // Galloup's Peanut Envy — Galloup's own evolved Circus Peanut design
  'Drunk & Disorderly': 'https://cdn.shopify.com/s/files/1/0871/4930/files/18-5061-w.png?v=1736012834', // Lynch's Mini D&D black — wedge deer hair head clearly visible, MFC photo
  'Olive Sculpin': 'woolly-bugger-black-beadhead',
  'Callibaetis': 'galloups-callibaetis-nymph-grey',
  'Damsel Nymph': 'ultra-damsel-nymph-olive',
  "Jig Hare's Ear": 'rozas-pink-hares-ear-jig-barbless',   // buggy hare's ear jig — caddis/mayfly/scud multi-imitator
  "Walt's Worm":    'sexy-walts-hares-ear',                 // Sexy Walt's Hare's Ear — scud/caddis/sow bug suggestion
  'Scud': 'sow-bug-tan',
  'Sow Bug': 'sow-bug-tan',
  'San Juan Worm': 'san-juan-worm-worm-brown',
  'Pink Egg': 'san-juan-worm-worm-brown',
  'Brown Drake': 'brown-drake-nealley',
  'Trico': 'cdc-trico-spinner',
};

function FlyImage({ taxon, flyFile, type, label, size = 120 }) {
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  useEffect(() => {
    setLoading(true); setErr(false); setImgUrl(null);
    let cancelled = false;

    if (taxon) {
      // iNaturalist Taxa API — reliable species photos
      // iNat Observations API: filter by life stage annotation
      // taxon value: 'TaxonName' or 'TaxonName|termValueId'
      // termValueIds: 2=Adult, 4=Pupa, 5=Nymph, 6=Larva, 16=Subimago(emerger/dun)
      const cacheKey = taxon;
      const cached = FlyImage._cache[cacheKey];
      if (cached === null) { setErr(true); setLoading(false); return; }
      if (cached) { setImgUrl(cached); setLoading(false); return; }
      const pipeIdx = taxon.lastIndexOf('|');
      const taxonName = pipeIdx > 0 ? taxon.slice(0, pipeIdx) : taxon;
      const termValueId = pipeIdx > 0 ? taxon.slice(pipeIdx + 1) : null;
      const stageParam = termValueId ? `&term_id=1&term_value_id=${termValueId}` : '';
      const obsUrl = `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(taxonName)}${stageParam}&per_page=3&photos=true&order_by=votes`;
      fetch(obsUrl)
        .then(r => r.json())
        .then(d => {
          if (cancelled) return;
          const obs = d.results?.find(o => o.photos?.[0]?.url);
          const url = obs?.photos?.[0]?.url?.replace('/square.', '/medium.');
          if (url) {
            FlyImage._cache[cacheKey] = url;
            setImgUrl(url); setLoading(false);
          } else {
            // Fallback: taxa default photo (no stage filter)
            return fetch(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(taxonName)}&per_page=1&photos=true`)
              .then(r => r.json())
              .then(d2 => {
                if (cancelled) return;
                const url2 = d2.results?.[0]?.default_photo?.medium_url;
                if (url2) {
                  FlyImage._cache[cacheKey] = url2;
                  setImgUrl(url2); setLoading(false);
                } else throw new Error('no photo');
              });
          }
        })
        .catch(() => {
          if (!cancelled) {
            FlyImage._cache[cacheKey] = null;
            setErr(true); setLoading(false);
          }
        });

    } else if (flyFile) {
      // FlyFishFood Shopify product JSON — OR direct https:// URL for non-FFF sources
      const cached = FlyImage._cache[flyFile];
      if (cached === null) { setErr(true); setLoading(false); return; }
      if (cached) { setImgUrl(cached); setLoading(false); return; }
      if (flyFile.startsWith('https://')) {
        // Direct image URL (e.g. external retailer CDN)
        FlyImage._cache[flyFile] = flyFile;
        setImgUrl(flyFile); setLoading(false);
      } else {
        fetch(`https://www.flyfishfood.com/products/${flyFile}.json`)
        .then(r => r.json())
        .then(data => {
          if (cancelled) return;
          const url = data?.product?.images?.[0]?.src;
          if (url) {
            FlyImage._cache[flyFile] = url;
            setImgUrl(url); setLoading(false);
          } else throw new Error('no image');
        })
        .catch(() => {
          if (!cancelled) {
            FlyImage._cache[flyFile] = null;
            setErr(true); setLoading(false);
          }
        });
      }
    } else {
      setErr(true); setLoading(false);
    }
    return () => { cancelled = true; };
  }, [taxon, flyFile, size]);

  const boxStyle = {
    width: size, height: size,
    maxWidth:'100%', maxHeight:'100%',
    aspectRatio:'1', borderRadius: 4, overflow:'hidden',
    background:'var(--bg3)', border:'1px solid var(--border)',
    display:'flex', alignItems:'center', justifyContent:'center', position:'relative',
  };

  return (
    <div style={boxStyle}>
      {loading && (
        <div style={{ width:20, height:20, borderRadius:'50%',
          border:'2px solid var(--border)', borderTopColor:'var(--teal)',
          animation:'spin .7s linear infinite' }} />
      )}
      {!loading && imgUrl && (
        <img src={imgUrl} alt={label} style={{ width:'100%', height:'100%', objectFit:'cover' }}
          onError={() => { setImgUrl(null); setErr(true); }} />
      )}
      {!loading && err && type && <InsectSVG type={type} />}
      {label && (
        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'.18rem .35rem',
          background:'rgba(10,20,25,.75)', fontSize:'.48rem', color:'var(--tdim)',
          letterSpacing:'.06em', textAlign:'center', lineHeight:1.3 }}>
          {label}
        </div>
      )}
    </div>
  );
}

FlyImage._cache = {}; // single shared cache, initialized once at module load

const HATCH_FAMILIES = {

  midge: {
    name: 'Chironomid (Midge)',
    scientificName: 'Chironomidae',
    overview: 'The most important year-round insect in tailwaters and still waters. Midges complete multiple generations per year. On cold winter tailwaters they are often the only hatch — mastering the midge lifecycle is non-negotiable for serious Mountain West anglers.',
    seasonPeak: 'Year-round — peak emergence Dec–Apr on tailwaters; May–Sep on stillwater',
    waterTypes: 'Tailwaters, spring creeks, stillwater, freestone streams',
    stages: [
      {
        stage: 'Larva',
        icon: '🪱',
        stageColor: INSECT_TYPE_COLORS.mayfly,
        timing: 'Year-round — most concentrated near the bottom substrate',
        description: 'Worm-like larvae live in the stream bottom. They drift freely in the current, especially after disturbance. Fish hold near the bottom and intercept drifting larvae.',
        howToFish: 'Dead-drift tight to the bottom with a euro rig or deep indicator. Use split shot to get the fly down. Slow, natural drift — no movement. Red "bloodworm" colors dominate in tailwaters; olive/cream in spring creeks.',
        patterns: ['Midge Larva', 'San Juan Worm'],
        activePatterns: ['Midge Larva'],
            },
      {
        stage: 'Pupa',
        icon: '🫧',
        stageColor: INSECT_TYPE_COLORS.midge,
        timing: 'During emergence — often mid-morning. Look for bulging rises with no adult taken.',
        description: 'Pupae ascend through the water column then hang suspended in the surface film. This is when fish feed most aggressively. The pupal stage is often more important than the adult.',
        howToFish: 'Fish just under or in the surface film. A slow, steady dead-drift is critical. Look for fish sipping with a "bulge" rise form — they are taking pupae in the film, not adults on top. Size and color must match the naturals exactly.',
        patterns: ['Midge Pupa', 'Zebra Midge', 'Rainbow Warrior', 'Blowtorch'],
        activePatterns: ['Midge Pupa', 'Zebra Midge'],
            },
      {
        stage: 'Adult / Emerger',
        icon: '🦟',
        stageColor: INSECT_TYPE_COLORS.caddis,
        timing: 'During and after emergence. Adults sit on the surface briefly before flying off.',
        description: 'Adult midges emerge from the pupal shuck on the surface. They are poor fliers and spend significant time on the water. Multiple adults often clump together into clusters — a more visible meal for trout.',
        howToFish: 'Match with a small dry fly or midge cluster. Fish in calm water with a dead-drift. A size 20–24 Griffith\'s Gnat (cluster) or para-midge (single adult) on 6X or 7X tippet. Only use this when you see actual adults being taken, not just bulging rises.',
        patterns: ['Midge Cluster'],
        activePatterns: ['Midge Cluster'],
            },
    ],
    progression: 'Start with larvae before and after hatches. Switch to pupae when you see bulging rises. Only move to adult dries when fish are clearly taking adults off the top — most "dry fly midge fishing" is actually pupa-in-the-film.',
    coachTip: 'The #1 midge mistake: fishing a dry fly when fish are eating pupae in the film. Bulging rises mean pupa. True surface sips mean adult. Learn to tell the difference — it will double your catch rate.',
  },

  bwo: {
    name: 'Blue-Winged Olive (Baetis)',
    scientificName: 'Baetis spp.',
    overview: 'The most important mayfly on most Mountain West tailwaters and spring creeks. Multiple broods per year. Hatches peak on cold, overcast, drizzly days — the worse the weather, the better the BWO fishing. One of the most technically demanding hatches.',
    seasonPeak: 'Spring (Mar–May) and Fall (Sep–Nov) peak; smaller hatches year-round',
    waterTypes: 'Tailwaters, spring creeks, freestone streams with moderate current',
    stages: [
      {
        stage: 'Nymph',
        icon: '🐛',
        stageColor: INSECT_TYPE_COLORS.mayfly,
        timing: 'Year-round subsurface. Most productive 1–2 hours before emergence begins.',
        description: 'Baetis nymphs are strong swimmers — unlike most nymphs, they actively dart through the current. They live 3–6 weeks before hatching. As hatching time approaches, nymphs become more active and move into faster water.',
        howToFish: 'Dead-drift a small pheasant tail or Frenchie near the bottom in riffles and runs. In the hour before a hatch, nymphs become very active — add a subtle swing at the end of the drift. Size 16–20 on 4X–5X. Works all day, not just during the hatch.',
        patterns: ['BWO Nymph', 'Pheasant Tail', 'Frenchie'],
        activePatterns: ['BWO Nymph'],
            },
      {
        stage: 'Emerger / Cripple',
        icon: '🫧',
        stageColor: INSECT_TYPE_COLORS.midge,
        timing: 'During the hatch — often the most productive stage. Fish key on trapped emergers.',
        description: 'Emerging BWOs struggle to break through the surface film on cold, damp days — they sit in the film longer, making them easy targets. Cripples (partially emerged adults stuck in the shuck) are especially vulnerable and trout learn to preferentially select them.',
        howToFish: 'Fish a CDC emerger or sparkle dun with a trailing shuck just in or under the film. When fish are rising but ignoring your dry fly, switch to an emerger pattern. A drag-free drift in the feeding lane is essential. 5X–6X fluorocarbon tippet.',
        patterns: ['BWO Emerger', 'BWO RS2'],
        activePatterns: ['BWO Emerger', 'BWO RS2'],
            },
      {
        stage: 'Adult Dun',
        icon: '🦋',
        stageColor: INSECT_TYPE_COLORS.caddis,
        timing: 'On the water briefly — overcast days extend time on the surface. Selective rises.',
        description: 'Adult duns sit on the surface while wings dry. On warm sunny days they fly off quickly — fish barely get a chance. On cold, overcast days they sit longer, creating the classic BWO dry fly rise. Fish can become very selective to size and profile.',
        howToFish: 'Parachute Adams, Comparadun, or parachute BWO in size 18–22. Match the size of naturals exactly — trout can be picky. Use the longest leader you can control (12–16ft) and size down tippet (6X on clear water). A perfect drag-free drift is everything.',
        patterns: ['BWO Nymph'],
        activePatterns: [],
            },
      {
        stage: 'Spinner',
        icon: '💀',
        stageColor: INSECT_TYPE_COLORS.terrestrial,
        timing: 'Evening spinner falls — spent adults lie flush in the film. Easy to miss.',
        description: 'After mating, female BWOs return to the water to lay eggs and die — their wings fall flat (spent) on the surface. Spinner falls often produce heavy feeding that looks like a hatch, but standard dun patterns will be ignored. You need a spent-wing pattern.',
        howToFish: 'A spent-wing or CDC spinner pattern in size 18–22, laid completely flat on the film. Fish during evening calm. The rise form is gentle and deliberate — fish are very confident and unhurried. 6X–7X tippet, long leader, no drag.',
        patterns: [],
        activePatterns: [],
            },
    ],
    progression: 'Nymphs → Emergers/Cripples → Adult Duns → Spinner. During an active hatch, emergers and cripples almost always outperform adult dries. The spinner fall is a completely separate event — usually evening, often overlooked.',
    coachTip: 'On a BWO day, start with a nymph below a dry, then watch the rise forms. Splashy takes = nymphs. Quiet head-and-tail rises = emergers in the film. Confident sips with visible duns = adult dries. Flat evening rises = spinner fall. Read the rise form and match accordingly.',
  },

  pmd: {
    name: 'Pale Morning Dun (PMD)',
    scientificName: 'Ephemerella dorothea & inermis',
    overview: 'The premier summer mayfly on most Mountain West freestone rivers. PMDs hatch mid-morning to noon from June through August. This is the quintessential Rocky Mountain dry fly hatch — a full PMD emergence on the Provo, Green, or Henry\'s Fork is unforgettable.',
    seasonPeak: 'June–August; earlier at lower elevation, later at high elevation',
    waterTypes: 'Freestone rivers, spring creeks, moderate tailwaters',
    stages: [
      {
        stage: 'Nymph',
        icon: '🐛',
        stageColor: INSECT_TYPE_COLORS.mayfly,
        timing: 'Year-round subsurface; productive 1–2 hours before the mid-morning hatch.',
        description: 'PMD nymphs are robust crawlers and clingers that live in moderate-to-fast current. They are available as food for weeks before hatching. In the hour before emergence, nymphs become very active near the surface.',
        howToFish: 'A pale olive or tan nymph on 4X–5X, dead-drifted near the bottom. Soft hackle or Hare\'s Ear variants work well. Fish the riffles and transition zones where nymphs concentrate before hatching. This is often productive even when no rise is visible.',
        patterns: ['PMD Nymph', 'Pheasant Tail'],
        activePatterns: ['PMD Nymph'],
      },
      {
        stage: 'Emerger / Cripple',
        icon: '🫧',
        stageColor: INSECT_TYPE_COLORS.midge,
        timing: 'During the hatch window — 9am–noon on most rivers. Most trout prefer emergers over duns.',
        description: 'PMD emergers are caught in the surface film during emergence — especially cripples (stuck in the shuck). Research shows trout take 3–4x more cripples than healthy duns during PMD hatches. Never overlook the emerger.',
        howToFish: 'Fish a Sparkle Dun, CDC emerger, or soft-hackle just in or below the film. A trailing Antron shuck makes a significant difference on selective fish. Keep your presentation upstream and drift through the feeding lane without drag.',
        patterns: ['PMD Sparkle Dun'],
        activePatterns: ['PMD Sparkle Dun'],
      },
      {
        stage: 'Adult Dun',
        icon: '🦋',
        stageColor: INSECT_TYPE_COLORS.caddis,
        timing: 'Mid-morning through noon — visible yellow/olive adults sitting on the water.',
        description: 'Adult PMD duns are pale yellow to olive and very visible on the surface. They take longer to dry their wings than smaller mayflies, extending their surface time. Classic dry fly fishing — fish feeding confidently on adults.',
        howToFish: 'Size 14–18 parachute or Comparadun in pale yellow. Watch the size of naturals — early in the season PMDs run larger (#14–16), shrinking later in summer (#16–18). Long leader, fine tippet (5X), reach-mend to avoid drag in complex currents.',
        patterns: [],
        activePatterns: [],
      },
      {
        stage: 'Spinner',
        icon: '💀',
        stageColor: INSECT_TYPE_COLORS.terrestrial,
        timing: 'Evening spinner fall, often 6–8pm. Rusty red spent wings flat in the film.',
        description: 'PMD spinners return to the water in the evening. Their wings become rusty red/orange and they lie spent (flat wings) on the surface after mating and egg-laying. The evening spinner fall often produces the most intense and selective surface feeding of the day.',
        howToFish: 'A PMD Rusty Spinner or spent-wing pattern, size 16–18, flat in the film. The rise form during a spinner fall is very quiet and deliberate. This is the most technically demanding part of the PMD cycle — perfect drift, right size, 6X tippet minimum.',
        patterns: [],
        activePatterns: [],
      },
    ],
    progression: 'Nymph (morning) → Emerger/Cripple (during hatch) → Adult Dun (mid-hatch) → Spinner (evening). Bring all four stages on a PMD river in summer.',
    coachTip: 'The PMD spinner fall is one of the most missed opportunities in fly fishing. After the mid-morning hatch ends, most anglers leave — but the evening spinner fall at dusk on the same pool can be even more intense. Look for rusty-orange wings in the current at 7pm.',
  },

  caddis: {
    name: 'Caddisfly',
    scientificName: 'Trichoptera (various)',
    overview: 'Caddisflies are the most diverse aquatic insect order — hundreds of species across Mountain West rivers. Unlike mayflies, they are excellent fliers and can be active for weeks. The adult egg-laying behavior (skittering on the surface) creates uniquely exciting dry fly fishing.',
    seasonPeak: 'Spring through fall — species-dependent; Oct Caddis peaks September–October',
    waterTypes: 'All river types — especially abundant in freestone streams and medium-gradient rivers',
    stages: [
      {
        stage: 'Larva',
        icon: '🐛',
        stageColor: INSECT_TYPE_COLORS.mayfly,
        timing: 'Year-round subsurface. 10–12 month larval stage — always available to fish.',
        description: 'Caddis larvae are the most abundant aquatic invertebrate in many Western rivers. Case-builders construct protective cases from sand, sticks, or pebbles. Free-living larvae crawl actively across the substrate. Net-spinners build silk webs to filter the current.',
        howToFish: 'Fish a chartreuse, olive, or cream caddis larva pattern near the bottom year-round. Often the most consistent subsurface producer on freestone rivers. Dead-drift on 4X–5X. The "electric green" chartreuse caddis is particularly effective in spring.',
        patterns: ['Caddis Larva'],
        activePatterns: ['Caddis Larva'],
      },
      {
        stage: 'Pupa',
        icon: '🫧',
        stageColor: INSECT_TYPE_COLORS.midge,
        timing: 'During emergence — often afternoon through evening. Look for slashing, aggressive strikes.',
        description: 'Caddis pupae swim actively to the surface — creating wakes just under the film. Fish slash aggressively at rising pupae. The ascending-pupa trigger is one of the most explosive strikes in fly fishing. Unlike mayfly hatches, caddis emergences can be chaotic and fish are not selective.',
        howToFish: 'A soft-hackle wet fly swung across current perfectly imitates an ascending pupa. Also effective: a beadhead caddis pupa dead-drifted then allowed to swing and rise. Evening caddis emergences can produce non-stop surface action for hours.',
        patterns: ['Caddis Pupa', 'Soft Hackle Caddis'],
        activePatterns: ['Caddis Pupa', 'Soft Hackle Caddis'],
      },
      {
        stage: 'Adult (Egg-Laying)',
        icon: '🦋',
        stageColor: INSECT_TYPE_COLORS.caddis,
        timing: 'Evening through dark — females return to water to lay eggs by skittering or diving.',
        description: 'Adult caddis return to lay eggs in the evening. Females skitter across the surface or dive below to deposit eggs — this erratic behavior makes dead-drift presentations less effective than twitching. Fish respond to movement. Some caddis adults live weeks and return multiple evenings.',
        howToFish: 'An Elk Hair Caddis in size 14–18. Fish with occasional twitches or skitters across current to imitate egg-laying behavior. A dead drift also works, but adding subtle movement can double your strikes. Evening on faster freestone rivers is prime.',
        patterns: ['Elk Hair Caddis', 'Chubby Chernobyl', 'October Caddis'],
        activePatterns: ['Elk Hair Caddis'],
            },
    ],
    progression: 'Larva (year-round bottom) → Pupa (aggressive ascending emergence) → Adult (evening skittering/diving egg-layer). Caddis are far less stage-selective than mayflies — fish often eat any stage during an emergence.',
    coachTip: 'The soft-hackle swing is underused on Western rivers. During an evening caddis emergence, wade to the far bank, cast quartering downstream, and let the fly swing across. The strike comes at the end of the swing as the fly rises to the surface — exactly imitating a pupa heading up.',
  },

  skwala: {
    name: 'Skwala Stonefly',
    scientificName: 'Skwala parallela',
    overview: 'The first significant hatch of the Mountain West season — a sign that winter is ending. Skwalas hatch on the first warm days of March and April on larger freestone rivers. Nymph fishing before the hatch is often better than the dry fly event itself.',
    seasonPeak: 'February–April depending on elevation and latitude',
    waterTypes: 'Larger freestone rivers — Snake, Clark Fork, Bitterroot, Provo, Yakima',
    stages: [
      {
        stage: 'Nymph (Pre-Emergence)',
        icon: '🐛',
        stageColor: INSECT_TYPE_COLORS.mayfly,
        timing: 'February–March — nymphs migrate toward the banks before hatching.',
        description: 'Skwala nymphs (1–1.5") migrate toward shore as emergence approaches. This pre-hatch nymph migration creates a concentrated bank-hugging drift. Large trout move tight to the banks to intercept them — often the most productive Skwala fishing happens before any adults appear.',
        howToFish: 'Fish a large, dark stonefly nymph with rubber legs tight to the bank. Dead-drift or use a slight swing. Euro nymph rig with 3.5–4.6mm tungsten bead. Start in February even before water temps suggest hatching — nymphs move early.',
        patterns: ['Skwala Nymph', 'Skwala Stone'],
        activePatterns: ['Skwala Nymph'],
            },
      {
        stage: 'Adult',
        icon: '🪲',
        stageColor: INSECT_TYPE_COLORS.stonefly,
        timing: 'First warm afternoons (50°F+) of March–April. Adults blow back onto water from bankside vegetation.',
        description: 'Skwala adults crawl out of the water onto rocks and vegetation to hatch — they do not emerge from the water surface like mayflies. Wind blows adults back onto the water, where their clumsy swimming creates an unmistakable target. Fish rise aggressively to adults on warm afternoons.',
        howToFish: 'A size 10–12 olive/brown dry fly with rubber legs (Mercer\'s Poacher, Pat\'s Foam Stone, or adult Skwala). Fish the banks and sheltered eddies. Best from noon to 4pm on days above 50°F. Look for naturals on the bank and in the water first.',
        patterns: ['Skwala Stone'],
        activePatterns: ['Skwala Stone'],
            },
    ],
    progression: 'Nymph fishing (Feb–Mar) → Adult dry fly (Mar–Apr warm afternoons). The nymph window is long; the dry fly window requires specific warm-day conditions.',
    coachTip: 'Don\'t wait for rising fish to fish the Skwala hatch. Trout are active on nymphs from February even in cold water. A large, ugly nymph fished tight to a snowy bank in March has caught some of the biggest fish of my season. Spring starts early underwater.',
  },

  salmonfly: {
    name: 'Salmonfly',
    scientificName: 'Pteronarcys californica',
    overview: 'The largest aquatic insect in the Mountain West — and the most famous hatch. Adults can exceed 3 inches. The annual salmonfly emergence in May–June triggers massive surface feeding from the biggest trout in the river. Rivers like the Madison, Salmon, and Deschutes draw anglers from worldwide.',
    seasonPeak: 'May–June — "chasing the hatch" upriver as it progresses with temperature',
    waterTypes: 'Large, cold freestone rivers with cobble substrate',
    stages: [
      {
        stage: 'Nymph (2–3 Year)',
        icon: '🐛',
        stageColor: INSECT_TYPE_COLORS.mayfly,
        timing: 'Year-round subsurface — 2–3 year life cycle. Best fished as a heavy bottom fly.',
        description: 'Salmonfly nymphs spend 2–3 years in the stream before hatching — making them a permanent, large food source. Pre-hatch, nymphs (up to 2.5") drift in the current and migrate toward shore. Large trout feed heavily on nymphs throughout the year.',
        howToFish: 'A large black/brown stonefly nymph (size 4–8) with rubber legs, weighted with 4.6mm+ tungsten bead. Fish near the bottom along the banks in May–June as the hatch approaches. A two-handed dead-drift with a bounce-the-bottom approach works best.',
        patterns: ['Salmonfly Nymph'],
        activePatterns: ['Salmonfly Nymph'],
            },
      {
        stage: 'Adult',
        icon: '🪲',
        stageColor: INSECT_TYPE_COLORS.stonefly,
        timing: 'During the emergence window — a 1–2 week window that moves upstream with warming water.',
        description: 'Adult salmonflies are enormous orange/rust insects that gather in streamside vegetation in huge numbers. Wind and morning/evening temperature drops blow them onto the water. The biggest trout in the river abandon their usual caution — this is the time for large dry flies.',
        howToFish: 'A size 4–8 dry fly (Sofa Pillow, Chubby Chernobyl, Stimulator in orange). Fish the banks and edges. The hatch moves upstream with warming water — check water temps (ideal 55–62°F). Be on the water early and late. Huge Stimulators and Chubby Chernobyls with rubber legs are the standard.',
        patterns: ['Stimulator', 'Chubby Chernobyl'],
        activePatterns: [],
      },
    ],
    progression: 'Pre-hatch nymphing (weeks before) → Adult dry fly (the 1–2 week emergence window). The nymph period is often more productive than the hatch itself — fish are conditioned to large nymphs all spring.',
    coachTip: 'The salmonfly hatch is the most overhyped and under-exploited hatch in the West. Everyone wants to fish the dry fly, but the best fishing is 2–3 weeks BEFORE the hatch when big nymphs are drifting and fish are eating without pressure. And after the adults are gone — big fish are still looking up.',
  },

  yellowsally: {
    name: 'Yellow Sally Stonefly',
    scientificName: 'Isoperla spp.',
    overview: 'The overlooked summer stonefly. Yellow Sallies hatch mid-day from June through August, often simultaneously with PMD hatches. Many anglers fish PMDs while trout are taking Yellow Sallies. The bright yellow color is unmistakable.',
    seasonPeak: 'June–August, mid-morning through afternoon',
    waterTypes: 'Freestone rivers and streams with cobble substrate',
    stages: [
      {
        stage: 'Nymph',
        icon: '🐛',
        stageColor: INSECT_TYPE_COLORS.mayfly,
        timing: 'Spring and summer subsurface. Small yellow/chartreuse nymph near the bottom.',
        description: 'Yellow Sally nymphs are small (size 14–16) and bright yellow-green. They live in riffles and moderate runs. Not as abundant as larger stoneflies but consistent producers when the hatch is active.',
        howToFish: 'A small yellow or chartreuse nymph on 4X–5X. Fish near the bottom in riffles. The Yellow Sally nymph is often overlooked in favor of more popular patterns — try it when fish are being finicky about Hare\'s Ears and Pheasant Tails.',
        patterns: ['Yellow Sally'],
        activePatterns: [],
      },
      {
        stage: 'Adult',
        icon: '🪲',
        stageColor: INSECT_TYPE_COLORS.stonefly,
        timing: 'Mid-morning through afternoon during the summer hatch period.',
        description: 'Adult Yellow Sallies are bright yellow and very visible on the water. They hatch during the warmest part of the day in summer. Often active simultaneously with PMD hatches — when fish ignore your PMD, try a Yellow Sally.',
        howToFish: 'A size 14–16 dry fly with yellow body and elk hair or deer hair wing. Yellow Stimulator, Yellow Sally parachute, or simple elk hair caddis in yellow. When PMDs are on but fish are ignoring you — switch to a Yellow Sally. The yellow color stands out.',
        patterns: ['Yellow Sally'],
        activePatterns: ['Yellow Sally'],
      },
    ],
    progression: 'Nymph (spring/summer subsurface) → Adult (mid-day summer dry fly).',
    coachTip: 'Carry a Yellow Sally when fishing summer PMD hatches. They often hatch simultaneously and fish sometimes prefer the Sally. The bright yellow body is an obvious distinguisher — look at what\'s actually on the water before assuming every rise is PMD.',
  },

  hopper: {
    name: 'Grasshopper / Terrestrial',
    scientificName: 'Orthoptera (grasshopper) + Formicidae (ants)',
    overview: 'Grasshoppers and other terrestrials are not aquatic — they fall or jump into the water from streamside grass and vegetation. High-protein, large meals that bring up the biggest fish. Prime season is mid-July through September across all Mountain West elevations.',
    seasonPeak: 'Mid-July through September — peaks August in most locations',
    waterTypes: 'All river types with grassy banks — especially meadow streams and valleys',
    stages: [
      {
        stage: 'Terrestrial (on water)',
        icon: '🌿',
        stageColor: INSECT_TYPE_COLORS.terrestrial,
        timing: 'Late morning through afternoon, mid-July through September. Hot, dry days produce the most grasshoppers.',
        description: 'Grasshoppers are blown or jump into the water from adjacent meadow and streamside grass. They are poor swimmers and struggle conspicuously on the surface — this movement triggers aggressive strikes. Unlike aquatic hatches, there is no "emergence" to time — hoppers just fall in.',
        howToFish: 'Fish the banks. Cast tight to the grass edge or undercut bank. Let the hopper land with a splat (a quiet presentation actually works against you). Add occasional twitches to imitate a struggling hopper. Best on windy days when naturals are being blown onto the water. A dry-dropper with a heavy nymph below the hopper doubles your options.',
        patterns: ['Hopper', 'Chubby Chernobyl'],
        activePatterns: ['Hopper', 'Chubby Chernobyl'],
            },
    ],
    progression: 'No progression — grasshoppers are available whenever they fall into the water. Fish banks aggressively from July onward.',
    coachTip: 'The hopper "hatch" requires reading the banks, not the water. Walk the streamside grass and watch for hoppers jumping — if they\'re abundant on the banks, they\'re falling into the river. Fish the inside of every bend and every grassy undercut from 10am–4pm in August.',
  },

  streamer_family: {
    name: 'Streamers & Attractor Patterns',
    scientificName: 'Various — sculpin, leech, baitfish imitations',
    overview: 'Streamers imitate fish, leeches, crayfish, and large invertebrates — not hatching insects. They target predatory behavior rather than feeding selectivity. Large, aggressive fish eat streamers when they ignore dry flies and nymphs.',
    seasonPeak: 'Most productive early morning and evening; spring and fall runoff; overcast days',
    waterTypes: 'All water types — especially large pools, undercut banks, woody debris',
    stages: [
      {
        stage: 'Sculpin / Bottom Baitfish',
        icon: '🐟',
        stageColor: INSECT_TYPE_COLORS.streamer,
        timing: 'Year-round — most effective in early morning, evening, and off-color water.',
        description: 'Sculpin are the primary baitfish in most Mountain West streams. Bottom-hugging and slow-moving, they are ambushed by large brown and rainbow trout. Slumpbuster, Conehead Sculpin, and similar patterns imitate this prey item.',
        howToFish: 'Dead-drift first (works in high/turbid water), then switch to aggressive stripping. Bounce the fly along the bottom in runs and riffles. Short, erratic strips with pauses — the pause is when most strikes happen. Sink-tip or weighted pattern to get to the bottom.',
        patterns: ['Slumpbuster'],
        activePatterns: ['Slumpbuster'],
            },
      {
        stage: 'Leech',
        icon: '🪱',
        stageColor: INSECT_TYPE_COLORS.attractor,
        timing: 'Year-round in still water; most effective at low light in rivers.',
        description: 'Leeches are permanent residents of both rivers and lakes. They swim with a slow undulating motion and are most active at low light. In stillwater, leeches are one of the most important food sources for large trout.',
        howToFish: 'Strip slowly with long pauses. In rivers, cast across and downstream and let the fly swing with occasional strips. In stillwater, count down to depth then retrieve with 3–5 slow strips and a pause. Effective year-round.',
        patterns: ['Woolly Bugger', 'Articulated Leech'],
        activePatterns: ['Woolly Bugger', 'Articulated Leech'],
            },
      {
        stage: 'Large Attractor / Baitfish',
        icon: '💥',
        stageColor: INSECT_TYPE_COLORS.streamer,
        timing: 'Fall (Sept–Nov) for big browns; early morning spring/fall for large rainbows.',
        description: 'Large articulated streamers trigger reaction strikes from territorial or predatory fish — especially large brown trout in fall. These patterns don\'t imitate one specific prey item but suggest a large, vulnerable meal. Most effective for targeting trophy fish.',
        howToFish: 'Aggressive stripping with pauses. Cast across and slightly downstream, strip hard with irregular cadence. A stop-and-go retrieve — five fast strips, dead stop, two slow strips — produces more strikes than a constant retrieve. Use a 7–8wt rod with a loop-to-loop sinking tip.',
        patterns: ['Circus Peanut', 'Drunk & Disorderly'],
        activePatterns: ['Circus Peanut', 'Drunk & Disorderly'],
            },
    ],
    progression: 'No hatch progression — use size, depth, and retrieve speed to match conditions. Big/deep in high water; small/slow in low clear water.',
    coachTip: 'Vary your retrieve until you find what triggers strikes. Most anglers strip too fast. A stop-dead pause after two strips often triggers fish that are following. Watch your line — many streamer strikes happen on the swing or on the pause, and you won\'t feel them until you\'re tight.',
  },

};

/* Map each FLY_INFO key to its family key for quick lookup */
const FLY_FAMILY_MAP = {
  // ── Core patterns ──
  'Zebra Midge':'midge',        'Midge Larva':'midge',       'Midge Pupa':'midge',        'Midge Cluster':'midge',
  'Rainbow Warrior':'midge',    'Blowtorch':'midge',
  'BWO Nymph':'bwo',            'BWO Emerger':'bwo',          'BWO RS2':'bwo',              'BWO (Dry)':'bwo',
  'Pheasant Tail':'bwo',        'RS2':'bwo',
  'PMD Nymph':'pmd',            'PMD Sparkle Dun':'pmd',      'PMD':'pmd',                 'PMD (Dry)':'pmd',
  'Caddis Larva':'caddis',      'Caddis Pupa':'caddis',       'Elk Hair Caddis':'caddis',
  'Soft Hackle Caddis':'caddis','October Caddis':'caddis',    'Caddis Dry':'caddis',       'October Caddis (Dry)':'caddis',
  'Skwala Stone':'skwala',      'Skwala Nymph':'skwala',
  'Salmonfly Nymph':'salmonfly','Salmonfly':'salmonfly',
  'Yellow Sally':'yellowsally', 'Stimulator':'salmonfly',     'Stonefly Nymph':'salmonfly',
  'Hopper':'hopper',            'Chubby Chernobyl':'hopper',  'Hopper (Dry)':'hopper',     'Ant':'hopper',  'Ant (Dry)':'hopper',
  'Woolly Bugger':'streamer_family', 'Articulated Leech':'streamer_family', 'Slumpbuster':'streamer_family',
  'Circus Peanut':'streamer_family', 'Drunk & Disorderly':'streamer_family', 'Olive Sculpin':'streamer_family',
  // ── Euro nymphs → mapped to their imitated insect family ──
  'Frenchie':'bwo',             'Perdigon':'bwo',
  "Jig Hare's Ear":'caddis',   "Walt's Worm":'caddis',
  // ── Stillwater ──
  'Callibaetis':'stillwater_mayfly', 'Damsel Nymph':'stillwater_damsel', 'Scud':'stillwater_crustacean',
  // ── Attractor / Egg / Worm ──
  'San Juan Worm':'streamer_family', 'Pink Egg':'streamer_family',       'Sow Bug':'streamer_family',
  // ── Other mayfly dries ──
  'Brown Drake':'pmd',          'Trico':'bwo',

};

/* ═══════════════════════════════════════════════════════════
   HATCH WINDOWS — time-of-day data for each family/stage
   Key format: "familyKey|stageName"
═══════════════════════════════════════════════════════════ */
const STAGE_HATCH_WINDOWS = {
  /* ── MIDGE ── */
  'midge|Larva':           { start:0,  end:23, peak:10, allDay:true,  label:'All day subsurface',        conditions:'No specific window — larvae available 24/7 in substrate.' },
  'midge|Pupa':            { start:9,  end:13, peak:11, allDay:false, label:'9am – 1pm',                 conditions:'Cold, overcast days push emergence earlier and extend the window.' },
  'midge|Adult / Emerger': { start:10, end:14, peak:11, allDay:false, label:'10am – 2pm',                conditions:'Adults linger longer on cold days. Bright sun shortens surface time.' },

  /* ── BWO ── */
  'bwo|Nymph':             { start:0,  end:23, peak:9,  allDay:true,  label:'All day subsurface',        conditions:'Fish nymphs any time. Most active 1–2 hrs before surface hatch.' },
  'bwo|Emerger / Cripple': { start:9,  end:14, peak:11, allDay:false, label:'9am – 2pm',                 conditions:'Best on cold, overcast, drizzly days. Bright sun suppresses emergence.' },
  'bwo|Adult Dun':         { start:10, end:14, peak:11, allDay:false, label:'10am – 2pm',                conditions:'Duns sit longer on cold wet days. Warm sun means quick departure from surface.' },
  'bwo|Spinner':           { start:17, end:21, peak:19, allDay:false, label:'5pm – dusk',                conditions:'Spinner falls happen in calm evening conditions after the main hatch.' },

  /* ── PMD ── */
  'pmd|Nymph':             { start:7,  end:11, peak:9,  allDay:false, label:'7am – 11am',                conditions:'Fish riffles in the morning before the mid-morning hatch begins.' },
  'pmd|Emerger / Cripple': { start:9,  end:13, peak:10, allDay:false, label:'9am – 1pm',                 conditions:'Prime hatch window. Overcast days extend emergence significantly.' },
  'pmd|Adult Dun':         { start:9,  end:13, peak:11, allDay:false, label:'9am – 1pm',                 conditions:'Sunny warm days shorten dun time on water. Fish dries mid-hatch window.' },
  'pmd|Spinner':           { start:18, end:21, peak:19, allDay:false, label:'6pm – dark',                conditions:'Evening spinner falls are often more intense than the morning hatch.' },

  /* ── CADDIS ── */
  'caddis|Larva':              { start:0,  end:23, peak:10, allDay:true,  label:'All day subsurface',    conditions:'Larvae available year-round with no specific emergence window.' },
  'caddis|Pupa':               { start:15, end:21, peak:18, allDay:false, label:'3pm – 9pm',             conditions:'Ascending pupa most active during late afternoon and evening emergences.' },
  'caddis|Adult (Egg-Laying)': { start:17, end:22, peak:19, allDay:false, label:'5pm – dark',            conditions:'Adults skitter and egg-lay as light fades. Best in the hour before dark.' },

  /* ── SKWALA ── */
  'skwala|Nymph (Pre-Emergence)': { start:7,  end:17, peak:9,  allDay:false, label:'All morning',        conditions:'Nymphs migrate bankward all day Feb–Mar. Morning most productive.' },
  'skwala|Adult':                  { start:12, end:17, peak:14, allDay:false, label:'Noon – 5pm',         conditions:'Only active on days above 50°F. Best noon–4pm when air temp peaks.' },

  /* ── SALMONFLY ── */
  'salmonfly|Nymph (2–3 Year)': { start:0,  end:23, peak:9,  allDay:true,  label:'All day subsurface',  conditions:'Nymphs year-round. Pre-hatch migration peaks in the morning hours.' },
  'salmonfly|Adult':             { start:10, end:20, peak:14, allDay:false, label:'10am – 8pm',          conditions:'Adults blown onto water all day. Morning and evening are strongest.' },

  /* ── YELLOW SALLY ── */
  'yellowsally|Nymph':   { start:8,  end:17, peak:10, allDay:false, label:'Morning – afternoon',         conditions:'Small nymph available subsurface during spring and summer months.' },
  'yellowsally|Adult':   { start:10, end:15, peak:12, allDay:false, label:'10am – 3pm',                  conditions:'Hatches during the warmest part of the day. Often overlaps with PMD.' },
  'yellowsally|Terrestrial (on water)': { start:10, end:15, peak:12, allDay:false, label:'10am – 3pm', conditions:'Active during the warmest mid-day hours in summer.' },

  /* ── HOPPER ── */
  'hopper|Terrestrial (on water)':     { start:10, end:17, peak:13, allDay:false, label:'10am – 5pm',   conditions:'Hoppers most active when air temp peaks on hot summer days.' },

  /* ── STREAMERS ── */
  'streamer_family|Sculpin / Bottom Baitfish':  { start:5,  end:11, peak:7,  allDay:false, label:'Dawn – mid-morning',   conditions:'Sculpins most vulnerable at low light when big trout actively hunt.' },
  'streamer_family|Leech':                       { start:5,  end:10, peak:7,  allDay:false, label:'Dawn & dusk',          conditions:'Leeches most active at low light. Effective any time in stillwater.' },
  'streamer_family|Large Attractor / Baitfish':  { start:5,  end:10, peak:7,  allDay:false, label:'Dawn & dusk',          conditions:'Trophy streamer fishing peaks at first and last light, especially fall.' },
};

/* Quick lookup: given a FLY_INFO key, return its hatch window via FLY_FAMILY_MAP */
function getHatchWindow(flyKey) {
  const famKey = FLY_FAMILY_MAP[flyKey];
  if (!famKey) return null;
  const family = HATCH_FAMILIES[famKey];
  if (!family) return null;
  const stageIdx = family.stages.findIndex(s =>
    s.activePatterns.includes(flyKey) || s.patterns.includes(flyKey)
  );
  if (stageIdx < 0) return null;
  const stageName = family.stages[stageIdx].stage;
  return STAGE_HATCH_WINDOWS[famKey + '|' + stageName] || null;
}




/* ═══════════════════════════════════════════════════════════
   STILLWATER DATA
═══════════════════════════════════════════════════════════ */
const STILLWATER_WATERS = {
  UT: ['Strawberry Reservoir','Flaming Gorge','Fish Lake','Pineview Reservoir','Scofield Reservoir','Deer Creek Reservoir'],
  ID: ["Henry's Lake",'Cascade Reservoir','Magic Reservoir','Lucky Peak Reservoir','Anderson Ranch Reservoir'],
  WY: ['Fremont Lake','Boysen Reservoir','Buffalo Bill Reservoir','Flaming Gorge (WY)','Ocean Lake'],
  MT: ['Flathead Lake','Canyon Ferry Lake','Fort Peck Reservoir','Holter Lake','Hebgen Lake'],
  CO: ['Blue Mesa Reservoir','Eleven Mile Reservoir','Spinney Mountain Reservoir','Cheesman Reservoir','Williams Fork Reservoir','Georgetown Reservoir'],
  OR: ['Crane Prairie Reservoir','Wickiup Reservoir','Davis Lake','Suttle Lake','Lake Billy Chinook'],
  WA: ['Lake Lenice','Lake Nunnally','Chopaka Lake','Dry Falls Lake','Rocky Ford Creek'],
};

const STILLWATER_SPECIES = {
  UT: {
    'Strawberry Reservoir':   ['rainbow','cutthroat','kokanee'],
    'Flaming Gorge':          ['rainbow','brown','kokanee','lake'],
    'Fish Lake':              ['splake','lake','brook','tiger','rainbow'],
    'Pineview Reservoir':     ['rainbow','brown','tiger'],
    'Scofield Reservoir':     ['rainbow','cutthroat'],
    'Deer Creek Reservoir':   ['rainbow','brown'],
  },
  ID: {
    "Henry's Lake":    ['cutthroat','brook','rainbow'],
    'Cascade Reservoir':       ['rainbow','brown'],
    'Magic Reservoir':         ['rainbow','brown'],
    'Lucky Peak Reservoir':    ['rainbow'],
    'Anderson Ranch Reservoir':['rainbow','brown'],
  },
  WY: {
    'Fremont Lake':            ['lake','rainbow','brown'],
    'Boysen Reservoir':        ['rainbow','brown'],
    'Buffalo Bill Reservoir':  ['rainbow','brown','cutthroat'],
    'Flaming Gorge (WY)':      ['rainbow','brown','kokanee','lake'],
    'Ocean Lake':              ['rainbow'],
  },
  MT: {
    'Flathead Lake':           ['rainbow','cutthroat','lake','bull','kokanee'],
    'Canyon Ferry Lake':       ['rainbow','brown'],
    'Fort Peck Reservoir':     ['rainbow','brown'],
    'Holter Lake':             ['rainbow','brown','cutthroat'],
    'Hebgen Lake':             ['rainbow','brown','cutthroat','whitefish'],
  },
  CO: {
    'Blue Mesa Reservoir':     ['rainbow','brown','kokanee','lake'],
    'Eleven Mile Reservoir':   ['rainbow','brown','cutthroat','cutbow'],
    'Spinney Mountain Reservoir':['rainbow','brown','cutthroat','cutbow'],
    'Cheesman Reservoir':      ['rainbow','brown'],
    'Williams Fork Reservoir': ['rainbow','brown','kokanee'],
    'Georgetown Reservoir':    ['rainbow','cutthroat','cutbow'],
  },
  OR: {
    'Crane Prairie Reservoir': ['rainbow','brown'],
    'Wickiup Reservoir':       ['rainbow','brown'],
    'Davis Lake':              ['rainbow'],
    'Suttle Lake':             ['rainbow','brook'],
    'Lake Billy Chinook':      ['rainbow','kokanee','bull'],
  },
  WA: {
    'Lake Lenice':   ['rainbow'],
    'Lake Nunnally': ['rainbow'],
    'Chopaka Lake':  ['rainbow'],
    'Dry Falls Lake':['rainbow','brown'],
    'Rocky Ford Creek':['rainbow'],
  },
};

const STILLWATER_TECHNIQUES = {
  UT: {
    'Strawberry Reservoir':   ['chironomid','damsel','leech','streamer'],
    'Flaming Gorge':          ['streamer','chironomid','leech','indicator'],
    'Fish Lake':              ['streamer','leech','indicator'],
    'Pineview Reservoir':     ['chironomid','indicator','leech'],
    'Scofield Reservoir':     ['chironomid','leech','indicator'],
    'Deer Creek Reservoir':   ['chironomid','indicator','leech'],
  },
  ID: {
    "Henry's Lake":    ['damsel','leech','indicator','chironomid'],
    'Cascade Reservoir':       ['chironomid','indicator','leech'],
    'Magic Reservoir':         ['indicator','leech','streamer'],
    'Lucky Peak Reservoir':    ['indicator','chironomid'],
    'Anderson Ranch Reservoir':['chironomid','leech','indicator'],
  },
  WY: {
    'Fremont Lake':            ['streamer','leech','chironomid'],
    'Boysen Reservoir':        ['indicator','leech','streamer'],
    'Buffalo Bill Reservoir':  ['streamer','leech','indicator'],
    'Flaming Gorge (WY)':      ['streamer','chironomid','leech','indicator'],
    'Ocean Lake':              ['indicator','leech'],
  },
  MT: {
    'Flathead Lake':           ['streamer','chironomid','leech','damsel'],
    'Canyon Ferry Lake':       ['chironomid','indicator','leech'],
    'Fort Peck Reservoir':     ['streamer','leech','indicator'],
    'Holter Lake':             ['chironomid','indicator','leech'],
    'Hebgen Lake':             ['chironomid','damsel','leech','indicator'],
  },
  CO: {
    'Blue Mesa Reservoir':     ['streamer','chironomid','leech','damsel'],
    'Eleven Mile Reservoir':   ['chironomid','indicator','leech','damsel'],
    'Spinney Mountain Reservoir':['chironomid','damsel','indicator','leech'],
    'Cheesman Reservoir':      ['chironomid','indicator'],
    'Williams Fork Reservoir': ['chironomid','leech','indicator'],
    'Georgetown Reservoir':    ['chironomid','indicator','damsel'],
  },
  OR: {
    'Crane Prairie Reservoir': ['damsel','leech','chironomid','indicator'],
    'Wickiup Reservoir':       ['leech','streamer','indicator'],
    'Davis Lake':              ['damsel','leech','indicator'],
    'Suttle Lake':             ['chironomid','indicator','leech'],
    'Lake Billy Chinook':      ['streamer','leech','chironomid'],
  },
  WA: {
    'Lake Lenice':   ['chironomid','damsel','indicator','leech'],
    'Lake Nunnally': ['chironomid','damsel','indicator','leech'],
    'Chopaka Lake':  ['chironomid','indicator','damsel'],
    'Dry Falls Lake':['chironomid','leech','indicator'],
    'Rocky Ford Creek':['chironomid','indicator','leech'],
  },
};

const STILLWATER_TECHNIQUES_DATA = {
  chironomid: {
    name: 'Chironomid / Midge Under Indicator', color: 'var(--euro-c)', level: 'Intermediate', levelClass: 'lv-int',
    short: 'Suspend midge pupa at depth under strike indicator — most productive stillwater technique',
    detail: 'The most refined stillwater method, especially on clear mountain lakes. A chironomid (midge pupa) is suspended via strike indicator at a precise depth — usually just above the substrate. Fish hang nearly motionless, feeding on ascending midges. A dead-still presentation is critical.',
    tip: 'Set depth so the fly is 1–2 ft off bottom. Use a long leader (10–16ft). Absolutely no movement — this is not a retrieval technique. Watch the indicator for any twitch or movement. Red and black chironomids are universal; use olive in early season.',
    rigs: ['9ft 5–6wt, full floating line, 10–14ft fluorocarbon leader','Thingamabobber indicator, size #12–16 chironomid pupa','No movement — fish from an anchored float tube or pontoon'],
  },
  damsel: {
    name: 'Damselfly Nymph Retrieve', color: 'var(--nymph-c)', level: 'Beginner', levelClass: 'lv-beg',
    short: 'Strip damsel nymph toward shore — imitates spring/summer migration',
    detail: 'Damselfly nymphs migrate horizontally through open water to reach shore for emergence, typically in June–July. Fish position outside weed beds and intercept migrating nymphs. The retrieve is critical — a slow, hand-over-hand retrieve toward shore is the standard.',
    tip: 'Fish with the sun behind you in early morning. Cast parallel to weed edges and strip slowly toward shore. Use floating line with a long leader and a weighted olive damsel nymph. Strikes are often violent.',
    rigs: ['5–6wt, floating line, 12ft fluorocarbon leader','Olive or tan damsel nymph #10–14, marabou tail','Slow hand-over-hand retrieve toward shore'],
  },
  leech: {
    name: 'Leech Pattern Strip', color: 'var(--str-c)', level: 'Beginner', levelClass: 'lv-beg',
    short: 'Sink-tip or floating line with slow leech strip — year-round producer',
    detail: 'Leeches are permanent stillwater residents and a year-round food source. Fish from a float tube along weed edges, drop-offs, and points. A slow, varied retrieve with pauses is most effective. The pause often triggers strikes — fish follow and hit when the fly stops.',
    tip: 'Use a black or olive woolly bugger or bunny leech. Count the fly down to depth, then retrieve with 3–5 slow strips, pause, repeat. Effective from ice-out through ice-over. Sink-tip lines in deeper water; floating line near shoreline structure.',
    rigs: ['5–7wt, floating or sink-tip line','Black/olive Woolly Bugger or Bunny Leech #4–8, 1X–2X tippet','Slow strip with pauses — let it sink on each pause'],
  },
  indicator: {
    name: 'Still-Water Indicator Nymphing', color: 'var(--nymph-c)', level: 'Beginner', levelClass: 'lv-beg',
    short: 'Suspend nymphs under indicator at feeding depth — versatile approach',
    detail: 'Standard indicator nymphing adapted for still water. Instead of current carrying the fly, you are suspending the fly at a specific depth where fish are feeding. Can be used with chironomids, callibaetis nymphs, and damsel patterns. Particularly effective during hatch activity.',
    tip: 'Observe where fish are rising or cruising and set indicator depth accordingly. On windy days, let the indicator drift naturally. On calm days, give occasional subtle twitches. Always use fluorocarbon — visibility matters in clear lake water.',
    rigs: ['5–6wt, floating line, 10–12ft fluorocarbon leader','Chironomid, Callibaetis nymph, or damsel under Thingamabobber','Match fly to active hatch; adjust depth until fish found'],
  },
  streamer: {
    name: 'Stillwater Streamer', color: 'var(--dry-c)', level: 'Intermediate', levelClass: 'lv-int',
    short: 'Strip large patterns for predatory fish — especially lake trout and kokanee',
    detail: 'Stillwater streamers target piscivorous species (lake trout, tiger trout, large rainbows) and can produce the largest fish of the season. Fish along drop-offs, rocky points, and inlet/outlet areas. Intermediate or sinking lines get flies to depth.',
    tip: 'Troll slowly from a float tube using an intermediate line and large streamer — cover water to locate fish. Once you find them, anchor and cast to the school. Vary retrieve speed and pauses until you find the trigger.',
    rigs: ['6–8wt, intermediate or type 3 sinking line','White/chartreuse or olive streamer #2–6, 1X tippet','Vary from slow strip to aggressive retrieve; pause is key'],
  },
};

/* Stillwater hatch data — 12-month grid */
const STILLWATER_H = {
  UT: {
    'Strawberry Reservoir': [[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud],[F.MidgePupa,F.Callibaetis],[F.Callibaetis,F.ZebraMidge],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ZebraMidge],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger,F.ZebraMidge],[F.Callibaetis,F.ArticulatedLeech,F.MidgePupa],[F.MidgePupa,F.WoollyBugger],[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud]],
    'Flaming Gorge': [[F.MidgeLarva,F.Slumpbuster],[F.MidgeLarva,F.Slumpbuster],[F.MidgePupa,F.WoollyBugger],[F.MidgePupa,F.Callibaetis,F.WoollyBugger],[F.BwoNymph,F.Callibaetis,F.ArticulatedLeech],[F.BwoNymph,F.Callibaetis,F.CircusPeanut],[F.Callibaetis,F.WoollyBugger,F.Scud],[F.Callibaetis,F.ArticulatedLeech,F.Hopper],[F.CircusPeanut,F.Callibaetis,F.MidgePupa],[F.DrunkDisorderly,F.MidgePupa],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Fish Lake': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.WoollyBugger],[F.MidgePupa,F.Callibaetis,F.ArticulatedLeech],[F.BwoNymph,F.Callibaetis,F.ArticulatedLeech],[F.Callibaetis,F.BwoNymph,F.WoollyBugger],[F.Callibaetis,F.WoollyBugger,F.BwoNymph],[F.Callibaetis,F.ArticulatedLeech,F.DrunkDisorderly],[F.CircusPeanut,F.MidgePupa,F.WoollyBugger],[F.WoollyBugger,F.MidgeLarva],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Pineview Reservoir': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.WoollyBugger],[F.MidgePupa,F.Callibaetis],[F.BwoNymph,F.Callibaetis,F.WoollyBugger],[F.Callibaetis,F.BwoNymph,F.CircusPeanut],[F.Callibaetis,F.WoollyBugger,F.ArticulatedLeech],[F.Callibaetis,F.ArticulatedLeech,F.DrunkDisorderly],[F.CircusPeanut,F.MidgePupa],[F.DrunkDisorderly,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Scofield Reservoir': [[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud],[F.MidgePupa,F.Callibaetis],[F.Callibaetis,F.ZebraMidge,F.Scud],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ZebraMidge],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger,F.ZebraMidge],[F.Callibaetis,F.MidgePupa,F.ArticulatedLeech],[F.MidgePupa,F.WoollyBugger],[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud]],
    'Deer Creek Reservoir': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.WoollyBugger],[F.MidgePupa,F.Callibaetis],[F.BwoNymph,F.Callibaetis,F.CircusPeanut],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger,F.BwoNymph],[F.Callibaetis,F.ArticulatedLeech,F.DrunkDisorderly],[F.CircusPeanut,F.MidgePupa],[F.DrunkDisorderly,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
  },
  ID: {
    "Henry's Lake": [[F.MidgeLarva,F.ArticulatedLeech],[F.MidgeLarva,F.ArticulatedLeech],[F.MidgePupa,F.WoollyBugger],[F.Callibaetis,F.BwoNymph,F.WoollyBugger],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger,F.BwoNymph],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.WoollyBugger,F.MidgePupa],[F.MidgeLarva,F.ArticulatedLeech],[F.MidgeLarva,F.ArticulatedLeech]],
    'Cascade Reservoir': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.WoollyBugger],[F.Callibaetis,F.ZebraMidge],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ZebraMidge],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger,F.ArticulatedLeech],[F.Callibaetis,F.MidgePupa],[F.DrunkDisorderly,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Magic Reservoir': [[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud],[F.MidgePupa,F.Callibaetis],[F.Callibaetis,F.ZebraMidge,F.Scud],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ZebraMidge],[F.Callibaetis,F.WoollyBugger,F.ArticulatedLeech],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.MidgePupa,F.WoollyBugger],[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud]],
    'Lucky Peak Reservoir': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.WoollyBugger],[F.MidgePupa,F.Callibaetis],[F.BwoNymph,F.Callibaetis,F.CircusPeanut],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger,F.BwoNymph],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.DrunkDisorderly,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Anderson Ranch Reservoir': [[F.MidgeLarva,F.ArticulatedLeech],[F.MidgeLarva,F.ArticulatedLeech],[F.MidgePupa,F.WoollyBugger],[F.Callibaetis,F.BwoNymph,F.WoollyBugger],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger,F.BwoNymph],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.DrunkDisorderly,F.WoollyBugger],[F.MidgeLarva,F.ArticulatedLeech],[F.MidgeLarva,F.ArticulatedLeech]],
  },
  WY: {
    'Fremont Lake': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger],[F.BwoNymph,F.Callibaetis,F.Slumpbuster],[F.Callibaetis,F.BwoNymph,F.CircusPeanut],[F.Callibaetis,F.WoollyBugger],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.WoollyBugger,F.MidgePupa],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Boysen Reservoir': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger],[F.BwoNymph,F.Callibaetis,F.Slumpbuster],[F.Callibaetis,F.BwoNymph,F.CircusPeanut],[F.Callibaetis,F.WoollyBugger],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.DrunkDisorderly,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Buffalo Bill Reservoir': [[F.MidgeLarva,F.ArticulatedLeech],[F.MidgeLarva,F.ArticulatedLeech],[F.MidgePupa,F.WoollyBugger],[F.Callibaetis,F.BwoNymph,F.WoollyBugger],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.BwoNymph,F.CircusPeanut],[F.Callibaetis,F.WoollyBugger],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.DrunkDisorderly,F.MidgePupa],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.ArticulatedLeech]],
    'Flaming Gorge (WY)': [[F.MidgeLarva,F.Slumpbuster],[F.MidgeLarva,F.Slumpbuster],[F.MidgePupa,F.WoollyBugger],[F.MidgePupa,F.Callibaetis,F.WoollyBugger],[F.BwoNymph,F.Callibaetis,F.ArticulatedLeech],[F.BwoNymph,F.Callibaetis,F.CircusPeanut],[F.Callibaetis,F.WoollyBugger,F.Scud],[F.Callibaetis,F.ArticulatedLeech,F.Hopper],[F.CircusPeanut,F.Callibaetis,F.MidgePupa],[F.DrunkDisorderly,F.MidgePupa],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Ocean Lake': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.WoollyBugger],[F.Callibaetis,F.ZebraMidge],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger,F.BwoNymph],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.WoollyBugger,F.MidgePupa],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
  },
  MT: {
    'Flathead Lake': [[F.MidgeLarva,F.ArticulatedLeech],[F.MidgeLarva,F.ArticulatedLeech],[F.MidgePupa,F.WoollyBugger],[F.Callibaetis,F.BwoNymph,F.WoollyBugger],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.BwoNymph,F.CircusPeanut],[F.Callibaetis,F.WoollyBugger],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.DrunkDisorderly,F.MidgePupa],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.ArticulatedLeech]],
    'Hebgen Lake': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.WoollyBugger],[F.Callibaetis,F.ZebraMidge],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ZebraMidge],[F.Callibaetis,F.ArticulatedLeech,F.ZebraMidge],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.WoollyBugger,F.MidgePupa],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Canyon Ferry Lake': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.WoollyBugger],[F.Callibaetis,F.ZebraMidge],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ZebraMidge],[F.Callibaetis,F.ArticulatedLeech,F.BwoNymph],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.DrunkDisorderly,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Fort Peck Reservoir': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger],[F.BwoNymph,F.Callibaetis,F.ArticulatedLeech],[F.Callibaetis,F.BwoNymph,F.CircusPeanut],[F.Callibaetis,F.WoollyBugger],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.DrunkDisorderly,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Holter Lake': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.WoollyBugger],[F.Callibaetis,F.ZebraMidge],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ZebraMidge],[F.Callibaetis,F.ArticulatedLeech,F.ZebraMidge],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.WoollyBugger,F.MidgePupa],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
  },
  CO: {
    'Blue Mesa Reservoir': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.ArticulatedLeech],[F.Callibaetis,F.BwoNymph,F.WoollyBugger],[F.Callibaetis,F.BwoNymph,F.Slumpbuster],[F.Callibaetis,F.BwoNymph,F.CircusPeanut],[F.Callibaetis,F.WoollyBugger],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.DrunkDisorderly,F.MidgePupa],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Spinney Mountain Reservoir': [[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud],[F.MidgePupa,F.Callibaetis],[F.Callibaetis,F.ZebraMidge],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ZebraMidge],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger],[F.Callibaetis,F.ArticulatedLeech],[F.MidgePupa,F.WoollyBugger],[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud]],
    'Eleven Mile Reservoir': [[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud],[F.MidgePupa,F.Callibaetis],[F.Callibaetis,F.ZebraMidge,F.Scud],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ZebraMidge],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger,F.Scud],[F.Callibaetis,F.MidgePupa,F.ArticulatedLeech],[F.MidgePupa,F.WoollyBugger,F.Scud],[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud]],
    'Cheesman Reservoir': [[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud],[F.MidgePupa,F.Callibaetis],[F.Callibaetis,F.ZebraMidge,F.Scud],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ZebraMidge],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger,F.ZebraMidge],[F.Callibaetis,F.ArticulatedLeech,F.MidgePupa],[F.MidgePupa,F.WoollyBugger,F.Scud],[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud]],
    'Williams Fork Reservoir': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger],[F.BwoNymph,F.Callibaetis,F.Slumpbuster],[F.Callibaetis,F.BwoNymph,F.CircusPeanut],[F.Callibaetis,F.WoollyBugger],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.DrunkDisorderly,F.MidgePupa],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Georgetown Reservoir': [[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud],[F.MidgePupa,F.Callibaetis],[F.Callibaetis,F.ZebraMidge,F.Scud],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ZebraMidge],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger,F.Scud],[F.Callibaetis,F.MidgePupa,F.ArticulatedLeech],[F.BwoEmerger,F.MidgePupa,F.WoollyBugger],[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud]],
  },
  OR: {
    'Crane Prairie Reservoir': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.ArticulatedLeech],[F.Callibaetis,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.BwoNymph,F.CircusPeanut],[F.Callibaetis,F.WoollyBugger],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.WoollyBugger,F.MidgePupa],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Wickiup Reservoir': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.WoollyBugger],[F.Callibaetis,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.BwoNymph,F.CircusPeanut],[F.Callibaetis,F.WoollyBugger],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.WoollyBugger,F.MidgePupa],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Davis Lake': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.Callibaetis],[F.Callibaetis,F.ZebraMidge],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ZebraMidge],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger,F.ZebraMidge],[F.Callibaetis,F.MidgePupa,F.ArticulatedLeech],[F.MidgePupa,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Suttle Lake': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.WoollyBugger],[F.MidgePupa,F.Callibaetis],[F.BwoNymph,F.Callibaetis,F.ArticulatedLeech],[F.Callibaetis,F.BwoNymph,F.CircusPeanut],[F.Callibaetis,F.WoollyBugger,F.BwoNymph],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.WoollyBugger,F.MidgePupa],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Lake Billy Chinook': [[F.MidgeLarva,F.ArticulatedLeech],[F.MidgeLarva,F.ArticulatedLeech],[F.MidgePupa,F.WoollyBugger],[F.Callibaetis,F.BwoNymph,F.WoollyBugger],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.BwoNymph,F.CircusPeanut],[F.Callibaetis,F.WoollyBugger],[F.Callibaetis,F.ArticulatedLeech],[F.CircusPeanut,F.MidgePupa],[F.DrunkDisorderly,F.WoollyBugger],[F.MidgeLarva,F.ArticulatedLeech],[F.MidgeLarva,F.ArticulatedLeech]],
  },
  WA: {
    'Lake Lenice': [[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud],[F.MidgePupa,F.Callibaetis],[F.Callibaetis,F.ZebraMidge],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ZebraMidge],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger],[F.Callibaetis,F.ArticulatedLeech],[F.MidgePupa,F.WoollyBugger],[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud]],
    'Lake Nunnally': [[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud],[F.MidgePupa,F.Callibaetis],[F.Callibaetis,F.ZebraMidge,F.Scud],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ZebraMidge],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger,F.ZebraMidge],[F.Callibaetis,F.MidgePupa,F.ArticulatedLeech],[F.MidgePupa,F.WoollyBugger,F.Scud],[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud]],
    'Chopaka Lake': [[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgePupa,F.Callibaetis],[F.Callibaetis,F.ZebraMidge],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ZebraMidge],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger,F.ArticulatedLeech],[F.Callibaetis,F.MidgePupa],[F.MidgePupa,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
    'Dry Falls Lake': [[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud],[F.MidgePupa,F.Callibaetis],[F.Callibaetis,F.ZebraMidge,F.Scud],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ZebraMidge],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger,F.ZebraMidge],[F.Callibaetis,F.MidgePupa,F.ArticulatedLeech],[F.MidgePupa,F.WoollyBugger,F.Scud],[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud]],
    'Rocky Ford Creek': [[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud],[F.MidgePupa,F.Callibaetis],[F.Callibaetis,F.ZebraMidge,F.Scud],[F.Callibaetis,F.ZebraMidge,F.BwoNymph],[F.Callibaetis,F.BwoNymph,F.ZebraMidge],[F.Callibaetis,F.BwoNymph,F.ArticulatedLeech],[F.Callibaetis,F.WoollyBugger,F.ZebraMidge],[F.Callibaetis,F.MidgePupa,F.ArticulatedLeech],[F.MidgePupa,F.Scud,F.WoollyBugger],[F.MidgeLarva,F.Scud],[F.MidgeLarva,F.Scud]],
  },
};

/* Normalise a fly name to a FLY_INFO key (strip size suffixes like "#20") */
function normalizeFlyName(name) {
  if (!name) return name;
  const base = name.replace(/\s*#\d+.*$/, '').replace(/\s*\(Large\)$|\s*\(Small\)$|\s*\(Olive\)$|\s*\(Dry\)$|\s*\(Tiny Dry\)$/, '').trim();
  return FLY_INFO[name] ? name : base;
}

const H = {
  UT:{
    rivers:['Provo River','Green River','Logan River','Strawberry River','Weber River','Fremont River','Duchesne River','Diamond Fork','Sixth Water Creek'],
    data:{
      'Provo River':[[F.ZebraMidge,F.Perdigon,F.Slumpbuster],[F.ZebraMidge,F.Frenchie,{t:'s',n:"Pat's Rubber Legs"}],[F.BwoNymph,F.SkwalaStone,{t:'e',n:"Jig Hare's Ear"},F.WoollyBugger],[F.BwoEmerger,F.SkwalaStone,F.RainbowWarrior,F.PheasantTail],[F.SalmonflyNymph,F.CaddisLarva,F.Blowtorch,F.Slumpbuster],[F.Stimulator,F.PmdNymph,{t:'e',n:"Walt's Worm"},F.ArticulatedLeech],[F.PmdSparkleDun,F.YellowSally,F.Perdigon,F.Trico],[F.Trico,F.ChubbyChernobyl,F.SoftHackleCaddis,F.WoollyBugger],[F.BwoDry,{t:'e',n:"Jig Hare's Ear"},F.CircusPeanut,F.OctoberCaddis],[F.BwoEmerger,F.Frenchie,F.DrunkDisorderly,F.OctoberCaddis],[F.ZebraMidge,F.Blowtorch,F.Slumpbuster],[F.ZebraMidge,F.Perdigon,F.WoollyBugger]],
      'Green River':[[F.ZebraMidge,F.RainbowWarrior,F.WoollyBugger],[F.MidgeLarva,F.Perdigon,{t:'s',n:"Pat's Rubber Legs"}],[F.BwoNymph,F.Frenchie,{t:'s',n:"Kaufmann's Stone"},F.Slumpbuster],[F.BwoRs2,F.SkwalaStone,F.Blowtorch,F.PheasantTail],[F.SalmonflyNymph,F.CaddisLarva,{t:'e',n:"Jig Hare's Ear"},F.Slumpbuster],[F.Stimulator,F.PmdNymph,F.SanJuanWorm,F.Perdigon],[F.PmdDry,F.YellowSally,{t:'e',n:"Walt's Worm"},F.Trico],[F.Trico,F.ChubbyChernobyl,F.RainbowWarrior,F.WoollyBugger],[F.BwoDry,F.Frenchie,F.CircusPeanut,F.OctoberCaddis],[F.BwoEmerger,F.Blowtorch,F.Slumpbuster,F.CaddisPupa],[F.ZebraMidge,F.Perdigon,F.ArticulatedLeech],[F.ZebraMidge,F.RainbowWarrior,F.WoollyBugger]],
      'Logan River':[[F.ZebraMidge,F.Frenchie,F.WoollyBugger],[F.MidgeLarva,{t:'e',n:"Jig Hare's Ear"},F.Slumpbuster],[F.SkwalaNymph,F.BwoNymph,F.Perdigon],[F.SkwalaStone,F.BwoRs2,F.Blowtorch,F.Slumpbuster],[F.SalmonflyNymph,F.ElkHairCaddis,{t:'e',n:"Walt's Worm"}],[F.Stimulator,F.PmdNymph,{t:'e',n:"Jig Hare's Ear"},F.CircusPeanut],[F.PmdDry,F.YellowSally,F.RainbowWarrior,F.Ant],[F.ChubbyChernobyl,F.Trico,F.Frenchie,F.WoollyBugger],[F.BwoDry,F.OctoberCaddis,F.Perdigon,F.Slumpbuster],[F.BwoEmerger,F.Blowtorch,F.ArticulatedLeech],[F.ZebraMidge,{t:'e',n:"Jig Hare's Ear"},F.WoollyBugger],[F.ZebraMidge,F.Frenchie]],
      'Weber River':[[F.ZebraMidge,F.WoollyBugger],[F.MidgeLarva,F.Frenchie,F.Slumpbuster],[F.BwoNymph,F.SkwalaNymph,F.Perdigon],[F.SkwalaStone,F.BwoRs2,F.Blowtorch,F.Slumpbuster],[F.StoneflyNymph,F.CaddisLarva,{t:'e',n:'Elk Hair Caddis'},F.CircusPeanut],[F.PmdNymph,F.ElkHairCaddis,{t:'e',n:"Walt's Worm"},F.ArticulatedLeech],[F.PmdSparkleDun,F.YellowSally,F.RainbowWarrior,F.Ant],[F.Hopper,F.Trico,F.Frenchie,F.WoollyBugger],[F.BwoDry,F.OctoberCaddis,F.Perdigon,F.Slumpbuster],[F.BwoEmerger,F.Blowtorch,F.ArticulatedLeech],[F.ZebraMidge,F.Frenchie,F.WoollyBugger],[F.ZebraMidge,F.Perdigon]],
      'Strawberry River':[[F.MidgeLarva,F.WoollyBugger],[F.ZebraMidge,F.Frenchie,F.Slumpbuster],[F.BwoNymph,{t:'e',n:"Jig Hare's Ear"},{t:'s',n:"Pat's Rubber Legs"}],[F.SkwalaStone,F.BwoRs2,F.Perdigon,F.Slumpbuster],[F.Salmonfly,F.CaddisLarva,{t:'e',n:"Walt's Worm"}],[F.Stimulator,F.Pmd,F.Blowtorch,F.ArticulatedLeech],[F.PmdDry,F.YellowSally,F.RainbowWarrior,{t:'n',n:'Hopper (Dry)'}],[F.ChubbyChernobyl,F.Trico,F.Frenchie,F.CircusPeanut],[F.BwoDry,{t:'e',n:"Jig Hare's Ear"},F.Slumpbuster],[F.BwoEmerger,F.Blowtorch,F.WoollyBugger],[F.ZebraMidge,F.Perdigon],[F.MidgeLarva,F.WoollyBugger]],
      'Fremont River':[[F.WoollyBugger,F.MidgeLarva],[F.ZebraMidge,F.Frenchie],[{t:'s',n:"Pat's Rubber Legs"},F.CaddisLarva,{t:'e',n:"Jig Hare's Ear"}],[F.SkwalaNymph,F.PheasantTail,F.Slumpbuster],[F.Salmonfly,{t:'n',n:'Caddis Pupa'},F.Perdigon],[F.Stimulator,F.PmdNymph,F.CircusPeanut],[F.PmdDry,F.YellowSally,{t:'e',n:"Walt's Worm"},F.Hopper],[F.ChubbyChernobyl,F.Ant,F.WoollyBugger],[{t:'n',n:'October Caddis'},F.Frenchie,F.Slumpbuster],[F.BwoNymph,F.Blowtorch,F.ArticulatedLeech],[F.ZebraMidge,{t:'e',n:"Jig Hare's Ear"}],[F.WoollyBugger,F.MidgeLarva]],
      'Duchesne River':[[F.MidgeLarva,F.WoollyBugger],[F.ZebraMidge,F.Frenchie,F.Slumpbuster],[F.BwoNymph,F.SkwalaNymph,F.Perdigon],[F.SkwalaStone,F.PheasantTail,F.Blowtorch,F.Slumpbuster],[F.StoneflyNymph,F.CaddisLarva,{t:'e',n:'Elk Hair Caddis'},F.CircusPeanut],[F.PmdNymph,F.Stimulator,{t:'e',n:"Walt's Worm"},F.ArticulatedLeech],[F.PmdDry,F.YellowSally,F.RainbowWarrior,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.Frenchie,F.WoollyBugger],[F.BwoDry,F.OctoberCaddis,F.Perdigon,F.Slumpbuster],[F.BwoEmerger,F.Blowtorch,F.ArticulatedLeech],[F.ZebraMidge,F.Frenchie,F.WoollyBugger],[F.MidgeLarva,F.Slumpbuster]],

      'Diamond Fork':[[F.MidgeLarva,F.WoollyBugger],[F.ZebraMidge,F.Frenchie],[F.BwoNymph,F.BwoRs2,F.Slumpbuster],[F.BwoNymph,F.PheasantTail,F.Blowtorch,F.Slumpbuster],[F.CaddisLarva,{t:'e',n:'Elk Hair Caddis'},F.CircusPeanut],[F.PmdNymph,F.ElkHairCaddis,{t:'e',n:"Walt's Worm"},F.ArticulatedLeech],[F.PmdSparkleDun,F.YellowSally,F.RainbowWarrior,F.Ant],[F.Hopper,F.Trico,F.Perdigon,F.WoollyBugger],[F.BwoDry,F.OctoberCaddis,F.Frenchie,F.Slumpbuster],[F.BwoEmerger,F.Blowtorch,F.ArticulatedLeech],[F.ZebraMidge,F.BwoRs2,F.WoollyBugger],[F.MidgeLarva,F.Frenchie]],

      'Sixth Water Creek':[[F.MidgeLarva,F.WoollyBugger],[F.ZebraMidge,F.Frenchie],[F.BwoNymph,F.BwoRs2,F.Slumpbuster],[F.BwoNymph,F.PheasantTail,F.Perdigon],[{t:'n',n:'Caddis Pupa'},{t:'e',n:'Elk Hair Caddis'},F.CircusPeanut],[F.Stimulator,F.CaddisLarva,{t:'e',n:"Walt's Worm"}],[{t:'s',n:'PMD (Dry)'},{t:'n',n:'Yellow Sally'},F.RainbowWarrior,{t:'s',n:'Ant (Dry)'}],[F.ChubbyChernobyl,F.Trico,F.Frenchie,{t:'s',n:'Hopper'}],[F.BwoDry,F.OctoberCaddis,F.Perdigon],[F.BwoEmerger,F.BwoRs2,F.WoollyBugger],[F.ZebraMidge,F.Frenchie],[F.MidgeLarva,F.Slumpbuster]],
    }
  },
  ID:{
    rivers:['South Fork Snake',"Henry's Fork",'Teton River','Boise River','Big Wood River','Silver Creek','Salmon River','Clearwater River'],
    data:{
      "South Fork Snake":[[F.WoollyBugger,F.ZebraMidge,F.Perdigon],[F.MidgeLarva,F.Frenchie,F.Slumpbuster],[F.SkwalaNymph,F.BwoNymph,{t:'e',n:"Jig Hare's Ear"},F.Slumpbuster],[F.SkwalaStone,F.BwoRs2,F.Blowtorch,F.CircusPeanut],[F.SalmonflyNymph,F.CaddisLarva,{t:'e',n:"Walt's Worm"},F.ArticulatedLeech],[F.Salmonfly,F.Stimulator,F.PmdNymph,F.Perdigon],[F.PmdDry,F.YellowSally,F.RainbowWarrior,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.Frenchie,F.DrunkDisorderly],[{t:'n',n:'October Caddis'},F.CaddisPupa,{t:'e',n:"Jig Hare's Ear"},F.CircusPeanut],[F.BwoEmerger,F.Blowtorch,F.Slumpbuster,F.OctoberCaddis],[F.ZebraMidge,F.Perdigon,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger,F.Frenchie]],
      "Henry's Fork":[[F.ZebraMidge,F.RainbowWarrior,F.WoollyBugger],[F.ZebraMidge,F.Frenchie,F.Slumpbuster],[F.BwoNymph,F.SkwalaNymph,{t:'e',n:"Jig Hare's Ear"}],[F.SkwalaStone,F.Callibaetis,F.Blowtorch,F.Slumpbuster],[F.Salmonfly,F.PmdNymph,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.Stimulator,F.PmdDry,F.Callibaetis,F.Perdigon],[F.PmdSparkleDun,F.YellowSally,F.RainbowWarrior,F.Trico],[F.Trico,F.ChubbyChernobyl,F.Callibaetis,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.Frenchie,F.DrunkDisorderly,F.BrownDrake],[F.BwoEmerger,F.Blowtorch,F.WoollyBugger],[F.ZebraMidge,F.Perdigon,F.Slumpbuster],[F.MidgeLarva,{t:'e',n:"Jig Hare's Ear"},F.WoollyBugger]],
      'Teton River':[[F.WoollyBugger,F.MidgeLarva],[F.ZebraMidge,F.Perdigon],[{t:'s',n:"Pat's Rubber Legs"},F.BwoNymph,F.Frenchie],[F.SkwalaStone,F.PheasantTail,F.Slumpbuster],[F.SalmonflyNymph,F.ElkHairCaddis,{t:'e',n:"Walt's Worm"}],[F.Stimulator,F.Pmd,F.CircusPeanut,{t:'e',n:"Jig Hare's Ear"}],[F.PmdDry,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.Frenchie,F.DrunkDisorderly],[F.BwoEmerger,F.RainbowWarrior,F.WoollyBugger],[F.ZebraMidge,F.Slumpbuster],[F.MidgeLarva,F.WoollyBugger]],
      'Boise River':[[F.ZebraMidge,F.Frenchie,F.WoollyBugger],[F.MidgeLarva,F.Perdigon,F.Slumpbuster],[F.SkwalaNymph,F.BwoNymph,{t:'e',n:"Jig Hare's Ear"}],[F.SkwalaStone,{t:'n',n:'Caddis Pupa'},F.Blowtorch,F.Slumpbuster],[F.Salmonfly,F.SoftHackleCaddis,{t:'e',n:"Walt's Worm"}],[F.Stimulator,F.PmdNymph,F.CircusPeanut],[F.PmdDry,F.YellowSally,F.RainbowWarrior,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.DrunkDisorderly],[{t:'n',n:'October Caddis'},F.Frenchie,F.Slumpbuster],[F.BwoEmerger,F.Blowtorch,F.ArticulatedLeech],[F.ZebraMidge,{t:'e',n:"Jig Hare's Ear"}],[F.MidgeLarva,F.WoollyBugger]],
      'Big Wood River':[[F.WoollyBugger,F.ZebraMidge],[F.MidgeLarva,F.Frenchie],[{t:'s',n:"Pat's Rubber Legs"},F.BwoNymph,F.Perdigon],[F.SkwalaStone,F.CaddisLarva,F.Slumpbuster],[F.SalmonflyNymph,F.ElkHairCaddis,{t:'e',n:"Jig Hare's Ear"}],[F.Stimulator,F.Pmd,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.PmdDry,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.RainbowWarrior,F.DrunkDisorderly],[F.BwoEmerger,F.Frenchie,F.WoollyBugger],[F.ZebraMidge,F.Perdigon],[F.MidgeLarva,F.WoollyBugger]],
      'Silver Creek':[[F.MidgeLarva,F.Perdigon],[F.ZebraMidge,F.RainbowWarrior],[F.BwoNymph,F.Frenchie,F.PheasantTail],[F.BwoRs2,F.Callibaetis,F.OliveSculpin],[F.PmdNymph,F.CaddisLarva,{t:'e',n:"Jig Hare's Ear"}],[F.PmdSparkleDun,F.Callibaetis,{t:'e',n:"Walt's Worm"}],[F.PmdDry,F.Trico,F.Blowtorch,{t:'n',n:'Damsel Nymph'}],[F.Trico,F.Callibaetis,F.WoollyBugger],[{t:'n',n:'October Caddis'},F.BwoDry,F.Frenchie],[F.BwoEmerger,F.RainbowWarrior,F.Slumpbuster],[F.ZebraMidge,F.Perdigon],[F.MidgeLarva,{t:'e',n:"Jig Hare's Ear"}]],
      'Salmon River':[[F.WoollyBugger,F.StoneflyNymph],[F.MidgeLarva,F.Frenchie],[F.SkwalaNymph,F.BwoNymph,F.Perdigon],[F.SkwalaStone,F.PheasantTail,F.Slumpbuster],[F.SalmonflyNymph,F.ElkHairCaddis,{t:'e',n:"Jig Hare's Ear"}],[F.Salmonfly,F.Stimulator,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.PmdDry,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.RainbowWarrior,F.DrunkDisorderly],[F.BwoEmerger,F.Frenchie,F.WoollyBugger],[F.ZebraMidge,F.Perdigon],[F.WoollyBugger,F.MidgeLarva]],
      'Clearwater River':[[F.WoollyBugger,F.StoneflyNymph],[F.CaddisLarva,F.Slumpbuster],[F.SkwalaNymph,F.BwoNymph,F.Frenchie],[F.SkwalaStone,F.PheasantTail,F.CircusPeanut],[F.SalmonflyNymph,F.ElkHairCaddis,{t:'e',n:"Walt's Worm"}],[F.Stimulator,F.PmdNymph,F.Slumpbuster],[F.PmdDry,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.RainbowWarrior,F.DrunkDisorderly],[F.BwoEmerger,F.Perdigon,F.WoollyBugger],[F.ZebraMidge,F.StoneflyNymph],[F.WoollyBugger,F.CaddisLarva]],
    }
  },
  WY:{
    rivers:['Snake River (WY)','Green River (WY)','North Platte River','Hoback River',"Ham's Fork",'Wind River','Shoshone River','Greys River','Yellowstone River (WY)'],
    data:{
      'Green River (WY)':[[F.WoollyBugger,F.MidgeLarva,F.Perdigon],[F.ZebraMidge,F.Frenchie,F.Slumpbuster],[{t:'s',n:"Pat's Rubber Legs"},F.BwoNymph,{t:'e',n:"Jig Hare's Ear"}],[F.SkwalaStone,F.BwoRs2,F.Blowtorch,F.Slumpbuster],[F.SalmonflyNymph,F.CaddisLarva,{t:'e',n:"Walt's Worm"},F.ArticulatedLeech],[F.Salmonfly,F.Stimulator,F.PmdNymph,F.Perdigon],[F.PmdSparkleDun,F.YellowSally,F.RainbowWarrior,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.Frenchie,F.CircusPeanut],[{t:'n',n:'October Caddis'},{t:'e',n:"Jig Hare's Ear"},F.DrunkDisorderly],[F.BwoEmerger,F.Blowtorch,F.WoollyBugger],[F.ZebraMidge,F.Perdigon,F.Slumpbuster],[F.MidgeLarva,F.WoollyBugger,F.RainbowWarrior]],
      'Snake River (WY)':[[F.WoollyBugger,F.ZebraMidge],[F.MidgeLarva,F.Frenchie],[{t:'s',n:"Pat's Rubber Legs"},F.PheasantTail,{t:'e',n:"Jig Hare's Ear"}],[F.SkwalaNymph,F.BwoEmerger,F.Slumpbuster],[F.SalmonflyNymph,{t:'n',n:'Caddis Pupa'},F.Perdigon],[F.Stimulator,F.PmdNymph,F.CircusPeanut,{t:'e',n:"Walt's Worm"}],[F.PmdDry,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.Frenchie,F.DrunkDisorderly],[F.BwoNymph,F.RainbowWarrior,F.WoollyBugger],[F.ZebraMidge,F.Slumpbuster],[F.MidgeLarva,F.WoollyBugger]],
      'Hoback River':[[F.WoollyBugger,F.MidgeLarva],[F.ZebraMidge,F.Perdigon],[{t:'s',n:"Pat's Rubber Legs"},F.BwoNymph],[F.SkwalaStone,F.PheasantTail,F.Slumpbuster],[F.Salmonfly,F.ElkHairCaddis,{t:'e',n:"Jig Hare's Ear"}],[F.Stimulator,F.Pmd,F.Frenchie,F.Slumpbuster],[F.PmdDry,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.CircusPeanut],[{t:'n',n:'October Caddis'},{t:'e',n:"Walt's Worm"},F.ArticulatedLeech],[F.BwoEmerger,F.RainbowWarrior,F.WoollyBugger],[F.ZebraMidge,F.Frenchie],[F.MidgeLarva,F.WoollyBugger]],
      'North Platte River':[[F.MidgeLarva,F.ZebraMidge,F.WoollyBugger],[F.ZebraMidge,F.Perdigon,F.Slumpbuster],[F.BwoNymph,{t:'s',n:"Pat's Rubber Legs"},F.Frenchie],[F.SkwalaStone,F.PheasantTail,F.Slumpbuster],[F.SalmonflyNymph,F.CaddisLarva,{t:'e',n:"Jig Hare's Ear"}],[F.Stimulator,F.PmdNymph,F.Blowtorch,F.CircusPeanut],[F.PmdSparkleDun,F.YellowSally,F.RainbowWarrior,F.Hopper],[F.ChubbyChernobyl,F.Trico,{t:'e',n:"Walt's Worm"},F.DrunkDisorderly],[{t:'n',n:'October Caddis'},F.Frenchie,F.ArticulatedLeech],[F.BwoEmerger,F.Blowtorch,F.Slumpbuster],[F.ZebraMidge,F.Perdigon],[F.MidgeLarva,F.WoollyBugger]],
      'Shoshone River':[[F.WoollyBugger,F.MidgeLarva],[F.ZebraMidge,F.Frenchie],[{t:'s',n:"Pat's Rubber Legs"},F.PheasantTail],[F.SkwalaNymph,F.BwoNymph,F.Slumpbuster],[F.Salmonfly,{t:'n',n:'Caddis Pupa'},F.Perdigon],[F.Stimulator,F.Pmd,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.PmdDry,F.YellowSally,{t:'e',n:"Jig Hare's Ear"},F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.Blowtorch,F.DrunkDisorderly],[F.BwoEmerger,F.RainbowWarrior,F.WoollyBugger],[F.ZebraMidge,F.Frenchie],[F.WoollyBugger,F.MidgeLarva]],
      'Yellowstone River (WY)':[[F.WoollyBugger,F.MidgeLarva],[F.ZebraMidge,F.Perdigon],[{t:'s',n:"Pat's Rubber Legs"},F.BwoNymph,{t:'e',n:"Jig Hare's Ear"}],[F.SkwalaNymph,F.CaddisLarva,F.Slumpbuster],[F.SalmonflyNymph,F.ElkHairCaddis,F.Frenchie],[F.Salmonfly,F.Pmd,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.PmdSparkleDun,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.DrunkDisorderly],[{t:'n',n:'October Caddis'},F.RainbowWarrior,F.ArticulatedLeech],[F.BwoEmerger,F.Frenchie,F.Slumpbuster],[F.ZebraMidge,F.Perdigon,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
      'Wind River':[[F.WoollyBugger,F.MidgeLarva],[F.ZebraMidge,F.Perdigon],[{t:'s',n:"Pat's Rubber Legs"},F.BwoNymph,F.Frenchie],[F.SkwalaNymph,F.PheasantTail,F.Slumpbuster],[F.SalmonflyNymph,F.CaddisLarva,{t:'e',n:"Jig Hare's Ear"}],[F.Stimulator,F.Pmd,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.PmdDry,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.RainbowWarrior,F.WoollyBugger],[F.BwoEmerger,F.Frenchie,F.Slumpbuster],[F.ZebraMidge,F.Perdigon],[F.WoollyBugger,F.MidgeLarva]],
      "Ham's Fork":[[F.WoollyBugger,F.MidgeLarva],[F.ZebraMidge,F.Perdigon],[{t:'s',n:"Pat's Rubber Legs"},F.BwoNymph,F.Frenchie],[F.SkwalaNymph,F.PheasantTail,F.Slumpbuster],[F.Salmonfly,F.CaddisLarva,{t:'e',n:"Jig Hare's Ear"}],[F.Stimulator,F.Pmd,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.PmdDry,F.YellowSally,F.ElkHairCaddis,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.Blowtorch,F.DrunkDisorderly],[F.BwoEmerger,F.RainbowWarrior,F.WoollyBugger],[F.ZebraMidge,F.Frenchie],[F.WoollyBugger,F.MidgeLarva]],
      'Greys River':[[F.WoollyBugger,F.MidgeLarva],[F.ZebraMidge,F.Perdigon],[{t:'s',n:"Pat's Rubber Legs"},F.BwoNymph,F.Frenchie],[F.SkwalaNymph,F.PheasantTail,{t:'e',n:"Jig Hare's Ear"}],[F.SalmonflyNymph,F.CaddisLarva,F.Slumpbuster],[F.Salmonfly,F.Stimulator,F.PmdNymph,F.CircusPeanut],[F.PmdDry,F.YellowSally,F.ElkHairCaddis,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.Hopper,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.BwoEmerger,F.DrunkDisorderly],[F.BwoNymph,F.RainbowWarrior,F.WoollyBugger],[F.ZebraMidge,F.Frenchie,F.Slumpbuster],[F.MidgeLarva,F.WoollyBugger]],
    }
  },
  MT:{
    rivers:['Madison River','Yellowstone River','Bighorn River','Gallatin River','Missouri River','Clark Fork','Bitterroot River'],
    data:{
      'Madison River':[[F.ZebraMidge,F.RainbowWarrior,F.WoollyBugger],[F.ZebraMidge,F.Perdigon,F.Slumpbuster],[F.SkwalaNymph,F.BwoNymph,{t:'e',n:"Jig Hare's Ear"}],[F.SkwalaStone,F.BwoRs2,F.Blowtorch,F.Slumpbuster],[F.SalmonflyNymph,F.CaddisLarva,{t:'e',n:"Walt's Worm"},F.ArticulatedLeech],[F.Salmonfly,F.Stimulator,F.PmdNymph,F.Perdigon],[F.PmdSparkleDun,F.YellowSally,F.RainbowWarrior,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.Frenchie,F.CircusPeanut],[{t:'n',n:'October Caddis'},{t:'e',n:"Jig Hare's Ear"},F.DrunkDisorderly],[F.BwoEmerger,F.Blowtorch,F.WoollyBugger],[F.ZebraMidge,F.Perdigon,F.Slumpbuster],[F.MidgeLarva,F.WoollyBugger,F.RainbowWarrior]],
      'Bighorn River':[[F.ZebraMidge,F.Frenchie,F.WoollyBugger],[F.MidgeLarva,F.RainbowWarrior,F.Slumpbuster],[F.BwoNymph,F.Perdigon,F.SanJuanWorm],[F.BwoRs2,F.Blowtorch,F.PheasantTail,F.Slumpbuster],[F.PmdNymph,F.CaddisLarva,{t:'e',n:"Jig Hare's Ear"},F.ArticulatedLeech],[F.PmdDry,F.ElkHairCaddis,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.Trico,F.PmdSparkleDun,F.RainbowWarrior,F.SowBug],[F.Trico,F.Scud,F.Frenchie,F.DrunkDisorderly],[{t:'n',n:'October Caddis'},F.Blowtorch,F.WoollyBugger],[F.BwoEmerger,F.Perdigon,F.Slumpbuster],[F.ZebraMidge,{t:'e',n:"Jig Hare's Ear"},F.ArticulatedLeech],[F.ZebraMidge,F.Frenchie,F.WoollyBugger]],
      'Gallatin River':[[F.WoollyBugger,F.MidgeLarva],[F.ZebraMidge,F.Frenchie],[F.SkwalaNymph,F.BwoNymph,F.Perdigon],[F.SkwalaStone,{t:'n',n:'Caddis Pupa'},F.Slumpbuster],[F.Salmonfly,F.ElkHairCaddis,{t:'e',n:"Jig Hare's Ear"}],[F.Stimulator,F.Pmd,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.PmdDry,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.RainbowWarrior,F.DrunkDisorderly],[F.BwoEmerger,F.Frenchie,F.WoollyBugger],[F.ZebraMidge,F.Perdigon],[F.WoollyBugger,F.MidgeLarva]],
      'Missouri River':[[F.ZebraMidge,F.RainbowWarrior,F.WoollyBugger],[F.MidgeLarva,F.Perdigon,F.Slumpbuster],[F.BwoNymph,F.Frenchie,F.SanJuanWorm],[F.BwoRs2,F.Blowtorch,F.PheasantTail,F.Slumpbuster],[F.PmdNymph,F.CaddisLarva,{t:'e',n:"Jig Hare's Ear"}],[F.PmdDry,F.ElkHairCaddis,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.Trico,F.PmdSparkleDun,F.RainbowWarrior,F.Hopper],[F.Trico,F.Scud,F.Frenchie,F.DrunkDisorderly],[{t:'n',n:'October Caddis'},F.Blowtorch,F.ArticulatedLeech],[F.BwoEmerger,F.Perdigon,F.Slumpbuster],[F.ZebraMidge,{t:'e',n:"Jig Hare's Ear"}],[F.ZebraMidge,F.WoollyBugger,F.RainbowWarrior]],
      'Yellowstone River':[[F.WoollyBugger,F.MidgeLarva],[F.ZebraMidge,F.Frenchie],[{t:'s',n:"Pat's Rubber Legs"},F.BwoNymph,F.Perdigon],[F.SkwalaStone,F.PheasantTail,F.Slumpbuster],[F.SalmonflyNymph,F.CaddisLarva,{t:'e',n:"Jig Hare's Ear"}],[F.Salmonfly,F.Pmd,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.PmdSparkleDun,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.DrunkDisorderly],[{t:'n',n:'October Caddis'},F.RainbowWarrior,F.ArticulatedLeech],[F.BwoEmerger,F.Frenchie,F.Slumpbuster],[F.ZebraMidge,F.Perdigon,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
      'Clark Fork':[[F.WoollyBugger,F.MidgeLarva],[F.ZebraMidge,F.Perdigon],[{t:'s',n:"Pat's Rubber Legs"},F.BwoNymph,F.Frenchie],[F.SkwalaStone,{t:'n',n:'Caddis Pupa'},F.Slumpbuster],[F.Salmonfly,F.ElkHairCaddis,{t:'e',n:"Jig Hare's Ear"}],[F.Stimulator,F.Pmd,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.PmdDry,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.RainbowWarrior,F.DrunkDisorderly],[F.BwoEmerger,F.Frenchie,F.WoollyBugger],[F.ZebraMidge,F.Perdigon],[F.WoollyBugger,F.MidgeLarva]],
      'Bitterroot River':[[F.WoollyBugger,F.MidgeLarva],[F.ZebraMidge,F.Frenchie],[F.SkwalaNymph,F.BwoNymph,F.Perdigon],[F.SkwalaStone,F.PheasantTail,F.Slumpbuster],[F.SalmonflyNymph,F.ElkHairCaddis,{t:'e',n:"Jig Hare's Ear"}],[F.Salmonfly,F.Stimulator,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.PmdSparkleDun,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.RainbowWarrior,F.DrunkDisorderly],[F.BwoEmerger,F.Frenchie,F.WoollyBugger],[F.ZebraMidge,F.Perdigon],[F.WoollyBugger,F.MidgeLarva]],
    }
  },
  CO:{
    rivers:['Arkansas River','South Platte','Frying Pan River','Blue River','Roaring Fork','Cache la Poudre','Clear Creek','Eagle River','Vail River'],
    data:{
      'Arkansas River':[[F.ZebraMidge,F.Perdigon,F.WoollyBugger],[F.MidgeLarva,F.Frenchie,F.Slumpbuster],[F.BwoNymph,{t:'e',n:"Jig Hare's Ear"},F.SanJuanWorm],[F.PheasantTail,F.Blowtorch,F.Slumpbuster],[F.SalmonflyNymph,F.CaddisLarva,{t:'e',n:"Walt's Worm"}],[F.Stimulator,F.Pmd,F.Perdigon,F.CircusPeanut],[F.PmdDry,F.YellowSally,F.RainbowWarrior,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.Frenchie,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},{t:'e',n:"Jig Hare's Ear"},F.DrunkDisorderly],[F.BwoEmerger,F.Blowtorch,F.Slumpbuster],[F.ZebraMidge,F.Perdigon],[F.MidgeLarva,F.WoollyBugger]],
      'South Platte':[[F.ZebraMidge,F.RainbowWarrior,F.WoollyBugger],[F.MidgeLarva,F.Perdigon,F.Slumpbuster],[F.BwoNymph,F.Frenchie,{t:'n',n:'RS2'}],[F.BwoRs2,F.Blowtorch,F.PheasantTail,F.Slumpbuster],[F.PmdNymph,F.CaddisLarva,{t:'e',n:"Jig Hare's Ear"}],[F.PmdDry,F.ElkHairCaddis,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.PmdSparkleDun,F.YellowSally,F.RainbowWarrior,F.Hopper],[F.Trico,F.Scud,F.Frenchie,F.DrunkDisorderly],[{t:'n',n:'October Caddis'},F.Blowtorch,F.ArticulatedLeech],[F.BwoEmerger,F.Perdigon,F.Slumpbuster],[F.ZebraMidge,{t:'e',n:"Jig Hare's Ear"}],[F.ZebraMidge,F.WoollyBugger]],
      'Frying Pan River':[[F.MidgeLarva,F.Perdigon,F.WoollyBugger],[F.ZebraMidge,F.RainbowWarrior],[F.BwoNymph,F.Frenchie,{t:'n',n:'RS2'}],[F.BwoRs2,F.Blowtorch,F.MidgePupa],[F.PmdNymph,F.Scud,{t:'e',n:"Jig Hare's Ear"}],[F.PmdDry,{t:'n',n:'Caddis Dry'},{t:'e',n:"Walt's Worm"},F.Slumpbuster],[F.PmdSparkleDun,F.Trico,F.RainbowWarrior,F.Hopper],[F.Trico,F.Scud,F.Frenchie,F.WoollyBugger],[{t:'n',n:'October Caddis'},F.Blowtorch,F.CircusPeanut],[F.BwoEmerger,F.Perdigon,F.ArticulatedLeech],[F.ZebraMidge,{t:'e',n:"Jig Hare's Ear"}],[F.MidgeLarva,F.WoollyBugger]],
      'Blue River':[[F.ZebraMidge,F.Frenchie,F.WoollyBugger],[F.MidgeLarva,F.Perdigon],[F.BwoNymph,{t:'e',n:"Jig Hare's Ear"},F.SanJuanWorm],[F.PheasantTail,F.Blowtorch,F.Slumpbuster],[F.Scud,F.CaddisLarva,{t:'e',n:"Walt's Worm"}],[F.PmdNymph,F.ElkHairCaddis,F.CircusPeanut],[F.PmdDry,F.YellowSally,F.RainbowWarrior,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.Frenchie,F.DrunkDisorderly],[F.BwoEmerger,F.Blowtorch,F.WoollyBugger],[F.ZebraMidge,F.Perdigon],[F.MidgeLarva,F.WoollyBugger]],
      'Roaring Fork':[[F.WoollyBugger,F.MidgeLarva],[F.ZebraMidge,F.Perdigon],[F.SkwalaNymph,F.BwoNymph,F.Frenchie],[F.SkwalaStone,F.PheasantTail,F.Slumpbuster],[F.Salmonfly,{t:'n',n:'Caddis Pupa'},{t:'e',n:"Jig Hare's Ear"}],[F.Stimulator,F.Pmd,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.PmdDry,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.RainbowWarrior,F.DrunkDisorderly],[F.BwoEmerger,F.Frenchie,F.WoollyBugger],[F.ZebraMidge,F.Perdigon],[F.WoollyBugger,F.MidgeLarva]],
      'Cache la Poudre':[[F.WoollyBugger,F.MidgeLarva],[F.ZebraMidge,F.Frenchie],[F.SkwalaNymph,F.BwoNymph,F.Perdigon],[F.SkwalaStone,F.CaddisLarva,F.Slumpbuster],[F.Salmonfly,F.ElkHairCaddis,{t:'e',n:"Jig Hare's Ear"}],[F.Stimulator,F.Pmd,{t:'e',n:"Walt's Worm"},F.Slumpbuster],[F.PmdDry,F.YellowSally,F.RainbowWarrior,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.CircusPeanut],[{t:'n',n:'October Caddis'},F.Blowtorch,F.ArticulatedLeech],[F.BwoEmerger,F.Frenchie,F.DrunkDisorderly],[F.ZebraMidge,F.Perdigon],[F.WoollyBugger,F.MidgeLarva]],
      'Clear Creek':[[F.ZebraMidge,F.Perdigon,F.WoollyBugger],[F.MidgeLarva,F.Perdigon,F.Slumpbuster],[F.BwoNymph,F.Frenchie,{t:'n',n:'RS2'}],[F.BwoRs2,F.Blowtorch,F.PheasantTail,F.Slumpbuster],[F.CaddisLarva,{t:'e',n:"Jig Hare's Ear"},F.SanJuanWorm],[F.ElkHairCaddis,F.PmdNymph,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.PmdDry,F.YellowSally,F.RainbowWarrior,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.Frenchie,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.Blowtorch,F.DrunkDisorderly],[F.BwoEmerger,F.Perdigon,F.WoollyBugger],[F.ZebraMidge,{t:'e',n:"Jig Hare's Ear"}],[F.MidgeLarva,F.WoollyBugger]],
      'Eagle River':[[F.ZebraMidge,F.Perdigon,F.WoollyBugger],[F.MidgeLarva,F.Frenchie,F.Slumpbuster],[F.BwoNymph,{t:'e',n:"Jig Hare's Ear"},F.SanJuanWorm],[F.BwoRs2,F.Blowtorch,F.PheasantTail,F.Slumpbuster],[F.CaddisLarva,F.StoneflyNymph,{t:'e',n:"Walt's Worm"}],[F.Stimulator,F.PmdNymph,F.CircusPeanut,F.ElkHairCaddis],[F.PmdDry,F.YellowSally,F.RainbowWarrior,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ElkHairCaddis,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.Blowtorch,F.DrunkDisorderly],[F.BwoEmerger,F.Perdigon,F.WoollyBugger],[F.ZebraMidge,F.Frenchie],[F.MidgeLarva,F.WoollyBugger]],
      'Vail River':[[F.MidgeLarva,F.ZebraMidge],[F.MidgeLarva,F.Perdigon],[F.BwoNymph,F.Frenchie,{t:'n',n:'RS2'}],[F.BwoRs2,F.Blowtorch,F.MidgePupa],[F.CaddisLarva,F.BwoNymph,{t:'e',n:"Jig Hare's Ear"}],[F.PmdNymph,F.ElkHairCaddis,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.PmdDry,F.PmdSparkleDun,F.Hopper,F.RainbowWarrior],[F.Trico,F.ElkHairCaddis,F.Hopper,F.Frenchie],[{t:'n',n:'October Caddis'},F.Blowtorch,F.ArticulatedLeech],[F.BwoEmerger,F.Perdigon,F.WoollyBugger],[F.ZebraMidge,{t:'e',n:"Jig Hare's Ear"}],[F.MidgeLarva,F.WoollyBugger]],
    }
  },
  OR:{
    rivers:['Deschutes River','Sandy River','Rogue River','McKenzie River','John Day River','Williamson River'],
    data:{
      'Deschutes River':[[F.WoollyBugger,F.MidgeLarva,F.Perdigon],[F.ZebraMidge,F.Frenchie,F.Slumpbuster],[F.SkwalaNymph,F.BwoNymph,{t:'e',n:"Jig Hare's Ear"}],[F.SkwalaStone,F.PheasantTail,F.Slumpbuster],[F.SalmonflyNymph,F.CaddisLarva,{t:'e',n:"Walt's Worm"},F.ArticulatedLeech],[F.Salmonfly,F.Stimulator,F.Pmd,F.Perdigon],[F.PmdSparkleDun,F.YellowSally,F.RainbowWarrior,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.Frenchie,F.CircusPeanut],[F.OctoberCaddis,{t:'e',n:"Jig Hare's Ear"},F.DrunkDisorderly],[F.BwoEmerger,F.Blowtorch,F.Slumpbuster],[F.ZebraMidge,F.Perdigon,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
      'Sandy River':[[F.SanJuanWorm,F.WoollyBugger],[F.PinkEgg,F.Slumpbuster,F.StoneflyNymph],[F.StoneflyNymph,F.ArticulatedLeech,F.CaddisLarva],[F.SkwalaStone,F.CircusPeanut,F.BwoNymph],[F.SalmonflyNymph,F.ElkHairCaddis,F.ArticulatedLeech],[F.Stimulator,F.SoftHackleCaddis,F.Slumpbuster],[F.PmdDry,F.YellowSally,F.RainbowWarrior,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.WoollyBugger],[{t:'n',n:'October Caddis (Dry)'},F.Frenchie,F.DrunkDisorderly],[F.BwoEmerger,F.SanJuanWorm,F.Slumpbuster],[F.PinkEgg,F.ArticulatedLeech],[F.SanJuanWorm,F.WoollyBugger]],
      'Rogue River':[[F.WoollyBugger,F.StoneflyNymph],[F.CaddisLarva,F.Slumpbuster,F.Perdigon],[F.SkwalaNymph,F.BwoNymph,F.ArticulatedLeech],[F.SkwalaStone,F.PheasantTail,F.CircusPeanut],[F.Salmonfly,F.ElkHairCaddis,{t:'e',n:"Jig Hare's Ear"}],[F.Stimulator,F.Pmd,F.Slumpbuster],[F.PmdDry,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,F.SoftHackleCaddis,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.RainbowWarrior,F.DrunkDisorderly],[F.BwoEmerger,F.Frenchie,F.WoollyBugger],[F.StoneflyNymph,F.ArticulatedLeech],[F.WoollyBugger,F.CaddisLarva]],
      'McKenzie River':[[F.WoollyBugger,F.MidgeLarva],[F.CaddisLarva,F.Frenchie],[F.SkwalaNymph,F.BwoNymph,F.Perdigon],[F.SkwalaStone,F.ElkHairCaddis,F.Slumpbuster],[F.Salmonfly,F.SoftHackleCaddis,{t:'e',n:"Jig Hare's Ear"}],[F.Stimulator,F.Pmd,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.PmdDry,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,{t:'n',n:'Caddis Pupa'},F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.RainbowWarrior,F.DrunkDisorderly],[F.BwoEmerger,F.Frenchie,F.WoollyBugger],[F.StoneflyNymph,F.Perdigon],[F.WoollyBugger,F.MidgeLarva]],
      'John Day River':[[F.WoollyBugger,F.MidgeLarva],[F.ZebraMidge,F.Frenchie],[{t:'s',n:'Stonefly Nymph'},F.BwoNymph,F.Perdigon],[F.SkwalaStone,F.CaddisLarva,F.Slumpbuster],[F.Salmonfly,F.ElkHairCaddis,{t:'e',n:"Jig Hare's Ear"}],[F.Stimulator,F.Pmd,F.CircusPeanut],[F.PmdDry,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.RainbowWarrior,F.DrunkDisorderly],[F.BwoEmerger,F.Frenchie,F.WoollyBugger],[F.ZebraMidge,F.Perdigon],[F.WoollyBugger,F.MidgeLarva]],
      'Williamson River':[[F.MidgeLarva,F.RainbowWarrior,F.WoollyBugger],[F.ZebraMidge,F.Frenchie],[F.BwoNymph,F.Perdigon,F.Callibaetis],[F.Callibaetis,F.Blowtorch,F.PheasantTail],[F.PmdNymph,F.CaddisLarva,{t:'e',n:"Jig Hare's Ear"}],[F.PmdDry,F.Callibaetis,{t:'e',n:"Walt's Worm"},F.Slumpbuster],[F.Trico,{t:'n',n:'Damsel Nymph'},F.RainbowWarrior,F.ArticulatedLeech],[F.Callibaetis,F.Trico,F.Frenchie,F.WoollyBugger],[{t:'n',n:'October Caddis'},F.Blowtorch,F.DrunkDisorderly],[F.BwoEmerger,F.Perdigon],[F.MidgeLarva,{t:'e',n:"Jig Hare's Ear"}],[F.ZebraMidge,F.WoollyBugger]],
    }
  },
  WA:{
    rivers:['Yakima River','Methow River','Skagit River','Klickitat River','Wenatchee River','Spokane River'],
    data:{
      'Yakima River':[[F.ZebraMidge,F.Perdigon,F.WoollyBugger],[F.MidgeLarva,F.Frenchie,F.Slumpbuster],[F.SkwalaNymph,F.BwoNymph,{t:'e',n:"Jig Hare's Ear"}],[F.SkwalaStone,F.BwoRs2,F.Blowtorch,F.Slumpbuster],[F.SalmonflyNymph,F.CaddisLarva,{t:'e',n:"Walt's Worm"},F.ArticulatedLeech],[F.Salmonfly,F.Stimulator,F.Pmd,F.Perdigon],[F.PmdSparkleDun,F.YellowSally,F.RainbowWarrior,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.Frenchie,F.CircusPeanut],[F.OctoberCaddis,{t:'e',n:"Jig Hare's Ear"},F.DrunkDisorderly],[F.BwoEmerger,F.Blowtorch,F.Slumpbuster],[F.ZebraMidge,F.Perdigon,F.WoollyBugger],[F.MidgeLarva,F.WoollyBugger]],
      'Methow River':[[F.WoollyBugger,F.MidgeLarva],[F.ZebraMidge,F.Frenchie],[F.SkwalaNymph,F.BwoNymph,F.Perdigon],[F.SkwalaStone,F.PheasantTail,F.Slumpbuster],[F.Salmonfly,{t:'n',n:'Caddis Pupa'},{t:'e',n:"Jig Hare's Ear"}],[F.Stimulator,F.Pmd,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.PmdDry,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.RainbowWarrior,F.DrunkDisorderly],[F.BwoEmerger,F.Frenchie,F.WoollyBugger],[F.ZebraMidge,F.Perdigon],[F.WoollyBugger,F.MidgeLarva]],
      'Skagit River':[[F.SanJuanWorm,F.WoollyBugger,F.StoneflyNymph],[F.PinkEgg,F.ArticulatedLeech,F.CaddisLarva],[{t:'s',n:'Stonefly Nymph'},F.CircusPeanut,F.BwoNymph],[F.SkwalaStone,F.ArticulatedLeech,F.PheasantTail],[F.SalmonflyNymph,F.ElkHairCaddis,F.Slumpbuster],[F.Stimulator,F.SoftHackleCaddis,F.Slumpbuster],[F.PmdDry,F.YellowSally,F.Frenchie,F.Hopper],[F.ChubbyChernobyl,{t:'n',n:'Caddis Pupa'},F.DrunkDisorderly],[{t:'n',n:'October Caddis'},F.RainbowWarrior,F.WoollyBugger],[F.BwoEmerger,F.SanJuanWorm,F.Slumpbuster],[F.PinkEgg,F.ArticulatedLeech],[F.SanJuanWorm,F.WoollyBugger]],
      'Klickitat River':[[F.WoollyBugger,F.StoneflyNymph],[F.CaddisLarva,F.Slumpbuster],[F.StoneflyNymph,F.BwoNymph,F.Frenchie],[F.SkwalaStone,F.PheasantTail,F.CircusPeanut],[F.Salmonfly,F.ElkHairCaddis,{t:'e',n:"Jig Hare's Ear"}],[F.Stimulator,F.SoftHackleCaddis,F.Slumpbuster],[F.Hopper,F.YellowSally,F.Blowtorch,F.PmdDry],[F.ChubbyChernobyl,{t:'n',n:'Caddis Pupa'},F.ArticulatedLeech],[F.OctoberCaddis,F.RainbowWarrior,F.DrunkDisorderly],[F.BwoEmerger,F.Perdigon,F.WoollyBugger],[F.PinkEgg,F.StoneflyNymph],[F.WoollyBugger,F.MidgeLarva]],
      'Wenatchee River':[[F.WoollyBugger,F.MidgeLarva],[F.ZebraMidge,F.Frenchie],[F.SkwalaNymph,F.BwoNymph,F.Perdigon],[F.SkwalaStone,F.CaddisLarva,F.Slumpbuster],[F.Salmonfly,F.ElkHairCaddis,{t:'e',n:"Jig Hare's Ear"}],[F.Stimulator,F.Pmd,{t:'e',n:"Walt's Worm"},F.CircusPeanut],[F.PmdDry,F.YellowSally,F.Blowtorch,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.RainbowWarrior,F.DrunkDisorderly],[F.BwoEmerger,F.Frenchie,F.WoollyBugger],[F.ZebraMidge,F.Perdigon],[F.WoollyBugger,F.MidgeLarva]],
      'Spokane River':[[F.ZebraMidge,F.Frenchie,F.WoollyBugger],[F.MidgeLarva,F.Perdigon],[F.BwoNymph,{t:'e',n:"Jig Hare's Ear"},F.StoneflyNymph],[F.SkwalaStone,F.PheasantTail,F.Slumpbuster],[F.SalmonflyNymph,{t:'n',n:'Caddis Pupa'},{t:'e',n:"Walt's Worm"}],[F.Stimulator,F.Pmd,F.CircusPeanut],[F.PmdDry,F.YellowSally,F.RainbowWarrior,F.Hopper],[F.ChubbyChernobyl,F.Trico,F.ArticulatedLeech],[{t:'n',n:'October Caddis'},F.Blowtorch,F.DrunkDisorderly],[F.BwoEmerger,F.Frenchie,F.WoollyBugger],[F.ZebraMidge,F.Perdigon],[F.MidgeLarva,F.WoollyBugger]],
    }
  },
};

/* ═══ USGS GAUGES ══════════════════════════════════════════ */
const HUB_GAUGES = {
  UT:[
    {river:'Provo River', loc:'Near Heber, UT', flowSite:'10154200', tempSite:'10154200'},
    {river:'Green River (UT)', loc:'Near Green River, UT', flowSite:'09315000', tempSite:'09315000'},
    {river:'Logan River', loc:'Near Logan, UT', flowSite:'10109000', tempSite:'10109000'},
    {river:'Strawberry River', loc:'Near Fruitland, UT', flowSite:'09295000', tempSite:null},
    {river:'Weber River', loc:'Near Coalville, UT', flowSite:'10128500', tempSite:'10128500'},
    {river:'Fremont River', loc:'Near Caineville, UT', flowSite:'09330000', tempSite:null},
    {river:'Duchesne River', loc:'Near Tabiona, UT', flowSite:'09285000', tempSite:null},
    {river:'Diamond Fork', loc:'Near Spanish Fork, UT', flowSite:'10163000', tempSite:null},
  ],
  ID:[
    {river:'South Fork Snake', loc:'Near Irwin, ID', flowSite:'13046995', tempSite:'13046995'},
    {river:"Henry's Fork", loc:"Near St. Anthony, ID", flowSite:'13057000', tempSite:'13057000'},
    {river:'Boise River', loc:'Near Boise, ID', flowSite:'13202000', tempSite:'13202000'},
    {river:'Big Wood River', loc:'Near Bellevue, ID', flowSite:'13139510', tempSite:null},
    {river:'Teton River', loc:'Near Driggs, ID', flowSite:'13046000', tempSite:null},
    {river:'Salmon River', loc:'Near White Bird, ID', flowSite:'13317000', tempSite:'13317000'},
  ],
  WY:[
    {river:'Green River (WY)', loc:'Below Fontenelle Reservoir, WY', flowSite:'09211200', tempSite:null},
    {river:'Snake River (WY)', loc:'Near Moose, WY', flowSite:'13010065', tempSite:'13010065'},
    {river:'North Platte', loc:'Near Saratoga, WY', flowSite:'06620000', tempSite:'06620000'},
    {river:'Shoshone River', loc:'Near Cody, WY (N Fork)', flowSite:'06279940', tempSite:null},
    {river:'Wind River', loc:'Near Dubois, WY', flowSite:'06218500', tempSite:'06218500'},
    {river:'Hoback River', loc:'Near Jackson, WY', flowSite:'13019500', tempSite:null},
    {river:"Ham's Fork", loc:"Near Granger, WY", flowSite:'09224700', tempSite:null},
  ],
  MT:[
    {river:'Madison River', loc:'Near Cameron, MT', flowSite:'06037500', tempSite:'06037500'},
    {river:'Bighorn River', loc:'Near St. Xavier, MT', flowSite:'06294500', tempSite:'06294500'},
    {river:'Gallatin River', loc:'Near Gallatin Gateway, MT', flowSite:'06042500', tempSite:'06042500'},
    {river:'Missouri River', loc:'Near Toston, MT', flowSite:'06054500', tempSite:'06054500'},
    {river:'Yellowstone River', loc:'Near Corwin Springs, MT', flowSite:'06191500', tempSite:'06191500'},
    {river:'Clark Fork', loc:'Near St. Regis, MT', flowSite:'12354500', tempSite:'12354500'},
    {river:'Bitterroot River', loc:'Near Darby, MT', flowSite:'12344000', tempSite:'12344000'},
  ],
  CO:[
    {river:'Arkansas River', loc:'Near Salida, CO', flowSite:'07091500', tempSite:'07091500'},
    {river:'South Platte', loc:'Near Deckers, CO', flowSite:'06700000', tempSite:'06700000'},
    {river:'Frying Pan River', loc:'Near Basalt, CO', flowSite:'09080400', tempSite:'09080400'},
    {river:'Blue River', loc:'Near Kremmling, CO', flowSite:'09057500', tempSite:null},
    {river:'Roaring Fork', loc:'Near Glenwood Springs, CO', flowSite:'09085000', tempSite:'09085000'},
    {river:'Cache la Poudre', loc:'Near Fort Collins, CO', flowSite:'06752000', tempSite:'06752000'},
  ],
  OR:[
    {river:'Deschutes River', loc:'Near Madras, OR', flowSite:'14092500', tempSite:'14092500'},
    {river:'Sandy River', loc:'Near Marmot, OR', flowSite:'14137000', tempSite:'14137000'},
    {river:'Rogue River', loc:'Near Agness, OR', flowSite:'14372300', tempSite:'14372300'},
    {river:'McKenzie River', loc:'Near Vida, OR', flowSite:'14162500', tempSite:'14162500'},
    {river:'John Day River', loc:'Near Service Creek, OR', flowSite:'14046500', tempSite:'14046500'},
    {river:'Williamson River', loc:'Near Sprague River, OR', flowSite:'11502500', tempSite:null},
  ],
  WA:[
    {river:'Yakima River', loc:'Near Cle Elum, WA', flowSite:'12479000', tempSite:'12479000'},
    {river:'Methow River', loc:'Near Twisp, WA', flowSite:'12448500', tempSite:'12448500'},
    {river:'Skagit River', loc:'Near Concrete, WA', flowSite:'12181000', tempSite:'12181000'},
    {river:'Klickitat River', loc:'Near Pitt, WA', flowSite:'14224500', tempSite:null},
    {river:'Wenatchee River', loc:'Near Plain, WA', flowSite:'12459000', tempSite:'12459000'},
    {river:'Spokane River', loc:'Near Post Falls, ID', flowSite:'12419000', tempSite:'12419000'},
  ],
};

/* ═══ ACCESS POINTS ════════════════════════════════════════ */
const ACCESS_HUB = {
  UT:{
    'Green River (UT)':[
      {name:'Little Hole (A-Section)',desc:'Primary float and walk-in access below Flaming Gorge Dam. Most famous Blue Ribbon stretch in the West.',parking:'Paved USFS lot at Little Hole Recreation Area. Fee. Restrooms, fish-cleaning station. NRT trailhead for walk-in fishing upriver.',tags:['Public','Parking','Drift Boat'],lat:40.9140, lng:-109.4200},
      {name:'Red Creek Rapid Access',desc:'B-Section Class III rapid where Red Creek tributary enters the Green. Scout river-left. Below the rapid: excellent streamer and dry fly water.',parking:'Float-only access. Park at Little Hole and float 4 mi, or hike the NRT ~4 mi to reach this stretch.',tags:['Public','Float','Scout Required'],lat:40.8922, lng:-109.3488},
      {name:'Browns Park',desc:'Lower Green River public access via Browns Park NWR.',parking:'NWR gravel lot off Browns Park Rd. Free. Short walk through cottonwood bottom to the river.',tags:['Public','NWR','Drive-in'],lat:40.8003, lng:-109.1122},
      {name:'Spillway Access',desc:'Walk-in access directly below the Flaming Gorge dam. Trophy rainbow zone.',parking:'Paved USFS lot at Spillway Recreation Area off Greendale Rd. Free. Walk 0.3 mi of trail to the riverbank.',tags:['Public','Walk-in','No Boat'],lat:40.9251, lng:-109.4218},
    ],
  },
  ID:{
    "Henry's Fork":[
      {name:'Box Canyon (TU Access)',desc:'Legendary Box Canyon section. Trophy rainbow water with difficult presentations.',tags:['Public','Trophy Trout','Difficult'],lat:44.5823, lng:-111.3841},
      {name:'Harriman State Park',desc:'World-famous Railroad Ranch section. Challenging spring creek conditions.',tags:['Public','State Park','Spring Creek'],lat:44.3422, lng:-111.5013},
      {name:'Ashton Reservoir Outflow',desc:'Walk-in access below the reservoir. Good streamer water in early season.',tags:['Public','Walk-in','Streamer'],lat:44.0688, lng:-111.4522},
    ],
  },
  WY:{
    'Green River (WY)':[
      {name:'Warren Bridge Access',desc:'BLM access on upper Green River. Remote dry fly water mid-summer.',tags:['Public','BLM','Remote'],lat:42.4521, lng:-109.7834},
      {name:'Seedskadee NWR',desc:'National Wildlife Refuge access on lower Green River. Excellent streamer water.',tags:['Public','NWR','Streamer'],lat:41.8812, lng:-109.6245},
    ],
    'Snake River (WY)':[
      {name:'Pacific Creek Boat Launch (GTNP)',desc:'Grand Teton National Park put-in. Drift the upper Snake for cutthroat.',tags:['Public','NPS','Drift Boat'],lat:43.8722, lng:-110.6234},
      {name:'Schwabacher Landing',desc:'Iconic upper Snake stretch. Walk-in wade fishing for cutthroat.',tags:['Public','NPS','Walk-in'],lat:43.6789, lng:-110.6512},
    ],
    'North Platte':[
      {name:'Saratoga Town Access',desc:'Public access through Saratoga. Excellent tailwater conditions.',tags:['Public','Town','Tailwater'],lat:41.4567, lng:-106.8123},
      {name:'Bennett Peak BLM',desc:'Remote BLM stretch above Rawlins. Wild brown trout and rainbow.',tags:['Public','BLM','Remote'],lat:41.6789, lng:-107.1234},
    ],
  },
  MT:{
  },
  CO:{
    'South Platte':[
      {name:'Deckers Access (CDOW)',desc:'Premier wild trout water. Mix of pocketwater and tailouts.',tags:['Public','CDOW','Wild Trout'],lat:39.2567, lng:-105.2890},
      {name:'Cheesman Canyon',desc:'Remote hike-in access. Trophy brown trout in technical water.',tags:['Public','Hike-in','Trophy'],lat:39.1934, lng:-105.3012},
    ],
  },
  OR:{
    'Rogue River':[
      {name:'Prospect Bridge Access (ODFW)',desc:'ODFW public access near Prospect. Wild steelhead and native rainbow.',tags:['Public','ODFW','Wild Fish'],lat:42.7567, lng:-122.4890},
    ],
    'McKenzie River':[
      {name:'Hendricks Bridge Wayside',desc:'ODOT public access. Classic McKenzie drift boat fishing for native rainbows.',tags:['Public','ODOT','Float Boat'],lat:44.1234, lng:-122.6789},
      {name:'Finn Rock Access (USFS)',desc:'USFS access mid-McKenzie. Excellent pocket water dry fly fishing.',tags:['Public','USFS','Dry Fly'],lat:44.2345, lng:-122.5678},
    ],
  },
  WA:{
    'Methow River':[
      {name:'Twisp Town Access',desc:'Walk-in public access near downtown Twisp. Native steelhead and wild rainbow.',tags:['Public','Town','Walk-in'],lat:48.3678, lng:-120.1190},
    ],
    'Wenatchee River':[
      {name:'Cashmere Bridge Access (WDFW)',desc:'WDFW public access near Cashmere. Spring steelhead and summer trout.',tags:['Public','WDFW','Steelhead'],lat:47.5234, lng:-120.4678},
    ],
  },
};

/* ═══════════════════════════════════════════════════════════
   RIVER SECTIONS
   Each river divided into named sections with character,
   access points, float/wade suitability, and hatch notes.
   accessPoints tagged with mode: 'wade' | 'float' | 'both'
═══════════════════════════════════════════════════════════ */
const RIVER_SECTIONS = {

  /* ── UTAH ── */

  'Logan River': [
    { id:'logan-lower', name:'Lower Canyon — Three Dams', subtitle:'Canyon Mouth → 3rd Dam',
      char:'The most accessible section of the Logan, beginning at First Dam right at the canyon entrance and running ~3 miles through two more impoundments. Heavily stocked with rainbow trout, plus resident browns. Great family and beginner water. Most anglers fish with bait here — flies and lures work equally well. Expect company on summer weekends.',
      elevation:'4,700–4,900 ft', length:'~3 miles', fishType:'Rainbow (stocked), Brown',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy wading throughout — shallow, clear water with gravel and cobble bottom. Hip waders adequate. The impoundments themselves are best fished from the bank or with a float tube.',
      floatNote:'Not floatable — impoundments too small; river between dams too shallow and short.',
      access:[
        {name:'First Dam / Canyon Entrance Park',desc:'Logan City park at the base of First Dam — the most popular fishing access on the entire river. Stocked rainbows, plus large resident browns. Fishing pier, viewing deck, and easy bank access around the reservoir.',parking:'Paved Logan City lot at First Dam, 1799 Canyon Rd. Free. Restrooms on site (May–Sep). Limited spots — arrive early on weekends.',tags:['City Park','Stocked','Family'],mode:'wade',lat:41.7422, lng:-111.7789},
        {name:'Stokes Nature Center Pull-offs',desc:'Small gravel pull-offs along US-89 ~1 mile above First Dam, adjacent to the river between First and Second Dams. Short scramble down the bank to wade productive riffles and runs.',parking:'Roadside gravel pull-offs on the south side of US-89. Free. Walk directly to the river from the shoulder.',tags:['Public','Walk-in','Roadside'],mode:'wade',lat:41.7444, lng:-111.7633},
        {name:'Second Dam Parking Area',desc:'Logan City parking area at Second Dam, ~2 miles up canyon. Fishing the impoundment from the bank plus river access above and below the dam. Less crowded than First Dam.',parking:'Paved lot on the right (south) side of US-89 at Second Dam. Free. Restrooms at the trailhead across the road.',tags:['City','Second Dam','Bank Access'],mode:'wade',lat:41.7477, lng:-111.7481},
        {name:'Third Dam / Gus Lind Area',desc:'Top of the lower section at Third Dam, ~3 miles up canyon. Access to the river just below the dam structure plus the short stretch between Second and Third Dams. Cleaner, colder water than further downstream.',parking:'Gravel pull-off and small lot on US-89 at Third Dam. Free. River is steps from the road.',tags:['City','Third Dam','Walk-in'],mode:'wade',lat:41.7522, lng:-111.7366},
      ],
    },
    { id:'logan-middle', name:'Middle Canyon', subtitle:'3rd Dam → Card Canyon Bridge',
      char:'The transition section of Logan Canyon — above the impoundments and below the special regs. Standard limits apply here. Brown trout dominate with some rainbow. Roadside access throughout via US-89. Guinavah-Malibu, Spring Hollow, and Bridger campgrounds all provide direct river access. Less pressure than the upper special-reg water.',
      elevation:'4,900–5,400 ft', length:'~7 miles', fishType:'Brown, Rainbow',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Moderate wading — faster water than the lower section, cobble and boulder bottom. Felt soles recommended. Chest waders useful for crossing to far bank pools.',
      floatNote:'Not floatable — canyon is too narrow and the gradient too fast.',
      access:[
        {name:'Guinavah-Malibu Campground',desc:'Large USFS campground just above 3rd Dam with direct river access through the campground. Multiple entry points to the river. Good brown trout water in riffles and runs adjacent to the sites.',parking:'Paved USFS fee campground lot on US-89, ~3.5 miles from Logan. Day-use parking available. Multiple paths lead to the river from the campground road.',tags:['USFS','Campground','Day Use'],mode:'wade',lat:41.7488, lng:-111.7244},
        {name:'Bridger Campground',desc:'Small USFS campground right on the river bank, ~3.5 miles up canyon just above Guinavah-Malibu. Excellent early-morning access to a productive riffle-pool stretch with less pressure than spots near the dams.',parking:'USFS fee campground lot on US-89. Small paved lot. Day-use parking at the entrance. Steps to the river from the sites.',tags:['USFS','Campground','Riverside'],mode:'wade',lat:41.7511, lng:-111.7177},
        {name:'Spring Hollow Campground',desc:'USFS campground ~6.6 miles up canyon with the Logan River flowing right past the sites. Named meadow stretch here is open and ideal for dry fly presentations. Also the upper terminus of the Logan River Trail from First Dam.',parking:'Paved USFS fee campground lot off US-89. Day-use parking available. River is immediately west of the campground.',tags:['USFS','Campground','Dry Fly'],mode:'wade',lat:41.7533, lng:-111.7166},
        {name:'US-89 Roadside Pull-offs (Mid Canyon)',desc:'Multiple unmarked gravel pull-offs along US-89 between Spring Hollow and Card Canyon. The river runs close to the road throughout. Park and walk down to any visible run or riffle.',parking:'Dispersed gravel pull-offs on the shoulder of US-89. Free. No facilities. Walk down the bank — typically 10–50 ft from the road to the water.',tags:['Public','Walk-in','Dispersed'],mode:'wade',lat:41.7722, lng:-111.6944},
      ],
    },
    { id:'logan-artonly', name:'Upper Canyon — Artificial Only', subtitle:'Card Canyon Bridge → Red Banks Campground',
      char:'The heart of the Logan\'s Blue Ribbon water. From Card Canyon Bridge to Red Banks is the most technically rewarding section — artificial flies and lures only, 2-fish combined limit. Wild brown and Bear River cutthroat in clear, cold freestone water. Card Picnic Area and Chokecherry Picnic Area provide good access. Less pressure than the lower sections despite being the best water.',
      elevation:'5,400–6,500 ft', length:'~10 miles', fishType:'Brown, Cutthroat (Bear River)',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Moderate to difficult — boulders, fast pocketwater, slippery bedrock. Studded boots or felt soles essential. Wading staff recommended in high water. The canyon gets narrow — expect some scrambling.',
      floatNote:'Not floatable.',
      access:[
        {name:'Card Canyon Bridge & Picnic Area',desc:'Bottom of the artificial-only section — the regulation boundary. Paved USFS picnic area right on the river overlooking a deep run. 4 picnic sites on the bank. Old Card Canyon guard cabin visible across the road.',parking:'Paved USFS picnic lot at Card Canyon Bridge, US-89 ~10 miles from Logan. Free. Vault restrooms. River is directly below the picnic area.',tags:['USFS','Picnic Area','Regulation Boundary'],mode:'wade',lat:41.7877, lng:-111.6433},
        {name:'Chokecherry Picnic Area',desc:'USFS picnic area mid-section on the banks of the Logan. 4 sites directly on the river with immediate wade access to good riffle and pool water. One of the better mid-canyon access options in the artificial-only zone.',parking:'Paved USFS picnic lot on US-89 in the upper canyon. Free. Vault restrooms. Walk directly from the picnic tables to the river bank.',tags:['USFS','Picnic Area','Riverside'],mode:'wade',lat:41.8144, lng:-111.6122},
        {name:'Wood Camp Campground',desc:'Small 6-site USFS campground tucked along the river, ~14 miles up canyon. Large willows buffer road noise. Direct river access through the campground. Good mid-to-upper artificial-only section water.',parking:'Gravel USFS fee campground lot off US-89. Day-use parking at the entrance. River is immediately alongside the sites — less than 50 ft.',tags:['USFS','Campground','Willows'],mode:'wade',lat:41.8244, lng:-111.5933},
        {name:'Right Hand Fork / Temple Fork Pull-offs',desc:'Dispersed roadside pull-offs in the upper portion of the artificial-only zone near the Right Hand Fork and Temple Fork junctions. Good access to the main stem above the tributaries.',parking:'Unmarked gravel pull-offs on US-89 near the Temple Fork Rd and Right Hand Fork Rd intersections. Free. Walk down the bank to the river.',tags:['Public','Walk-in','Dispersed'],mode:'wade',lat:41.8599, lng:-111.5533},
      ],
    },
    { id:'logan-upper', name:'Upper Canyon — Wild Cutthroat', subtitle:'Red Banks Campground → Idaho Border',
      char:'Remote, native water. From Red Banks upstream to the Idaho border is managed exclusively for native Bonneville Bear River cutthroat. The river shrinks considerably — brushy, tight banks, boulder-strewn pocketwater. Closed January 1 through mid-July to protect spawning fish. When open, this is among the best native cutthroat fishing in Utah. Expect small fish but wild and willing.',
      elevation:'6,500–7,800 ft', length:'~10 miles', fishType:'Cutthroat (Bear River), Brook',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Difficult — small stream with brushy banks, slick boulders, and tight casting lanes. Hip waders or wet wading adequate given stream size. More hiking than wading to reach good pools.',
      floatNote:'Not floatable — too small and wooded.',
      access:[
        {name:'Red Banks Campground',desc:'Top of the artificial-only section and bottom of the native cutthroat zone. 12-site USFS campground right on the river bank. The regulation boundary is at the highway bridge through camp. Fish above the bridge for native cutthroat when open (mid-July through Dec).',parking:'USFS fee campground on US-89, ~18 miles from Logan. Day-use parking available. River runs through the campground — immediate access.',tags:['USFS','Campground','Regulation Boundary','BRCT'],mode:'wade',lat:41.8755, lng:-111.5833},
        {name:'Tony Grove Road Pull-off',desc:'Gravel pull-off on US-89 near the Tony Grove Rd junction. The main stem passes close to the road here. One of the most productive upper-canyon access points for native cutthroat when the section is open.',parking:'Gravel roadside pull-off on US-89 near the Tony Grove Rd turnoff. Free. Walk a short distance to the river bank.',tags:['Public','Walk-in','BRCT'],mode:'wade',lat:41.8944, lng:-111.5488},
        {name:'Franklin Basin Road',desc:'Top of the accessible upper canyon. Turn onto Franklin Basin Rd (FR-007) — the road follows the main stem upstream. The stream becomes very small with productive beaver ponds. Fish to the headwaters.',parking:'Park at the Franklin Basin Rd junction off US-89, or drive up the gravel road and park at any pullout. Free. Stream runs alongside the road for several miles.',tags:['Public','Walk-in','Beaver Ponds','Headwaters'],mode:'wade',lat:41.9344, lng:-111.5133},
      ],
    },
  ],

  'Provo River': [
    { id:'upper-provo', name:'Upper Provo', species:['rainbow','brown','brook','cutthroat'], subtitle:'Kamas (Uinta Mtns) → Jordanelle Reservoir',
      char:'True headwaters of the Provo — a classic high-elevation freestone stream dropping out of the Uinta Mountains through a narrow forested valley. Wild cutthroat and rainbow in clear, cold water. Far less pressure than the middle canyon. Excellent attractor dry fly water June through September.',
      elevation:'6,400–8,000 ft', length:'~20 miles', fishType:'Cutthroat, Rainbow, Brook',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy to moderate wading — cobble and gravel bottom, knee-to-thigh depth. Hip waders adequate most of the season. Streamside trail access at multiple USFS pulloffs along SR-150.',
      floatNote:'Not floatable — too shallow, narrow, and wooded through the upper canyon.',
      access:[
        {name:'Lower Provo River Road (SR-150)',desc:'Multiple USFS gravel pulloffs along SR-150 between Kamas and Hailstone Junction give direct roadside walk-in access. Best morning dry fly water in the upper canyon.',parking:'Dispersed USFS gravel pulloffs at roughly 0.5–1 mi intervals on SR-150. Free. No formal trailhead — walk the bank.',tags:['Public','USFS','Walk-in'],mode:'wade',lat:40.6422, lng:-111.2188},
        {name:'Soapstone Campground Access',desc:'USFS campground with direct river access above the upper canyon. Wild cutthroat dominate this stretch.',parking:'USFS fee campground lot off SR-150, ~8 mi east of Kamas. Day-use parking at the campground entrance. River is steps from the sites.',tags:['Public','USFS','Campground'],mode:'wade',lat:40.6188, lng:-111.1744},
        {name:'Jordanelle Inlet / Upper Delta',desc:'Where the upper Provo fans into the Jordanelle arm. Slow, accessible water with large fish moving in and out of the reservoir during fall.',parking:'Jordanelle State Park — Hailstone Section parking off US-40. State park fee. Paved lot with restrooms. Walk the inlet trail to the river mouth.',tags:['State Park','Fee','Inlet'],mode:'wade',lat:40.6011, lng:-111.3833},
      ],
    },
    { id:'middle-provo', name:'Middle Provo', species:['rainbow','brown','whitefish'], subtitle:'Jordanelle Dam → Deer Creek Reservoir',
      char:'Blue Ribbon tailwater through the open Heber Valley. Consistent dam-regulated flows from Jordanelle produce excellent midge and BWO hatches. Trophy rainbow and brown averaging 14–18" in a wide meadow setting — less pressure and more visible fish than the canyon below.',
      elevation:'5,200–5,600 ft', length:'~12 miles', fishType:'Rainbow, Brown',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy to moderate wading on flat gravel and cobble through the meadow valley. Hip waders adequate. Wide open banks make spotting rising fish easy.',
      floatNote:'Not floatable — too shallow and braided through the Heber Valley meadow section.',
      access:[
        {name:'Jordanelle Dam — River Access Lot',desc:'Top of the Middle Provo corridor, directly below Jordanelle Dam. Cold tailwater with dense brown trout populations. Named pools "Hoover Hole" and "Lunker Lane" are a short walk downstream from the lot.',parking:'Dedicated PRRP paved lot with vault toilets at the end of River Section Rd off SR-32, south of Francis. Free. Signed trail leads along the river corridor from the lot.',tags:['PRRP','Tailwater','Vault Toilets'],mode:'wade',lat:40.5888, lng:-111.4177},
        {name:'Cottonwood Access Lot',desc:'Upper-middle section parking in the Cottonwood area. Access to meadow bends and undercut banks holding large browns. Reached via Old Hwy 40 off SR-32.',parking:'Gravel PRRP lot with vault toilets off a dirt road on Old Hwy 40, ~2 mi from River Rd. Free. Signed. Trail leads west to the river from the lot.',tags:['PRRP','Meadow','Named Lot'],mode:'wade',lat:40.5644, lng:-111.4388},
        {name:'River Road North Lot',desc:'The most-fished stretch on the Middle Provo. "Lunker Lane," "Tree Hole," and "Rickety Bridge" pools are all within walking distance. Dense fish populations — 3,000+ browns per mile.',parking:'Paved PRRP lot with vault toilets on the north side of River Rd (W 100 S), ~0.25 mi west of US-189. Free. Signed trail drops to the river immediately west of the lot.',tags:['PRRP','Named Pools','High Density'],mode:'wade',lat:40.5233, lng:-111.4755},
        {name:'River Road South Lot',desc:'South-side counterpart to River Road North. Separate parking for the Bunny Farm stretch — excellent spring and summer dry fly water. Fishes well in the morning before crowds arrive.',parking:'Paved PRRP lot with vault toilets on the south side of River Rd (W 100 S). Free. Signed. Trail leads northwest into the riparian corridor to the river.',tags:['PRRP','Bunny Farm','Dry Fly'],mode:'wade',lat:40.5177, lng:-111.4822},
        {name:'Midway Lane (Legacy Bridge)',desc:'Mid-section access at Legacy Bridge on Midway Lane. Regulation boundary — catch-and-release artificial-only above Legacy Bridge; bait and 4-fish limit allowed below. Classic mid-valley meanders with undercut banks.',parking:'Paved PRRP lot with vault toilets at Legacy Bridge on Midway Ln between Heber and Midway. Free. Signed. Walk directly from the lot to the river at the bridge.',tags:['PRRP','Legacy Bridge','Regulation Boundary'],mode:'wade',lat:40.5022, lng:-111.4966},
        {name:'Charleston Access Lot',desc:'Lower Middle Provo in the small community of Charleston. Slower, flat water with large lightly pressured browns. Best evening dry fly fishing on the river. River Road South access described above serves water just upstream.',parking:'Paved PRRP lot with vault toilets near Charleston Bridge off Center St (SR-113), Charleston. Free. Signed. Short walk from lot to the river at the bridge.',tags:['PRRP','Charleston','Lower Meadow'],mode:'wade',lat:40.4711, lng:-111.5066},
        {name:'Charleston Inlet Flat',desc:'Bottom of the Middle Provo where the river slows and fans into Deer Creek Reservoir. Large fall fish push upstream from the reservoir — some of the best big-fish opportunities on the section.',parking:'Small gravel PRRP lot near the reservoir inlet south of Charleston off Center St. Free. Short walk along the river bank to the flat water above the reservoir.',tags:['PRRP','Inlet','Fall Fishing'],mode:'wade',lat:40.4566, lng:-111.5133},
      ],
    },
    { id:'lower-provo', name:'Lower Provo', species:['rainbow','brown','whitefish'], subtitle:'Deer Creek Dam → Utah Lake',
      char:'The lower Provo begins below Deer Creek Dam and runs through the full length of Provo Canyon before emerging into the valley below. The canyon section is Utah\'s most heavily fished Blue Ribbon trout water — fast riffles, deep pools, educated rainbow and brown. Below the canyon the river slows through the Provo urban corridor with large, rarely targeted brown trout.',
      elevation:'4,450–5,000 ft', length:'~20 miles', fishType:'Rainbow, Brown',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Canyon section: moderate to difficult — slippery cobble, variable depths. Felt soles or carbide studs essential. Chest waders needed for deeper crossings. Below canyon: easy wading on soft bottom, knee to thigh depth.',
      floatNote:'Not floatable through Provo Canyon — too fast and narrow. Floatable by kayak or pontoon below the canyon mouth. Use established launch/take-out points and avoid private land.',
      access:[
        {name:'Deer Creek Dam Outflow',desc:'Top of the lower Provo. Immediately below Deer Creek Dam — consistent tailwater flows produce excellent midge and BWO action year-round. Most productive in the first half mile below the dam face.',parking:'Deer Creek State Park lot off US-189 near the dam. Paved, fee required. Restrooms on site. Trail follows the river downstream ~0.5 mi.',tags:['State Park','Tailwater','Trail'],mode:'wade',lat:40.4018, lng:-111.5307},
        {name:'Legacy Bridge Parking Area',desc:'Upper canyon access just inside Provo Canyon. Easy walk-in to fast riffle water and tailout pools above and below the bridge.',parking:'Dedicated paved lot at Legacy Bridge off US-189. Free. Short path to the river — less than 100 ft from the lot.',tags:['Public','Parking','Riffle'],mode:'wade',lat:40.4855, lng:-111.4933},
        {name:'Cottonwood Bridge Parking',desc:'One of the most productive mid-canyon access points. Good riffle-run-pool water both above and below the bridge.',parking:'Paved UDWR lot at Cottonwood Bridge, US-189. Free. Signed access. Walk straight to the river from the lot.',tags:['Public','UDWR','Named Lot'],mode:'wade',lat:40.4411, lng:-111.5188},
        {name:'Bunny Farm Parking Area',desc:'Local name for the paved mid-canyon pull-off near the old farm property. Long productive run with undercut banks holding large fish. One of the better dry fly stretches in the canyon.',parking:'Paved roadside lot on US-189 — look for the UDWR fishing access sign. Free. Trail drops ~30 ft from the lot to the river edge.',tags:['Public','UDWR','Dry Fly'],mode:'wade',lat:40.4122, lng:-111.5388},
        {name:'Olmstead Diversion Trailhead',desc:'The most-visited canyon access. Paved trail follows prime riffle-to-pool sequences through the heart of the canyon. Educated fish — fine tippet and accurate casts required.',parking:'Paved UDWR lot off US-189. 20+ spaces, restrooms. Signed trailhead leads directly to the water.',tags:['Public','UDWR','Paved Trail'],mode:'wade',lat:40.3492, lng:-111.5884},
        {name:'Nunns Park',desc:'USFS campground near the lower canyon mouth. Multiple pools accessible directly from the campground road. Good early morning access before day crowds arrive.',parking:'USFS fee campground on US-189. Day-use parking at the entrance gate. Walk 50–200 ft to the river.',tags:['Public','USFS','Campground'],mode:'wade',lat:40.3365, lng:-111.6124},
        {name:'Vivian Park',desc:'Where the canyon opens into the valley below. Wide gravel bar with easy bank access. Good dry fly water in summer before transitioning to slower water downstream.',parking:'Vivian Park day-use area off US-189. Paved lot with restrooms. Trail leads ~0.1 mi to the gravel bar.',tags:['Public','Gravel Bar','Canyon Exit'],mode:'wade',lat:40.3562, lng:-111.5740},
        {name:'Springville / Carterville Bridge',desc:'Public put-in for pontoon and kayak float trips on the lower valley river. Flat, slow water through agricultural land holding large, unsophisticated brown trout.',parking:'Small gravel lot at Carterville Bridge off 400 S, Springville. Room for 6 vehicles. Free. Carry-in launch from the bank.',tags:['Public','Put-in','Float'],mode:'float',lat:40.1722, lng:-111.6122},
      ],
    },
  ],

  'Weber River': [
    { id:'weber-upper', name:'Upper Weber — Rockport & Echo Tailwaters', subtitle:'Rockport Dam → Echo Reservoir (~12 miles)',
      char:'The upper Weber is a dual-tailwater system — cold releases from Rockport Reservoir feed the river through a narrow canyon to Echo Reservoir. Brown trout dominate with wild rainbow. Roadside access throughout via US-189 and I-80. Less pressure than the Provo or Green but consistently productive water. Good midge and caddis fishing year-round due to regulated flows.',
      elevation:'5,600–6,200 ft', length:'~12 miles', fishType:'Brown, Rainbow, Whitefish',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy to moderate wading — cobble and gravel bottom with manageable flows below Rockport Dam. Monitor reservoir releases before wading. Chest waders useful for crossing.',
      floatNote:'Not practically floatable — ends at Echo Reservoir, short sections only.',
      access:[
        {name:'Rockport Dam Outlet', desc:'Access directly below the dam face. Cold, clear tailwater with year-round consistent flows. Best midge and scud fishing on the upper river. The river is small but productive in this first mile.',parking:'Small gravel pull-off on SR-302 at the dam face, approximately 2 miles south of Rockport exit off I-80. Free. Walk the bank.',tags:['Tailwater','Dam','Year-Round'],mode:'wade',lat:40.7844, lng:-111.3944},
        {name:'Wanship Town Access', desc:'Public roadside access through the small town of Wanship where US-189 crosses the Weber. Good riffle and run water with browns and whitefish. Short stretch but productive in early morning.',parking:'Park along the gravel shoulder near the Wanship bridge on US-189. Free. Walk the banks upstream and downstream.',tags:['Public','Town','Walk-in'],mode:'wade',lat:40.7944, lng:-111.4133},
        {name:'Echo Canyon Roadside Pull-offs', desc:'Several gravel pull-offs where the Weber flows beside the old Lincoln Highway (Business I-80) through Echo Canyon. Brown trout hold in the deep pools under canyon walls. Multiple informal access points.',parking:'Gravel pull-offs on the old US-30 (Echo Canyon Rd) through the canyon. Free. Walk directly to river.',tags:['Public','Canyon','Walk-in'],mode:'wade',lat:40.8244, lng:-111.4433},
      ],
    },
    { id:'weber-middle', name:'Middle Weber — Morgan Valley', subtitle:'Echo Reservoir → Morgan (~25 miles)',
      char:'The most productive fly fishing section of the Weber. Below Echo Reservoir the river enters Morgan Valley — a broad agricultural corridor with good public access at bridge crossings and UDWR access easements. Brown trout to 20"+ in deep undercut banks and braided channels. Whitefish are abundant. Hopper fishing is excellent in August. Less known than other UT rivers — worth exploring.',
      elevation:'5,000–5,600 ft', length:'~25 miles', fishType:'Brown, Rainbow, Whitefish',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Easy to moderate wading on gravel bars and cobble. Good bank access at bridge crossings throughout the valley. Irrigation diversions affect flow mid-summer.',
      floatNote:'Floatable by drift boat in higher water (spring). Short shuttle sections between bridge crossings. Not a primary float fishery — wade fishing preferred.',
      access:[
        {name:'Echo Reservoir Outlet / SR-65 Bridge', desc:'Bottom of Echo Reservoir and top of the Morgan Valley section. Good brown trout water directly below the reservoir outlet. The river picks up size and character here.',parking:'Small gravel pull-off on SR-65 near the Echo Reservoir outlet structure. Free. Walk the bank.',tags:['Reservoir Outlet','Brown Trout','Walk-in'],mode:'wade',lat:40.9244, lng:-111.4244},
        {name:'Morgan County UDWR Fishing Access', desc:'Multiple UDWR-managed public fishing access sites through Morgan Valley. Check the UDWR access map for current easement locations. Good brown trout water with undercut banks.',parking:'UDWR access sites marked with blue fishing access signs along SR-66 through Morgan Valley. Free. Gravel pull-offs.',tags:['UDWR','Public Access','Easement'],mode:'wade',lat:41.0244, lng:-111.5644},
        {name:'Morgan City Bridge Access', desc:'Public access at the SR-66 bridge in downtown Morgan. One of the most productive spots on the middle Weber — deep pool at the bridge holds large browns year-round. Fish the run below the bridge with streamers at dusk.',parking:'Park in the gravel pull-off on the east side of the SR-66 bridge in Morgan City. Free.',tags:['Town','Bridge','Brown Trout','Streamers'],mode:'wade',lat:41.0344, lng:-111.6744},
        {name:'Peterson (Devil\'s Slide) Pull-offs', desc:'Several gravel pull-offs where SR-66 follows the river near the Devil\'s Slide geological feature. Distinctive red rock canyon with good pocket water. Less accessed than the open valley stretches.',parking:'Gravel road pull-offs on SR-66. Free. The Devil\'s Slide area has an informal viewpoint with a short walk to the river.',tags:['Scenic','Pocket Water','Walk-in'],mode:'wade',lat:41.0944, lng:-111.7144},
      ],
    },
    { id:'weber-lower', name:'Lower Weber — Ogden Canyon & Devil\'s Gate', subtitle:'Ogden → Great Salt Lake (~30 miles)',
      char:'The lower Weber transitions from productive trout water near Ogden into the warmer braided flats approaching the Great Salt Lake. The Ogden Canyon section just above Pineview Reservoir is the highlight — fast pocket water with wild brown and rainbow. Below Ogden the river is primarily warm-water species. Ogden Canyon has good USFS and UTA Trailway access.',
      elevation:'4,450–5,000 ft', length:'~20 miles (trout water)', fishType:'Brown, Rainbow, Whitefish',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Moderate to difficult in Ogden Canyon — fast pocket water with boulders. Below Ogden: easy but water warms significantly in summer. Best spring and fall.',
      floatNote:'Not floatable through Ogden Canyon. Below Ogden: possible kayak but not a fly fishing float.',
      access:[
        {name:'Pineview Reservoir Outlet / 2nd Dam Bridge', desc:'Top of the productive lower Weber section — cold water releases from Pineview Reservoir keep this stretch fishable through summer. Brown trout stack below the outlet.',parking:'Turn into the picnic area just below the Pineview dam face on SR-39. Free. Short walk to the river below the diversion.',tags:['Dam Outlet','Brown Trout','Year-Round'],mode:'wade',lat:41.2644, lng:-111.8244},
        {name:'Ogden Canyon — SR-39 Pull-offs', desc:'Multiple gravel pull-offs along SR-39 through Ogden Canyon provide access to fast pocket water with wild browns and rainbow. Fish the runs and pools between the boulder gardens.',parking:'Gravel roadside pull-offs on SR-39 through Ogden Canyon. Free. Walk from the shoulder — river is usually visible from the road.',tags:['Canyon','Pocket Water','Wild Trout'],mode:'wade',lat:41.2344, lng:-111.8844},
        {name:'Rainbow Gardens / Lower Canyon Mouth', desc:'Bottom of the productive trout section where the canyon opens into the Ogden Valley. Good early morning streamer fishing before summer temperatures warm the flats.',parking:'Park at Rainbow Gardens Recreation Area on SR-39, east of Ogden. Free parking area. Walk the trail along the river.',tags:['Canyon Mouth','Streamer','Early Season'],mode:'wade',lat:41.2144, lng:-111.9344},
      ],
    },
  ],

  'Fremont River': [
    { id:'fremont-upper', name:'Upper Fremont — Fish Lake Plateau', subtitle:'Fish Lake Outlet → Bicknell (~20 miles)',
      char:'The Fremont River headwaters drop from Fish Lake through a high-elevation forested canyon before entering the broad Rabbit Valley near Bicknell. Cold, clear freestone water with wild cutthroat, rainbow, and brown trout. Light pressure. Scenic canyon with the Fishlake National Forest lining both banks. US-24 provides roadside access through much of the upper drainage.',
      elevation:'7,000–8,800 ft', length:'~20 miles', fishType:'Rainbow, Cutthroat, Brown',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy to moderate wading — clear water over cobble and gravel. Small to medium-sized stream. Hip waders usually adequate. Watch for slick algae-covered rocks in slower sections.',
      floatNote:'Not floatable — too small and too much gradient in the upper canyon.',
      access:[
        {name:'Fish Lake Outlet / Doctor Creek', desc:'The river begins its journey here below Fish Lake, just downstream of Doctor Creek Campground. Cold, crystal-clear water holds wild rainbow and cutthroat. Short walk from the campground to river access.',parking:'USFS Doctor Creek Campground and day-use area on Fish Lake. Day-use parking available. Walk the trail along the outlet stream to the river.',tags:['USFS','Headwaters','Cutthroat','Campground'],mode:'wade',lat:38.5544, lng:-111.7144},
        {name:'USFS Road 206 / Upper Canyon Pull-offs', desc:'Multiple pull-offs along the forest service road following the Fremont through the upper canyon before the highway. Less-traveled stretch with wild fish seeing minimal pressure.',parking:'Dispersed parking on USFS Rd 206, accessible from SR-25 south of Fish Lake. Free. Multiple informal river access points.',tags:['USFS','Dispersed','Wild Trout','Light Pressure'],mode:'wade',lat:38.4944, lng:-111.6844},
        {name:'Fremont (Town) Bridge — US-24', desc:'Public access at the small community of Fremont where US-24 crosses the river. Wide riffle-pool sequence with good dry fly water in summer evenings. Attractor patterns dominate in this open valley stretch.',parking:'Park on the gravel shoulder near the US-24 bridge at the town of Fremont. Free. Walk the banks.',tags:['Town Access','Dry Fly','Walk-in'],mode:'wade',lat:38.4544, lng:-111.6044},
        {name:'Bicknell Town Access', desc:'Good public access at the bridges through Bicknell where the river begins its descent out of the plateau. Brown trout increase below town. Good morning hopper fishing in late summer on the meadow bends.',parking:'Multiple gravel pull-offs near the bridges in Bicknell on US-24. Free.',tags:['Town Access','Brown Trout','Hopper'],mode:'wade',lat:38.3444, lng:-111.5444},
      ],
    },
    { id:'fremont-middle', name:'Middle Fremont — Capitol Reef Area', subtitle:'Torrey → Capitol Reef National Park (~25 miles)',
      char:'The most dramatic and accessible section of the Fremont. The river flows through red rock canyon on its way to Capitol Reef National Park — pastel cliffs, cottonwood corridors, and surprisingly good brown and rainbow trout fishing. The National Park boundary begins just east of Torrey. Within the park, fishing is open year-round with standard regulations. The scenic drive follows the river providing excellent access.',
      elevation:'5,200–7,000 ft', length:'~25 miles', fishType:'Brown, Rainbow, Cutthroat',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy wading on gravel and cobble in the broad valley sections. Technical in the narrow canyon cuts within the park. Sandstone-bottomed sections can be slick.',
      floatNote:'Not floatable — gradient and canyon narrows preclude safe floating.',
      access:[
        {name:'Torrey Town — SR-12/US-24 Junction', desc:'Good access near Torrey at the junction of SR-12 and US-24. Brown and rainbow trout in the willow-lined bends. Several access points from town. Excellent dry fly water on summer evenings.',parking:'Park near the Torrey town bridge or along US-24 east of town. Free. Walk the willow-lined banks.',tags:['Town Access','Dry Fly','Brown Trout'],mode:'wade',lat:38.2944, lng:-111.4144},
        {name:'Capitol Reef National Park — Fruita Campground', desc:'NPS campground directly on the Fremont River in Capitol Reef NP. Walk-in access to the river from all campsites. Excellent brown trout fishing — fruit orchards attract insects that fall into the river. NPS entrance fee required; camping is additional. Fish downstream from the orchards for rising trout under the cottonwoods.',parking:'Capitol Reef NP campground at Fruita, on Scenic Drive off US-24. NPS entrance fee ($20/vehicle). Camping reservation required. Walk directly to river from sites.',tags:['National Park','Campground','Brown Trout','Iconic'],mode:'wade',lat:38.2844, lng:-111.2644},
        {name:'Capitol Reef Scenic Drive — River Pull-offs', desc:'The Capitol Reef Scenic Drive follows the Fremont for several miles through the heart of the park. Multiple pull-offs provide access to different river stretches past petroglyphs and beneath dramatic red cliffs. Some of the most scenic trout fishing in Utah.',parking:'Scenic Drive begins at the visitor center. Fee ($20/vehicle). Multiple signed pull-offs with short walks to the river.',tags:['National Park','Scenic Drive','Historic','Cottonwoods'],mode:'wade',lat:38.2744, lng:-111.2244},
        {name:'Notom Road Access (Below Park)', desc:'Just east of the park boundary on Notom Road, the river transitions to the lower canyon. Less touristed than the park section but equally productive. Good brown trout in the pools below the canyon narrows.',parking:'Turn south on Notom Rd from US-24 near the park east boundary. Gravel pull-offs where the road crosses or approaches the river. Free.',tags:['Below Park','Walk-in','Brown Trout'],mode:'wade',lat:38.2544, lng:-111.1544},
      ],
    },
    { id:'fremont-lower', name:'Lower Fremont — Caineville Desert', subtitle:'Caineville Wash → Dirty Devil Confluence (~30 miles)',
      char:'The lower Fremont is desert canyon water — dramatic, remote, and increasingly warm as it drops toward the Dirty Devil River confluence. Trout populations thin significantly below Caineville. This section is primarily visited for its otherworldly scenery rather than fishing. The badlands terrain features eroded blue-gray bentonite badlands. A small population of brown trout hangs on in the deeper spring-fed pools near Caineville but the fishery is marginal. Best explored in spring when flows are higher and temperatures cooler.',
      elevation:'4,500–5,200 ft', length:'~30 miles', fishType:'Brown (sparse), Warm Water Species',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy wading in low flows but sections can run muddy with runoff from the badlands. Limited shade — schedule morning fishing. Not worth the drive in summer heat.',
      floatNote:'Not floatable in normal conditions.',
      access:[
        {name:'Caineville USGS Gauge Access', desc:'The USGS flow gauge site near Caineville provides the best public access to the lower river. A small population of brown trout persists in the spring-fed pools here. Best fished early spring when water is coldest.',parking:'Small gravel pull-off near the gauge house on US-24 near Caineville. Free. Walk the bank.',tags:['USGS Gauge','Early Season','Brown Trout'],mode:'wade',lat:38.3144, lng:-110.9644},
        {name:'Factory Butte / North Wash Road', desc:'Remote access to the lower desert section via North Wash Road. Almost entirely scenic rather than productive fishing. The backdrop of Factory Butte and the Caineville Reef is extraordinary.',parking:'Turn onto North Wash Rd from US-24. Dispersed BLM pull-offs near the river. Free. Very remote — bring water.',tags:['Remote','BLM','Scenic','Low Fish Density'],mode:'wade',lat:38.2144, lng:-110.8244},
      ],
    },
  ],

  'Strawberry River': [
    { id:'straw-upper', name:'Upper Strawberry — Uinta Backcountry', subtitle:'Headwaters → Strawberry Reservoir Inlet (~25 miles)',
      char:'The Strawberry River begins high in the Uinta Mountains — headwater tributary streams draining Ashley National Forest into Strawberry Reservoir. This upper section is lightly fished mountain stream water with wild rainbow, cutthroat, and small browns. Access is via forest roads from US-40. Many anglers overlook this section in favor of the famous tailwater below the reservoir. Open roads in July; snowbound earlier.',
      elevation:'8,000–9,800 ft', length:'~25 miles', fishType:'Rainbow, Cutthroat, Brook',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy wading — small mountain stream. Hip waders adequate. Watch for late snowmelt keeping flows elevated through June.',
      floatNote:'Not floatable — too small.',
      access:[
        {name:'Strawberry Valley USFS Roads (FR-131 / FR-132)', desc:'Forest roads branching off US-40 at the Strawberry Valley exit access the upper river drainage. Multiple small streams converge to form the main river. Wild cutthroat and small rainbow in lightly pressured headwaters.',parking:'Turn onto USFS Rd 131 (Strawberry Valley Rd) from US-40. Dispersed parking at pulloffs along the forest road. Free. Roads open July–October.',tags:['USFS','Headwaters','Cutthroat','Light Pressure'],mode:'wade',lat:40.2144, lng:-110.9244},
        {name:'Strawberry Reservoir Inlet Flats', desc:'Where the river enters Strawberry Reservoir at the north end. During high water, large reservoir cutthroat and rainbow move into the inlet to feed. Wade the shallows near the inlet channel — can be spectacular.',parking:'Drive to the north end of the reservoir on the gravel access road from US-40. Free. Roadside parking near the inlet.',tags:['Reservoir Inlet','Large Fish','Seasonal'],mode:'wade',lat:40.2544, lng:-111.1644},
      ],
    },
    { id:'straw-tailwater', name:'Strawberry Tailwater — Blue Ribbon', subtitle:'Strawberry Dam → Soldier Creek Confluence (~8 miles)',
      char:'The crown jewel of the Strawberry River system. Cold water releases from Strawberry Reservoir create world-class tailwater fishing for trophy rainbow and cutthroat averaging 16–20". Designated Blue Ribbon Trout Water. Catch-and-release only in most of the tailwater section. Heavily stocked but also holds wild fish. Year-round fishing; best March–June and September–November. The entire section is accessible via a trail along the north bank.',
      elevation:'7,600–7,800 ft', length:'~8 miles', fishType:'Rainbow (trophy), Cutthroat',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Moderate wading — cobble and gravel bottom with consistent dam-regulated flows. Felt soles recommended. Watch BOR flow releases before fishing.',
      floatNote:'Not floatable — designated wade-only fishery.',
      access:[
        {name:'Strawberry Dam Outlet / Tailwater Trailhead', desc:'Top of the Blue Ribbon tailwater directly below the Strawberry Dam face. Largest concentration of fish in the entire river. The trail runs the entire 8 miles to Soldier Creek. Some of the most productive water on the trail is within 0.5 miles of the dam.',parking:'Turn left off US-40 onto the Strawberry Reservoir Rd and follow signs to the dam outlet. Free parking at the trailhead/access area. Vault restrooms available.',tags:['Blue Ribbon','Dam Outlet','Trophy','Year-Round'],mode:'wade',lat:40.1633, lng:-111.1533},
        {name:'Mid-Tailwater Trail Access — Mile 2–4', desc:'The trail along the north bank provides access to the mid-section where most anglers thin out. Fish the classic riffle-pool sequences away from the dam crowds. Best dry fly water on the entire river.',parking:'Access via the tailwater trail from either the dam outlet (2–4 mile walk) or from the Soldier Creek Road upstream. Free.',tags:['Walk-in','Trail','Less Crowded','Dry Fly'],mode:'wade',lat:40.1533, lng:-111.1244},
        {name:'Soldier Creek Road Access', desc:'FR-131 (Soldier Creek Rd) parallels the lower tailwater section providing multiple vehicle access points. Less walked than the upper trail section. Good streamer and nymph water in the deeper runs here.',parking:'Turn onto Soldier Creek Rd (FR-131) from US-40 at the Soldier Creek Campground exit. Multiple gravel pull-offs where the road approaches the river. Free.',tags:['Road Access','Soldier Creek','Lower Tailwater'],mode:'wade',lat:40.1333, lng:-111.0944},
      ],
    },
    { id:'straw-canyon', name:'Lower Strawberry — Strawberry Canyon', subtitle:'Soldier Creek Confluence → Duchesne River (~30 miles)',
      char:'Below the tailwater section the Strawberry River enters a remote canyon on its way to the Duchesne. The canyon is BLM and Uintah-Ouray Tribal land — verify boundaries and permits before fishing. Wild rainbow and brown trout in lightly fished water. The farther from the tailwater, the fewer anglers. Access is limited and some sections require significant hiking. A worthwhile destination for anglers seeking solitude.',
      elevation:'5,800–7,600 ft', length:'~30 miles', fishType:'Rainbow, Brown, Whitefish',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Moderate to difficult — canyon walls close in, boulders and bedrock pools. Some stretches require scrambling. Check tribal land boundaries.',
      floatNote:'Not practically floatable — too technical and remote for standard float.',
      access:[
        {name:'Fruitland / US-40 Bridge Access', desc:'Where US-40 crosses the Strawberry River near Fruitland is the best public access to the lower canyon. Large pool at the bridge holds brown and rainbow trout. USGS gauge is located here (site 09295000).',parking:'Pull off on the gravel shoulder near the Strawberry River bridge on US-40 at Fruitland. Free. Walk up or downstream.',tags:['Highway Access','Brown Trout','USGS Gauge'],mode:'wade',lat:40.0444, lng:-110.8244},
        {name:'Starvation Reservoir Inlet Area', desc:'Where the Strawberry River enters Starvation Reservoir near Duchesne. Large reservoir fish migrate into the river inlet in spring and fall. Good access from the state park.',parking:'Turn into Starvation State Park off US-40 near Duchesne. Day-use fee ($10). Walk to the river inlet area at the north end of the reservoir.',tags:['State Park','Reservoir Inlet','Spring Run'],mode:'wade',lat:40.1844, lng:-110.4444},
      ],
    },
  ],

  'Duchesne River': [
    { id:'duchesne-northfork', name:'North Fork — Ashley Canyon', subtitle:'North Fork Rd (FR-144) → SR-35 Confluence (~15 miles)',
      char:'The North Fork of the Duchesne is the most scenic and remote of the three forks — a deep Ashley National Forest canyon with steep limestone walls and a forested corridor of aspen, spruce, and fir. Brook, brown, and rainbow trout in cold, clear water. USFS campgrounds at Aspen, Hades, and Iron Mine provide direct river access. FR-144 follows the entire North Fork from SR-35 to the wilderness boundary. Closed January 1 through the second Saturday of July to protect spawning fish.',
      elevation:'7,200–9,400 ft', length:'~15 miles', fishType:'Brook, Brown, Rainbow',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy to moderate wading on cobble and boulders. Stream is moderate-sized — hip waders adequate. Watch for deep pools at cliff base.',
      floatNote:'Not floatable — too steep and canyon-bound.',
      access:[
        {name:'SR-35 / FR-144 Junction — Lower North Fork', desc:'Turn onto Forest Road 144 from SR-35 at milepost 35.5, approximately 13 miles north of Tabiona. The road follows the North Fork upstream into the canyon. The lower section near the junction has good brown trout and is the first accessible water after the SR-35 drive.',parking:'Pull off on the gravel shoulder at the FR-144 / SR-35 junction. Free. Walk down to the river from the road junction. No developed facilities at the lower access.',tags:['USFS','Canyon Mouth','Brown Trout','FR-144'],mode:'wade',lat:40.5533, lng:-110.8544},
        {name:'Aspen Campground', desc:'USFS campground at 7,200 ft, nestled in aspen and subalpine fir alongside the North Fork. All sites are within steps of the river. Good brook and brown trout water in the runs and pools beside the campground. Popular base camp for upper canyon exploration.',parking:'Paved USFS fee campground on FR-144, approximately 13 miles from Tabiona via SR-35. Reservation recommended in summer. Vault toilets, picnic tables, fire rings.',tags:['USFS','Campground','Brook Trout','Aspen'],mode:'wade',lat:40.5733, lng:-110.8744},
        {name:'Hades Campground', desc:'Mid-canyon USFS campground at higher elevation. Smaller than Aspen, quieter and more remote. The North Fork narrows here with deeper pools and better brook trout fishing away from the road pressure. Great early-morning dry fly water.',parking:'USFS fee campground on FR-144 above Aspen. Gravel road, high-clearance vehicle recommended past this point. Vault toilets.',tags:['USFS','Campground','Remote','Brook Trout'],mode:'wade',lat:40.5933, lng:-110.8944},
        {name:'Iron Mine Campground', desc:'Upper North Fork USFS campground near the wilderness boundary. Highest elevation access on the North Fork — cold, pristine water with native cutthroat and brook trout. Minimal pressure above this point.',parking:'USFS fee campground on FR-144 near the end of the maintained road. High-clearance vehicle required. Vault toilets.',tags:['USFS','Upper Canyon','Cutthroat','Wilderness Edge'],mode:'wade',lat:40.6244, lng:-110.9144},
      ],
    },
    { id:'duchesne-westfork', name:'West Fork — Blue Ribbon (Artificial Only)', subtitle:'USFS Boundary → North Fork Confluence (~16 miles)',
      char:'The West Fork of the Duchesne is designated Blue Ribbon by the State of Utah and is the premier fly fishing section of the entire system. Artificial flies and lures only from the confluence with the North Fork upstream to the headwaters including Wolf Creek. Wild Colorado River cutthroat and brown trout in a beautiful forested canyon. The upper portion flows through Ashley National Forest; the lower portion crosses private land with DWR-acquired public access easements marked by brown signs along SR-35. Closed January 1 through the second Saturday of July.',
      elevation:'6,900–9,600 ft', length:'~16 miles', fishType:'Cutthroat (Colorado River), Brown, Rainbow',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy to moderate wading. Upper sections are smaller, technical pocket water; lower reaches open up. Felt soles recommended on algae-covered rocks in slower pools.',
      floatNote:'Not floatable.',
      access:[
        {name:'Upper West Fork — USFS Land (SR-35 Access)', desc:'Where SR-35 approaches the West Fork drainage above Hanna, several pull-offs provide access to the upper USFS-managed section. This is the easiest access to the public land portion of the West Fork. Wild cutthroat fishing at its best — light pressure, attractor dry flies, and gin-clear water.',parking:'Gravel pull-offs on SR-35 where the road parallels the West Fork, approximately 14 miles northwest of Hanna. Free. Walk down to the stream from the road.',tags:['USFS','Blue Ribbon','Cutthroat','Artificial Only'],mode:'wade',lat:40.4933, lng:-110.8344},
        {name:'DWR Access Easement Points — Lower West Fork', desc:'The Utah DWR has acquired angler-access easements through the private land on the lower West Fork. Access points are marked by small brown signs with pull-outs along SR-35. Do not park on the highway shoulder — use the designated pull-outs only. The stream is productive for brown and cutthroat throughout this section.',parking:'Designated brown-sign DWR pull-outs on SR-35 between Hanna and the North Fork confluence. Free. Day use only — no camping.',tags:['DWR','Easement','Access Points','Blue Ribbon'],mode:'wade',lat:40.4644, lng:-110.8133},
        {name:'West Fork / North Fork Confluence', desc:'The confluence of the West and North Forks forms the Duchesne River proper. Access the confluence area from SR-35 just off the highway near the Hanna area. Both forks hold fish near the confluence and the main stem begins here.',parking:'Small gravel pull-off on SR-35 near the confluence. Free. Short walk to the river.',tags:['Confluence','Access Point','DWR'],mode:'wade',lat:40.4388, lng:-110.8022},
      ],
    },
    { id:'duchesne-mainstem', name:'Main Stem — Hanna Access (Blue Ribbon)', subtitle:'North Fork Confluence → Sand Creek Bridge (~3.5 miles)',
      char:'The Blue Ribbon main stem Duchesne between the North Fork confluence and Sand Creek Bridge is the most accessible and heavily fished public water on the system. The Utah DWR has acquired a 3.5-mile angler-access easement through private land here — a critical piece of public fishing water. Access points are marked with brown signs along SR-35 with designated pull-outs. Day use only; no camping. Below Sand Creek Bridge all land is private — no access. This compact stretch holds stout rainbow, brown, and whitefish and is worth every mile of the drive from the Wasatch Front.',
      elevation:'6,300–6,500 ft', length:'~3.5 miles', fishType:'Rainbow, Brown, Whitefish, Cutthroat',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy wading throughout — the main stem is broader and slower than the forks. Gravel and cobble bottom. Hip or chest waders depending on season.',
      floatNote:'Not floatable through this section.',
      access:[
        {name:'North Fork Confluence Access — DWR', desc:'The upstream end of the main stem Blue Ribbon easement, just below where the North and West Forks join. The confluence pool and first 0.5 miles of main stem are the most productive. Big brown trout hold in the deep pool at the fork junction.',parking:'Brown-sign DWR pull-out on SR-35 near the North Fork confluence, just south of milepost 38. Free. Day use only — no camping or campfires.',tags:['DWR','Blue Ribbon','Confluence Pool','Brown Trout'],mode:'wade',lat:40.4344, lng:-110.7944},
        {name:'Mid-Easement Access Points — SR-35', desc:'Two to three brown-sign DWR access points mark the middle of the 3.5-mile easement. These mid-stretch spots receive less pressure than the confluence end and offer good riffle-pool sequences for nymphing and dry fly. Stonefly and PMD hatches June–July are excellent.',parking:'Designated DWR pull-outs on SR-35 between milepost 37 and 38. Free. Day use only.',tags:['DWR','Mid-Stretch','Nymphing','Dry Fly'],mode:'wade',lat:40.4244, lng:-110.7844},
        {name:'Sand Creek Bridge — Downstream Terminus', desc:'The lower boundary of the public access easement. Sand Creek enters from the east just above the bridge. Below this point all land is private with no angler access. Fish the last pool above the bridge — it often holds the largest fish on this stretch.',parking:'Pull-off near the Sand Creek Bridge on SR-35, approximately at milepost 37. Free. Day use only.',tags:['DWR','Easement Boundary','Terminal Access'],mode:'wade',lat:40.4122, lng:-110.7722},
      ],
    },
    { id:'duchesne-lower', name:'Lower Duchesne — Tabiona to Green River', subtitle:'Tabiona → Green River Confluence (~80 miles)',
      char:'Below the Hanna access area, the Duchesne River flows southeast through the Uintah Basin across land that is almost entirely private or tribal. Trout populations thin significantly below Tabiona as the river warms and slows. Below Myton the river is warm-water species territory — catfish, bass, and carp dominate. The lower river confluence with the Green River near Ouray is within the Ute Tribal lands and requires a tribal fishing permit. Not a primary trout fly fishing destination, but worth noting for anglers exploring the full system.',
      elevation:'4,900–6,300 ft', length:'~80 miles', fishType:'Brown, Rainbow (upper), Warm Water (lower)',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy wading where accessible, but access is the primary challenge — mostly private land.',
      floatNote:'Technically floatable but very limited takeout options due to private/tribal ownership.',
      access:[
        {name:'Tabiona Town Bridge', desc:'One of the few public access points on the lower river. The SR-208 bridge at Tabiona provides a short stretch of walk-in fishing in the town corridor. Brown trout and whitefish hold in the bends. Limited but free access.',parking:'Park near the SR-208 bridge in Tabiona. Free. Limited roadside parking.',tags:['Town Access','Limited Access','Brown Trout'],mode:'wade',lat:40.3444, lng:-110.7144},
        {name:'Duchesne City Access — Knight Diversion', desc:'Limited public access near the city of Duchesne around the Knight Diversion structure where SR-87 crosses the river. Below the diversion the species mix transitions toward warm-water fish. Worth checking regulations — special rules apply below the diversion.',parking:'Park near the city bridge on SR-87 in Duchesne. Free. Limited access.',tags:['Town Access','Regulation Boundary','Warm Water Transition'],mode:'wade',lat:40.1644, lng:-110.4044},
      ],
    },
  ],

  'Diamond Fork': [
    { id:'dfork-lower', name:'Lower Canyon — Mitigation Access Corridor', subtitle:'Spanish Fork River Confluence → USFS Boundary (~1.3 miles)',
      char:'The lower 1.3 miles of Diamond Fork Canyon is publicly owned mitigation land acquired as part of the Central Utah Project. This is the most accessible stretch on the entire system — multiple DWR parking areas with restrooms line Diamond Fork Road from the canyon mouth to the USFS boundary. Brown trout dominate with some stocked rainbow. General regulations apply here (bait allowed, 4-fish limit). The canyon recovered well from the 2018 wildfires that impacted upper sections. A genuinely good brown trout fishery close to the Wasatch Front — often overlooked in favor of the Provo.',
      elevation:'4,800–5,200 ft', length:'~1.3 miles', fishType:'Brown, Rainbow',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy wading on cobble and gravel throughout. River is medium-sized with stable flows year-round due to the Central Utah Project pipeline regulating releases. Hip waders adequate most of the season.',
      floatNote:'Not floatable — too small and rocky.',
      access:[
        {name:'Diamond Fork Road — Lower Parking Area #1', desc:'First DWR parking area just inside the canyon off Diamond Fork Rd from US-6. Restrooms on site. Walk directly to the river. The pool at the canyon mouth holds fish year-round.',parking:'Paved DWR day-use parking lot on Diamond Fork Rd, approximately 0.5 miles from US-6 junction near Springville. Free. Restrooms on site.',tags:['DWR','Mitigation Land','Year-Round','Restrooms'],mode:'wade',lat:40.1133, lng:-111.5133},
        {name:'Diamond Fork Road — Mid Corridor Parking Areas', desc:'Several DWR parking areas with restrooms spaced along the lower mitigation corridor. Each gives direct access to different pool-riffle sequences. Mid-corridor spots get slightly less pressure than the highway end.',parking:'Multiple paved DWR day-use lots along Diamond Fork Rd. Free. Restrooms at each. Day use only.',tags:['DWR','Walk-in','Multiple Access Points'],mode:'wade',lat:40.1222, lng:-111.5044},
        {name:'Springville Crossing — Regulation Boundary', desc:'The USFS boundary and regulation change point. Above here: artificial flies and lures only; cutthroat possession closed. The pool just below the crossing is among the most productive on the lower section.',parking:'Small DWR pull-off at the Springville Crossing area. Free. Restrooms nearby at adjacent lots.',tags:['Regulation Boundary','Artificial Only Above'],mode:'wade',lat:40.1311, lng:-111.4944},
      ],
    },
    { id:'dfork-middle', name:'Middle Canyon — Artificial Only', subtitle:'Springville Crossing → Three Forks (~6 miles)',
      char:'Above Springville Crossing the rules shift to artificial flies and lures only — cutthroat possession closed. This is the heart of Diamond Fork\'s wild fishery. Brown trout up to 20" hold in the deeper canyon runs and undercut banks. The canyon narrows with dramatic walls and cottonwood-lined banks. USFS campgrounds at Diamond Fork, Palmyra, and Sawmill Hollow provide access throughout. October Caddis (mid-Sept through Oct) and hoppers (Aug) are the signature hatches. Flows run a stable ~45 cfs in summer thanks to Central Utah Project management — rare for a Utah freestone stream.',
      elevation:'5,200–6,000 ft', length:'~6 miles', fishType:'Brown, Rainbow, Cutthroat',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Moderate wading — canyon narrows with boulder gardens in places. Felt soles recommended on slick canyon sandstone.',
      floatNote:'Not floatable.',
      access:[
        {name:'Diamond Fork Campground', desc:'Large USFS campground in the artificial-only section with direct river access. Multiple trail entry points to different pool and riffle sequences. Good brown trout water immediately adjacent to the sites.',parking:'Paved USFS fee campground on Diamond Fork Rd. Day-use parking available. Restrooms, fire rings. Open May–October.',tags:['USFS','Campground','Artificial Only'],mode:'wade',lat:40.1444, lng:-111.4744},
        {name:'Palmyra Campground', desc:'Smaller, quieter USFS campground mid-canyon. Less traffic than Diamond Fork Campground. The river here flows through tight canyon with good pocket water and undercut banks. August hopper fishing in the open meadow stretch above camp is excellent.',parking:'USFS fee campground on Diamond Fork Rd. Day-use parking at entrance. Vault restrooms.',tags:['USFS','Campground','Pocket Water','Hopper'],mode:'wade',lat:40.1644, lng:-111.4533},
        {name:'Sawmill Hollow Campground', desc:'Upper end of the middle section, closest USFS camp to Three Forks. The winter gate is near here — park and walk ~2 miles to access upper sections when the road is gated in winter.',parking:'USFS fee campground on Diamond Fork Rd. Road may be gated in winter — walk from gate when closed.',tags:['USFS','Campground','Winter Gate'],mode:'wade',lat:40.1811, lng:-111.4344},
      ],
    },
    { id:'dfork-upper', name:'Upper Diamond Fork — Three Forks & BCT Headwaters', subtitle:'Three Forks → BCT Headwaters (~12 miles)',
      char:'Three Forks is the confluence of Diamond Fork\'s major tributaries — including Sixth Water Creek — and marks the transition to headwaters managed for native Bonneville Cutthroat Trout (BCT). A fish migration barrier near Three Forks prevents non-native species from entering ~21 miles of BCT habitat (Upper Diamond Fork, Shingle Mill Creek, Chase and Halls Fork Creek). Flows decrease significantly above Three Forks — classic small-stream cutthroat fishing. The 2018 wildfires affected this watershed; BCT have been stocked to supplement recovering wild populations.',
      elevation:'6,000–8,500 ft', length:'~12 miles', fishType:'Cutthroat (BCT), Brown (near confluence), Brook',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy to moderate wading in small-stream conditions. Hip waders adequate. Brushy banks require careful approach. High-clearance vehicle needed for upper road access.',
      floatNote:'Not floatable.',
      access:[
        {name:'Three Forks Area', desc:'The confluence of Sixth Water Creek and other tributaries forming the upper Diamond Fork. Large brown trout hold in the deep confluence pool. This is both the top of the brown trout fishery and the gateway into BCT water above the migration barrier.',parking:'Gravel road pull-off near Three Forks on Diamond Fork Rd. Free. Road quality degrades above — check conditions.',tags:['USFS','Confluence','Trophy Brown','BCT Boundary'],mode:'wade',lat:40.2033, lng:-111.3844},
        {name:'Upper Diamond Fork Road Pull-offs', desc:'Dispersed gravel pull-offs above the migration barrier access the small-stream BCT water. Most anglers stop at the campgrounds below — very light pressure up here. Small attractor dries for wild Bonneville cutthroat.',parking:'Dispersed pull-offs on upper Diamond Fork Rd. Free. High-clearance vehicle recommended. Road may be impassable when wet.',tags:['USFS','Dispersed','BCT','Light Pressure'],mode:'wade',lat:40.2311, lng:-111.3544},
      ],
    },
  ],

  'Sixth Water Creek': [
    { id:'sixth-lower', name:'Lower Sixth Water — Ray\'s Valley', subtitle:'Diamond Fork Confluence → Ray\'s Valley Bridge (~3 miles)',
      char:'The most accessible and productive section of Sixth Water Creek. The stream enters Diamond Fork at Three Forks and winds through canyon before opening at Ray\'s Valley. Designated Bonneville Cutthroat Trout (BCT) water and a key site for the Utah Cutthroat Slam. Ray\'s Valley Bridge is the signature access point — both above and below produce BCT and brown trout. Small to medium-sized stream with an intimate, attractor-dry feel. The lower canyon requires a short hike from Three Forks; Ray\'s Valley is directly road-accessible.',
      elevation:'5,800–6,400 ft', length:'~3 miles', fishType:'Cutthroat (BCT), Brown',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy wading in small stream. Hip waders or wet wading fine in summer. Rocky canyon floor — watch footing.',
      floatNote:'Not floatable.',
      access:[
        {name:'Ray\'s Valley Bridge', desc:'The signature Sixth Water access — where the canyon opens into Ray\'s Valley. Fish both above and below the bridge. The pool under the bridge holds fish year-round and is the most reliable BCT spot on the creek. Parachute Adams, Elk Hair Caddis, and small nymphs are the go-to approach.',parking:'Small gravel pull-off at Ray\'s Valley Bridge on the access road off Diamond Fork Rd. Free. High-clearance vehicle recommended for the access road.',tags:['BCT','Utah Cutthroat Slam','Bridge Pool'],mode:'wade',lat:40.1922, lng:-111.4133},
        {name:'Three Forks — Sixth Water Confluence', desc:'Where Sixth Water enters Diamond Fork. Access the lower reach of Sixth Water by walking upstream from the confluence pool. Large browns from Diamond Fork mix with cutthroat here making the confluence pool the most diverse fishing on the creek.',parking:'Gravel pull-off at Three Forks on Diamond Fork Rd. Free. Walk up into the Sixth Water drainage.',tags:['USFS','Confluence','BCT','Brown Trout'],mode:'wade',lat:40.2033, lng:-111.3844},
      ],
    },
    { id:'sixth-upper', name:'Upper Sixth Water — Hot Springs Canyon', subtitle:'Ray\'s Valley → Fifth Water Hot Springs Area (~4 miles)',
      char:'The upper canyon is some of the most scenic fishing in Utah — a narrow slot canyon trail leads toward the famous Fifth Water Hot Springs. Important distinction: Fifth Water Creek is a warm-water spring tributary (reaching ~100°F) and is not a fishery. Sixth Water carries the cold trout water. The trail climbs away from the creek in the upper canyon making stream access intermittent — fishing is secondary to the experience here, but BCT and brook trout can be found throughout. The trailhead also serves as the winter walk-in access point for lower Diamond Fork when the road gate is closed.',
      elevation:'6,400–7,200 ft', length:'~4 miles', fishType:'Cutthroat (BCT), Brook',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Hike-in fishing — trail follows creek for first ~2 miles then climbs above the canyon. Best access in the first mile from the trailhead and near the hot springs junction. Wet wading fine in summer.',
      floatNote:'Not floatable.',
      access:[
        {name:'Fifth Water / Sixth Water Trailhead', desc:'The main trailhead for the upper canyon. Trail follows Sixth Water ~2.5 miles to the Fifth Water Hot Springs junction. Fish the creek along the trail where accessible — best in the first mile and near the junction. Note: Fifth Water itself (the hot spring tributary) is not a fishery — fish Sixth Water above and below the junction instead.',parking:'Paved USFS trailhead lot on Diamond Fork Rd near the winter gate. Free. Restrooms at trailhead. Fills early on summer weekends — arrive before 8am.',tags:['USFS','Trailhead','BCT','Hot Springs Adjacent'],mode:'wade',lat:40.1944, lng:-111.4044},
        {name:'Upper Canyon — Beyond Hot Springs', desc:'Past the Fifth Water junction the trail continues up into the quieter upper Sixth Water canyon. Most day hikers stop at the hot springs leaving this stretch nearly deserted. Small wild BCT in cold headwater pools. Combine a hot springs soak with a morning of fishing on the way up.',parking:'Access via the Fifth Water Trailhead. Continue ~2.5 miles past the hot springs junction. Total 3–5 miles one-way.',tags:['Hike-in','Remote','BCT','Light Pressure'],mode:'wade',lat:40.2144, lng:-111.3744},
      ],
    },
  ],

  'Green River': [
    { id:'green-a', name:'A Section', subtitle:'Flaming Gorge Dam → Little Hole (7 miles)',
      char:'The crown jewel of Western tailwaters. 7 miles of Blue Ribbon water below the dam — trophy rainbow and brown trout averaging 16–20". Up to 15,000 fish per mile. No camping allowed in Section A. The Red Canyon National Recreation Trail runs the entire north bank, giving walk-in access to all 7 miles.',
      elevation:'5,600 ft', length:'7 miles', fishType:'Rainbow, Brown (trophy)',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Wadable throughout on consistent dam-controlled flows. Felt soles essential on slick algae-covered cobble. Watch BOR flow release schedules before going.',
      floatNote:'The classic Green River drift. Put in at the Spillway Boat Ramp, float 7 miles to Little Hole. Class I–II only. Half-day to full-day depending on fishing stops.',
      access:[
        {name:'Spillway Boat Ramp',desc:'Primary A Section put-in, directly below Flaming Gorge Dam. Most productive and most crowded stretch on the entire river. Constant dam-regulated flows year-round. Walk-in access to the entire A Section via the Red Canyon NRT heading downstream.',parking:'Paved USFS lot at Spillway Recreation Area. Take FR-219 (Spillway Boat Launch Rd) south 1.4 mi from US-191. 40+ spaces, vault toilets, boat ramp.',tags:['Public','USFS','Boat Ramp','Trophy'],mode:'both',lat:40.9122, lng:-109.4233},
        {name:'Red Canyon NRT — Mid-Section Pull-offs',desc:'The National Recreation Trail provides bank access at the 2, 3, and 4-mile marks along the A Section. Less crowded than the ramp zones with equally productive water.',parking:'No drive-in access at mid-section. Park at Spillway Ramp or Little Hole and hike the NRT. Grasshopper Flats (~mile 3) is a well-known destination for sight fishing.',tags:['Public','Trail','Less Crowded','Sight Fishing'],mode:'wade',lat:40.9155, lng:-109.4033},
        {name:'Little Hole Recreation Area',desc:'A Section take-out and B Section put-in. NRT trailhead for walk-in upstream into the A Section. Fish-cleaning station and vault restrooms.',parking:'Large paved USFS lot at Little Hole off Little Hole Rd, ~6 miles from Dutch John. Fee required. Restrooms, fish-cleaning station, boat ramp.',tags:['Public','USFS','Boat Ramp','Take-out / Put-in'],mode:'both',lat:40.9033, lng:-109.3855},
      ],
    },
    { id:'green-b', name:'B Section', subtitle:'Little Hole → Indian Crossing (9 miles)',
      char:'Remote canyon with 17 float-in campsites. More riffles and slightly fewer fish than A Section, but bigger average size. Less pressure. Outstanding streamer fishing in deep canyon runs. Road access only at the endpoints — all mid-section access is float-in.',
      elevation:'5,400 ft', length:'9 miles', fishType:'Rainbow, Brown',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'More technical wading — faster riffles, larger boulders, studded boots essential. Access primarily by floating and pulling over to wade productive runs.',
      floatNote:'Full-day float from Little Hole to Indian Crossing. 17 BLM river campsites for overnight trips. Longer shuttle via Browns Park Rd required.',
      access:[
        {name:'Little Hole Boat Ramp (B Section Put-in)',desc:'Launch here to float into the remote B Section canyon. Same facility as A Section take-out.',parking:'Paved USFS lot at Little Hole Recreation Area, ~6 miles from Dutch John. Fee required. Restrooms, boat ramp.',tags:['Public','USFS','Put-in'],mode:'float',lat:40.9033, lng:-109.3855},
        {name:'Red Creek Rapid (River Mile 4)',desc:'Class III rapid at the Red Creek tributary confluence, approximately 4 miles below Little Hole. Scout river-left before running. The river mellows into productive deep-run streamer water below here.',parking:'Float-in only. Park at Little Hole and float 4 miles downstream.',tags:['Float Access','Class III','Scout First'],mode:'float',lat:40.8944, lng:-109.3433},
        {name:'Indian Crossing Campground & Boat Ramp',desc:'B/C section boundary in Browns Park. BLM campground with vault toilets, potable water, and a boat ramp. Long but worthwhile drive for launching or taking out.',parking:'BLM gravel lot at Indian Crossing. Free. From US-191, take Browns Park Rd (UT-1364) east ~20 miles then turn right on Red Creek Rd, 2 miles west to the campground.',tags:['Public','BLM','Boat Ramp','Camping'],mode:'both',lat:40.9188, lng:-109.2944},
      ],
    },
    { id:'green-c', name:'C Section', subtitle:'Indian Crossing → Swallow Canyon (11.5 miles)',
      char:'The "lazy" section — low gradient, slow meandering water through Browns Park NWR. Reputed to hold the biggest fish of the entire system. Flat clear water demands long leaders and precise presentation. Dispersed camping throughout. Best for anglers willing to trade fish numbers for trophy potential.',
      elevation:'5,200 ft', length:'11.5 miles', fishType:'Brown (trophy), Rainbow',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Easy wading in wide shallow riffles. The challenge is the fish, not the wade. Long tippets and delicate presentations essential.',
      floatNote:'Full-day leisurely float. Slow current means more paddling. Take-out at Swallow Canyon Ramp or Swinging Bridge (just over the Colorado border).',
      access:[
        {name:'Indian Crossing Campground (C Section Put-in)',desc:'Start of the C Section float through Browns Park NWR. BLM campground with boat ramp, vault toilets, and potable water.',parking:'BLM gravel lot at Indian Crossing. Free. From US-191, take Browns Park Rd (UT-1364) east ~20 miles.',tags:['Public','BLM','Put-in','Camping'],mode:'float',lat:40.9188, lng:-109.2944},
        {name:'Browns Park NWR Road Access',desc:'Several gravel pull-offs along the main Browns Park Rd provide mid-section bank access through the NWR. Cottonwood bottom with excellent wildlife viewing and less-pressured bank fishing.',parking:'NWR gravel pull-offs along Browns Park Rd. Free. Short walks through cottonwood flats to the river bank.',tags:['Public','NWR','Walk-in'],mode:'wade',lat:40.8022, lng:-109.1688},
        {name:'Swallow Canyon Access (Take-out)',desc:'C Section take-out at the Utah/Colorado border. BLM boat ramp and primitive camping. Some anglers continue 3 miles downstream to Swinging Bridge in Colorado.',parking:'BLM gravel lot at Swallow Canyon. Free. Access via Browns Park Rd east to Swallow Canyon River Access Rd.',tags:['Public','BLM','Take-out'],mode:'float',lat:40.7522, lng:-109.0944},
      ],
    },
  ],


  /* ── WYOMING ── */

  'Snake River (WY)': [
    { id:'snake-wy-upper', name:'Upper Snake — Grand Teton NP', subtitle:'Jackson Lake Dam → Moose (~15 miles)',
      char:'Wild Snake River finespotted cutthroat in one of the most scenic fly fishing settings in the world. Braided channels, log jams, and gravel bars define this reach. Drift boat fishing is the standard — wading access limited but rewarding.',
      elevation:'6,200–6,800 ft', length:'~15 miles', fishType:'Snake River Finespotted Cutthroat',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Limited wade access inside GTNP — Schwabacher Landing and Pacific Creek areas best. Strong current and braided channels make wading technical. Felt soles or studded boots essential.',
      floatNote:'Classic drift boat float. Pacific Creek to Deadmans Bar (~10 mi) most popular. Deadmans Bar to Moose also excellent. Permit required for overnight floating inside GTNP.',
      access:[
        {name:'Pacific Creek Boat Launch (GTNP)',desc:'Grand Teton NP put-in near Moran Junction. Launch here for the upper braided reach. Permit required.',tags:['Public','NPS','Put-in'],mode:'float',lat:43.8654,lng:-110.5167},
        {name:'Schwabacher Landing',desc:'Walk-in wade access to a scenic braided side channel. Popular photography spot. Excellent early morning dry fly fishing for cutthroat.',tags:['Public','NPS','Walk-in'],mode:'wade',lat:43.7221,lng:-110.6543},
        {name:'Deadmans Bar',desc:'Mid-float take-out/put-in. Also wade access to gravel bars. Good hopper and dry fly water in summer.',tags:['Public','NPS','Put-in','Take-out'],mode:'both',lat:43.7089,lng:-110.6234},
        {name:'Moose Boat Ramp',desc:'Lower GTNP take-out. Also walk-in access to Moose-Wilson corridor side channels.',tags:['Public','NPS','Take-out'],mode:'both',lat:43.6572,lng:-110.7234},
      ],
    },
    { id:'snake-wy-lower', name:'Lower Snake — South Park & Hoback', subtitle:'Moose → Hoback Junction (~25 miles)',
      char:'Below GTNP the Snake opens into a wider valley. Less scenically dramatic but excellent dry fly and streamer fishing with lighter pressure. Hoback confluence adds volume and brown trout mix.',
      elevation:'5,600–6,200 ft', length:'~25 miles', fishType:'Cutthroat, Brown, Rainbow',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Good gravel bar wading at South Park and East Table Creek areas. Current is powerful — wading staff recommended.',
      floatNote:'South Park to Wilson Bridge or Hoback Jct. Multiple commercial outfitter launches in this stretch.',
      access:[
        {name:'South Park Bridge (WGFD)',desc:'Wyoming Game & Fish public access just below GTNP boundary. Primary wade and float launch for lower canyon.',tags:['Public','WGFD','Put-in'],mode:'both',lat:43.5891,lng:-110.7543},
        {name:'East Table Creek Boat Ramp',desc:'Mid-section put-in/take-out. Gravel bars accessible for wading. Good dry fly water.',tags:['Public','WGFD','Put-in','Take-out'],mode:'both',lat:43.5123,lng:-110.7812},
        {name:'Hoback Junction Takeout',desc:'Confluence of Snake and Hoback Rivers. Classic take-out for lower float. Also wade access at the confluence pool.',tags:['Public','Take-out'],mode:'both',lat:43.3456,lng:-110.8234},
      ],
    },
  ],

  'Green River (WY)': [
    { id:'green-wy-upper', name:'Upper Green — Warren Bridge', subtitle:'Headwaters → Warren Bridge (~40 miles)',
      char:'Remote high-desert freestone river with excellent wild brown and rainbow trout. Receives far less pressure than Utah\'s Green River. Best accessed via BLM roads. Hopper and attractor dry fly fishing is excellent July through September.',
      elevation:'6,800–8,200 ft', length:'~40 miles', fishType:'Brown, Rainbow, Cutthroat',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Easy to moderate wading on gravel and cobble. Flows drop significantly by late summer — hip waders adequate August onward.',
      floatNote:'Float from Warren Bridge to various BLM take-outs. Raft or hard-sided drift boat recommended — remote water with limited rescue options.',
      access:[
        {name:'Warren Bridge Access (BLM)',desc:'Primary BLM public access on upper Green. Well-known wade and float launch. Good hopper fishing near willows.',tags:['Public','BLM','Put-in'],mode:'both',lat:42.6123,lng:-109.8234},
        {name:'Big Piney / Marbleton BLM Access',desc:'Lower upper-section BLM access near Big Piney. Less pressured than Warren Bridge.',tags:['Public','BLM'],mode:'wade',lat:42.5456,lng:-110.1123},
      ],
    },
    { id:'green-wy-fontenelle', name:'Fontenelle Tailwater', subtitle:'Fontenelle Reservoir → La Barge (~15 miles)',
      char:'Cold, clear tailwater below Fontenelle Dam with excellent rainbow and brown trout. Dam release creates consistent cold temperatures through summer. One of Wyoming\'s most consistent summer fisheries.',
      elevation:'6,400 ft', length:'~15 miles', fishType:'Rainbow, Brown',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Moderate wading on cobble. Flow is regulated — check releases before wading. Water can rise quickly with power generation.',
      floatNote:'Drift boat or raft from dam access to La Barge. Multiple access points. Check BLM map before floating.',
      access:[
        {name:'Fontenelle Dam Outflow',desc:'Immediate below-dam access. Coldest water and highest trout density. Walk-in path from parking area.',tags:['Public','BLM','Walk-in'],mode:'wade',lat:42.0234,lng:-110.0654},
        {name:'La Barge BLM Access',desc:'Lower tailwater take-out and wade access. Less pressure than dam area. Good streamer water.',tags:['Public','BLM'],mode:'both',lat:41.9456,lng:-110.1234},
      ],
    },
  ],

  'North Platte River': [
    { id:'nplatte-saratoga', name:'Miracle Mile & Saratoga', subtitle:'Seminoe Dam → Alcova Reservoir (~65 miles)',
      char:'The "Miracle Mile" is one of Wyoming\'s most celebrated trout fisheries — a 5-mile heavily stocked reach immediately below Seminoe Dam. Below this, the river winds through the Platte Valley with excellent wild trout water near Saratoga.',
      elevation:'6,300–6,800 ft', length:'~65 miles', fishType:'Brown, Rainbow',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Classic wading water — cobble and gravel bottom, thigh-deep riffles. Wading staff helpful in higher flows. Miracle Mile section particularly wadeable.',
      floatNote:'Excellent drift boat float. Saratoga to various take-outs most popular. WGFD boat ramps at multiple points.',
      access:[
        {name:'Miracle Mile (WGFD)',desc:'Wyoming Game & Fish public access immediately below Seminoe Dam. The most famous section of the North Platte in Wyoming.',tags:['Public','WGFD'],mode:'wade',lat:42.1789,lng:-106.8654},
        {name:'Saratoga Town Access (WGFD)',desc:'Excellent public access through Saratoga. Multiple pull-offs along WY-130. Good tailwater conditions year-round.',tags:['Public','WGFD'],mode:'both',lat:41.4567,lng:-106.8123},
        {name:'Bennett Peak BLM',desc:'Remote BLM stretch above Rawlins. Wild fish, minimal pressure. 4WD recommended for access road.',tags:['Public','BLM'],mode:'wade',lat:41.9123,lng:-107.1234},
      ],
    },
  ],

  'Hoback River': [
    { id:'hoback-canyon', name:'Hoback Canyon', subtitle:'Hoback Junction → Hoback Rim (~25 miles)',
      char:'Small freestone tributary of the Snake with excellent wild cutthroat and brown trout. Remote canyon water accessed via US-189/191 corridor. Low pressure, willing fish, and spectacular mountain scenery.',
      elevation:'5,600–7,200 ft', length:'~25 miles', fishType:'Cutthroat, Brown',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy to moderate wading — small stream with gravel and cobble bottom. Hip waders adequate. Watch for flash flooding in afternoon storms.',
      floatNote:'Not floatable — too small and rocky throughout canyon.',
      access:[
        {name:'Hoback Junction Pull-offs',desc:'Multiple roadside pull-offs along US-191 near the Snake confluence. Best lower canyon access.',tags:['Public'],mode:'wade',lat:43.3456,lng:-110.8123},
        {name:'Granite Creek Campground (USFS)',desc:'USFS campground mid-canyon with direct river access. Good cutthroat fishing in riffles above campground.',tags:['Public','USFS'],mode:'wade',lat:43.4123,lng:-110.5678},
      ],
    },
  ],

  "Ham's Fork": [
    { id:'hamsfork-upper', name:"Upper Ham's Fork — Kemmerer Headwaters", subtitle:"Headwaters → Kemmerer (~30 miles)",
      char:'Underrated high-desert stream near Kemmerer with wild brown and rainbow trout. Minimal angling pressure. Flows through sagebrush flats and willow-lined banks. Excellent hopper and attractor dry fly fishing late summer.',
      elevation:'6,800–8,400 ft', length:'~30 miles', fishType:'Brown, Rainbow, Cutthroat',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy wading throughout — small to medium stream with gravel bottom. Hip waders adequate. Best flows April through July.',
      floatNote:'Not floatable — too shallow and narrow.',
      access:[
        {name:'Hams Fork Campground (USFS)',desc:"USFS campground on upper Ham's Fork. Direct river access. Wild brown trout in undercut banks.",tags:['Public','USFS'],mode:'wade',lat:41.8567,lng:-110.6789},
        {name:'Kemmerer BLM Access',desc:'BLM public access near Kemmerer. Accessible from US-189. Best lower upper-section access.',tags:['Public','BLM'],mode:'wade',lat:41.7923,lng:-110.5345},
      ],
    },
    { id:'hamsfork-lower', name:"Lower Ham's Fork — Granger Confluence", subtitle:"Kemmerer → Green River Confluence (~35 miles)",
      char:"Wider, slower lower reach as Ham's Fork winds through high-desert terrain toward the Green River confluence near Granger. Brown trout dominate. Excellent streamer water in fall.",
      elevation:'6,100–6,800 ft', length:'~35 miles', fishType:'Brown, Rainbow',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy wading on sand and gravel. Low gradient. Best accessed at bridge crossings.',
      floatNote:'Technically floatable at high water but not practical — too shallow most of the season.',
      access:[
        {name:'US-189 Bridge Access',desc:"Primary public access on lower Ham's Fork. Park at bridge and wade upstream or downstream.",tags:['Public'],mode:'wade',lat:41.6234,lng:-110.4567},
        {name:'Granger Area BLM',desc:'Near confluence with Green River. BLM access. Fall streamer fishing for large brown trout moving up from the Green.',tags:['Public','BLM'],mode:'wade',lat:41.5678,lng:-110.2123},
      ],
    },
  ],

  "Henry's Fork": [
    { id:'hf-box', name:'Box Canyon', subtitle:'Island Park Dam → Last Chance (~5 miles)',
      char:'World-famous Box Canyon. Powerful, heavy water with massive rainbow trout — 18–24" fish are the standard. One of the most technically demanding wade fisheries in the West. Fish are sophisticated, the current is demanding, and every presentation must be precise. TroutUnlimited manages access cooperatively with USFS.',
      elevation:'6,280 ft', length:'~5 miles', fishType:'Rainbow (trophy)',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Difficult wading — deep, fast water with slippery boulders. Wading staff essential. Wade only at established crossings. Fish with a buddy.',
      floatNote:'Not floatable — too fast and hazardous. Walk-and-wade only.',
      access:[
        {name:'Island Park Dam — Upper Box Canyon Access',desc:'Top of Box Canyon immediately below the dam outflow. Where the largest fish hold in cold, fast water. The most productive but most demanding water on the entire Henry\'s Fork. Short trail descends to the canyon rim.',parking:'Small USFS/TU gravel lot off Last Chance Rd, approximately 1 mile north of the Island Park Dam. 10–15 vehicles. Short trail to river.',tags:['Public','TU/USFS','Trophy','Difficult'],mode:'wade',lat:44.5022, lng:-111.3933},
        {name:'Box Canyon Lower — Harriman Boundary',desc:'Lower portion of Box Canyon where the canyon begins to open near the Harriman Ranch. Slightly less intense current with big PMD and BWO hatches in summer.',parking:'Harriman State Park trailhead lot off US-20. Day-use fee. Trail follows canyon rim with river drop-downs.',tags:['State Park','Hatch','Less Intense'],mode:'wade',lat:44.4611, lng:-111.3902},
      ],
    },
    { id:'hf-harriman', name:'Harriman Ranch', subtitle:'Last Chance Flat Water (~4 miles)',
      char:'The legendary Railroad Ranch — wide, gin-clear flat water with massive selective rainbow trout averaging 18–22". Arguably the most technically demanding dry fly fishing in the West. Fish have seen every pattern. A perfect drift doesn\'t guarantee a take here — approach angle and position matter as much as fly choice.',
      elevation:'6,200 ft', length:'~4 miles', fishType:'Rainbow (large, extremely selective)',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy wading in flat meadow water. The challenge is entirely in stealth and presentation. Every step must be slow and deliberate — fish spook at vibrations 40 feet away.',
      floatNote:'No floating allowed in the Harriman section.',
      access:[
        {name:'Harriman State Park Trailhead',desc:'Primary access to the Railroad Ranch. Marked trails lead through the park to multiple river bank access points (~0.5 mile walk). Bring 6X fluorocarbon and patience.',parking:'Paved Harriman State Park lot off US-20, approximately 17 miles north of Ashton. Day-use fee. Restrooms at trailhead. Multiple signed trail options.',tags:['State Park','Day Use Fee','Dry Fly','Selective Fish'],mode:'wade',lat:44.4119, lng:-111.5255},
        {name:'Last Chance Village — Upper Harriman Access',desc:'Town of Last Chance provides additional access to the upper end of the Harriman section. Multiple world-class guide services and fly shops (Henry\'s Fork Anglers) are based here.',parking:'Informal gravel parking along Last Chance Loop Rd off US-20. Walk public easement short distance to the river. Fly shops can direct you to current best access.',tags:['Town','Guide Services','Fly Shop'],mode:'wade',lat:44.4488, lng:-111.3844},
      ],
    },
    { id:'hf-lower', name:'Lower Henry\'s Fork', subtitle:'Ashton → St. Anthony (~20 miles)',
      char:'Slower, less pressured water below Ashton Falls. Good streamer and hopper fishing for large brown trout in braided channels and undercut banks. More forgiving water than the upper sections. Popular multi-day float option through farmland and cottonwood corridors.',
      elevation:'5,200 ft', length:'~20 miles', fishType:'Brown, Rainbow, Mountain Whitefish',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Easy to moderate wading on gravel and sand. Good wade access at all bridge crossings.',
      floatNote:'Excellent float. Drift boat or raft standard. Multiple put-in/take-out combinations for half-day or full-day trips.',
      access:[
        {name:'Ashton Falls / Reservoir Outflow',desc:'Put-in just below Ashton Reservoir, above the waterfall. Good bank access to the top of the lower section where productive runs form below the falls structure.',parking:'Paved lot at Ashton Reservoir Recreation Area off US-20. Day-use fee. Short walk to river bank and boat ramp.',tags:['Public','Put-in','Upper Lower'],mode:'both',lat:44.0722, lng:-111.4488},
        {name:'Chester Bridge Boat Ramp',desc:'Mid-section float access. County-maintained concrete boat ramp with good bank walk-in access upstream and downstream of the bridge.',parking:'Gravel county lot at Chester Bridge on Chester-Humphrey Rd. Free. Concrete ramp and bank fishing access.',tags:['Public','Boat Ramp','Mid-Section'],mode:'both',lat:43.9688, lng:-111.5144},
        {name:'Lorenzo Bridge Boat Ramp',desc:'Lower section primary take-out. Full-featured BLM boat ramp with restrooms and trash cans. Common end point for overnight floats from Ashton. River mile 53.7 from Palisades Dam.',parking:'Paved BLM lot at Lorenzo Bridge off Hwy 20 (Exit 325, Menan Exit). Free. Restrooms on site.',tags:['Public','BLM','Take-out'],mode:'both',lat:43.7363, lng:-111.8804},
      ],
    },
  ],

  'Madison River': [
    { id:'madison-upper', name:'Upper Madison', subtitle:'Hebgen Dam → Quake Lake (~14 miles)',
      char:'The legendary 50-Mile Riffle starts here. Wide, powerful freestone water with big stonefly hatches and massive spawning fish in fall. Catch-and-release only for rainbow. Multiple USFS campgrounds along US-287 and US-191 give walk-in access throughout the upper valley.',
      elevation:'6,400 ft', length:'~14 miles', fishType:'Rainbow, Brown',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Classic thigh-deep wading across wide gravel bars. Strong current — wading staff recommended. Felt soles essential on algae-covered cobble.',
      floatNote:'Excellent float. Standard drift boat or raft. Put in at Baker\'s Hole or Raynolds Pass, take out at Earthquake Lake ramp.',
      access:[
        {name:'Hebgen Dam Outflow — Campfire Lodge Area',desc:'Walk-in below Hebgen Dam. Consistent tailwater flows produce year-round fishing. Large fish stack in the dam outflow run. Good midge fishing all winter.',parking:'Small gravel lot near Campfire Lodge Resort off US-287 west of West Yellowstone. Day-use parking. Short walk along the bank upstream to dam outflow zone.',tags:['Public','Tailwater','Large Fish'],mode:'wade',lat:44.7922, lng:-111.4833},
        {name:'Baker\'s Hole Campground',desc:'USFS campground 3 miles north of West Yellowstone with direct river access. Classic 50-Mile Riffle water. Good stonefly and caddis fishing mid-summer. River runs right alongside the campground.',parking:'USFS fee campground lot off US-191, ~3 miles north of West Yellowstone. Day-use parking at entrance. Walk directly to the river.',tags:['USFS','Campground','Day Use'],mode:'wade',lat:44.7033, lng:-111.1633},
        {name:'Raynolds Pass Bridge',desc:'Classic wade-fishing access point at the famous Reynolds Pass. River below Reynolds Pass to Three Dollar Bridge has the highest fish density on the upper Madison.',parking:'MFWP FAS gravel lot at Raynolds Pass Bridge on US-287. Free. Wide gravel bars walkable upstream and downstream from the bridge.',tags:['MFWP','Classic Wade','High Density'],mode:'wade',lat:44.7488, lng:-111.2844},
        {name:'Three Dollar Bridge FAS',desc:'MFWP access mid-upper section with multiple foot trails to fishing spots. Excellent pocket water and riffles in both directions from this site.',parking:'MFWP FAS gravel lot at Three Dollar Bridge off US-287. Free. Multiple signed trails lead to different river reaches.',tags:['MFWP','Multiple Trails','Wade'],mode:'wade',lat:44.8233, lng:-111.3588},
        {name:'Earthquake Lake Visitor Center Ramp',desc:'Float put-in and take-out below the Quake Lake slide area. Good bank access to the lower upper Madison canyon.',parking:'USFS gravel lot at Earthquake Lake Visitor Center off US-287. Free. Boat ramp with bank walk-in access adjacent to the ramp.',tags:['USFS','Boat Ramp','Float'],mode:'both',lat:44.8188, lng:-111.4433},
      ],
    },
    { id:'madison-lower', name:'Lower Madison', subtitle:'Quake Lake → Ennis Lake (~35 miles)',
      char:'The most famous stretch of the Madison. Wide braided channels, gravel bars, and classic riffle-pool-run sequences. World-class caddis in June, PMDs in July, hoppers in August–September, BWOs in fall. Rainbow catch-and-release; browns may be kept. Fish populations estimated at 3,000–5,000 per mile.',
      elevation:'5,000–6,100 ft', length:'~35 miles', fishType:'Rainbow, Brown',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Classic wade-fishing Madison. Miles of MFWP public access along US-287. Park at any FAS and wade the gravel bars in both directions.',
      floatNote:'Multiple float options. Classic routes: Lyon Bridge to Varney (~10 mi), Varney to 8-Mile Ford (~5 mi), 8-Mile Ford to Ennis (~4 mi).',
      access:[
        {name:'Lyon Bridge Boat Ramp',desc:'Primary float put-in for the most popular Madison stretch. The West Fork of the Madison enters just above the bridge — the confluence zone holds exceptional trout density. Classic morning dry fly water.',parking:'MFWP FAS gravel lot at Lyon Bridge on US-287. Free. Concrete boat ramp and direct bank access for wade fishing.',tags:['MFWP','Classic Float','Confluence'],mode:'both',lat:45.0622, lng:-111.5933},
        {name:'McAtee Bridge / 8-Mile Ford FAS',desc:'Mid-section wade access with wide shallow riffles and visible fish. Best reach for hopper fishing McAtee to Varney in August. Less pressure than the main corridor.',parking:'MFWP FAS gravel lot at McAtee Bridge off Ennis-McAllister Rd. Free. Wide gravel bars walkable in both directions. Also a mid-float pull-out.',tags:['MFWP','Wade','Hopper Water'],mode:'both',lat:45.2133, lng:-111.6688},
        {name:'Varney Bridge FAS',desc:'Mid-lower section boat ramp and wade-in site. Fish stack in runs and deeper channels near Varney. Prime hopper and dry fly water August–September.',parking:'MFWP FAS gravel lot at Varney Bridge. Free. Concrete boat ramp and wide gravel bars walkable from the lot.',tags:['MFWP','Boat Ramp','Hopper'],mode:'both',lat:45.2288, lng:-111.7494},
        {name:'Ennis Boat Ramp',desc:'Primary lower-section take-out. Also walk-in access to the town water and below. Less pressure than the upper stretch.',parking:'MFWP FAS paved lot in Ennis off US-287. Free. Boat ramp, restrooms, and trail access to wade water below town.',tags:['MFWP','Take-out','Town'],mode:'both',lat:45.3477, lng:-111.7294},
      ],
    },
    { id:'madison-bear-trap', name:'Bear Trap Canyon', subtitle:'Ennis Lake → Three Forks (~9 miles)',
      char:'BLM Wilderness — no road access, no crowds, no shortcuts. Hike the 7.5-mile canyon trail in from Highway 84 to fish remote pools that most anglers never see. Outstanding wild rainbow and brown trout. Class IV rapids make this unsuitable for drift boats.',
      elevation:'4,600 ft', length:'~9 miles', fishType:'Rainbow, Brown, Whitefish',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Hike-in required (2+ miles on the east-bank canyon trail). Technical wading in fast canyon water. Self-sufficient conditions — no cell service, no rescue easy.',
      floatNote:'Not suitable for drift boats — Class IV rapids. Advanced kayakers only.',
      access:[
        {name:'Bear Trap Canyon Trailhead (Highway 84)',desc:'BLM wilderness trailhead at Highway 84. The 7.5-mile canyon trail runs the east bank. Fish any distance in — even the first mile sees far fewer anglers than the main river. Vault toilet at the trailhead.',parking:'BLM gravel lot at the Bear Trap Trailhead off MT-84, south of Manhattan. Free. Vault toilet on site.',tags:['BLM','Wilderness','Hike-in'],mode:'wade',lat:45.5677, lng:-111.7822},
        {name:'Madison Dam / Ennis Lake Outflow',desc:'Upper end of Bear Trap Canyon below Madison Dam. Road access before the canyon wall closes in. Good walk-in access to the first mile of canyon water before the serious hiking begins.',parking:'Gravel pullout near Madison Dam off MT-84. Free. Walk downstream into the canyon from the dam outflow.',tags:['Public','Canyon Entry','Walk-in'],mode:'wade',lat:45.5022, lng:-111.8155},
      ],
    },
  ],

  'Yellowstone River': [
    { id:'yell-park', name:'Yellowstone Park Section', subtitle:'Yellowstone Lake → Gardiner (~50 miles)',
      char:'One of the last great ungated wild fisheries in America. Native Yellowstone cutthroat in pristine water with no hatcheries, no stocking. Catch-and-release required on most sections within the park. Closed until July 15 on many reaches. Buffalo Ford is the most famous wade fishing spot in the park — dozens of visible fish at a time.',
      elevation:'6,200–7,700 ft', length:'~50 miles', fishType:'Yellowstone Cutthroat',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Classic wade fishing throughout. Park entrance pass required. Must stay on designated fishing-side bank at certain locations (LeHardy). Check current regulations at the park entrance.',
      floatNote:'Floating restricted within Yellowstone National Park boundaries.',
      access:[
        {name:'Buffalo Ford (Nez Perce Ford)',desc:'The most iconic wade fishing spot in Yellowstone National Park. Wild cutthroat stack in clear water — sight fishing with 20+ visible fish at a time is common. Arrive before 8 AM in summer to avoid the crowds.',parking:'NPS paved pullout on Grand Loop Rd between Canyon Village and Fishing Bridge. Free with park entrance pass. Very short walk to the ford.',tags:['National Park','Sight Fishing','Wild Cutthroat','Iconic'],mode:'wade',lat:44.5488, lng:-110.3833},
        {name:'LeHardy Rapids',desc:'Just below Yellowstone Lake outlet — where the river truly begins. Cutthroat stack on spawning migration in June–July. Fish from the trail-side bank only; the opposite side is off-limits.',parking:'NPS roadside pullout at LeHardy Rapids on Grand Loop Rd, south of Fishing Bridge. Free with park pass. Short walk to the rapids viewing platform and bank.',tags:['National Park','Spawning Run','June Access'],mode:'wade',lat:44.5244, lng:-110.3688},
        {name:'Lamar Valley Pullouts',desc:'Multiple NPS pullouts along the Northeast Entrance Rd give access to the Yellowstone main stem in the remote northeast park. Outstanding wildlife viewing alongside some of the best dry fly water in the park.',parking:'NPS pullouts along Northeast Entrance Rd in Lamar Valley. Free with park pass. Multiple walk-in points from the road shoulder directly to the river.',tags:['National Park','Remote','Dry Fly','Wildlife'],mode:'wade',lat:44.8988, lng:-110.2655},
        {name:'Yankee Jim Canyon (Below Park Boundary)',desc:'First section below the park, immediately north of Gardiner on US-89. Excellent canyon water with rainbow and cutthroat. BLM public land — no park pass needed here.',parking:'BLM/USFS pullouts along US-89 in Yankee Jim Canyon between Gardiner and Miner. Free. Walk from the road shoulder directly to the river.',tags:['BLM','Below Park Boundary','Canyon'],mode:'wade',lat:45.1244, lng:-110.6144},
      ],
    },
    { id:'yell-paradise', name:'Paradise Valley', subtitle:'Gardiner → Livingston (~45 miles)',
      char:'Montana\'s most productive float corridor. Three world-class spring creeks (Armstrong, DePuy, Nelson) add extraordinary nutrients that grow trophy brown and rainbow trout averaging 18-22"+. Classic Western valley with the Absaroka Range backdrop. Salmonfly hatch in late June, hoppers in August, BWOs in fall. Multiple day-float options.',
      elevation:'4,500 ft', length:'~45 miles', fishType:'Rainbow, Brown, Cutthroat',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Excellent wading at bridge crossings and MFWP access sites. Private land borders the river through much of the valley — use only marked public access points.',
      floatNote:'Classic drift boat corridor. Most commercial guides operate here. Any two MFWP access sites can be used as put-in/take-out for custom float lengths.',
      access:[
        {name:'Carbella BLM Launch',desc:'Upper Paradise Valley entry point just below Yankee Jim Canyon. Lightly fished upper water. Good rainbow and cutthroat habitat in canyon tailout reaches.',parking:'BLM gravel lot at Carbella off US-89, north of Gardiner. Free. Concrete boat ramp and bank walk-in access.',tags:['BLM','Float','Upper Section'],mode:'both',lat:45.4611, lng:-110.5722},
        {name:'Pray Bridge MFWP FAS',desc:'Key mid-valley wade and float access near the Armstrong and DePuy spring creek confluences. These spring creeks pour in cold, nutrient-rich water that creates exceptional trophy trout habitat nearby.',parking:'MFWP FAS gravel lot at Pray Bridge on Eastside Hwy (East River Rd). Free. Riverside trail from the lot to wade-fishing areas upstream and downstream.',tags:['MFWP','Spring Creek Area','Trophy'],mode:'both',lat:45.4111, lng:-110.5488},
        {name:'Pine Creek Bridge MFWP FAS',desc:'Mid-valley float and wade. Good evening dry fly water with consistent PMD and caddis hatches. Pine Creek tributary enters nearby adding cold water.',parking:'MFWP FAS gravel lot at Pine Creek Bridge on East River Rd. Free. Boat ramp and riverside walk-in trail.',tags:['MFWP','Mid-Valley','Evening Hatch'],mode:'both',lat:45.5522, lng:-110.5933},
        {name:'Carter Bridge MFWP FAS',desc:'Classic one-day float take-out, just above Livingston. Excellent wade water below the bridge. Strong hopper action along the grassy undercut banks in August.',parking:'MFWP FAS gravel lot at Carter Bridge. Free. Boat ramp, restrooms, riverside trail upstream and downstream.',tags:['MFWP','Take-out','Hopper'],mode:'both',lat:45.6788, lng:-110.5655},
        {name:'Ninth Street Island Park — Livingston',desc:'City of Livingston public river park with direct Yellowstone access. Good evening streamer fishing for large browns in the town reach.',parking:'City of Livingston park lot at Ninth Street off Park St. Free. Paved path leads to the river bank.',tags:['Public','Town','Streamer'],mode:'wade',lat:45.6633, lng:-110.5622},
      ],
    },
  ],
  'Deschutes River': [
    { id:'deschutes-upper', name:'Upper Deschutes', subtitle:'Bend → Warm Springs',
      char:'Trout water — rainbow and brown trout in a high-desert canyon above Sherars Falls. Completely different character from the steelhead lower river. Midge, PMD, and caddis dominate.',
      elevation:'2,800–3,600 ft', length:'~100 miles', fishType:'Rainbow, Brown, Whitefish',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Excellent wading throughout upper canyon. Consistent flows from regulated lakes upstream.',
      floatNote:'Classic drift boat water. Many outfitters operate on this section.',
      access:[
        {name:'Maupin City Park',desc:'Town of Maupin park with direct river access. Central hub for upper canyon fishing.',parking:'Maupin City Park gravel lot off US-197 in Maupin. Free. Riverside path gives direct access to prime wade water through town.',tags:['Public','Town','Easy Access'],mode:'wade',lat:44.9644, lng:-121.2122},
        {name:'Harpham Flat Campground',desc:'USFS campground with wade access to classic riffle-pool-run sequences.',parking:'USFS fee campground lot off US-197. Day-use parking at the campground entrance. Short walk through camp to the river.',tags:['Public','USFS','Campground'],mode:'wade',lat:45.1738, lng:-121.0741},
        {name:'Beavertail Campground Launch',desc:'Popular float put-in above Maupin. Full-day drift to town.',parking:'USFS campground lot at Beavertail. Fee. Boat ramp directly from the lot.',tags:['Public','Float','Campground'],mode:'float',lat:45.2155, lng:-121.0488},
      ],
    },
    { id:'deschutes-lower', name:'Lower Deschutes', subtitle:'Warm Springs → Columbia',
      char:'Legendary steelhead and trout water. Deeply cut desert canyon. High-summer caddis hatches draw anglers from worldwide. Remote, roadless sections require float access.',
      elevation:'200–800 ft', length:'~100 miles', fishType:'Summer Steelhead, Rainbow, Whitefish',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Wading from designated campsite access and road-accessible points. Lower canyon wading spots are well-known among regulars.',
      floatNote:'Multi-day float the premier lower canyon experience. Self-contained whitewater experience required.',
      access:[
        {name:'Macks Canyon Campground',desc:'Road-end access to the lower roadless canyon. Classic swing fishing for steelhead.',parking:'BLM gravel lot at Macks Canyon Campground, end of Deschutes River Rd (30+ mi from Maupin). Free. Trail follows the river bank into the roadless canyon.',tags:['Public','Steelhead','Road End'],mode:'wade',lat:45.2444, lng:-121.0133},
        {name:'Sherars Falls',desc:'Dramatic waterfall with tribal dipnet fishing above. Steelhead stack below the falls — major holding area.',parking:'ODOT pullout on US-197 at Sherars Bridge. Free. Walk down to the bank below the falls — a short but steep scramble.',tags:['Tribal Area','Steelhead','Falls'],mode:'wade',lat:45.2444, lng:-121.0144},
        {name:'Heritage Landing (Columbia Confluence)',desc:'Take-out at the Columbia River. End point for lower canyon multi-day floats.',parking:'USACE gravel lot at Heritage Landing near Biggs Junction. Free. Boat ramp and riverside access.',tags:['Public','Take-out','Confluence'],mode:'float',lat:45.6292, lng:-121.0072},
      ],
    },
  ],

  'Yakima River': [
    { id:'yakima-canyon', name:'The Canyon', subtitle:'Roza Dam → Ellensburg',
      char:'Washington\'s premier trout river — and the only Blue Ribbon trout stream in the state. Slow, deep, clear canyon water with exceptional technical fishing. Caddis, BWO, and PMD hatches.',
      elevation:'1,400 ft', length:'~18 miles', fishType:'Rainbow, Brown',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Good wading at access sites and gravel bars throughout the canyon. Flows fluctuate with irrigation demand — check USGS before wading.',
      floatNote:'The classic Yakima float — one of Washington\'s best. Canyon scenery, consistent access to the best pools.',
      access:[
        {name:'Roza Recreation Site',desc:'Upper canyon put-in just below Roza Dam. Prime technical dry fly water in the flat glides.',parking:'WDFW paved lot at Roza Recreation Site off Roza Dam Rd. Free. Boat ramp and trail along the bank for wade fishing above the ramp.',tags:['Public','Put-in','Technical'],mode:'both',lat:46.8546, lng:-120.4796},
        {name:'Umtanum Recreation Area',desc:'BLM access in the heart of the canyon. Suspension footbridge for crossing. Excellent mid-canyon wading.',parking:'BLM gravel lot at Umtanum off Umtanum Rd. Free. Suspension bridge across the river, with trails on both banks for extensive wading access.',tags:['BLM','Suspension Bridge','Wading'],mode:'wade',lat:46.8688, lng:-120.4755},
        {name:'Big Pines Recreation Site',desc:'Mid-canyon access. Good wade fishing from gravel bars. Hatch activity is excellent here in May.',parking:'BLM gravel lot at Big Pines, signed from Umtanum Rd. Free. Walk directly to gravel bar access from the lot.',tags:['Public','Gravel Bar','Hatch'],mode:'wade',lat:46.9044, lng:-120.4633},
        {name:'Ellensburg Boat Launch',desc:'Primary take-out for canyon float trips. Also walk-in wade access.',parking:'City of Ellensburg paved lot at the boat launch off S Thorp Hwy. Free. Boat ramp plus a walking path along the bank.',tags:['Public','Take-out','Walk-in'],mode:'both',lat:46.7044, lng:-120.5288},
      ],
    },
    { id:'yakima-upper', name:'Upper Yakima', subtitle:'Cle Elum Lake → Roza Dam',
      char:'Higher elevation water with brook trout, wild rainbow, and mountain whitefish. More freestone character. Less pressure than the famous canyon.',
      elevation:'2,200–3,800 ft', length:'~50 miles', fishType:'Rainbow, Brook, Whitefish',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Good wade access throughout the upper valley.',
      floatNote:'Not commonly floated — too braided and shallow in many sections.',
      access:[
        {name:'Thorp Mill Road Access',desc:'Easy walk-in on upper Yakima near Cle Elum. Underutilized water with good wild rainbow fishing.',parking:'Gravel pullout on Thorp Mill Rd near the bridge crossing. Free. Short walk to the water.',tags:['Public','Walk-in','Less Crowded'],mode:'wade',lat:47.0533, lng:-120.6833},
        {name:'Cle Elum WDFW Access',desc:'State fishing access area on upper valley water. Good brook trout fishing in smaller side channels.',parking:'WDFW FAS gravel lot in Cle Elum, signed from WA-970. Free. Trail to the river.',tags:['WDFW','Access','Brook Trout'],mode:'wade',lat:47.1933, lng:-120.9244},
      ],
    },
  ],

  'Arkansas River': [
    { id:'ark-browns', name:'Browns Canyon', subtitle:'Salida → Cotopaxi',
      char:'Classic Gold Medal freestone. Excellent caddis and PMD hatches in summer. Browns Canyon National Monument protects this stretch — some of Colorado\'s best wade fishing.',
      elevation:'7,200 ft', length:'~12 miles', fishType:'Rainbow, Brown (Gold Medal)',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Excellent wading on gravel and cobble. Hip or chest waders. Watch for slippery algae.',
      floatNote:'Raft and kayak float through the Class II-III canyon. Combination float-fish trips are popular.',
      access:[
        {name:'Hecla Junction SWA',desc:'Primary access to Browns Canyon. Launch or walk-in. Gold Medal water below the bridge.',parking:'CPAW paved SWA lot at Hecla Junction, off US-285 south of Salida. Free. Boat ramp and riverside trail for walk-in waders.',tags:['SWA','Public','Launch'],mode:'both',lat:38.5655, lng:-106.0288},
        {name:'Ruby Mountain Campground',desc:'USFS campground walk-in access. Mid-canyon wade fishing near Ruby Mountain rapid.',parking:'USFS fee campground lot. Day-use parking available at the entrance. Short walk through camp to the canyon wade water.',tags:['USFS','Campground','Walk-in'],mode:'wade',lat:38.5144, lng:-106.0488},
        {name:'Five Points Access',desc:'BLM day-use area. Excellent wade water in an underused section just downstream of the main canyon.',parking:'BLM paved day-use lot at Five Points, off US-285. Free. Trail from the lot to the river.',tags:['BLM','Day Use','Less Crowded'],mode:'wade',lat:38.4744, lng:-106.0733},
      ],
    },
    { id:'ark-upper', name:'Upper Arkansas', subtitle:'Leadville → Salida',
      char:'High-altitude freestone fishing from Leadville down through Salida. Wild rainbow and brown trout in a wide, open valley. PMD and caddis hatches at 10,000 ft.',
      elevation:'9,000–7,200 ft', length:'~60 miles', fishType:'Rainbow, Brown, Brook',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Excellent high-altitude wading. Wide, relatively shallow water. Great dry fly water in midsummer.',
      floatNote:'Not commonly floated — upper valley is too shallow and braided.',
      access:[
        {name:'Buena Vista SWA',desc:'State Wildlife Area with extensive public access. Prime mid-valley water between Buena Vista and Salida.',parking:'CPAW paved SWA lot on US-285 in Buena Vista. Free. Trail from the lot runs along the river through the SWA.',tags:['SWA','Public','Parking'],mode:'wade',lat:38.8444, lng:-106.1188},
        {name:'Fisherman\'s Bridge (Leadville)',desc:'Town access on the upper river near Leadville at high altitude. Brook trout and small rainbow.',parking:'City of Leadville roadside parking near Fisherman\'s Bridge on US-24. Free. Walk directly from the pullout to the water.',tags:['Public','High Altitude','Brook Trout'],mode:'wade',lat:39.2444, lng:-106.3644},
      ],
    },
  ],

  'South Fork Snake': [
    { id:'sf-upper', name:'Upper Canyon', subtitle:'Palisades Dam → Heise',
      char:'Classic drift boat water — the South Fork is Idaho\'s premier float river. Deep canyon, cobble bars, and massive hatches. Limited walk-in access. Drift boat is the standard approach.',
      elevation:'5,400 ft', length:'~20 miles', fishType:'Cutthroat, Rainbow, Brown',
      wadeSuitable:false, floatSuitable:true,
      wadeNote:'Limited walk-in access in the upper canyon — drift boat is the standard approach.',
      floatNote:'Full-day guided drift. Launch at Palisades or Byington. Take out at Heise or Conant.',
      access:[
        {name:'Palisades Creek Boat Ramp',desc:'Primary upper canyon put-in. Easiest access to world-class canyon float water.',parking:'Paved USFS lot at Palisades Creek Recreation Area off US-26. Fee required. Restrooms, fish-cleaning station. Boat ramp directly from lot.',tags:['Public','Boat Ramp','Primary'],mode:'float',lat:43.360, lng:-111.230},
        {name:'Byington Boat Ramp',desc:'Alternative upper put-in. Shorter float to Heise.',parking:'Gravel BLM lot at Byington Ramp off the canyon road. Free. Boat ramp and short bank walk access.',tags:['Public','Boat Ramp','Float'],mode:'float',lat:43.4006, lng:-111.3050},
        {name:'Conant Valley BLM',desc:'One of the only walk-in access points in the canyon. Remote, lightly pressured.',parking:'Gravel BLM pullout at Conant Valley off Snake River Rd. Free. Short 0.2 mi trail through river bottom to the water.',tags:['Public','BLM','Walk-in'],mode:'wade',lat:43.5967, lng:-111.6164},
      ],
    },
    { id:'sf-lower', name:'Lower Canyon', subtitle:'Heise → Lorenzo',
      char:'More wading access and less canyon. Wider river with braided channels, gravel bars, and excellent dry fly water in summer.',
      elevation:'4,800 ft', length:'~15 miles', fishType:'Cutthroat, Rainbow, Brown',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Good wading on gravel bars and islands. Wade at any river access point along the lower stretch.',
      floatNote:'Half-day floats from Heise to Lorenzo or Lorenzo to Twin Bridges.',
      access:[
        {name:'Heise Bridge Launch',desc:'Most popular float put-in on the entire South Fork. Guided trips depart here daily in summer.',parking:'Paved county lot at Heise Bridge off N 3300 E Rd. Free. Boat ramp, vault toilets. Bank walk-in access available from the lot for wade fishing nearby gravel bars.',tags:['Public','Boat Launch','Popular'],mode:'float',lat:43.5967, lng:-111.6164},
        {name:'Lorenzo Bridge Ramp',desc:'Mid-lower section access and take-out. Good wade access from gravel bar.',parking:'Gravel lot at Lorenzo Bridge on E 1100 S. Free. Boat ramp, direct access to gravel bars for wading.',tags:['Public','Boat Ramp','Wade Access'],mode:'both',lat:43.7363, lng:-111.8804},
        {name:'Twin Bridges Take-out',desc:'Lower take-out for full-day lower canyon floats.',parking:'Gravel BLM lot at Twin Bridges. Free. Primarily float access — wade fishing from the bank near the ramp.',tags:['Public','Take-out','Float'],mode:'float',lat:43.6727, lng:-111.7685},
      ],
    },
  ],

  'Bighorn River': [
    { id:'bighorn-13mile', name:'13-Mile Stretch', subtitle:'Yellowtail Dam → St. Xavier',
      char:'Montana\'s most productive tailwater. Consistent dam-regulated flows produce extraordinary midge, BWO, and PMD hatches year-round. World-class rainbow and brown trout averaging 16–22".',
      elevation:'3,100 ft', length:'13 miles', fishType:'Rainbow, Brown (trophy)',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'The best wade fishing in Montana. Consistent, wading-friendly flows. The 3-mile section near Afterbay is the most productive walk-in water in the state.',
      floatNote:'The classic Bighorn drift — full-day float from Afterbay to Three Mile or Thirteen Mile.',
      access:[
        {name:'Afterbay Boat Launch',desc:'Primary put-in below Yellowtail Dam. Exceptional wade fishing within walking distance of the ramp. Most productive midge water.',parking:'Large paved USACE lot at Afterbay Dam Recreation Area. Free. Restrooms, boat ramp, and a well-worn trail along the bank for walk-in wading access.',tags:['Public','Primary','Trophy'],mode:'both',lat:45.3380, lng:-107.8984},
        {name:'Three Mile Access',desc:'Walk-in access 3 miles below the dam. Less crowded than Afterbay. Excellent dry fly and nymph water.',parking:'MFWP Fishing Access Site gravel lot, signed from the main road. Free. Short trail to the river through riverbank brush.',tags:['Public','Walk-in','Less Crowded'],mode:'wade',lat:45.3088, lng:-107.9155},
        {name:'Thirteen Mile Launch',desc:'Mid-section float access and popular wade-in site. Parking and bank access.',parking:'MFWP Fishing Access Site gravel lot. Free. Signed off the main road. Bank access and short riverside trail from the lot.',tags:['Public','Float','Bank Access'],mode:'both',lat:45.2533, lng:-107.8988},
        {name:'St. Xavier Bridge',desc:'Take-out for the full 13-mile float. Walk-in access to the lower stretch.',parking:'County bridge pullout with gravel lot. Free. Bank walk-in access for wading just below the bridge.',tags:['Public','Take-out','Walk-in'],mode:'both',lat:45.1744, lng:-107.8588},
      ],
    },
    { id:'bighorn-lower', name:'Lower Bighorn', subtitle:'St. Xavier → Bighorn Confluence',
      char:'Less pressured water below the famous 13-mile stretch. Large fish, lower crowds. Requires more exploration. Excellent fall streamer fishing.',
      elevation:'3,000 ft', length:'~30 miles', fishType:'Rainbow, Brown, Whitefish',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Good wading at access sites, though fewer public access points than the upper stretch.',
      floatNote:'Multi-day float through remote canyon. Self-sufficient conditions.',
      access:[
        {name:'St. Xavier Bridge (Lower Put-in)',desc:'Upper access for lower Bighorn float trips.',parking:'County bridge gravel lot. Free. Boat ramp and short bank access for wade fishing.',tags:['Public','Put-in','Lower Section'],mode:'float',lat:45.1744, lng:-107.8588},
        {name:'Bighorn Access',desc:'BLM access on the lower river. Remote and lightly fished.',parking:'BLM pullout off the county road. Free. Walk short trail through cottonwood bottom to the river bank.',tags:['BLM','Remote','Less Crowded'],mode:'wade',lat:45.1555, lng:-107.8544},
      ],
    },
  ],

  'Gallatin River': [
    { id:'gallatin-canyon', name:'Gallatin Canyon', subtitle:'Big Sky → Gallatin Gateway',
      char:'Classic Montana freestone canyon river — the river from A River Runs Through It. Wild rainbow and brown trout in a steep-walled canyon alongside US-191. Excellent stonefly and caddis fishing.',
      elevation:'5,000–7,000 ft', length:'~40 miles', fishType:'Rainbow, Brown, Cutthroat',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Classic wade river — pull off US-191 anywhere public and wade in. Miles of productive canyon water accessible from the highway.',
      floatNote:'Not floatable — too confined and dangerous in the canyon.',
      access:[
        {name:'Moose Creek Flat',desc:'Wide meadow section above Big Sky. Excellent hopper fishing in August. Easier wading than the main canyon.',parking:'USFS pull-off on US-191 at Moose Creek Flat. Free. Roadside gravel, room for 6–8 vehicles. Walk directly to the meadow bank — no trail needed.',tags:['Public','Meadow','Hopper'],mode:'wade',lat:45.2144, lng:-111.2944},
        {name:'Storm Castle Road Access',desc:'Mid-canyon access off the highway. Classic freestone riffle-run-pool water.',parking:'Gravel USFS pull-off on US-191 near Storm Castle Creek Rd junction. Free. Short scramble down the embankment to the river.',tags:['Public','Highway Pull-off','Classic'],mode:'wade',lat:45.4233, lng:-111.2355},
        {name:'Karst Stage Station',desc:'Lower canyon access with more gradient. Excellent caddis and PMD hatches.',parking:'Gravel roadside pull-off at the historic Karst Stage Station on US-191. Free. Well-worn path down bank to the river.',tags:['Public','Lower Canyon','Caddis'],mode:'wade',lat:45.5444, lng:-111.1844},
      ],
    },
    { id:'gallatin-lower', name:'Lower Gallatin', subtitle:'Gallatin Gateway → Manhattan',
      char:'Valley floor water below the canyon. Slower, wider, with good brown trout fishing. Hopper season in August is outstanding.',
      elevation:'4,500 ft', length:'~25 miles', fishType:'Brown, Rainbow',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Easy wading on gravel and sand bottom in the lower valley.',
      floatNote:'Floatable with pontoon or raft below Gallatin Gateway. Less commonly floated.',
      access:[
        {name:'Gallatin Gateway Bridge',desc:'MFWP access at the canyon exit. Walk-in to the lower valley water.',parking:'MFWP Fishing Access Site gravel lot at the bridge. Free. Short riverside trail from the lot to the first productive bends.',tags:['MFWP','Walk-in','Valley'],mode:'wade',lat:45.6188, lng:-111.1433},
        {name:'Manhattan Access',desc:'Lower Gallatin access near Manhattan. Good brown trout in the deeper bends.',parking:'MFWP FAS gravel lot near Manhattan. Free. Trail follows the bank to prime wade-fishing water.',tags:['Public','Lower Valley','Brown Trout'],mode:'wade',lat:45.8533, lng:-111.3322},
      ],
    },
  ],

  'Missouri River': [
    { id:'missouri-craig', name:'Craig to Cascade', subtitle:'Holter Dam → Cascade',
      char:'Montana\'s most famous tailwater. Consistent dam-regulated flows produce exceptional midge and BWO hatches. Wild rainbow and brown averaging 18"+. Rated among the top 5 trout rivers in North America.',
      elevation:'3,400 ft', length:'~30 miles', fishType:'Rainbow, Brown (trophy)',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Excellent wading throughout. Flat, gravel bottom with consistent flows from Holter Dam. Hip waders adequate in most sections.',
      floatNote:'The classic Craig float. Numerous commercial operations. Drift boat standard.',
      access:[
        {name:'Holter Dam Recreation Area',desc:'Walk-in below the dam. Most productive stretch is the first mile below Holter. Exceptional midge activity year-round.',parking:'USFS paved lot at Holter Dam Recreation Area off Beartooth Rd. Fee required. Short paved path from lot to the tailwater bank.',tags:['Public','Tailwater','Midge'],mode:'wade',lat:47.0133, lng:-111.9516},
        {name:'Craig Fishing Access (MFWP)',desc:'The hub of Missouri River fishing. Multiple access points, guide operations, and walk-in access to classic water.',parking:'MFWP gravel FAS lot in Craig, signed from MT-434. Free. Multiple walk-in trails lead from the lot to different sections of productive bank water.',tags:['MFWP','Town','Primary Hub'],mode:'both',lat:47.0744, lng:-112.0644},
        {name:'Hardy Bridge (Mid-Section)',desc:'Mid-float access. Boat ramp and wade access to the productive mid-section water.',parking:'MFWP FAS lot at Hardy Bridge. Free. Boat ramp and riverside trail for wade anglers.',tags:['Public','Mid-Section','Boat Ramp'],mode:'both',lat:47.2244, lng:-111.8722},
        {name:'Cascade Access',desc:'Lower section take-out and wade access. Less pressure than the Craig corridor.',parking:'MFWP FAS gravel lot near Cascade, signed off US-15. Free. Short walk to the water.',tags:['Public','Lower Section','Less Crowded'],mode:'both',lat:47.2733, lng:-111.7055},
      ],
    },
  ],

  'Clark Fork': [
    { id:'clarkfork-upper', name:'Upper Clark Fork', subtitle:'Warm Springs → Missoula',
      char:'Recovering river — water quality improvements over decades have brought back exceptional fishing. Mix of wild rainbow, brown, and westslope cutthroat. PMD and caddis dominate.',
      elevation:'3,200 ft', length:'~60 miles', fishType:'Rainbow, Brown, Westslope Cutthroat',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Good wading at MFWP access sites throughout the valley.',
      floatNote:'Float the upper Clark Fork for access to remote channels and weed beds.',
      access:[
        {name:'Warm Springs Ponds FAS',desc:'MFWP Fishing Access Site at the upper river. Strong PMD and caddis hatches.',parking:'MFWP gravel FAS lot at Warm Springs off I-90. Free. Signed access to the river bank from the lot.',tags:['MFWP','Upper River','Hatch'],mode:'wade',lat:46.2488, lng:-112.7944},
        {name:'Deer Lodge FAS',desc:'Mid-upper access. Excellent evening caddis dry fly fishing.',parking:'MFWP FAS gravel lot near Deer Lodge, signed off I-90 frontage road. Free. Short trail to the river.',tags:['MFWP','Wade','Caddis'],mode:'wade',lat:46.4011, lng:-112.7366},
        {name:'Missoula — Bitterroot Confluence',desc:'Walk-in access near Missoula where the Bitterroot joins. Large brown trout in the slow bends.',parking:'City of Missoula park lot off Spurgin Rd near the Kim Williams Trail. Free. Paved trail leads along the river to the confluence.',tags:['Public','Confluence','Urban'],mode:'wade',lat:46.8511, lng:-114.0955},
      ],
    },
    { id:'clarkfork-lower', name:'Lower Clark Fork', subtitle:'Missoula → Idaho Border',
      char:'Big, powerful river through the Alberton Gorge. Remote canyon with large brown trout and bull trout. Float access is the primary option in the gorge.',
      elevation:'2,600 ft', length:'~80 miles', fishType:'Rainbow, Brown, Bull Trout',
      wadeSuitable:false, floatSuitable:true,
      wadeNote:'Limited wade access in the gorge — float is the primary approach.',
      floatNote:'Multi-day float through Alberton Gorge. Class III-IV in high water. Self-sufficient conditions required.',
      access:[
        {name:'Alberton Gorge Put-in',desc:'Access to the famed Alberton Gorge. Class III-IV whitewater fishing float.',parking:'Gravel lot at the Gorge put-in off I-90 Frontage Rd near Alberton. Free. Boat ramp and short bank access.',tags:['Public','Gorge','Whitewater'],mode:'float',lat:47.0122, lng:-114.5144},
        {name:'Paradise Access',desc:'Lower Clark Fork bank access. Bull trout habitat — special regulations apply.',parking:'MFWP FAS pullout near Paradise, signed from MT-200. Free. Short trail to the river.',tags:['Public','Bull Trout','Special Regs'],mode:'wade',lat:47.1988, lng:-114.9422},
      ],
    },
  ],

  'Bitterroot River': [
    { id:'bitterroot-upper', name:'Upper Bitterroot — Darby to Hamilton', subtitle:'Darby → Hamilton (~25 miles)',
      char:'Classic Rocky Mountain freestone river in a stunning valley. Wild rainbow and brown trout with excellent dry fly fishing. Caddis hatches are legendary in early summer. Receives moderate pressure but offers miles of public access through USFS and state lands.',
      elevation:'3,500–4,000 ft', length:'~25 miles', fishType:'Rainbow, Brown, Cutthroat',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Easy to moderate wading on cobble and gravel. Thigh-to-waist depth in most runs. Strong current in spring runoff — wait for flows under 2,000 CFS for comfortable wading.',
      floatNote:'Excellent drift boat float. Darby to Hamilton or Hamilton to Stevensville. Multiple MFWP and county access points throughout.',
      access:[
        {name:'Darby Bridge MFWP Access',desc:'Primary upper Bitterroot access. Good wade fishing on cobble runs immediately below Darby. Ample parking.',tags:['Public','MFWP'],mode:'both',lat:45.8901,lng:-114.1723},
        {name:'Bass Creek MFWP Access',desc:'MFWP public fishing access mid upper section. Gravel bar wading. Good summer dry fly water.',tags:['Public','MFWP'],mode:'both',lat:46.0234,lng:-114.1456},
        {name:'Hamilton Bridge Takeout',desc:'End of upper float. Also wade access to town water. Popular year-round.',tags:['Public','MFWP','Take-out'],mode:'both',lat:46.2456,lng:-114.1567},
      ],
    },
    { id:'bitterroot-lower', name:'Lower Bitterroot — Hamilton to Missoula', subtitle:'Hamilton → Clark Fork Confluence (~50 miles)',
      char:'The most productive and pressured reach of the Bitterroot. Wide braided channels with excellent side-channel fishing. Famous for salmonfly hatch in June. Large browns hold in the deeper pools and cut banks near Missoula.',
      elevation:'3,200–3,500 ft', length:'~50 miles', fishType:'Brown, Rainbow',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Moderate wading — wider river with braided channels. Side channels offer calmer wading. Felt soles or studs essential on slick boulders. Best wading July through October.',
      floatNote:'Classic lower Bitterroot float. Stevensville to Florence or Florence to Lolo multiple-day options. Commercial outfitter traffic heavy in June during salmonfly hatch.',
      access:[
        {name:'Stevensville Bridge MFWP',desc:'Primary mid-section access. Excellent braided channel fishing. Put-in for popular lower float.',tags:['Public','MFWP','Put-in'],mode:'both',lat:46.5123,lng:-114.0956},
        {name:'Florence Bridge MFWP',desc:'Mid-lower section access. Good dry fly water in braided channels. Boat launch and wade access.',tags:['Public','MFWP','Put-in','Take-out'],mode:'both',lat:46.6234,lng:-114.1123},
        {name:'Lolo MFWP Access',desc:'Lower section near Lolo. Good brown trout water in deeper pools. Easy take-out access.',tags:['Public','MFWP','Take-out'],mode:'both',lat:46.7456,lng:-114.0789},
        {name:'Bell Crossing MFWP',desc:'Near Clark Fork confluence. Big brown trout water. Fish upstream into the lower canyon pools.',tags:['Public','MFWP'],mode:'wade',lat:46.8123,lng:-114.0567},
      ],
    },
  ],

  'Frying Pan River': [
    { id:'fryingpan-lower', name:'Lower Frying Pan', subtitle:'Ruedi Reservoir → Basalt',
      char:'Colorado\'s most technical tailwater. World-class midge and BWO fishing. Massive rainbow and brown trout in gin-clear water with consistent flows from Ruedi. The midge hatch here is the best in Colorado.',
      elevation:'6,500 ft', length:'~14 miles', fishType:'Rainbow, Brown (trophy)',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Excellent walk-and-wade. Colorado River Trail system provides access along most of the tailwater.',
      floatNote:'Not floatable — technical water, too many boulders.',
      access:[
        {name:'Ruedi Reservoir Outflow',desc:'First 2 miles below the dam. Most technical and most productive section. Trophy fish stacked in consistent flows.',parking:'Ruedi Reservoir boat ramp lot and day-use area off Frying Pan Rd. Fee required. Trail follows the river downstream from the dam face.',tags:['Public','Trophy','Technical'],mode:'wade',lat:39.3512, lng:-107.0744},
        {name:'Toilet Bowl Pool',desc:'Famous named pool on the lower Pan. Large visible fish in clear holding water.',parking:'Roadside pull-off on Frying Pan Rd. Multiple gravel spots along the road between the dam and Basalt. Walk short distance to the named pools.',tags:['Public','Named Pool','Sight Fishing'],mode:'wade',lat:39.3644, lng:-107.0911},
        {name:'Basalt Access',desc:'Town of Basalt walk-in. Lower section with slightly less pressure.',parking:'Town of Basalt public parking lot and Lions Club river access off Basalt Ave. Free. Short paved walk to the river.',tags:['Public','Town','Lower'],mode:'wade',lat:39.3722, lng:-107.0433},
      ],
    },
  ],

  /* ── COLORADO ── */

  'South Platte River': [
    { id:'splatte-cheesman', name:'Cheesman Canyon — Trophy Section', subtitle:'Cheesman Dam → Deckers (~10 miles)',
      char:'Colorado\'s most famous technical tailwater. World-class wild rainbow and brown trout in a remote canyon. Cheesman Canyon is walk-in only — a 1.5-mile trail leads to water that rewards patience and precise presentation. Midge and BWO hatches year-round.',
      elevation:'6,200 ft', length:'~10 miles', fishType:'Rainbow, Brown (trophy)',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Moderate wading on slick limestone slabs and cobble. Felt soles or studs essential. Water is gin-clear — approach low and slow. Best flows 50–150 CFS.',
      floatNote:'Not floatable — canyon walls and regulations prohibit floating.',
      access:[
        {name:'Cheesman Canyon Trailhead (CPAW)',desc:'Hike-in access to the trophy section. Trail follows river through the canyon. No camping. Catch-and-release artificial only.',tags:['Public','CPAW','Walk-in'],mode:'wade',lat:39.1567,lng:-105.3234},
        {name:'Deckers CDOW Access',desc:'Lower Cheesman section at Deckers. Road access. Popular wade fishing with mix of wild and stocked trout.',tags:['Public','CDOW'],mode:'wade',lat:39.2123,lng:-105.2789},
      ],
    },
    { id:'splatte-eleven', name:'Eleven Mile Canyon', subtitle:'Eleven Mile Reservoir → Lake George (~12 miles)',
      char:'High-altitude tailwater below Eleven Mile Reservoir. Wild rainbow and brown trout in a scenic canyon. Less pressured than Cheesman. Good BWO and caddis hatches. Artificial flies and lures only throughout the canyon.',
      elevation:'8,000–8,600 ft', length:'~12 miles', fishType:'Rainbow, Brown',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy to moderate wading — cobble bottom with clear sight lines. Cold water year-round from reservoir releases. Hip waders adequate most of the year.',
      floatNote:'Not floatable.',
      access:[
        {name:'Eleven Mile Canyon CDOW Access Points',desc:'Multiple CDOW pull-offs along CR-59 through the canyon. Park at any pull-off and wade up or downstream.',tags:['Public','CDOW'],mode:'wade',lat:38.9234,lng:-105.4567},
        {name:'Lake George Lower Access',desc:'Bottom of canyon near Lake George. Good brown trout water. Easy roadside access.',tags:['Public'],mode:'wade',lat:38.9789,lng:-105.3891},
      ],
    },
  ],

  'Blue River': [
    { id:'blue-upper', name:'Upper Blue — Silverthorne Tailwater', subtitle:'Green Mountain Reservoir → Silverthorne (~15 miles)',
      char:'Cold, clear tailwater below Green Mountain Reservoir cutting through the Blue River Valley. Excellent rainbow and brown trout. Receives heavy pressure near Silverthorne but holds large fish. Good midge and BWO hatches nearly year-round.',
      elevation:'8,700–9,000 ft', length:'~15 miles', fishType:'Rainbow, Brown',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy wading on gravel and cobble. Cold dam release — water temperature rarely exceeds 55°F even in summer. Short leaders and small flies (18–24) most effective.',
      floatNote:'Not floatable through the canyon section.',
      access:[
        {name:'Blue River CDOW Access — Silverthorne',desc:'Primary public access on the Blue River through Silverthorne. Multiple pull-offs along CO-9.',tags:['Public','CDOW'],mode:'wade',lat:39.6234,lng:-106.0789},
        {name:'Heney Road Access',desc:'Less pressured mid-section access off Heney Road. Larger fish hold in undercut banks away from town.',tags:['Public'],mode:'wade',lat:39.6789,lng:-106.1234},
      ],
    },
  ],

  'Roaring Fork River': [
    { id:'rfork-upper', name:'Upper Roaring Fork — Aspen Area', subtitle:'Independence Pass → Basalt (~35 miles)',
      char:'Classic freestone river flowing through the Roaring Fork Valley past Aspen. Wild rainbow and brown trout with excellent caddis and PMD hatches in summer. Three creek confluences add flow and fish. Receives significant pressure near Aspen.',
      elevation:'6,600–8,000 ft', length:'~35 miles', fishType:'Rainbow, Brown',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Moderate wading — cobble and boulder bottom. Current is fast through Aspen canyon sections. Hip waders adequate in summer low water.',
      floatNote:'Floatable from Woody Creek takeout area to Basalt. Raft or hard-sided boat. Several commercial outfitters operate this stretch.',
      access:[
        {name:'Slaughterhouse Bridge — Aspen',desc:'Primary Aspen-area access. Gold Medal water begins here. Catch-and-release artificial only for 1.5 miles.',tags:['Public','CDOW'],mode:'wade',lat:39.1789,lng:-106.8234},
        {name:'Woody Creek CDOW Access',desc:'Mid-section public fishing access. Good riffle and pool wading. Float put-in option.',tags:['Public','CDOW'],mode:'both',lat:39.2456,lng:-106.8789},
        {name:'Basalt Town Access',desc:'Lower upper section near Frying Pan confluence. Brown trout stack below the confluence.',tags:['Public'],mode:'wade',lat:39.3678,lng:-107.0345},
      ],
    },
    { id:'rfork-lower', name:'Lower Roaring Fork — Basalt to Glenwood', subtitle:'Basalt → Colorado River Confluence (~20 miles)',
      char:'Wider, warmer lower reach with large brown trout. Less technical than upper sections. Excellent streamer fishing in fall. Public access limited — know access points before heading out.',
      elevation:'5,700–6,600 ft', length:'~20 miles', fishType:'Brown, Rainbow',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Easy wading on gravel bars. Warmer water in summer — fish best in morning or evening when temps exceed 65°F.',
      floatNote:'Good float from Carbondale to Glenwood. Drift boat recommended. Take out at South Canyon.',
      access:[
        {name:'Carbondale Town Park',desc:'Good public access through Carbondale. Multiple pull-offs along CO-133.',tags:['Public'],mode:'both',lat:39.4012,lng:-107.2134},
        {name:'South Canyon CDOW',desc:'Lower section take-out and wade access near Colorado River confluence.',tags:['Public','CDOW'],mode:'both',lat:39.5234,lng:-107.3678},
      ],
    },
  ],

  'Cache la Poudre River': [
    { id:'poudre-canyon', name:'Poudre Canyon — Wild Trout', subtitle:'Fort Collins Canyon → Mishawaka (~25 miles)',
      char:'Colorado\'s only Wild and Scenic River. Freestone canyon water with wild rainbow, brown, and cutthroat trout. Excellent caddis and stonefly hatches. The canyon road (US-14) provides access to miles of public water.',
      elevation:'5,600–7,000 ft', length:'~25 miles', fishType:'Rainbow, Brown, Cutthroat',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Moderate to difficult wading — rocky canyon with fast water. Wading staff recommended. Best access at CDOW pull-offs along US-14. High flows in May–June runoff.',
      floatNote:'Not floatable — too steep and rocky throughout the canyon.',
      access:[
        {name:'Poudre Park CDOW Access',desc:'Lower canyon access near Poudre Park. Wild trout water begins here. Multiple pull-offs upstream.',tags:['Public','CDOW'],mode:'wade',lat:40.6789,lng:-105.3234},
        {name:'Mishawaka Area Pull-offs',desc:'Mid-canyon access. Some of the best dry fly water on the Poudre. Multiple USFS pull-offs.',tags:['Public','USFS'],mode:'wade',lat:40.7123,lng:-105.4567},
        {name:'Big Bend Campground USFS',desc:'Upper canyon access. Less pressure. Good cutthroat water above Big Bend.',tags:['Public','USFS'],mode:'wade',lat:40.7456,lng:-105.5789},
      ],
    },
  ],

  /* ── OREGON ── */

  'Rogue River': [
    { id:'rogue-upper', name:'Upper Rogue — Crater Lake to Medford', subtitle:'Prospect → Medford (~40 miles)',
      char:'Wild rainbow and brown trout in classic Southern Oregon freestone water. Above Lost Creek Reservoir is premier wild trout fishing. Excellent dry fly water with caddis and PMD hatches. Wild steelhead in fall below the reservoir.',
      elevation:'1,400–3,000 ft', length:'~40 miles', fishType:'Rainbow, Brown, Steelhead',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Easy to moderate wading on gravel and cobble. Best in summer low water. Above reservoir is catch-and-release artificial only for wild trout.',
      floatNote:'Excellent float from Prospect to McLeod or McLeod to Shady Cove. Drift boat standard.',
      access:[
        {name:'Prospect Bridge ODFW',desc:'ODFW public access near Prospect. Wild rainbow water above Lost Creek. Artificial-only section.',tags:['Public','ODFW'],mode:'both',lat:42.7456,lng:-122.4789},
        {name:'Shady Cove ODFW',desc:'Mid-section access below Lost Creek Reservoir. Mix of wild and hatchery trout. Good float take-out.',tags:['Public','ODFW'],mode:'both',lat:42.5989,lng:-122.8123},
      ],
    },
    { id:'rogue-lower', name:'Lower Rogue — Wild Steelhead', subtitle:'Grants Pass → Gold Beach (~84 miles)',
      char:'World-famous wild winter and summer steelhead. The lower Rogue is one of the premier steelhead rivers in the Pacific Northwest. The Wild Rogue Wilderness section (40 miles) is accessible only by jet boat or multi-day raft.',
      elevation:'0–900 ft', length:'~84 miles', fishType:'Steelhead, Chinook, Coho',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Moderate wading at access points. Rock and gravel bottom. Spey or single-hand switch rods standard for steelhead.',
      floatNote:'Classic drift boat and raft water. Wilderness section requires multi-day raft trip. Permits required for overnight floats.',
      access:[
        {name:'Grants Pass Boat Ramp (ODFW)',desc:'Primary lower Rogue launch. Excellent summer steelhead water begins below town.',tags:['Public','ODFW','Put-in'],mode:'both',lat:42.4345,lng:-123.3234},
        {name:'Galice ODFW Access',desc:'Mid lower-river access. Edge of Wild and Scenic corridor. Good wade access at gravel bars.',tags:['Public','ODFW'],mode:'both',lat:42.5678,lng:-123.5789},
      ],
    },
  ],

  'McKenzie River': [
    { id:'mckenzie-upper', name:'Upper McKenzie — Clear Lake to Leaburg', subtitle:'Clear Lake → Leaburg Dam (~35 miles)',
      char:'One of Oregon\'s most beautiful freestone rivers. Spring-fed from Clear Lake with extraordinary clarity. Wild rainbow trout are the primary quarry. Famous for the McKenzie River driftboat — invented here for this exact water.',
      elevation:'1,200–3,000 ft', length:'~35 miles', fishType:'Rainbow, Cutthroat',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Easy to moderate wading on gravel and cobble. Extremely clear water demands careful approach. Fish are spooky — long leaders and careful wading essential.',
      floatNote:'Classic McKenzie drift boat water. Olallie to Hendricks Bridge most popular. Multiple USFS and ODFW ramps throughout.',
      access:[
        {name:'Olallie USFS Campground',desc:'Upper McKenzie float put-in. Classic drift boat launch. Immediate access to wild rainbow water below camp.',tags:['Public','USFS','Put-in'],mode:'both',lat:44.1789,lng:-122.1234},
        {name:'Hendricks Bridge Wayside',desc:'Mid-section access. ODOT public access. Excellent dry fly water. Float take-out or wade access.',tags:['Public','ODOT'],mode:'both',lat:44.1234,lng:-122.5678},
        {name:'Finn Rock USFS Access',desc:'Mid-lower section. USFS access with parking. Good pocket water dry fly fishing.',tags:['Public','USFS'],mode:'both',lat:44.0789,lng:-122.6234},
      ],
    },
    { id:'mckenzie-lower', name:'Lower McKenzie — Leaburg to Springfield', subtitle:'Leaburg Dam → Confluence (~20 miles)',
      char:'Slower, warmer lower reach with good streamer and dry fly fishing for large brown trout. Side channels and backwaters hold fish. Less scenically dramatic but excellent low-pressure fishing.',
      elevation:'400–1,200 ft', length:'~20 miles', fishType:'Brown, Rainbow',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Easy wading on sand and gravel. Warmer in summer — fish mornings and evenings.',
      floatNote:'Drift boat or raft. Multiple public ramps from Leaburg to Springfield.',
      access:[
        {name:'Leaburg Dam ODFW',desc:'Below dam access. Coldest water in lower section. Good rainbow and brown trout fishing.',tags:['Public','ODFW'],mode:'both',lat:44.0456,lng:-122.6789},
        {name:'Camp Creek ODFW',desc:'Mid lower section ODFW access. Gravel bar wading. Good hopper fishing in summer.',tags:['Public','ODFW'],mode:'wade',lat:44.0123,lng:-122.7891},
      ],
    },
  ],

  'Sandy River': [
    { id:'sandy-gorge', name:'Sandy River Gorge — Bull Run to Troutdale', subtitle:'Bull Run Confluence → Troutdale (~15 miles)',
      char:'Wild steelhead and sea-run cutthroat within an hour of Portland. The Sandy is one of the most accessible quality steelhead rivers in Oregon. Winter steelhead peak December through March; summer steelhead June through August.',
      elevation:'50–300 ft', length:'~15 miles', fishType:'Steelhead, Sea-run Cutthroat',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Moderate to difficult wading — volcanic cobble and boulder bottom. Felt soles or studs essential. River drops quickly after rain — check gauge before heading out.',
      floatNote:'Drift boat or pontoon boat. Oxbow Park to Lewis & Clark State Park most popular float.',
      access:[
        {name:'Oxbow Regional Park',desc:'Multnomah County park with excellent steelhead access. Fee parking. Multiple bank fishing spots on gravel bars.',tags:['Public','County'],mode:'both',lat:45.4789,lng:-122.2234},
        {name:'Revenue Bridge ODFW',desc:'Mid-section ODFW access. Good winter steelhead water in deep pools below the bridge.',tags:['Public','ODFW'],mode:'wade',lat:45.4234,lng:-122.1789},
      ],
    },
  ],

  'John Day River': [
    { id:'johnday-lower', name:'Lower John Day — Service Creek to Clarno', subtitle:'Service Creek → Clarno (~70 miles)',
      char:'Remote high-desert river with wild rainbow trout and smallmouth bass. One of Oregon\'s longest free-flowing rivers. The lower canyon offers a true wilderness float experience with minimal access roads. Best March through June before water warms.',
      elevation:'1,400–2,200 ft', length:'~70 miles', fishType:'Rainbow, Smallmouth Bass',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Easy wading at access points. Sandy and gravel bottom. Water warms significantly by July — fish early in the season.',
      floatNote:'Classic multi-day raft or drift boat float. Service Creek to Clarno (70 mi) takes 4–6 days. One of Oregon\'s premier wilderness float trips.',
      access:[
        {name:'Service Creek ODFW',desc:'Primary upper access. Campground and boat launch. Popular multi-day float put-in.',tags:['Public','ODFW','Put-in'],mode:'both',lat:44.8234,lng:-120.0789},
        {name:'Clarno Unit — John Day Fossil Beds',desc:'Take-out for Service Creek float. NPS access. Also wade fishing at the boat ramp.',tags:['Public','NPS','Take-out'],mode:'both',lat:44.9123,lng:-120.4234},
      ],
    },
  ],

  /* ── WASHINGTON ── */

  'Methow River': [
    { id:'methow-upper', name:'Upper Methow — Mazama to Twisp', subtitle:'Mazama → Twisp (~30 miles)',
      char:'Remote upper Methow Valley with wild summer steelhead, rainbow, and cutthroat. Mazama area is pristine mountain water — less pressure than lower sections. Excellent dry fly fishing in July and August before steelhead arrive.',
      elevation:'1,600–2,400 ft', length:'~30 miles', fishType:'Steelhead, Rainbow, Cutthroat',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy to moderate wading on cobble and gravel. Best July through September before fall steelhead pressure increases. Hip waders adequate in low summer flows.',
      floatNote:'Not recommended — too rocky and shallow in upper valley.',
      access:[
        {name:'Mazama Community — Upper Valley',desc:'Multiple roadside pull-offs near Mazama along WA-20. Wild rainbow and cutthroat. Low pressure excellent dry fly water.',tags:['Public','WDFW'],mode:'wade',lat:48.5789,lng:-120.4234},
        {name:'Twisp Town Access (WDFW)',desc:'Primary Twisp area access. Walk-in wading to good summer steelhead and resident trout water.',tags:['Public','WDFW'],mode:'wade',lat:48.3678,lng:-120.1123},
      ],
    },
    { id:'methow-lower', name:'Lower Methow — Twisp to Columbia', subtitle:'Twisp → Columbia River Confluence (~30 miles)',
      char:'The premier steelhead reach of the Methow. Wild summer steelhead stack in the lower canyon pools. Native fish retention typically prohibited — check WDFW regulations annually as they change with run strength.',
      elevation:'700–1,600 ft', length:'~30 miles', fishType:'Steelhead, Rainbow',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Moderate wading on cobble. Steelhead hold in seams behind boulders and along cut banks. Swing flies or indicator nymphing both produce.',
      floatNote:'Drift boat from Twisp to Pateros or Pateros to Columbia. Several public ramps.',
      access:[
        {name:'Carlton WDFW Access',desc:'Mid lower section access. Good summer steelhead water. Gravel bar wading.',tags:['Public','WDFW'],mode:'both',lat:48.2234,lng:-119.9789},
        {name:'Pateros WDFW Access',desc:'Lower section near Columbia confluence. Prime summer steelhead holding water.',tags:['Public','WDFW'],mode:'both',lat:47.9789,lng:-119.9012},
      ],
    },
  ],

  'Skagit River': [
    { id:'skagit-upper', name:'Upper Skagit — Wild Steelhead', subtitle:'Concrete → Rockport (~15 miles)',
      char:'One of the most important wild winter steelhead rivers in the lower 48. Massive native wild steelhead — average 12–15 lbs with fish over 20 lbs possible. The upper Skagit is managed almost exclusively for wild fish conservation. Regulations are strict and change annually.',
      elevation:'100–300 ft', length:'~15 miles', fishType:'Steelhead (wild winter)',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Powerful large river — wading is limited to gravel bars and tailouts. Two-hand spey rods standard. Studded boots essential on slick boulders.',
      floatNote:'Drift boat or raft. Concrete to Rockport and Rockport to Howard Miller most common floats.',
      access:[
        {name:'Concrete Boat Ramp (WDFW)',desc:'Primary upper reach launch. Good bank access at the ramp for early morning fishing before floating.',tags:['Public','WDFW','Put-in'],mode:'both',lat:48.5456,lng:-121.7534},
        {name:'Howard Miller Steelhead Park',desc:'Mid section park with excellent bank access and camping. Popular winter steelhead destination.',tags:['Public','County'],mode:'both',lat:48.4989,lng:-121.5678},
        {name:'Rockport State Park',desc:'Lower upper-section access. Classic steelhead pool access along WA-20.',tags:['Public','WA State Parks'],mode:'wade',lat:48.4678,lng:-121.6012},
      ],
    },
    { id:'skagit-lower', name:'Lower Skagit — Rockport to Mouth', subtitle:'Rockport → Puget Sound (~45 miles)',
      char:'Tidal-influenced lower Skagit with sea-run cutthroat and winter steelhead. Less classic fly water than upper sections but holds fish year-round. Pink and Chinook salmon runs draw additional attention in even years.',
      elevation:'0–100 ft', length:'~45 miles', fishType:'Steelhead, Sea-run Cutthroat, Salmon',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Easy wading on gravel and sand at access points. Tidal fluctuations affect lower sections.',
      floatNote:'Drift boat or pontoon boat. Multiple public ramps from Rockport to Mount Vernon.',
      access:[
        {name:'Mount Vernon Boat Launch (WDFW)',desc:'Lower Skagit access near Mount Vernon. Winter steelhead and sea-run cutthroat year-round.',tags:['Public','WDFW'],mode:'both',lat:48.4123,lng:-122.3234},
      ],
    },
  ],

  'Klickitat River': [
    { id:'klickitat-canyon', name:'Klickitat Canyon — Wild Steelhead', subtitle:'Klickitat Gorge → Columbia River (~25 miles)',
      char:'Remote basalt canyon with excellent wild summer and fall steelhead. One of Washington\'s most productive steelhead rivers per mile. The lower canyon requires a hike or raft — no road access for most of the prime water. High wild fish retention rates.',
      elevation:'100–800 ft', length:'~25 miles', fishType:'Steelhead (summer/fall)',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Difficult wading — sharp basalt and powerful current. Studs essential. Limited wade access without hiking in. Spey rods standard.',
      floatNote:'Raft or drift boat from Leidl Bridge to the Columbia. Technical water with Class III sections — experienced boaters only.',
      access:[
        {name:'Leidl Bridge WDFW',desc:'Primary Klickitat access. Boat launch and wade access. Good summer steelhead water immediately below bridge.',tags:['Public','WDFW','Put-in'],mode:'both',lat:45.8234,lng:-121.1789},
        {name:'Pitt WDFW Access',desc:'Lower canyon access near the Columbia confluence. Good fall steelhead holding water.',tags:['Public','WDFW'],mode:'both',lat:45.6789,lng:-121.2345},
      ],
    },
  ],

  'Wenatchee River': [
    { id:'wenatchee-upper', name:'Upper Wenatchee — Leavenworth', subtitle:'Lake Wenatchee → Leavenworth (~20 miles)',
      char:'Clear, cold river flowing through the Bavarian-themed town of Leavenworth. Wild rainbow and cutthroat with summer steelhead. Popular with tourists and anglers alike. Excellent dry fly fishing in the Icicle Creek confluence area.',
      elevation:'1,100–1,800 ft', length:'~20 miles', fishType:'Rainbow, Cutthroat, Steelhead',
      wadeSuitable:true, floatSuitable:false,
      wadeNote:'Easy wading on gravel and cobble. River is swift but manageable. Good access throughout Leavenworth on public property.',
      floatNote:'Not recommended in upper section — too technical and shallow.',
      access:[
        {name:'Icicle Creek Confluence (WDFW)',desc:'Where Icicle Creek meets the Wenatchee. Prime dry fly and steelhead water. Good gravel bar wading.',tags:['Public','WDFW'],mode:'wade',lat:47.5956,lng:-120.6634},
        {name:'Cashmere Bridge WDFW',desc:'Mid-section access near Cashmere. Spring steelhead water. WDFW boat ramp and walk-in access.',tags:['Public','WDFW'],mode:'both',lat:47.5234,lng:-120.4678},
      ],
    },
    { id:'wenatchee-lower', name:'Lower Wenatchee — Cashmere to Columbia', subtitle:'Cashmere → Columbia River Confluence (~20 miles)',
      char:'Lower gradient reach with summer steelhead and resident rainbow trout. Less scenic than upper canyon but holds fish and offers easy access near Wenatchee city.',
      elevation:'600–1,100 ft', length:'~20 miles', fishType:'Steelhead, Rainbow',
      wadeSuitable:true, floatSuitable:true,
      wadeNote:'Easy wading on gravel and sand. Good bank access at WDFW sites throughout.',
      floatNote:'Drift boat or raft from Cashmere to Monitor. Good float with multiple access options.',
      access:[
        {name:'Monitor WDFW Access',desc:'Lower section float take-out. Also good wade access on gravel bars.',tags:['Public','WDFW'],mode:'both',lat:47.4789,lng:-120.3123},
        {name:'Columbia Park Wenatchee',desc:'City park at confluence. Good steelhead water near the mouth of the Wenatchee.',tags:['Public'],mode:'wade',lat:47.4234,lng:-120.2789},
      ],
    },
  ],


};


/* ═══════════════════════════════════════════════════════════
   NOTABLE TRIBUTARIES
   Small streams worth targeting near the main rivers.
   Often less pressured, with wild fish and classic freestone
   dry fly action. Listed by parent river.
═══════════════════════════════════════════════════════════ */
const TRIBUTARIES = {

  /* ── UTAH ── */
  'Green River': [
    {
      name: 'Jones Hole Creek',
      parent: 'Green River',
      state: 'UT',
      desc: 'Spring-fed tributary entering the Green near Dinosaur National Monument. 4-mile trail from the Jones Hole National Fish Hatchery follows gin-clear water with wild rainbow and brown trout. One of the most pristine small streams in the region.',
      access: 'Jones Hole Trailhead, ~25 mi east of Vernal via Diamond Mountain Rd. Paved parking at hatchery.',
      species: ['rainbow','brown'],
      notes: 'Trail access only — no road to the confluence. Fish early before the day-hikers arrive.',
      lat: 40.5788, lng: -109.0522,
      tags: ['Wild Trout','Walk-in','Spring Creek','Dinosaur NM'],
    },
    {
      name: 'Sheep Creek',
      parent: 'Green River',
      state: 'UT',
      desc: 'Canyon tributary entering the Green River arm of Flaming Gorge Reservoir. Brook and cutthroat trout in a dramatic geological canyon. Sheep Creek Lake above offers alpine stillwater fishing.',
      access: 'Sheep Creek Canyon Geological Area loop road off US-191, ~20 mi south of Manila, UT.',
      species: ['brook','cutthroat'],
      notes: 'Lower section subject to reservoir backwater. Fish mid-canyon for the best wild trout.',
      lat: 40.8188, lng: -109.5544,
      tags: ['Brook Trout','Cutthroat','Geological Area','Flaming Gorge'],
    },
  ],

  'Logan River': [
    {
      name: 'Temple Fork',
      parent: 'Logan River',
      state: 'UT',
      desc: 'The primary spawning tributary for Logan River Bear River Cutthroat. Small, brushy stream with willing cutthroat averaging 6–10". Closed in spring to protect spawning fish — check current regulations before going.',
      access: 'Turn off US-89 at Temple Fork Rd, ~12 miles up Logan Canyon. Road follows the stream.',
      species:['cutthroat'],
      notes: 'Closed Jan 1 through early July for spawning. Open mid-summer through fall. Small attractor patterns dominate — size 14–16 Humpy, Adams, EHC.',
      lat: 41.8844, lng: -111.5266,
      tags: ['Native Cutthroat','Spawning Tributary','Small Stream','Seasonal Closure'],
    },
    {
      name: 'Blacksmith Fork',
      parent: 'Logan River',
      state: 'UT',
      desc: 'One of the Logan River system\'s best tributary fisheries. Brown trout dominate with wild cutthroat in the upper reaches. Famous for one of the few Salmonfly hatches in Utah — typically mid-June. Access via Hardware Ranch Rd (SR-101) east of Hyrum.',
      access: 'SR-101 (Hardware Ranch Rd) east from Hyrum, UT. Road parallels the river for miles. Multiple pullouts.',
      species: ['brown','cutthroat','rainbow'],
      notes: 'Best accessed above the power plant crossing near Hyrum. Salmonfly hatch mid-June is a must-fish event. Large browns to 18" in deeper pools.',
      lat: 41.6122, lng: -111.7088,
      tags: ['Brown Trout','Salmonfly Hatch','Freestone','BRCT'],
    },
  ],

  'Provo River': [
    {
      name: 'South Fork Provo River',
      parent: 'Provo River',
      state: 'UT',
      desc: 'Wild cutthroat tributary entering the upper Provo near Heber Valley. Smaller water with less pressure than the main stem. Excellent terrestrial fishing in late summer through stands of willows and meadow grass.',
      access: 'South Fork Rd off US-189 near Heber City, UT.',
      species: ['cutthroat','brown'],
      notes: 'Best in late July–September on hoppers and ants. Smaller fish than the main Provo but far less crowded.',
      lat: 40.5188, lng: -111.3944,
      tags: ['Cutthroat','Small Stream','Terrestrials','Less Pressure'],
    },
  ],

  /* ── IDAHO ── */
  "Henry's Fork": [
    {
      name: 'Buffalo River',
      parent: "Henry's Fork",
      state: 'ID',
      desc: 'A spring creek tributary entering Henry\'s Fork near Last Chance. Crystal-clear water with a sustained cool temperature even in August. Wild rainbow trout in a classic meadow setting — technical fishing requiring careful presentations.',
      access: 'Buffalo River Campground (USFS) off US-20 near Last Chance, ID.',
      species:['rainbow'],
      notes: 'Catch-and-release only. Insects and presentation must be perfect — fish see a lot of flies here. PMDs, Tricos, and midges.',
      lat: 44.4655, lng: -111.4177,
      tags: ['Spring Creek','Rainbow','Technical','Catch & Release'],
    },
  ],

  'South Fork Snake': [
    {
      name: 'Palisades Creek',
      parent: 'South Fork Snake',
      state: 'ID',
      desc: 'Cascading tributary entering the upper South Fork near Palisades Reservoir. Walk-in trail access with cutthroat and brook trout in clear pocket water. A welcome escape from the float-dominated main stem.',
      access: 'Palisades Creek Trailhead, 4 mi east of Swan Valley, ID off US-26.',
      species: ['cutthroat','brook'],
      notes: 'Trail follows the creek for several miles. Fish get smaller and wilder the higher you go. Excellent attractor dry fly water.',
      lat: 43.3600, lng: -111.2300,
      tags: ['Cutthroat','Brook Trout','Walk-in','Pocket Water'],
    },
  ],

  /* ── MONTANA ── */
  'Madison River': [
    {
      name: 'West Fork Madison',
      parent: 'Madison River',
      state: 'MT',
      desc: 'Headwaters tributary entering the Madison near the Wyoming border. Wild cutthroat and brown trout in a remote meadow canyon. Rarely fished compared to the lower Madison.',
      access: 'West Fork Madison Rd off US-287, ~10 mi south of West Yellowstone.',
      species: ['cutthroat','brown'],
      notes: 'Road access but light traffic. Best July–September. Attract-and-eat dry fly water.',
      lat: 44.5788, lng: -111.2344,
      tags: ['Wild Trout','Headwaters','Remote','Dry Fly'],
    },
  ],

  'Gallatin River': [
    {
      name: 'Taylor Fork',
      parent: 'Gallatin River',
      state: 'MT',
      desc: 'Notable Gallatin tributary flowing through open meadows before joining the main river near Big Sky. Wild rainbow and cutthroat in a lightly pressured drainage. Good hopper fishing late summer.',
      access: 'Taylor Fork Rd off US-191, ~35 mi south of Bozeman.',
      species: ['rainbow','cutthroat'],
      notes: 'Road access to lower mile, then walk-in. Meadow section fishes well on hoppers and stimulators mid-July through September.',
      lat: 45.1022, lng: -111.2677,
      tags: ['Rainbow','Cutthroat','Meadow','Walk-in'],
    },
  ],

  /* ── OREGON ── */
  'Deschutes River': [
    {
      name: 'Shitike Creek',
      parent: 'Deschutes River',
      state: 'OR',
      desc: 'Warm Springs Reservation tributary entering the Deschutes north of Warm Springs. Wild steelhead use this creek as a spawning tributary in fall. The confluence area holds both trout and staging steelhead.',
      access: 'Highway 26 near Warm Springs, OR. Tribal lands — check current access and permit requirements.',
      species: ['steelhead','rainbow'],
      notes: 'Access may require Warm Springs Tribal permit. Verify current regulations before fishing.',
      lat: 44.7722, lng: -121.2644,
      tags: ['Steelhead','Tribal Lands','Permit Required','Confluence'],
    },
  ],

};


/* ═══════════════════════════════════════════════════════════
   STILLWATER ACCESS
   Each lake: shore and watercraft access points
   mode: 'shore' | 'boat' | 'both'
═══════════════════════════════════════════════════════════ */
const STILLWATER_ACCESS = {
  'Strawberry Reservoir': {
    overview: 'Large reservoir at 7,600 ft. Boat access opens up the best mid-lake structures. Shore fishing productive at inlet areas and the dam face.',
    boatNote: 'Two full-service boat ramps. No horsepower limit but float tubes and pontoons are ideal for fly fishing the weed edges. Launch at Soldier Creek or Strawberry Bay.',
    shoreNote: 'Excellent shore access along the west arm and at Soldier Creek inlet. Evening callibaetis hatches on calm days bring fish to the surface within casting range.',
    access: [
      {name:'Strawberry Bay Marina',desc:'Full-service marina and launch. Primary access for the main body of the reservoir.',tags:['Boat Launch','Marina','Parking'],mode:'boat',lat:40.1722, lng:-111.1633},
      {name:'Soldier Creek Inlet',desc:'Wading and shore fishing at the creek inlet. Outstanding callibaetis and damsel activity. Float tube staging area.',tags:['Shore','Inlet','Float Tube'],mode:'both',lat:40.1488, lng:-111.1355},
      {name:'Chicken Creek Campground',desc:'West arm shore access. Early morning stillwater midge and chironomid fishing from the bank.',tags:['Shore','Campground','Midge'],mode:'shore',lat:40.1933, lng:-111.1788},
      {name:'Strawberry Dam Face',desc:'Shore fishing at the dam. Deep water nearby — indicator rigs with chironomids effective.',tags:['Shore','Deep Water','Chironomid'],mode:'shore',lat:40.1366, lng:-111.1488},
    ],
  },
  'Flaming Gorge': {
    overview: 'Massive deep reservoir spanning Utah and Wyoming. Best fly fishing near the upper Green River arm and tributary inlets. Boat essential for accessing quality water.',
    boatNote: 'Multiple marinas on a large reservoir. Cedar Springs Marina (UT) and Buckboard Crossing (WY) are primary launches. Expect boat traffic on summer weekends.',
    shoreNote: 'Limited but productive shore access near inlets and Sheep Creek Bay. Early morning midge and callibaetis activity near shore structure.',
    access: [
      {name:'Cedar Springs Marina',desc:'Primary Utah-side launch. Access to the trophy section below the dam and upper reservoir.',tags:['Boat Launch','Full-Service','Primary'],mode:'boat',lat:40.9244, lng:-109.4344},
      {name:'Sheep Creek Bay',desc:'North shore bay with good shore access and float tube staging. Callibaetis and chironomid activity.',tags:['Shore','Bay','Float Tube'],mode:'both',lat:41.0322, lng:-109.5188},
      {name:'Buckboard Crossing (WY)',desc:'Wyoming-side marina for the upper reservoir arm. Quieter, closer to the Green River inlet.',tags:['Boat Launch','Wyoming','Inlet'],mode:'boat',lat:41.2822, lng:-109.6288},
    ],
  },
  "Henry's Lake": {
    overview: 'Legendary stillwater fishery near Yellowstone Park. Trophy hybrid cutthroat in a shallow, weedy lake. Float tube mandatory for serious fishing. Walk-in shore access limited.',
    boatNote: 'State park boat ramp at Henry\'s Lake State Park. Float tube and pontoon boat ideal — motors allowed but electric preferred near weed beds. Morning and evening are prime.',
    shoreNote: 'Limited productive shore access. Deep wading from the state park beach accesses some of the near-shore weed structure. Best shore opportunity: northwest arm near the inlet channels.',
    access: [
      {name:'Henry\'s Lake State Park Ramp',desc:'Primary access. Paved boat ramp with staging area. Float tube launch. Fishing best along weed edges in 6–12 feet of water.',tags:['State Park','Boat Ramp','Float Tube'],mode:'both',lat:44.6188, lng:-111.4234},
      {name:'Northwest Inlet Channels',desc:'Float tube staging and walk-in wading near the inlet. Prime morning chironomid and damsel water.',tags:['Inlet','Shore','Walk-in'],mode:'shore',lat:44.6511, lng:-111.4622},
    ],
  },
  'Crane Prairie Reservoir': {
    overview: 'Oregon\'s finest stillwater fly fishery. Iconic for large, aggressive rainbow and brown trout. Dead-standing timber provides unique habitat. Float tube or boat essential.',
    boatNote: 'Crane Prairie Campground boat ramp. No-wake zones protect fly fishing areas. Electric motors strongly preferred. Navigate around standing dead timber carefully.',
    shoreNote: 'Limited shore access — dead timber makes bank fishing challenging except at the campground area and inlet channels.',
    access: [
      {name:'Crane Prairie Campground Ramp',desc:'Primary access. Float tubes and electric-motor boats most effective for navigating the timber.',tags:['Boat Ramp','Campground','Primary'],mode:'boat',lat:43.7933, lng:-121.7288},
      {name:'Quinn River Inlet',desc:'Shore and float tube access at the Quinn River inlet. Excellent spring rainbow migration area.',tags:['Inlet','Shore','Spring Migration'],mode:'both',lat:43.8133, lng:-121.7511},
    ],
  },
  'Lake Lenice': {
    overview: 'Washington\'s top desert lake for trophy rainbow trout. Fly fishing only, no motors. Hike-in float tube lake. Two-mile walk to the lake ensures low pressure.',
    boatNote: 'No motorized boats or trailers. Float tube or pontoon boat required. Carry-in only. Two-mile hike on Lenice Road to the lake.',
    shoreNote: 'Shore fishing possible but limited by tule reeds. A float tube allows full access to the productive mid-lake structure and drop-offs.',
    access: [
      {name:'Lenice Road Trailhead',desc:'Hike 2 miles to the lake. Primitive parking. Float tube carry-in access. Fly fishing only — some of Washington\'s largest rainbow.',tags:['Hike-in','Float Tube','Fly Only'],mode:'both',lat:46.6244, lng:-119.9544},
    ],
  },
  'Blue Mesa Reservoir': {
    overview: 'Colorado\'s largest reservoir at 9,000 ft. Excellent lake trout, kokanee, and rainbow. Large boat most effective. Shore fishing productive near the Iola and Cebolla basins.',
    boatNote: 'Elk Creek Marina (full service) and Lake Fork Marina. Launch fees apply. Large reservoir with afternoon winds — plan early morning.',
    shoreNote: 'Good shore access at the Iola Basin arm and Cebolla Basin. Streamer fishing from shore effective for large brown trout in the river arms.',
    access: [
      {name:'Elk Creek Marina',desc:'Full-service marina on the main body. Primary access for trophy lake trout and kokanee.',tags:['Marina','Full-Service','Lake Trout'],mode:'boat',lat:38.4644, lng:-107.3288},
      {name:'Iola Basin',desc:'Shore fishing in the upper reservoir arm. River-like conditions with brown trout and rainbow.',tags:['Shore','River Arm','Brown Trout'],mode:'shore',lat:38.5244, lng:-107.2022},
      {name:'Lake Fork Arm',desc:'Quieter western arm. Shore fishing for rainbow and brown trout. Chironomid activity near weed edges.',tags:['Shore','Quiet','Chironomid'],mode:'both',lat:38.5022, lng:-107.4566},
    ],
  },
  'Flathead Lake': {
    overview: 'The largest natural freshwater lake west of the Mississippi. Bull trout, lake trout, rainbow, and westslope cutthroat. Boat essential for the main lake. Shore fishing at the river inlets.',
    boatNote: 'Multiple public marinas and launches around the lake perimeter. This is a large, potentially dangerous lake — respect afternoon winds on the main body.',
    shoreNote: 'Best shore access at the Flathead River inlet (north end) and Wild Horse Island State Park (boat access only). Shore fishing in the tributary mouths.',
    access: [
      {name:'Wayfarers State Park Ramp',desc:'East shore launch near Bigfork. Access to the southern half of the lake and Bigfork Bay.',tags:['State Park','Boat Ramp','South Lake'],mode:'boat',lat:48.0622, lng:-114.0644},
      {name:'Flathead River Inlet (North)',desc:'North end shore access where the river enters. Migratory bull trout and cutthroat in the inlet zone.',tags:['Inlet','Shore','Bull Trout','Migration'],mode:'shore',lat:47.9844, lng:-114.1288},
      {name:'Polson Bay',desc:'South end access. Full marina facilities. Callibaetis and chironomid activity on the shallow south shelf.',tags:['Marina','South Bay','Stillwater'],mode:'boat',lat:47.6855, lng:-114.1655},
    ],
  },
  'Fremont Lake': {
    overview: 'Wyoming\'s second largest natural lake in the Wind River Range foothills. Cold, deep, and clear. Lake trout dominate but mackinaw are the primary target. Boat preferred.',
    boatNote: 'Public boat launch at the Fremont Lake Campground. Deep lake — sink-tip and full-sink lines needed for lake trout.',
    shoreNote: 'Shore fishing possible near the inlet creek and campground area. Early morning surface activity for smaller rainbow and cutthroat.',
    access: [
      {name:'Fremont Lake Campground Ramp',desc:'USFS campground and boat launch. Primary access to the main lake. Lake trout in deep structure.',tags:['USFS','Boat Ramp','Lake Trout'],mode:'both',lat:42.9544, lng:-109.8244},
      {name:'Inlet Creek Area',desc:'Shore fishing where the inlet stream enters the lake. Morning surface activity for cutthroat.',tags:['Shore','Inlet','Cutthroat'],mode:'shore',lat:42.9822, lng:-109.8511},
    ],
  },
};


/* ═══════════════════════════════════════════════════════════
   USGS HELPERS
═══════════════════════════════════════════════════════════ */
const flowCache = {};

async function fetchUSGS(siteId, param) {
  const key = `${siteId}-${param}`;
  const cached = flowCache[key];
  if (cached && Date.now() - cached.ts < 300_000) return cached.val;
  try {
    const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${siteId}&parameterCd=${param}&siteStatus=active`;
    const res = await fetch(url);
    const data = await res.json();
    const ts = data?.value?.timeSeries;
    if (!ts?.length) return null;
    const val = parseFloat(ts[0]?.values?.[0]?.value?.[0]?.value);
    if (isNaN(val)) return null;
    flowCache[key] = { val, ts: Date.now() };
    return val;
  } catch { return null; }
}

function getFlowStatus(cfs) {
  if (cfs === -1) return { label:'Ice-Affected', color:'var(--tdim)' };
  if (cfs === null) return { label:'No Data', color:'var(--tdim)' };
  if (cfs < 50)    return { label:'Low',                    color:'var(--flow-low)' };
  if (cfs < 300)   return { label:'Good Fishing',           color:'var(--flow-ok)'  };
  if (cfs < 1000)  return { label:'Moderate',               color:'var(--flow-med)' };
  if (cfs < 3000)  return { label:'High / Challenging',     color:'var(--flow-hi)'  };
  return              { label:'Flood Stage — Stay Home', color:'var(--flow-flood)'};
}

function getTempAdvice(f) {
  if (f === null) return { label:'Temp not available',              color:'var(--tdim)' };
  if (f < 36)     return { label:'Frozen / Off-limits',            color:'var(--slate)' };
  if (f < 42)     return { label:'Very Cold — Nymph Deep',         color:'var(--slate)' };
  if (f < 50)     return { label:'Cold — Euro Nymph, Midges',      color:'var(--teal)' };
  if (f < 58)     return { label:'Prime — Hatches Starting',       color:'var(--flow-ok)' };
  if (f < 65)     return { label:'Peak — Dry Fly Window',          color:'var(--gold)' };
  if (f < 70)     return { label:'Warm — Evening Fishing Best',    color:'var(--flow-med)' };
  if (f < 75)     return { label:'Hot — Fish Stressed, Use Care',  color:'var(--flow-hi)' };
  return              { label:"⚠ Too Hot — Don't Fish",           color:'var(--flow-flood)'};
}

/* ═══════════════════════════════════════════════════════════
   SMALL REUSABLE COMPONENTS
═══════════════════════════════════════════════════════════ */

/** Labelled section divider */
function SectionLabel({ children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'.7rem', fontSize:'.64rem',
      letterSpacing:'.22em', textTransform:'uppercase', color:'var(--teal)',
      fontWeight:600, marginBottom:'.6rem' }}>
      <span style={{ width:16, height:1, background:'var(--teal)', display:'block', flexShrink:0 }} />
      {children}
    </div>
  );
}

/** Decorative divider bar */
function SDivider() {
  return <div style={{ width:32, height:2, background:'var(--teal)', margin:'1rem 0 2.2rem' }} />;
}

/** Panel header row */
function PanelHeader({ icon, title, river }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'.7rem', marginBottom:'1.4rem' }}>
      <span style={{ fontSize:'1.1rem' }}>{icon}</span>
      <span style={{ ...S.label, marginBottom:0 }}>{title}</span>
      {river && (
        <span style={{ marginLeft:'auto', fontSize:'.73rem', color:'var(--tdim)',
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:200 }}>
          {river}
        </span>
      )}
    </div>
  );
}

/** Empty state placeholder */
function EmptyState({ icon, msg }) {
  return (
    <div style={{ padding:'2.5rem', textAlign:'center', color:'var(--tdim)', fontSize:'.85rem' }}>
      <div style={{ fontSize:'2.2rem', marginBottom:'.7rem', opacity:.5 }}>{icon}</div>
      {msg}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HATCH PANEL
═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   SECTION-SPECIFIC GAUGE OVERRIDES
   Maps each river section → best available USGS gauge.
   Where no gauge exists in a section, nearest gauge is used.
   flowSite = USGS parameter 00060 (discharge, CFS)
   tempSite = USGS parameter 00010 (water temp, °C) — null if unavailable
═══════════════════════════════════════════════════════════ */
const SECTION_GAUGES = {

  /* ── UTAH: LOGAN RIVER ─────────────────────────────────
     10109000  Logan R. near Logan (below 1st Dam)  — has temp
     10108400  Logan R. above State Dam (above 3rd Dam) — flow only
     No gauge exists above Card Canyon Bridge */
  'logan-lower':   { flowSite:'10109000', tempSite:'10109000', loc:'USGS at canyon mouth (below 1st Dam)' },
  'logan-middle':  { flowSite:'10108400', tempSite:null,       loc:'Nearest gauge: above 3rd Dam (upstream of section)' },
  'logan-artonly': { flowSite:'10108400', tempSite:null,       loc:'Nearest gauge: above 3rd Dam (no gauge in this section)' },
  'logan-upper':   { flowSite:'10108400', tempSite:null,       loc:'Nearest gauge: above 3rd Dam (no gauge in wild cutthroat zone)' },

  /* ── UTAH: PROVO RIVER ─────────────────────────────────
     10134500  Provo R. near Woodland (above Jordanelle) — upper
     10154200  Provo R. near Heber (below Jordanelle) — middle, has temp
     10163000  Provo R. near Springville (below Deer Creek) — lower */
  'upper-provo':  { flowSite:'10134500', tempSite:null,       loc:'USGS near Woodland (above Jordanelle Reservoir)' },
  'middle-provo': { flowSite:'10154200', tempSite:'10154200', loc:'USGS near Heber (below Jordanelle Dam)' },
  'lower-provo':  { flowSite:'10163000', tempSite:null,       loc:'USGS near Springville (below Deer Creek Dam)' },

  /* ── UTAH: WEBER RIVER ─────────────────────────────────
     10128500  Weber R. near Coalville (below Rockport) — upper, has temp
     10130500  Weber R. near Morgan — middle
     10141000  Weber R. near Plain City — lower */
  'weber-upper':  { flowSite:'10128500', tempSite:'10128500', loc:'USGS near Coalville (below Rockport Dam)' },
  'weber-middle': { flowSite:'10130500', tempSite:null,       loc:'USGS near Morgan' },
  'weber-lower':  { flowSite:'10141000', tempSite:null,       loc:'USGS near Plain City' },

  /* ── UTAH: FREMONT RIVER ───────────────────────────────
     09328500  Fremont R. near Loa (upper plateau) — flow only
     09329000  Fremont R. near Torrey — middle Capitol Reef area
     09330000  Fremont R. near Caineville — lower desert reach */
  'fremont-upper':  { flowSite:'09328500', tempSite:null, loc:'Nearest gauge: USGS near Loa (upper plateau)' },
  'fremont-middle': { flowSite:'09329000', tempSite:null, loc:'USGS near Torrey (Capitol Reef area)' },
  'fremont-lower':  { flowSite:'09330000', tempSite:null, loc:'USGS near Caineville (desert reach)' },

  /* ── UTAH: STRAWBERRY RIVER ────────────────────────────
     09291000  Strawberry R. near Soldier Summit (tailwater outflow) — has temp
     09295000  Strawberry R. near Fruitland (lower canyon) */
  'straw-upper':    { flowSite:'09291000', tempSite:null,       loc:'Nearest gauge: USGS near Soldier Summit (no gauge in backcountry)' },
  'straw-tailwater':{ flowSite:'09291000', tempSite:'09291000', loc:'USGS near Soldier Summit (just below dam)' },
  'straw-canyon':   { flowSite:'09295000', tempSite:null,       loc:'USGS near Fruitland (lower canyon)' },

  /* ── UTAH: DUCHESNE RIVER ──────────────────────────────
     09279000  North Fork Duchesne R. near Tabiona
     09285000  Duchesne R. near Tabiona (main stem / lower)
     No gauge on West Fork — nearest is main stem at Tabiona */
  'duchesne-northfork': { flowSite:'09279000', tempSite:null, loc:'USGS North Fork near Tabiona' },
  'duchesne-westfork':  { flowSite:'09285000', tempSite:null, loc:'Nearest gauge: USGS main stem near Tabiona (no gauge on West Fork)' },
  'duchesne-mainstem':  { flowSite:'09285000', tempSite:null, loc:'USGS main stem near Tabiona' },
  'duchesne-lower':     { flowSite:'09285000', tempSite:null, loc:'USGS near Tabiona (nearest upstream gauge)' },

  /* ── UTAH: DIAMOND FORK ────────────────────────────────
     10163000  Diamond Fork near Spanish Fork (outlet gauge)
     No interior gauges — all sections use the outlet */
  'dfork-lower':  { flowSite:'10163000', tempSite:null, loc:'USGS near Spanish Fork confluence (nearest gauge)' },
  'dfork-middle': { flowSite:'10163000', tempSite:null, loc:'USGS near Spanish Fork (nearest gauge; no gauge in canyon)' },
  'dfork-upper':  { flowSite:'10163000', tempSite:null, loc:'USGS near Spanish Fork (no gauge in upper canyon)' },

  /* ── UTAH: SIXTH WATER CREEK ───────────────────────────
     No dedicated USGS gauge — Diamond Fork outlet is best proxy */
  'sixth-lower': { flowSite:'10163000', tempSite:null, loc:'Proxy: Diamond Fork gauge near Spanish Fork (no Sixth Water gauge)' },
  'sixth-upper': { flowSite:'10163000', tempSite:null, loc:'Proxy: Diamond Fork gauge (no gauge on Sixth Water Creek)' },

  /* ── IDAHO: HENRY'S FORK ──────────────────────────────────
     13055000  Henry's Fork at Island Park Dam (Box Canyon start) — has temp
     13057000  Henry's Fork near St. Anthony (below Harriman/lower) — has temp
     No gauge between Island Park Dam and St. Anthony — Harriman uses dam gauge */
  'hf-box':     { flowSite:'13055000', tempSite:'13055000', loc:'USGS at Island Park Dam (Box Canyon start)' },
  'hf-harriman':{ flowSite:'13055000', tempSite:'13055000', loc:'Nearest gauge: USGS at Island Park Dam (no gauge at Harriman)' },
  'hf-lower':   { flowSite:'13057000', tempSite:'13057000', loc:'USGS near St. Anthony (lower river)' },

  /* ── IDAHO: SOUTH FORK SNAKE RIVER ─────────────────────
     13046995  South Fork Snake R. near Irwin (just below Palisades Dam) — has temp
     13060000  South Fork Snake R. near Heise (between sections) — has temp */
  'sf-upper': { flowSite:'13046995', tempSite:'13046995', loc:'USGS near Irwin (just below Palisades Dam)' },
  'sf-lower': { flowSite:'13060000', tempSite:'13060000', loc:'USGS near Heise (lower canyon)' },

  /* ── MONTANA: MADISON RIVER ────────────────────────────────
     06036905  Madison R. below Hebgen Dam (upper section start) — has temp
     06037500  Madison R. near Cameron, MT (lower section) — has temp
     06038800  Madison R. at Ennis Lake outflow (Bear Trap start) */
  'madison-upper':    { flowSite:'06036905', tempSite:'06036905', loc:'USGS below Hebgen Dam (upper Madison start)' },
  'madison-lower':    { flowSite:'06037500', tempSite:'06037500', loc:'USGS near Cameron (classic lower Madison)' },
  'madison-bear-trap':{ flowSite:'06038800', tempSite:null,       loc:'USGS at Ennis Lake outflow (Bear Trap entry)' },

  /* ── MONTANA: YELLOWSTONE RIVER ─────────────────────────
     06191500  Yellowstone R. near Corwin Springs, MT (Park section exit / Paradise top) — has temp
     06192500  Yellowstone R. at Livingston, MT (lower Paradise Valley) — has temp */
  'yell-park':    { flowSite:'06191500', tempSite:'06191500', loc:'USGS near Corwin Springs (park exit gauge)' },
  'yell-paradise':{ flowSite:'06192500', tempSite:'06192500', loc:'USGS at Livingston (Paradise Valley)' },

  /* ── MONTANA: BIGHORN RIVER ─────────────────────────────
     06294500  Bighorn R. near St. Xavier, MT (13-Mile start, below Yellowtail Dam) — has temp
     06295000  Bighorn R. near Hardin, MT (lower section) */
  'bighorn-13mile':{ flowSite:'06294500', tempSite:'06294500', loc:'USGS near St. Xavier (below Yellowtail Dam)' },
  'bighorn-lower': { flowSite:'06295000', tempSite:null,       loc:'USGS near Hardin (lower Bighorn)' },

  /* ── MONTANA: GALLATIN RIVER ────────────────────────────
     06041000  Gallatin R. at West Yellowstone (upper canyon top) — flow only
     06042500  Gallatin R. near Gallatin Gateway, MT (canyon bottom) — has temp */
  'gallatin-canyon':{ flowSite:'06042500', tempSite:'06042500', loc:'USGS near Gallatin Gateway (canyon bottom)' },
  'gallatin-lower': { flowSite:'06043500', tempSite:null,       loc:'USGS near Manhattan (lower Gallatin)' },

  /* ── MONTANA: MISSOURI RIVER ────────────────────────────
     06054500  Missouri R. near Toston, MT (Craig reach) — has temp
     06058500  Missouri R. near Cascade, MT (lower reach) */
  'missouri-craig': { flowSite:'06054500', tempSite:'06054500', loc:'USGS near Toston (Craig tailwater gauge)' },

  /* ── MONTANA: CLARK FORK ────────────────────────────────
     12334550  Clark Fork R. at Warm Springs, MT (upper start) — has temp
     12340000  Clark Fork R. near Missoula (upper/lower divide) — has temp
     12354500  Clark Fork R. near St. Regis, MT (lower canyon) — has temp */
  'clarkfork-upper':{ flowSite:'12340000', tempSite:'12340000', loc:'USGS near Missoula (upper Clark Fork)' },
  'clarkfork-lower':{ flowSite:'12354500', tempSite:'12354500', loc:'USGS near St. Regis (Alberton Gorge reach)' },

  /* ── MONTANA: BITTERROOT RIVER ──────────────────────────
     12344000  Bitterroot R. near Darby, MT (upper section) — has temp
     12352500  Bitterroot R. near Missoula (lower section) — has temp */
  'bitterroot-upper':{ flowSite:'12344000', tempSite:'12344000', loc:'USGS near Darby (upper Bitterroot)' },
  'bitterroot-lower':{ flowSite:'12352500', tempSite:'12352500', loc:'USGS near Missoula (lower Bitterroot)' },

  /* ── WYOMING: SNAKE RIVER ─────────────────────────────────
     13010065  Snake R. near Moose, WY (below GTNP upper section) — has temp
     13016450  Snake R. near Hoback Jct, WY (lower section) — has temp */
  'snake-wy-upper': { flowSite:'13010065', tempSite:'13010065', loc:'USGS near Moose (below GTNP upper reach)' },
  'snake-wy-lower': { flowSite:'13018750', tempSite:null,       loc:'USGS Snake River below Flat Creek, near Jackson, WYack Junction (lower Snake)' },

  /* ── WYOMING: GREEN RIVER ───────────────────────────────
     09188500  Green R. at Warren Bridge near Daniel, WY (upper) — flow only, ice Mar
     09211200  Green R. below Fontenelle Reservoir, WY (lower) — flow only */
  'green-wy-upper':     { flowSite:'09188500', tempSite:null,       loc:'USGS Green River at Warren Bridge near Daniel, WY (upper — seasonal ice Mar) Warren Bridge (upper Green)' },
  'green-wy-fontenelle':{ flowSite:'09211200', tempSite:null,       loc:'USGS Green River below Fontenelle Reservoir, WY Fontenelle (below dam — has temp)' },

  /* ── WYOMING: NORTH PLATTE ──────────────────────────────
     06620000  North Platte R. near Saratoga, WY — has temp
     Only one gauge needed — covers Miracle Mile and Saratoga sections */
  'nplatte-saratoga': { flowSite:'06620000', tempSite:'06620000', loc:'USGS near Saratoga (covers Miracle Mile & Saratoga reach)' },

  /* ── WYOMING: HOBACK RIVER ──────────────────────────────
     13017000  Hoback R. near Hoback Jct, WY — flow only
     Single gauge for the entire accessible canyon */
  'hoback-canyon': { flowSite:'13019500', tempSite:null, loc:'USGS Hoback River near Jackson, WY' },

  /* ── WYOMING: HAM'S FORK ────────────────────────────────
     09224700  Ham's Fork near Granger, WY — flow only
     Single gauge near mouth — best available for both sections */
  'hamsfork-upper': { flowSite:'09224700', tempSite:null, loc:"Nearest gauge: USGS near Granger (no gauge in upper canyon)" },
  'hamsfork-lower': { flowSite:'09224700', tempSite:null, loc:'USGS near Granger (lower Hams Fork)' },

  /* ── UTAH: GREEN RIVER ─────────────────────────────────
     09234500  Green R. at Flaming Gorge Dam (A Section start) — has temp
     09261000  Green R. at Green River, UT (far downstream) — has temp
     Best for all 3 sections is the dam gauge — most relevant to tailwater fishery */
  'green-a': { flowSite:'09234500', tempSite:'09234500', loc:'USGS at Flaming Gorge Dam (A Section start)' },
  'green-b': { flowSite:'09234500', tempSite:'09234500', loc:'USGS at Flaming Gorge Dam (nearest upstream gauge)' },
  'green-c': { flowSite:'09234500', tempSite:'09234500', loc:'USGS at Flaming Gorge Dam (nearest upstream gauge)' },

  /* ── COLORADO: ARKANSAS RIVER ───────────────────────────
     07091500  Arkansas R. near Salida, CO (below Granite) — has temp
     07099500  Arkansas R. near Parkdale, CO (Browns Canyon) — has temp */
  'ark-upper':  { flowSite:'07091500', tempSite:'07091500', loc:'USGS near Salida (upper Arkansas — below Granite)' },
  'ark-browns': { flowSite:'07099500', tempSite:'07099500', loc:'USGS near Parkdale (Browns Canyon entrance)' },

  /* ── COLORADO: SOUTH PLATTE ─────────────────────────────
     06701900  South Platte R. below Cheesman Reservoir (Cheesman Canyon) — has temp
     06700000  South Platte R. near Deckers — has temp
     06696980  South Platte R. below Eleven Mile Reservoir */
  'splatte-cheesman': { flowSite:'06701900', tempSite:'06701900', loc:'USGS below Cheesman Reservoir (trophy section)' },
  'splatte-eleven':   { flowSite:'06696980', tempSite:null,       loc:'USGS below Eleven Mile Reservoir' },

  /* ── COLORADO: FRYING PAN RIVER ─────────────────────────
     09080400  Frying Pan R. near Basalt, CO — has temp
     Single gauge covers the only floatable section */
  'fryingpan-lower': { flowSite:'09080400', tempSite:'09080400', loc:'USGS near Basalt (below Ruedi Dam)' },

  /* ── COLORADO: BLUE RIVER ───────────────────────────────
     09057500  Blue R. near Kremmling, CO — flow only
     09058000  Blue R. below Green Mountain Reservoir (Silverthorne tailwater) */
  'blue-upper': { flowSite:'09058000', tempSite:null, loc:'USGS below Green Mountain Reservoir (Silverthorne tailwater)' },

  /* ── COLORADO: ROARING FORK ─────────────────────────────
     09085000  Roaring Fork R. near Glenwood Springs — has temp
     09081600  Roaring Fork R. at Aspen (upper section) — has temp */
  'rfork-upper': { flowSite:'09081600', tempSite:'09081600', loc:'USGS at Aspen (upper Roaring Fork)' },
  'rfork-lower': { flowSite:'09085000', tempSite:'09085000', loc:'USGS near Glenwood Springs (lower Roaring Fork)' },

  /* ── COLORADO: CACHE LA POUDRE ──────────────────────────
     06752000  Cache la Poudre R. near Fort Collins — has temp
     06746095  Cache la Poudre R. near Rustic, CO (canyon) — flow only */
  'poudre-canyon': { flowSite:'06746095', tempSite:null, loc:'USGS near Rustic (upper canyon — nearest gauge)' },

  /* ── OREGON: DESCHUTES RIVER ────────────────────────────
     14092500  Deschutes R. near Madras, OR (below Pelton Dam) — has temp
     14103000  Deschutes R. at Moody, OR (lower — near Columbia) — has temp */
  'deschutes-upper': { flowSite:'14092500', tempSite:'14092500', loc:'USGS near Madras (below Pelton/Round Butte Dams)' },
  'deschutes-lower': { flowSite:'14103000', tempSite:'14103000', loc:'USGS at Moody near Columbia confluence' },

  /* ── OREGON: ROGUE RIVER ────────────────────────────────
     14335300  Rogue R. at Prospect, OR (upper — above Lost Creek) — has temp
     14372300  Rogue R. near Agness, OR (lower wild section) — has temp */
  'rogue-upper': { flowSite:'14335300', tempSite:'14335300', loc:'USGS near Prospect (upper Rogue above Lost Creek)' },
  'rogue-lower': { flowSite:'14372300', tempSite:'14372300', loc:'USGS near Agness (lower wild Rogue)' },

  /* ── OREGON: McKENZIE RIVER ─────────────────────────────
     14162500  McKenzie R. near Vida, OR (upper/mid) — has temp
     14163900  McKenzie R. near Leaburg, OR (lower) — has temp */
  'mckenzie-upper': { flowSite:'14162500', tempSite:'14162500', loc:'USGS near Vida (upper McKenzie)' },
  'mckenzie-lower': { flowSite:'14163900', tempSite:'14163900', loc:'USGS near Leaburg (lower McKenzie)' },

  /* ── OREGON: SANDY RIVER ────────────────────────────────
     14137000  Sandy R. near Marmot, OR — has temp
     Single gauge covers the primary steelhead section */
  'sandy-gorge': { flowSite:'14137000', tempSite:'14137000', loc:'USGS near Marmot (upper Sandy gorge)' },

  /* ── OREGON: JOHN DAY RIVER ─────────────────────────────
     14046500  John Day R. near Service Creek, OR — has temp
     Single gauge at the primary float put-in */
  'johnday-lower': { flowSite:'14046500', tempSite:'14046500', loc:'USGS near Service Creek (lower canyon put-in)' },

  /* ── WASHINGTON: YAKIMA RIVER ───────────────────────────
     12479000  Yakima R. near Cle Elum (upper) — has temp
     12484500  Yakima R. near Umtanum (canyon) — has temp */
  'yakima-upper':  { flowSite:'12479000', tempSite:'12479000', loc:'USGS near Cle Elum (above Roza Dam)' },
  'yakima-canyon': { flowSite:'12484500', tempSite:'12484500', loc:'USGS near Umtanum (canyon reach)' },

  /* ── WASHINGTON: METHOW RIVER ───────────────────────────
     12448500  Methow R. near Twisp, WA — has temp
     12449500  Methow R. near Pateros, WA (lower) — has temp */
  'methow-upper': { flowSite:'12448500', tempSite:'12448500', loc:'USGS near Twisp (upper Methow valley)' },
  'methow-lower': { flowSite:'12449500', tempSite:'12449500', loc:'USGS near Pateros (lower Methow)' },

  /* ── WASHINGTON: SKAGIT RIVER ───────────────────────────
     12181000  Skagit R. near Concrete, WA — has temp
     12200500  Skagit R. near Mount Vernon, WA (lower) — has temp */
  'skagit-upper': { flowSite:'12181000', tempSite:'12181000', loc:'USGS near Concrete (upper wild steelhead reach)' },
  'skagit-lower': { flowSite:'12200500', tempSite:'12200500', loc:'USGS near Mount Vernon (lower tidal reach)' },

  /* ── WASHINGTON: KLICKITAT RIVER ────────────────────────
     14224500  Klickitat R. near Pitt, WA — flow only
     Single gauge near Columbia confluence covers canyon */
  'klickitat-canyon': { flowSite:'14224500', tempSite:null, loc:'USGS near Pitt (nearest gauge — lower canyon)' },

  /* ── WASHINGTON: WENATCHEE RIVER ────────────────────────
     12459000  Wenatchee R. near Plain, WA (upper) — has temp
     12462500  Wenatchee R. at Wenatchee, WA (lower) — has temp */
  'wenatchee-upper': { flowSite:'12459000', tempSite:'12459000', loc:'USGS near Plain (upper Wenatchee valley)' },
  'wenatchee-lower': { flowSite:'12462500', tempSite:'12462500', loc:'USGS at Wenatchee (lower reach near Columbia)' },

};

/* ═══════════════════════════════════════════════════════════
   LIVE CONDITIONS PANEL
═══════════════════════════════════════════════════════════ */
function ConditionsPanel({ state, river, sectionId }) {
  const [status,  setStatus]  = useState('idle');
  const [cfs,     setCfs]     = useState(null);
  const [tempF,   setTempF]   = useState(null);
  const [gauge,   setGauge]   = useState(null);
  const [history, setHistory] = useState([]);  // 30-day daily values

  useEffect(() => {
    const sectionOverride = sectionId ? SECTION_GAUGES[sectionId] : null;
    const g = sectionOverride
      ? { river, ...sectionOverride }
      : (HUB_GAUGES[state] || []).find(g =>
          g.river === river ||
          g.river.toLowerCase().startsWith(river.toLowerCase().split(' ')[0]) ||
          river.toLowerCase().startsWith(g.river.toLowerCase().split(' ')[0])
        );
    setGauge(g || null);
    setHistory([]);
    if (!g) { setStatus('no-gauge'); return; }

    setStatus('loading');
    setCfs(null); setTempF(null);

    // Live instantaneous values + 30-day daily values in parallel
    const ivUrl = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${g.flowSite}&parameterCd=00060&siteStatus=active`;
    const dvUrl = `https://waterservices.usgs.gov/nwis/dv/?format=json&sites=${g.flowSite}&parameterCd=00060&period=P30D&siteStatus=active`;
    const tempUrl = g.tempSite
      ? `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${g.tempSite}&parameterCd=00010&siteStatus=active`
      : null;

    Promise.all([
      fetch(ivUrl).then(r => r.json()).catch(() => null),
      tempUrl ? fetch(tempUrl).then(r => r.json()).catch(() => null) : Promise.resolve(null),
      fetch(dvUrl).then(r => r.json()).catch(() => null),
    ]).then(([ivData, tempData, dvData]) => {
      // Live CFS — -999999 is USGS sentinel for ice-affected/equipment failure
      try {
        const ts = ivData?.value?.timeSeries;
        const rawVal = ts?.[0]?.values?.[0]?.value?.[0]?.value;
        const qualifiers = ts?.[0]?.values?.[0]?.value?.[0]?.qualifiers || [];
        const val = parseFloat(rawVal);
        const isIce = val <= -999990 || qualifiers.some(q => q === 'Ice');
        setCfs(isNaN(val) ? null : isIce ? -1 : val);  // -1 = ice sentinel
      } catch { setCfs(null); }

      // Live temp
      try {
        const ts = tempData?.value?.timeSeries;
        const tempC = parseFloat(ts?.[0]?.values?.[0]?.value?.[0]?.value);
        setTempF(isNaN(tempC) ? null : Math.round(tempC * 9/5 + 32));
      } catch { setTempF(null); }

      // 30-day history
      try {
        const ts = dvData?.value?.timeSeries;
        const vals = ts?.[0]?.values?.[0]?.value || [];
        const parsed = vals
          .map(v => ({ date: v.dateTime?.slice(0,10), cfs: parseFloat(v.value) }))
          .filter(v => !isNaN(v.cfs) && v.cfs >= 0 && v.cfs < 999990);
        setHistory(parsed);
      } catch { setHistory([]); }

      setStatus('done');
    }).catch(() => setStatus('error'));
  }, [state, river, sectionId]);

  const flowSt  = getFlowStatus(cfs);
  const tempAdv = getTempAdvice(tempF);

  // Mini sparkline dimensions
  const W = 320, H = 80, PAD = 6;
  const sparkline = useMemo(() => {
    if (history.length < 2) return null;
    const vals = history.map(d => d.cfs);
    const mn = Math.min(...vals), mx = Math.max(...vals);
    const range = mx - mn || 1;
    const pts = history.map((d, i) => {
      const x = PAD + (i / (history.length - 1)) * (W - PAD * 2);
      const y = H - PAD - ((d.cfs - mn) / range) * (H - PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    // Current value dot
    const lastX = W - PAD, lastVal = vals[vals.length - 1];
    const lastY = H - PAD - ((lastVal - mn) / range) * (H - PAD * 2);
    return { pts, lastX, lastY: lastY.toFixed(1), mn: Math.round(mn), mx: Math.round(mx), lastVal: Math.round(lastVal) };
  }, [history]);

  return (
    <div style={S.infoCard}>
      <PanelHeader icon="💧" title="Live Conditions" river={river} />

      {status === 'no-gauge' && (
        <div style={{ ...S.tealBox, fontSize:'.8rem', color:'var(--mist)' }}>
          No USGS gauge for <strong>{river}</strong>.{' '}
          <a href="https://waterdata.usgs.gov" target="_blank" rel="noreferrer"
            style={S.tealText}>Check USGS directly →</a>
        </div>
      )}

      {status === 'loading' && (
        <div style={{ color:'var(--tdim)', fontSize:'.85rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
          <span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⟳</span>
          Loading live USGS data…
        </div>
      )}

      {status === 'error' && (
        <div style={{ ...S.tealBox, fontSize:'.8rem', color:'var(--mist)' }}>
          Could not reach USGS. Check{' '}
          <a href={`https://waterdata.usgs.gov/monitoring-location/${gauge?.flowSite}/`}
            target="_blank" rel="noreferrer" style={S.tealText}>
            waterdata.usgs.gov →
          </a>
        </div>
      )}

      {status === 'done' && gauge && (
        <>
          {/* Live readouts — CFS / Temp / Status */}
          <div className="cond-3col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem', marginBottom:'1.2rem' }}>
            {/* CFS */}
            <div style={S.cardCenter}>
              <span style={{ ...S.serif, fontSize:'2rem',
                color:flowSt.color, display:'block', lineHeight:1 }}>
                {cfs === -1 ? '—' : cfs !== null ? Math.round(cfs).toLocaleString() : '—'}
              </span>
              <span style={{ fontSize:'.6rem', letterSpacing:'.14em', textTransform:'uppercase',
                color:'var(--tdim)', display:'block', marginTop:'.2rem' }}>CFS Flow</span>
                {cfs === -1 && (
                  <span style={{ fontSize:'.6rem', color:'var(--tdim)', fontStyle:'italic', display:'block', marginTop:'.15rem' }}>
                    ❄️ Ice-affected — gauge impaired
                  </span>
                )}
              <span style={{ fontSize:'.72rem', color:flowSt.color, display:'block', marginTop:'.3rem' }}>
                {flowSt.label}
              </span>
            </div>
            {/* Temp */}
            <div style={S.cardCenter}>
              <span style={{ ...S.serif, fontSize:'2rem',
                color:tempAdv ? tempAdv.color : 'var(--tdim)', display:'block', lineHeight:1 }}>
                {tempF !== null ? `${tempF}°` : '—'}
              </span>
              <span style={{ fontSize:'.6rem', letterSpacing:'.14em', textTransform:'uppercase',
                color:'var(--tdim)', display:'block', marginTop:'.2rem' }}>Water Temp</span>
              {tempAdv && <span style={{ fontSize:'.72rem', color:tempAdv.color, display:'block', marginTop:'.3rem' }}>
                {tempAdv.label}
              </span>}
            </div>
            {/* Fishing Status */}
            <div style={S.cardCenter}>
              <span style={{ fontSize:'1.5rem', display:'block', lineHeight:1 }}>
                {cfs !== null ? (cfs < 50 ? '⚠️' : cfs < 1000 ? '✅' : cfs < 3000 ? '🟡' : '🚫') : '❓'}
              </span>
              <span style={{ fontSize:'.6rem', letterSpacing:'.14em', textTransform:'uppercase',
                color:'var(--tdim)', display:'block', marginTop:'.2rem' }}>Fishability</span>
              <span style={{ fontSize:'.72rem', color:flowSt.color, display:'block', marginTop:'.3rem' }}>
                {cfs !== null ? flowSt.label : 'No Data'}
              </span>
            </div>
          </div>

          {/* 30-day flow graph */}
          {sparkline ? (
            <div style={{ marginBottom:'1rem' }}>
              <div style={{ fontSize:'.65rem', letterSpacing:'.12em', textTransform:'uppercase',
                color:'var(--tdim)', marginBottom:'.4rem' }}>
                30-Day Flow History (CFS)
              </div>
              <div style={{ background:'var(--card)', borderRadius:6, padding:'8px 4px 4px', overflow:'hidden' }}>
                <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
                  style={{ display:'block', height:80 }}>
                  {/* Fill area under line */}
                  <defs>
                    <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.35"/>
                      <stop offset="100%" stopColor="var(--teal)" stopOpacity="0.03"/>
                    </linearGradient>
                  </defs>
                  <polygon
                    points={`${PAD},${H} ${sparkline.pts} ${W-PAD},${H}`}
                    fill="url(#flowGrad)"
                  />
                  {/* Line */}
                  <polyline
                    points={sparkline.pts}
                    fill="none"
                    stroke="var(--teal)"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Current value dot */}
                  <circle cx={sparkline.lastX} cy={sparkline.lastY} r="3.5"
                    fill="var(--teal)" stroke="var(--bg)" strokeWidth="1.5"/>
                </svg>
                <div style={{ display:'flex', justifyContent:'space-between', padding:'0 4px',
                  fontSize:'.6rem', color:'var(--tdim)' }}>
                  <span>Low: {sparkline.mn.toLocaleString()} cfs</span>
                  <span style={{ color:'var(--teal)', fontWeight:600 }}>Now: {sparkline.lastVal.toLocaleString()} cfs</span>
                  <span>High: {sparkline.mx.toLocaleString()} cfs</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize:'.75rem', color:'var(--tdim)', marginBottom:'1rem',
              background:'var(--card)', borderRadius:6, padding:'10px 12px' }}>
              📊 30-day flow history unavailable for this gauge.
            </div>
          )}

          {/* Temp advice */}
          {tempAdv && (
            <div style={{ ...S.tealBox, fontSize:'.8rem', marginBottom:'.8rem' }}>
              <strong style={{ color:tempAdv.color }}>{tempAdv.label}</strong>
              {' — '}{tempAdv.advice}
            </div>
          )}

          {/* Gauge info */}
          <div style={{ fontSize:'.65rem', color:'var(--tdim)', marginTop:'.5rem' }}>
            {gauge.loc && <span>📍 {gauge.loc} · </span>}
            <a href={`https://waterdata.usgs.gov/monitoring-location/${gauge.flowSite}/`}
              target="_blank" rel="noreferrer" style={S.tealText}>
              USGS #{gauge.flowSite} →
            </a>
          </div>
        </>
      )}
    </div>
  );
}

function SpeciesPanel({ state, river, speciesMap, section }) {
  const resolvedMap = speciesMap || RIVER_SPECIES;
  const speciesIds = useMemo(() => {
    // Section-level species override takes priority over river-level
    if (section?.species?.length) return section.species.filter(id => RIVER_SPECIES[id]);
    return ((resolvedMap[state] || {})[river] || []).filter(id => RIVER_SPECIES[id]);
  }, [resolvedMap, state, river, section]);

  const [activeId, setActiveId] = useState(null);
  useEffect(() => { setActiveId(speciesIds[0] || null); }, [speciesIds]);
  const [spawnOpen, setSpawnOpen] = useState(false);
  useEffect(() => { setSpawnOpen(false); }, [activeId]);
  const sp = RIVER_SPECIES[activeId];

  return (
    <div style={{ ...S.panel(), minHeight:260 }}>
      <PanelHeader icon="🐟" title="Target Species" river={river} />
      {speciesIds.length === 0 ? (
        <EmptyState icon="🎯" msg="No species data for this water yet" />
      ) : (
        <>
          <div style={{ display:'flex', gap:'.4rem', flexWrap:'wrap', marginBottom:'1.2rem' }}>
            {speciesIds.map(id => {
              const s = RIVER_SPECIES[id];
              if (!s) return null;
              const isActive = id === activeId;
              return (
                <button key={id} onClick={() => setActiveId(id)} style={{
                  padding:'.28rem .72rem',
                  background: isActive ? 'var(--panel2)' : 'var(--bg3)',
                  border: `1px solid ${isActive ? 'var(--teal-lt)' : 'var(--border2)'}`,
                  color: isActive ? 'var(--teal-lt)' : 'var(--mist)',
                  borderRadius:20, fontSize:'.72rem', fontWeight:500,
                  cursor:'pointer', ...S.sans, transition:'all .15s',
                }}>
                  {s.emoji} {s.name}
                </button>
              );
            })}
          </div>
          {sp && (
            <div className="anim-up" key={activeId}>
              <p style={{ fontSize:'.82rem', color:'var(--mist)', lineHeight:1.65, marginBottom:'1rem' }}>
                {sp.desc}
              </p>
              <div className="cond-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.8rem', marginBottom:'1rem' }}>
                {[['Prime Water Temp',sp.temp],['Preferred Habitat',sp.habitat],['Typical Size',sp.size],['Feeding Pattern',sp.feeding]].map(([lbl,val]) => (
                  <div key={lbl} style={{ ...S.card, padding:'.6rem .8rem' }}>
                    <span style={{ ...S.tinyLabel, letterSpacing:'.14em', color:'var(--tdim)', marginBottom:'.18rem' }}>{lbl}</span>
                    <span style={{ fontSize:'.8rem', color:'var(--mist)', fontWeight:500 }}>{val}</span>
                  </div>
                ))}
              </div>
              <div style={{ ...S.subLabel }}>Key Tactics</div>
              {sp.tactics.map((t, i) => (
                <div key={i} style={{ fontSize:'.77rem', color:'var(--mist)', lineHeight:1.5, padding:'.28rem 0 .28rem .8rem', borderLeft:'2px solid var(--teal-dim)', marginBottom:'.28rem' }}>{t}</div>
              ))}
              <div style={{ marginTop:'.8rem', ...S.card, padding:'.6rem .8rem', fontSize:'.72rem', color:'var(--teal)' }}>
                🪡 {sp.keyRigs}
              </div>
              {sp.migratory && sp.runTiming && (() => {
                const rt = sp.runTiming;
                const riverNote = rt.byRiver && (rt.byRiver[river] || null) || rt.byWater && (rt.byWater[river] || null);
                const windows = Object.entries(rt).filter(([k]) => k !== 'byRiver' && k !== 'byWater');
                return (
                  <div style={{ marginTop:'1rem', border:'1px solid var(--teal-dim)', borderRadius:8, overflow:'hidden' }}>
                    <div style={{ background:'rgba(0,180,160,.12)', padding:'.5rem .8rem', display:'flex', alignItems:'center', gap:'.4rem' }}>
                      <span style={{ fontSize:'.85rem' }}>🗓️</span>
                      <span style={{ ...S.subLabel, fontWeight:600 }}>
                        Run &amp; Spawn Timing — Migratory Species
                      </span>
                    </div>
                    {riverNote && (
                      <div style={{ padding:'.6rem .8rem', background:'rgba(0,180,160,.07)', borderBottom:'1px solid var(--teal-dim)' }}>
                        <span style={{ ...S.tinyLabel, letterSpacing:'.14em', color:'var(--teal)', marginBottom:'.25rem' }}>📍 {river}</span>
                        <span style={{ fontSize:'.78rem', color:'var(--mist)', lineHeight:1.6 }}>{riverNote}</span>
                      </div>
                    )}
                    <div style={{ padding:'.6rem .8rem', display:'flex', flexDirection:'column', gap:'.5rem' }}>
                      {windows.map(([key, val]) => (
                        <div key={key} style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'.6rem', alignItems:'start' }}>
                          <div style={{ background:'rgba(0,180,160,.15)', borderRadius:6, padding:'.2rem .5rem', fontSize:'.64rem', color:'var(--teal)', fontWeight:600, whiteSpace:'nowrap', textTransform:'capitalize', marginTop:'.1rem' }}>
                            {val.months}
                          </div>
                          <div>
                            <span style={{ ...S.tinyLabel, color:'var(--tdim)', marginBottom:'.1rem' }}>{key.replace(/_/g,' ')}</span>
                            <span style={S.bodyText}>{val.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {sp.spawnTiming && (() => {
                const st = sp.spawnTiming;
                const isSterile = st.window && st.window.toLowerCase().includes('no spawning');
                const borderColor = isSterile ? 'var(--border2)' : 'rgba(233,196,106,.35)';
                const headerBg   = isSterile ? 'rgba(120,120,120,.1)' : 'rgba(233,196,106,.1)';
                const accentColor = isSterile ? 'var(--tdim)' : '#e9c46a';
                return (
                  <div style={{ marginTop:'1rem', border:`1px solid ${borderColor}`, borderRadius:8, overflow:'hidden' }}>
                    <button
                      onClick={() => setSpawnOpen(o => !o)}
                      style={{ width:'100%', background:headerBg, padding:'.5rem .8rem', display:'flex', alignItems:'center', gap:'.4rem',
                        border:'none', cursor:'pointer', textAlign:'left' }}>
                      <span style={{ fontSize:'.85rem' }}>{isSterile ? '✅' : '🥚'}</span>
                      <span style={{ ...S.subLabel, color:accentColor, fontWeight:600, flex:1 }}>
                        {isSterile ? 'No Spawn Season — Fish Year-Round' : 'Spawn Season & Conservation'}
                      </span>
                      <span style={{ fontSize:'.7rem', color:accentColor, opacity:.7, marginLeft:'auto', flexShrink:0 }}>
                        {spawnOpen ? '▲' : '▼'}
                      </span>
                    </button>
                    {spawnOpen && (
                      <>
                        {!isSterile && (
                          <div style={{ padding:'.6rem .8rem', borderBottom:`1px solid ${borderColor}`, display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.5rem' }}>
                            {[['🗓 Spawn Window', st.window],['🌡 Water Temp', st.waterTemp]].map(([lbl,val]) => (
                              <div key={lbl} style={{ background:'rgba(233,196,106,.06)', borderRadius:6, padding:'.4rem .6rem' }}>
                                <span style={{ ...S.tinyLabel, color:'var(--tdim)', marginBottom:'.15rem' }}>{lbl}</span>
                                <span style={{ fontSize:'.76rem', color:'var(--mist)', fontWeight:500 }}>{val}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {!isSterile && (
                          <div style={{ padding:'.5rem .8rem', borderBottom:`1px solid ${borderColor}` }}>
                            <span style={{ ...S.tinyLabel, color:'var(--tdim)', marginBottom:'.2rem' }}>📍 Spawn Location</span>
                            <span style={S.bodyText}>{st.location}</span>
                          </div>
                        )}
                        {!isSterile && (
                          <div style={{ padding:'.5rem .8rem', borderBottom:`1px solid ${borderColor}` }}>
                            <span style={{ ...S.tinyLabel, color:'var(--tdim)', marginBottom:'.2rem' }}>👁 How to Identify Spawning Fish</span>
                            <span style={S.bodyText}>{st.signs}</span>
                          </div>
                        )}
                        <div style={{ padding:'.5rem .8rem', borderBottom:`1px solid ${borderColor}`, background:'rgba(233,196,106,.06)' }}>
                          <span style={{ ...S.tinyLabel, color: isSterile ? 'var(--tdim)' : '#e9c46a', marginBottom:'.2rem' }}>
                            {isSterile ? '✅ No Restrictions Needed' : '⚠️ When to Back Off'}
                          </span>
                          <span style={{ fontSize:'.77rem', color:'var(--mist)', lineHeight:1.6 }}>{st.avoidGuidance}</span>
                        </div>
                        <div style={{ padding:'.5rem .8rem' }}>
                          <span style={{ ...S.tinyLabel, color:'var(--teal)', marginBottom:'.2rem' }}>✅ Best Time to Target</span>
                          <span style={{ fontSize:'.77rem', color:'var(--mist)', lineHeight:1.6 }}>{st.okToFish}</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TECHNIQUES PANEL
═══════════════════════════════════════════════════════════ */
const LEVEL_STYLES = {
  lv_beg: { background:'rgba(74,158,106,.2)',  color:'#6fc48a' },
  lv_int: { background:'rgba(233,196,106,.2)', color:'#e9c46a' },
  lv_adv: { background:'rgba(192,69,42,.2)',   color:'#e08060' },
};

/* ═══════════════════════════════════════════════════════════
   TECHNIQUES PANEL  (river + stillwater unified)
   Props:
     isStillwater — switches data source
     river/water  — name for PanelHeader
═══════════════════════════════════════════════════════════ */
function TechniquesPanel({ state, river, isStillwater = false }) {
  const water = river; // alias — called 'water' in stillwater context, same value
  const techIds = useMemo(() => {
    if (isStillwater) {
      return ((STILLWATER_TECHNIQUES[state] || {})[water] || []).filter(id => STILLWATER_TECHNIQUES_DATA[id]);
    }
    return ((RIVER_TECHNIQUES[state] || {})[river] || []).filter(id => TECHNIQUES[id]);
  }, [state, river, isStillwater]);

  const [activeId, setActiveId] = useState(null);
  useEffect(() => { setActiveId(techIds[0] || null); }, [techIds]);

  const tech = isStillwater ? STILLWATER_TECHNIQUES_DATA[activeId] : TECHNIQUES[activeId];
  const emptyMsg = isStillwater ? 'No technique data for this water yet' : 'No technique data for this river yet';
  const title    = isStillwater ? 'Stillwater Techniques' : 'Recommended Techniques';

  return (
    <div style={S.infoCard}>
      <PanelHeader icon="🎣" title={title} river={water} />
      {techIds.length === 0 ? (
        <EmptyState icon="🏞" msg={emptyMsg} />
      ) : (
        <>
          <div style={{ ...S.grid2(), marginBottom:'1.2rem' }}>
            {techIds.map(id => {
              const t = isStillwater ? STILLWATER_TECHNIQUES_DATA[id] : TECHNIQUES[id];
              const isActive = id === activeId;
              const lvKey = t.levelClass.replace('-','_');
              return (
                <div key={id} onClick={() => setActiveId(id)} style={{
                  ...S.card,
                  border:`1px solid ${isActive ? 'var(--teal)' : 'var(--border)'}`,
                  background: isActive ? 'var(--teal-dim)' : 'var(--bg3)',
                  cursor:'pointer', transition:'all .15s',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'.45rem',
                    fontSize:'.8rem', fontWeight:600, color:'var(--cream)', marginBottom:'.22rem' }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:t.color, flexShrink:0 }} />
                    {t.name}
                    <span style={{ marginLeft:'auto', fontSize:'.54rem', padding:'.15rem .4rem',
                      borderRadius:2, fontWeight:600, ...LEVEL_STYLES[lvKey] }}>
                      {t.level}
                    </span>
                  </div>
                  <div style={{ fontSize:'.71rem', color:'var(--tdim)', lineHeight:1.45 }}>{t.short}</div>
                </div>
              );
            })}
          </div>
          {tech && (
            <div className="anim-up" key={activeId} style={{ ...S.card, background:'var(--bg3)',
              border:'1px solid var(--border2)', padding:'1.2rem 1.3rem' }}>
              <div style={{ ...S.serif, fontSize:'1.2rem', color:'var(--cream)', marginBottom:'.4rem' }}>{tech.name}</div>
              <span style={{ fontSize:'.6rem', padding:'.18rem .45rem', borderRadius:2, fontWeight:600,
                display:'inline-block', marginBottom:'.8rem',
                ...LEVEL_STYLES[tech.levelClass.replace('-','_')] }}>{tech.level}</span>
              <p style={{ fontSize:'.8rem', color:'var(--mist)', lineHeight:1.7, marginBottom:'1rem' }}>
                {tech.detail}
              </p>
              <div style={{ ...S.tealBox, fontSize:'.77rem', color:'var(--mist)', marginBottom:'1rem' }}>
                💡 <strong>Coach&apos;s Tip:</strong> {tech.tip}
              </div>
              <div style={{ ...S.subLabel }}>Rigging Options</div>
              {tech.rigs.map((r, i) => (
                <div key={i} style={{ fontSize:'.77rem', color:'var(--mist)', lineHeight:1.5,
                  padding:'.28rem 0 .28rem .8rem',
                  borderLeft:'2px solid var(--teal-dim)', marginBottom:'.28rem' }}>{r}</div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}



/* ═══════════════════════════════════════════════════════════
   ACCESS CARD  (shared by all three AccessPanel branches)
═══════════════════════════════════════════════════════════ */
function AccessCard({ pt, modeLabels }) {
  // modeLabels: { wade:'🥾 Wade', float:'🛶 Float' } or { shore:'🚶 Shore', boat:'🚣 Boat' }
  const modeTag = modeLabels?.[pt.mode] ?? (pt.mode === 'both' ? '🥾🚣 Both' : null);
  const modeBg  = pt.mode === 'wade'  || pt.mode === 'shore' ? 'rgba(233,196,106,.15)' :
                  pt.mode === 'both'                          ? 'rgba(42,157,143,.15)'  : 'rgba(107,127,212,.15)';
  const modeClr = pt.mode === 'wade'  || pt.mode === 'shore' ? 'var(--gold)'           :
                  pt.mode === 'both'                          ? 'var(--teal-lt)'        : '#8a9fdf';
  const modeBdr = pt.mode === 'wade'  || pt.mode === 'shore' ? 'rgba(233,196,106,.3)'  :
                  pt.mode === 'both'                          ? 'rgba(42,157,143,.3)'   : 'rgba(107,127,212,.3)';
  return (
    <div style={{ ...S.card, padding:'.85rem 1rem' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'.5rem', marginBottom:'.35rem' }}>
        <div style={{ fontSize:'.82rem', fontWeight:700, color:'var(--cream)', lineHeight:1.3 }}>{pt.name}</div>
        {modeTag && (
          <span style={{ fontSize:'.58rem', padding:'.15rem .45rem', borderRadius:20, whiteSpace:'nowrap', flexShrink:0,
            background:modeBg, color:modeClr, border:`1px solid ${modeBdr}` }}>
            {modeTag}
          </span>
        )}
      </div>
      <p style={{ fontSize:'.76rem', color:'var(--mist)', lineHeight:1.55, marginBottom:'.5rem' }}>{pt.desc}</p>
      {pt.parking && (
        <p style={{ fontSize:'.72rem', color:'var(--slate)', lineHeight:1.5, marginBottom:'.5rem' }}>
          <span style={{ color:'var(--tdim)', fontWeight:600 }}>Parking: </span>{pt.parking}
        </p>
      )}
      <div style={{ display:'flex', gap:'.3rem', flexWrap:'wrap' }}>
        {pt.tags.map(tag => (
          <span key={tag} style={{ fontSize:'.58rem', padding:'.12rem .4rem', borderRadius:10,
            background:'var(--teal-dim)', color:'var(--teal-lt)', border:'1px solid rgba(42,157,143,.2)' }}>{tag}</span>
        ))}
      </div>
      {pt.lat && (
        <a href={`https://maps.google.com/?q=${pt.lat},${pt.lng}`} target="_blank" rel="noopener noreferrer"
          style={{ display:'inline-block', marginTop:'.5rem', fontSize:'.65rem', color:'var(--teal)',
            textDecoration:'none', borderBottom:'1px dotted var(--teal)' }}>
          📍 Open in Maps
        </a>
      )}
    </div>
  );
}

const ACCESS_GRID = { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'.8rem' };

/* ═══════════════════════════════════════════════════════════
   ACCESS PANEL
═══════════════════════════════════════════════════════════ */
function AccessPanel({ state, river, section, accessMode, isStillwater }) {

  // ── STILLWATER access ──────────────────────────────────────────────────
  if (isStillwater) {
    const lakeData = STILLWATER_ACCESS[river];
    if (!lakeData) {
      return (
        <div style={{ ...S.panel() }}>
          <PanelHeader icon="🗺" title="Access & Put-ins" river={river} />
          <EmptyState icon="📍" msg="Detailed access data coming soon for this water" />
        </div>
      );
    }
    const filteredAccess = lakeData.access.filter(a =>
      !accessMode || a.mode === accessMode || a.mode === 'both'
    );
    const modeLabels = { shore:'🚶 Shore', boat:'🚣 Boat' };
    return (
      <div style={{ ...S.panel() }}>
        <PanelHeader icon="🗺" title={`${accessMode === 'shore' ? 'Shore' : 'Boat / Watercraft'} Access — ${river}`} river={river} />
        <div style={{ ...S.tealBox, fontSize:'.8rem', color:'var(--mist)', lineHeight:1.65, marginBottom:'1.2rem' }}>
          {accessMode === 'shore' ? lakeData.shoreNote : lakeData.boatNote}
        </div>
        <div style={ACCESS_GRID}>
          {filteredAccess.map(pt => <AccessCard key={pt.name} pt={pt} modeLabels={modeLabels} />)}
        </div>
      </div>
    );
  }

  // ── RIVER with section data ─────────────────────────────────────────────
  if (section) {
    const filteredAccess = section.access.filter(a =>
      !accessMode || a.mode === accessMode || a.mode === 'both'
    );
    const modeLabel  = accessMode === 'wade' ? 'Wading' : 'Float / Drift Boat';
    const modeLabels = { wade:'🥾 Wade', float:'🛶 Float', both:'🥾🛶 Both' };
    return (
      <div style={{ ...S.panel() }}>
        <PanelHeader icon={accessMode === 'wade' ? '🥾' : '🛶'}
          title={`${modeLabel} Access — ${river}: ${section.name}`}
          river={river} />
        <div style={{ ...S.tealBox, fontSize:'.8rem', color:'var(--mist)', lineHeight:1.65, marginBottom:'1.2rem' }}>
          {accessMode === 'wade' ? section.wadeNote : section.floatNote}
        </div>
        {filteredAccess.length === 0 ? (
          <EmptyState icon="📍" msg={`No dedicated ${modeLabel.toLowerCase()} access recorded for this section — try the other mode or check local fly shop for current conditions.`} />
        ) : (
          <div style={ACCESS_GRID}>
            {filteredAccess.map(pt => <AccessCard key={pt.name} pt={pt} modeLabels={modeLabels} />)}
          </div>
        )}

        {/* ── Nearby Tributaries ── */}
        {TRIBUTARIES[river]?.length > 0 && (
          <div style={{ marginTop:'1.8rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'.6rem', marginBottom:'1rem' }}>
              <span style={{ fontSize:'1rem' }}>🌿</span>
              <div>
                <div style={{ ...S.stepLabel }}>Explore Nearby</div>
                <div style={{ fontSize:'.88rem', fontWeight:700, color:'var(--cream)' }}>Notable Tributaries</div>
              </div>
            </div>
            <div style={{ ...S.tealBox, fontSize:'.78rem', color:'var(--mist)', lineHeight:1.6, marginBottom:'1rem' }}>
              Smaller streams worth targeting near the {river}. Often less pressured with wild fish and classic freestone dry fly action.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'.8rem' }}>
              {TRIBUTARIES[river].map(trib => (
                <div key={trib.name} style={{ ...S.card, padding:'.9rem 1rem', borderLeft:'3px solid rgba(42,157,143,.4)' }}>
                  <div style={{ fontSize:'.84rem', fontWeight:700, color:'var(--cream)', marginBottom:'.2rem' }}>{trib.name}</div>
                  <div style={{ fontSize:'.66rem', color:'var(--teal-lt)', marginBottom:'.45rem', letterSpacing:'.05em' }}>
                    {trib.species.join(' · ')}
                  </div>
                  <p style={{ fontSize:'.76rem', color:'var(--mist)', lineHeight:1.55, marginBottom:'.4rem' }}>{trib.desc}</p>
                  <div style={{ fontSize:'.72rem', color:'var(--slate)', lineHeight:1.5, marginBottom:'.4rem' }}>
                    <span style={{ color:'var(--tdim)', fontWeight:600 }}>Access: </span>{trib.access}
                  </div>
                  {trib.notes && (
                    <div style={{ fontSize:'.72rem', color:'var(--gold)', lineHeight:1.5, marginBottom:'.5rem',
                      background:'rgba(233,196,106,.07)', padding:'.4rem .6rem', borderRadius:6,
                      border:'1px solid rgba(233,196,106,.15)' }}>
                      💡 {trib.notes}
                    </div>
                  )}
                  <div style={{ display:'flex', gap:'.3rem', flexWrap:'wrap', marginBottom:'.4rem' }}>
                    {trib.tags.map(tag => (
                      <span key={tag} style={{ fontSize:'.58rem', padding:'.12rem .4rem', borderRadius:10,
                        background:'rgba(42,157,143,.08)', color:'var(--teal-lt)', border:'1px solid rgba(42,157,143,.15)' }}>{tag}</span>
                    ))}
                  </div>
                  {trib.lat && (
                    <a href={`https://maps.google.com/?q=${trib.lat},${trib.lng}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize:'.65rem', color:'var(--teal)', textDecoration:'none', borderBottom:'1px dotted var(--teal)' }}>
                      📍 Open in Maps
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── FALLBACK: legacy ACCESS_HUB ────────────────────────────────────────
  const spots    = ACCESS_HUB[state]?.[river] || [];
  const filtered = spots.filter(a => !accessMode || !a.mode || a.mode === accessMode || a.mode === 'both');
  return (
    <div style={{ ...S.panel() }}>
      <PanelHeader icon={accessMode === 'float' ? '🛶' : '🥾'}
        title={`Public Access — ${river}`} river={river} />
      {filtered.length === 0 ? (
        <EmptyState icon="📍" msg="No public access data for this water yet" />
      ) : (
        <div style={ACCESS_GRID}>
          {filtered.map(pt => <AccessCard key={pt.name} pt={pt} />)}
        </div>
      )}
    </div>
  );
}





/* ═══════════════════════════════════════════════════════════
   HATCH TIMELINE  — visual 24-hour bar showing activity window
═══════════════════════════════════════════════════════════ */
function HatchTimeline({ window: w, compact }) {
  if (!w) return null;

  const HOURS = [0,2,4,6,8,10,12,14,16,18,20,22];
  const HOUR_LABELS = { 0:'12a', 4:'4a', 6:'6a', 8:'8a', 10:'10a', 12:'Noon', 14:'2p', 16:'4p', 18:'6p', 20:'8p', 22:'10p' };

  // Convert hour to % position on the bar
  const pct = h => `${(h / 24) * 100}%`;
  const width = h1 => `${((h1.end - h1.start) / 24) * 100}%`;

  if (w.allDay) {
    return (
      <div style={{ marginBottom: compact ? '.6rem' : '1rem' }}>
        {!compact && <div style={{ ...S.label, marginBottom:'.4rem' }}>Best Time to Fish</div>}
        <div style={{ display:'flex', alignItems:'center', gap:'.6rem', flexWrap:'wrap' }}>
          <span style={{ fontSize:'.7rem', fontWeight:600, color:'var(--teal-lt)' }}>🕐 All Day</span>
          <span style={{ fontSize:'.72rem', color:'var(--tdim)' }}>{w.label}</span>
        </div>
        {!compact && w.conditions && (
          <div style={{ fontSize:'.72rem', color:'var(--tdim)', marginTop:'.3rem', lineHeight:1.5, fontStyle:'italic' }}>
            {w.conditions}
          </div>
        )}
      </div>
    );
  }

  const startHour = w.start;
  const endHour   = w.end;
  const peakHour  = w.peak;

  const formatHour = h => {
    if (h === 0 || h === 24) return '12am';
    if (h === 12) return 'Noon';
    return h < 12 ? `${h}am` : `${h - 12}pm`;
  };

  // Determine if peak is dawn/dusk for coloring
  const isDawn  = peakHour >= 5 && peakHour <= 8;
  const isDusk  = peakHour >= 17 && peakHour <= 21;
  const isMidDay = peakHour >= 9 && peakHour <= 15;
  const barColor = isDawn ? '#e9c46a' : isDusk ? '#e76f51' : isMidDay ? '#4dbfaf' : '#6b7fd4';

  return (
    <div style={{ marginBottom: compact ? '.6rem' : '1.2rem' }}>
      {!compact && <div style={S.labelMb}>Best Time to Fish</div>}

      {/* Time label + range */}
      <div style={{ display:'flex', alignItems:'center', gap:'.7rem', marginBottom:'.45rem', flexWrap:'wrap' }}>
        <span style={{ fontSize:'.78rem', fontWeight:700, color:barColor }}>
          🕐 {w.label}
        </span>
        <span style={{ fontSize:'.68rem', color:'var(--tdim)' }}>
          Peak: {formatHour(peakHour)}
        </span>
      </div>

      {/* Timeline bar */}
      <div style={{ position:'relative', height: compact ? 18 : 22, marginBottom:'.3rem' }}>
        {/* Background track */}
        <div style={{ position:'absolute', inset:0, background:'var(--bg3)',
          borderRadius:4, border:'1px solid var(--border)' }} />

        {/* Shaded activity window */}
        <div style={{
          position:'absolute', top:0, bottom:0,
          left: pct(startHour),
          width: `${((endHour - startHour) / 24) * 100}%`,
          background: barColor + '33',
          borderRadius:3,
        }} />

        {/* Solid peak bar (1-hour window around peak) */}
        <div style={{
          position:'absolute', top: compact ? 3 : 4, bottom: compact ? 3 : 4,
          left: pct(Math.max(0, peakHour - 0.5)),
          width: pct(1),
          background: barColor,
          borderRadius:2,
        }} />

        {/* Hour tick marks */}
        {HOURS.map(h => (
          <div key={h} style={{
            position:'absolute', top:0, bottom:0, left: pct(h),
            width:1, background:'rgba(255,255,255,0.05)',
          }} />
        ))}
      </div>

      {/* Hour labels under bar */}
      {!compact && (
        <div style={{ position:'relative', height:14 }}>
          {Object.entries(HOUR_LABELS).map(([h, lbl]) => (
            <div key={h} style={{
              position:'absolute', left: pct(Number(h)),
              fontSize:'.5rem', color:'var(--tdim)',
              transform:'translateX(-50%)',
            }}>{lbl}</div>
          ))}
        </div>
      )}

      {/* Conditions note */}
      {!compact && w.conditions && (
        <div style={{ fontSize:'.72rem', color:'var(--tdim)', marginTop: compact ? 0 : '.35rem',
          lineHeight:1.5, fontStyle:'italic' }}>
          {w.conditions}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FLY DETAIL MODAL  (with hatch progression)
═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   FLY DETAIL MODAL  (with hatch progression + time windows)
═══════════════════════════════════════════════════════════ */
function FlyModal({ flyName, onClose }) {
  const key     = normalizeFlyName(flyName);
  const info    = key ? FLY_INFO[key] : null;
  const famKey  = FLY_FAMILY_MAP[key] || FLY_FAMILY_MAP[flyName];
  const family  = famKey ? HATCH_FAMILIES[famKey] : null;

  const thisStageIdx = family
    ? family.stages.findIndex(s => s.activePatterns.includes(key) || s.patterns.includes(key))
    : -1;

  const [activeTab, setActiveTab] = useState('fly');

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => { setActiveTab('fly'); }, [flyName]);

  const typeColor = info ? (INSECT_TYPE_COLORS[info.type] || INSECT_TYPE_FALLBACK) : INSECT_TYPE_FALLBACK;
  const thisStage = (family && thisStageIdx >= 0) ? family.stages[thisStageIdx] : null;

  // Get hatch window for THIS fly
  const flyWindow = key ? getHatchWindow(key) : null;
  // Also get fly's own hatchTimes from FLY_INFO for the quick-view
  const flyTimes  = info ? info.hatchTimes : null;
  // Use whichever is available (prefer structured window from STAGE_HATCH_WINDOWS)
  const quickWindow = flyWindow || (flyTimes ? flyTimes : null);

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:900,
      background:'rgba(10,20,25,0.85)', backdropFilter:'blur(6px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:6,
        maxWidth:600, width:'100%', maxHeight:'88vh', overflowY:'auto', position:'relative',
        boxShadow:'0 24px 60px rgba(0,0,0,.7)',
      }}>

        {/* ── Sticky Header ── */}
        <div style={{ padding:'1.5rem 2rem 0', position:'sticky', top:0,
          background:'var(--bg2)', zIndex:10, borderBottom:'1px solid var(--border)' }}>
          <button onClick={onClose} style={{
            position:'absolute', top:'1rem', right:'1rem', background:'none', border:'none',
            color:'var(--tdim)', fontSize:'1.1rem', cursor:'pointer', padding:'.25rem .45rem',
          }}>✕</button>

          {/* Family + stage badges */}
          <div style={{ display:'flex', alignItems:'center', gap:'.5rem', flexWrap:'wrap', marginBottom:'.35rem' }}>
            <span style={{ fontSize:'.6rem', letterSpacing:'.2em', textTransform:'uppercase',
              color:typeColor, fontWeight:600 }}>
              {info ? info.insect : 'Fly Pattern'}
            </span>
            {thisStage && (
              <span style={{ fontSize:'.58rem', padding:'.18rem .55rem', borderRadius:20, fontWeight:700,
                letterSpacing:'.1em', textTransform:'uppercase',
                background: thisStage.stageColor + '22', border:`1px solid ${thisStage.stageColor}55`,
                color: thisStage.stageColor }}>
                {thisStage.icon} {thisStage.stage}
              </span>
            )}
          </div>

          <h3 style={{ ...S.serif, fontSize:'1.5rem',
            color:'var(--cream)', lineHeight:1.1, marginBottom:'.85rem' }}>{flyName}</h3>

          {/* Tabs */}
          {family && (
            <div style={{ display:'flex', gap:0 }}>
              {[['fly','🪰 This Fly'],['progression','📈 Hatch Progression']].map(([tab, label]) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding:'.5rem 1.1rem', border:'none', cursor:'pointer',
                  ...S.sans, fontSize:'.71rem', fontWeight:600,
                  letterSpacing:'.05em', background:'none',
                  borderBottom: tab === activeTab ? '2px solid var(--teal)' : '2px solid transparent',
                  color: tab === activeTab ? 'var(--teal-lt)' : 'var(--slate)',
                  transition:'all .15s',
                }}>{label}</button>
              ))}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ padding:'1.5rem 2rem' }}>

          {/* ══ FLY TAB ══ */}
          {activeTab === 'fly' && (
            <>
              {!info ? (
                <div style={{ color:'var(--tdim)', fontSize:'.88rem', lineHeight:1.7 }}>
                  <p style={{ marginBottom:'.8rem' }}>This is a popular Rocky Mountain pattern.</p>
                  <p>Detailed lifecycle and sizing information is not yet in our database for this specific fly. Your coach can provide specific guidance during a session.</p>
                </div>
              ) : (
                <>
                  {/* ── HATCH TIME WINDOW — top of fly tab ── */}
                  {quickWindow && (
                    <div style={{ background:'var(--bg3)', border:'1px solid var(--border)',
                      borderRadius:5, padding:'.9rem 1.1rem', marginBottom:'1.4rem' }}>
                      <HatchTimeline window={quickWindow} compact={false} />
                    </div>
                  )}

                  {/* ── Side-by-side: Real insect vs Artificial fly ── */}
                  {(() => {
                    const insectQ = info.type && thisStage
                      ? INSECT_TAXON[info.type + '|' + thisStage.stage] || INSECT_TAXON[info.type]
                      : INSECT_TAXON[info.type];
                    const stageKey = thisStage ? (key + '|' + thisStage.stage) : null;
                    const flyQ = (stageKey && FLY_FILES[stageKey])
                      || FLY_FILES[key] || FLY_FILES[flyName] || null;
                    return (
                      <div style={{ marginBottom:'1.4rem' }}>
                        <div style={S.labelMb}>Real Insect vs. Artificial Fly</div>
                        <div className="fly-compare-row" style={{ display:'flex', gap:'1rem', alignItems:'flex-start' }}>
                          <div className="fly-compare-col" style={{ flex:1, textAlign:'center', minWidth:0, overflow:'hidden' }}>
                            <div className="fly-compare-img-wrap" style={{ width:'min(140px,100%)', height:'min(140px,100%)', aspectRatio:'1', margin:'0 auto' }}>
                              <FlyImage
                                taxon={insectQ}
                                type={info.type}
                                label="Natural Insect"
                                size={140}
                              />
                            </div>
                            <div style={{ fontSize:'.6rem', color:'var(--tdim)', marginTop:'.35rem',
                              letterSpacing:'.1em', textTransform:'uppercase' }}>
                              {thisStage ? thisStage.stage : 'Natural'}
                            </div>
                          </div>
                          <div className="fly-arrow-divider" style={{ display:'flex', alignItems:'center', justifyContent:'center',
                            width:24, paddingTop:55, color:'var(--border2)', fontSize:'1rem', flexShrink:0 }}>
                            ↔
                          </div>
                          <div className="fly-compare-col" style={{ flex:1, textAlign:'center', minWidth:0, overflow:'hidden' }}>
                            <div className="fly-compare-img-wrap" style={{ width:'min(140px,100%)', height:'min(140px,100%)', aspectRatio:'1', margin:'0 auto' }}>
                              <FlyImage
                                flyFile={flyQ}
                                type={info.type}
                                label="Artificial Fly"
                                size={140}
                              />
                            </div>
                            <div style={{ fontSize:'.6rem', color:'var(--tdim)', marginTop:'.35rem',
                              letterSpacing:'.1em', textTransform:'uppercase' }}>
                              {flyName}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Lifecycle */}
                  <div style={S.mb4}>
                    <div style={S.labelMb}>Insect Lifecycle</div>
                    <p style={{ fontSize:'.83rem', color:'var(--mist)', lineHeight:1.7 }}>{info.lifecycle}</p>
                  </div>

                  {/* Life stages pills */}
                  {info.stages?.length > 0 && (
                    <div style={S.mb4}>
                      <div style={S.labelMb}>Life Stages This Fly Imitates</div>
                      <div style={{ display:'flex', gap:'.4rem', flexWrap:'wrap' }}>
                        {info.stages.map(s => (
                          <span key={s} style={{
                            padding:'.25rem .7rem', borderRadius:20, fontSize:'.7rem', fontWeight:500,
                            background:'rgba(42,157,143,.12)', border:'1px solid rgba(42,157,143,.25)',
                            color:'var(--teal-lt)',
                          }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  <div style={S.mb4}>
                    <div style={S.labelMb}>Recommended Sizes</div>
                    <div className="fly-modal-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.55rem' }}>
                      {[
                        ['🪁 Dry Fly', info.sizes.dry, '--dry-c'],
                        ['🔵 Euro / Tight-Line', info.sizes.euro, '--euro-c'],
                        ['🟢 Indicator', info.sizes.indicator, '--nymph-c'],
                        ['🔴 Streamer', info.sizes.streamer, '--str-c'],
                      ].map(([label, sz, colVar]) => sz && (
                        <div key={label} style={{ background:'var(--bg3)', border:'1px solid var(--border)',
                          borderRadius:4, padding:'.6rem .8rem' }}>
                          <div style={{ fontSize:'.6rem', color:`var(${colVar})`,
                            letterSpacing:'.1em', textTransform:'uppercase', marginBottom:'.2rem' }}>{label}</div>
                          <div style={{ fontSize:'.82rem', color:'var(--cream)', fontWeight:600 }}>{sz}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  {Object.keys(info.colors || {}).length > 0 && (
                    <div style={S.mb4}>
                      <div style={S.labelMb}>Colors & Materials</div>
                      {Object.entries(info.colors).map(([tech, desc]) => (
                        <div key={tech} style={{ marginBottom:'.5rem' }}>
                          <span style={{ fontSize:'.65rem', color:'var(--teal)', textTransform:'capitalize',
                            letterSpacing:'.1em', marginRight:'.4rem' }}>{tech}:</span>
                          <span style={{ fontSize:'.8rem', color:'var(--mist)' }}>{desc}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {info.notes && (
                    <div style={{ ...S.tealBox, fontSize:'.8rem', color:'var(--mist)', lineHeight:1.6, marginBottom:'1.2rem' }}>
                      💡 <strong>Fishing Notes:</strong> {info.notes}
                    </div>
                  )}

                  {/* Nudge to progression tab */}
                  {family && (
                    <button onClick={() => setActiveTab('progression')} style={{
                      width:'100%', padding:'.65rem', background:'var(--teal-dim)',
                      border:'1px solid rgba(42,157,143,.3)', borderRadius:4, cursor:'pointer',
                      color:'var(--teal-lt)', fontSize:'.76rem', fontWeight:600,
                      ...S.sans, letterSpacing:'.05em',
                    }}>
                      📈 See full {family.name} hatch progression →
                    </button>
                  )}
                </>
              )}
            </>
          )}

          {/* ══ PROGRESSION TAB ══ */}
          {activeTab === 'progression' && family && (
            <div className="anim-up">

              {/* Family overview */}
              <div style={{ marginBottom:'1.6rem' }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:'.6rem', marginBottom:'.3rem' }}>
                  <span style={{ ...S.serif, fontSize:'1.2rem', color:'var(--cream)' }}>
                    {family.name}
                  </span>
                  <span style={{ fontSize:'.65rem', color:'var(--tdim)', fontStyle:'italic' }}>
                    {family.scientificName}
                  </span>
                </div>
                <p style={{ fontSize:'.82rem', color:'var(--mist)', lineHeight:1.65, marginBottom:'.8rem' }}>
                  {family.overview}
                </p>
                <div className="cond-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.5rem' }}>
                  <div style={{ ...S.card, padding:'.5rem .7rem' }}>
                    <div style={{ ...S.tinyLabel, letterSpacing:'.14em', color:'var(--tdim)', marginBottom:'.15rem' }}>Peak Season</div>
                    <div style={{ fontSize:'.75rem', color:'var(--mist)', fontWeight:500 }}>{family.seasonPeak}</div>
                  </div>
                  <div style={{ ...S.card, padding:'.5rem .7rem' }}>
                    <div style={{ ...S.tinyLabel, letterSpacing:'.14em', color:'var(--tdim)', marginBottom:'.15rem' }}>Water Types</div>
                    <div style={{ fontSize:'.75rem', color:'var(--mist)', fontWeight:500 }}>{family.waterTypes}</div>
                  </div>
                </div>
              </div>

              {/* Stage-by-stage progression */}
              <div style={{ ...S.label, marginBottom:'1rem' }}>Stage-by-Stage Hatch Progression</div>

              {family.stages.map((stage, idx) => {
                const isThisStage = idx === thisStageIdx;
                const stageWindow = STAGE_HATCH_WINDOWS[famKey + '|' + stage.stage] || null;

                return (
                  <div key={stage.stage} style={{
                    marginBottom:'1rem',
                    border:`1px solid ${isThisStage ? stage.stageColor : 'var(--border)'}`,
                    borderLeft:`3px solid ${stage.stageColor}`,
                    borderRadius:'0 4px 4px 0',
                    background: isThisStage ? `${stage.stageColor}11` : 'var(--bg3)',
                    overflow:'hidden',
                  }}>
                    {/* Stage header */}
                    <div style={{ padding:'.65rem 1rem', borderBottom:'1px solid var(--border)',
                      display:'flex', alignItems:'center', gap:'.5rem', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'1rem' }}>{stage.icon}</span>
                      <span style={{ fontWeight:700, fontSize:'.84rem',
                        color: isThisStage ? stage.stageColor : 'var(--cream)' }}>
                        {stage.stage}
                      </span>
                      {isThisStage && (
                        <span style={{ fontSize:'.56rem', padding:'.15rem .48rem', borderRadius:20,
                          background: stage.stageColor + '33', color: stage.stageColor,
                          fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase' }}>
                          ← YOU ARE HERE
                        </span>
                      )}
                      {/* Compact time badge in header */}
                      {stageWindow && !stageWindow.allDay && (
                        <span style={{ marginLeft:'auto', fontSize:'.64rem', fontWeight:600,
                          color: isThisStage ? stage.stageColor : 'var(--tdim)',
                          background: isThisStage ? stage.stageColor + '18' : 'var(--bg2)',
                          border:'1px solid var(--border)', borderRadius:20,
                          padding:'.15rem .55rem', whiteSpace:'nowrap' }}>
                          🕐 {stageWindow.label}
                        </span>
                      )}
                      {stageWindow && stageWindow.allDay && (
                        <span style={{ marginLeft:'auto', fontSize:'.64rem', color:'var(--tdim)',
                          fontStyle:'italic' }}>All day</span>
                      )}
                    </div>

                    <div style={{ padding:'.8rem 1rem' }}>

                      {/* ── Insect stage photo ── */}
                      {(() => {
                        const famType = { midge:'midge', bwo:'mayfly', pmd:'mayfly',
                          caddis:'caddis', skwala:'stonefly', salmonfly:'stonefly',
                          yellowsally:'stonefly', hopper:'terrestrial',
                          streamer_family:'streamer', stillwater:'stillwater' }[famKey] || 'mayfly';
                        const insectQ = INSECT_TAXON[famType + '|' + stage.stage]
                          || INSECT_TAXON[famType];
                        return insectQ ? (
                          <div className="fly-stage-row" style={{ display:'flex', gap:'1rem', alignItems:'flex-start', marginBottom:'.9rem' }}>
                            <FlyImage taxon={insectQ} type={famType} label={stage.stage} size={100} />
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:'.7rem', color:'var(--mist)', lineHeight:1.6,
                                fontStyle:'italic', marginBottom:'.3rem' }}>
                                {stage.description}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p style={{ fontSize:'.78rem', color:'var(--mist)', lineHeight:1.6, marginBottom:'.7rem' }}>
                            {stage.description}
                          </p>
                        );
                      })()}

                      {/* Timeline bar for this stage */}
                      {stageWindow && (
                        <div style={{ marginBottom:'.7rem' }}>
                          <HatchTimeline window={stageWindow} compact={false} />
                        </div>
                      )}

                      <div style={{ ...S.tealBox, fontSize:'.75rem', color:'var(--mist)',
                        lineHeight:1.6, marginBottom:'.9rem' }}>
                        🎣 <strong>How to fish:</strong> {stage.howToFish}
                      </div>

                      {/* ── Pattern thumbnails ── */}
                      {stage.patterns.length > 0 && (
                        <div>
                          <div style={{ ...S.tinyLabel, letterSpacing:'.12em', color:'var(--tdim)',
                            marginBottom:'.55rem' }}>Recommended Patterns</div>
                          <div style={{ display:'flex', gap:'.6rem', flexWrap:'wrap' }}>
                            {stage.patterns.map(p => {
                              const pKey = normalizeFlyName(p) || p;
                              const flyQ = FLY_FILES[pKey] || FLY_FILES[p] || null;
                              const isCurrent = p === key;
                              return (
                                <div key={p} style={{ textAlign:'center', opacity: isCurrent ? 1 : 0.75 }}>
                                  <div style={{ position:'relative' }}>
                                    <FlyImage flyFile={flyQ} type={null} label="" size={56} />
                                    {isCurrent && (
                                      <div style={{ position:'absolute', top:-4, right:-4,
                                        width:14, height:14, borderRadius:'50%',
                                        background:'var(--teal)', border:'2px solid var(--bg2)',
                                        fontSize:'.45rem', display:'flex', alignItems:'center',
                                        justifyContent:'center', color:'var(--bg)' }}>★</div>
                                    )}
                                  </div>
                                  <div style={{ fontSize:'.52rem', color: isCurrent ? 'var(--teal-lt)' : 'var(--tdim)',
                                    marginTop:'.25rem', lineHeight:1.2, maxWidth:60,
                                    fontWeight: isCurrent ? 600 : 400 }}>
                                    {p}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Overall progression summary */}
              <div style={{ background:'var(--bg3)', border:'1px solid var(--border)',
                borderRadius:4, padding:'1rem 1.1rem', marginBottom:'1rem' }}>
                <div style={S.labelMb}>Overall Progression</div>
                <p style={{ fontSize:'.78rem', color:'var(--mist)', lineHeight:1.6 }}>{family.progression}</p>
              </div>

              {/* Coach tip */}
              <div style={{ background:'rgba(233,196,106,.07)', borderLeft:'3px solid var(--gold)',
                padding:'.9rem 1.1rem', borderRadius:'0 4px 4px 0' }}>
                <div style={{ fontSize:'.6rem', color:'var(--gold)', letterSpacing:'.18em',
                  textTransform:'uppercase', fontWeight:600, marginBottom:'.35rem' }}>Coach's Tip</div>
                <p style={{ fontSize:'.8rem', color:'var(--mist)', lineHeight:1.65, fontStyle:'italic' }}>
                  {family.coachTip}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




/* ═══════════════════════════════════════════════════════════
   HATCH PANEL  (with clickable fly pills → FlyModal)
═══════════════════════════════════════════════════════════ */
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function HatchPanel({ state, river, waterType }) {
  const currentMonth = new Date().getMonth();
  const [selectedFly, setSelectedFly] = useState(null);

  const hatchData = waterType === 'stillwater' ? STILLWATER_H : H;

  const riverData = useMemo(() => {
    const sd = hatchData[state];
    if (!sd) return null;
    if (sd[river]) return sd[river];
    if (sd.data?.[river]) return sd.data[river];
    const key = Object.keys(sd.data || sd).find(k =>
      k.toLowerCase().startsWith(river.toLowerCase().split(' ')[0]) ||
      river.toLowerCase().startsWith(k.toLowerCase().split(' ')[0])
    );
    return key ? (sd.data ? sd.data[key] : sd[key]) : null;
  }, [state, river, hatchData]);

  return (
    <div style={{ ...S.panel(), minHeight:260, position:'relative' }}>
      <PanelHeader icon="🗓" title="Hatch Calendar" river={river} />
      {!riverData ? (
        <EmptyState icon="🪰" msg="No hatch data for this water yet" />
      ) : (
        <>
          <div style={{ fontSize:'.7rem', color:'var(--teal)', marginBottom:'.7rem', fontStyle:'italic' }}>
            Click any fly name for insect lifecycle & sizing info
          </div>
          {/* Scrollable month grid */}
          <div style={{ display:'flex', gap:'.35rem', overflowX:'auto', paddingBottom:'.4rem',
            scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
            {MONTHS_SHORT.map((m, i) => (
              <div key={m} style={{ flexShrink:0, minWidth:68 }}>
                <div style={{
                  fontSize:'.58rem', letterSpacing:'.1em', textTransform:'uppercase',
                  textAlign:'center', padding:'.22rem .1rem', marginBottom:'.28rem',
                  borderBottom:`1px solid ${i === currentMonth ? 'var(--gold)' : 'var(--border)'}`,
                  color: i === currentMonth ? 'var(--gold)' : 'var(--tdim)',
                }}>
                  {i === currentMonth ? '▶ ' : ''}{m}
                </div>
                {(riverData[i] || []).map((fly, fi) => (
                  <button key={fi}
                    onClick={() => setSelectedFly(fly.n)}
                    className={`fly-${fly.t}`}
                    style={{
                      display:'block', width:'100%', margin:'0 0 .22rem',
                      padding:'.18rem .32rem', borderRadius:3, border:'none',
                      fontSize:'.59rem', fontWeight:500, textAlign:'center',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                      cursor:'pointer', ...S.sans, transition:'filter .12s, transform .1s',
                    }}
                    title={`Click for ${fly.n} info`}
                    onMouseEnter={e => { e.target.style.filter='brightness(1.25)'; e.target.style.transform='scale(1.04)'; }}
                    onMouseLeave={e => { e.target.style.filter=''; e.target.style.transform=''; }}
                  >
                    {fly.n}
                  </button>
                ))}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div style={{ display:'flex', gap:'.9rem', flexWrap:'wrap', marginTop:'.8rem' }}>
            {[['s','#d4a855','Stoneflies'],['e','#8a9fdf','Euro/Nymphs'],['n','#6fc48a','Dries/Emergers'],['r','#e08060','Streamers']].map(([t,col,lbl]) => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:'.35rem', fontSize:'.64rem', color:'var(--tdim)' }}>
                <span style={{ width:8, height:8, borderRadius:2, background:col, display:'block', flexShrink:0 }} />
                {lbl}
              </div>
            ))}
          </div>
          <div style={{ marginTop:'.5rem', fontSize:'.66rem', color:'var(--tdim)' }}>
            ▶ = current month · Timing shifts 2–3 weeks later at higher elevation
          </div>
        </>
      )}

      {/* Fly detail modal */}
      {selectedFly && (
        <FlyModal flyName={selectedFly} onClose={() => setSelectedFly(null)} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STILLWATER TECHNIQUES PANEL
═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   INTEL SECTION  (now with waterType toggle)
═══════════════════════════════════════════════════════════ */
const STATES = ['UT','ID','WY','MT','CO','OR','WA'];

function IntelSection() {
  const [activeState,   setActiveState]   = useState('UT');
  const [waterType,     setWaterType]     = useState('river');
  const [activeWater,   setActiveWater]   = useState('Provo River');
  const [activeSection, setActiveSection] = useState(null);   // river section object | null
  const [accessMode,    setAccessMode]    = useState(null);   // 'wade'|'float' for rivers, 'shore'|'boat' for lakes

  // Derive water list from waterType
  const waters = useMemo(() => {
    if (waterType === 'stillwater') return STILLWATER_WATERS[activeState] || [];
    return Object.keys(RIVER_SPECIES[activeState] || {});
  }, [activeState, waterType]);

  // When state OR waterType changes → reset to first water, clear section/mode
  useEffect(() => {
    const first = waters[0] || '';
    setActiveWater(first);
    setActiveSection(null);
    setAccessMode(null);
  }, [waters]);

  // When water changes → reset section and mode
  useEffect(() => {
    setActiveSection(null);
    setAccessMode(null);
  }, [activeWater]);

  // When section changes → reset mode (so user re-picks wade/float)
  useEffect(() => {
    setAccessMode(null);
  }, [activeSection]);

  const handleStateChange = (s) => setActiveState(s);
  const handleWaterTypeChange = (type) => setWaterType(type);

  const isStillwater = waterType === 'stillwater';
  const speciesMap   = isStillwater ? STILLWATER_SPECIES   : RIVER_SPECIES;

  // River sections for the active river
  const riverSections = (!isStillwater && RIVER_SECTIONS[activeWater]) || null;

  // Mode options differ by water type
  const modeOptions = isStillwater
    ? [['shore','🚶 Shore / Bank'],['boat','🚣 Boat / Watercraft']]
    : [['wade','🥾 Wading'],['float','🛶 Float / Drift Boat']];

  // Determine if we have enough selection to show the dashboard
  // Rivers with sections: need section + mode. Rivers without: need mode only. Lakes: need mode only.
  const needsSection = !isStillwater && riverSections !== null;
  const dashboardReady = needsSection
    ? (activeSection !== null && accessMode !== null)
    : (accessMode !== null);

  // Build step number labels dynamically
  const sectionStep = !isStillwater && riverSections ? 4 : null;
  const modeStep    = sectionStep ? 5 : 4;

  const rp = { state: activeState, river: activeWater };

  return (
    <section id="intel" style={{ background:'var(--bg)', paddingTop:'5.5rem' }}>
      {/* Header */}
      <div style={{ padding:'0 3.5rem 2.5rem' }}>
        <SectionLabel>River & Lake Intelligence</SectionLabel>
        <h2 style={{ ...S.serif, fontSize:'clamp(1.7rem,3vw,2.6rem)',
          lineHeight:1.1, color:'var(--cream)', marginBottom:'.9rem' }}>
          Where Do You Want to Fish?
        </h2>
        <SDivider />
        <p style={{ fontSize:'.95rem', color:'var(--mist)', lineHeight:1.78, maxWidth:580, fontWeight:300 }}>
          Select your state, water, and how you'll be fishing to get section-specific access points,
          live conditions, today's hatch, and recommended techniques.
        </p>
      </div>

      {/* ── Step 1: State ── */}
      <div style={{ background:'var(--bg2)', borderTop:'1px solid var(--border)',
        borderBottom:'1px solid var(--border)', padding:'0 3rem' }}>
        <div style={{ ...S.stepLabel, padding:'.6rem 0 0' }}>Step 1 — State</div>
        <div style={{ display:'flex', overflowX:'auto', scrollbarWidth:'none' }}>
          {STATES.map(s => (
            <button key={s} onClick={() => handleStateChange(s)} style={{
              flexShrink:0, padding:'.9rem 1.7rem', background:'none', border:'none',
              borderBottom: s === activeState ? '3px solid var(--teal)' : '3px solid transparent',
              color: s === activeState ? 'var(--teal-lt)' : 'var(--slate)',
              ...S.sans, fontSize:'.77rem', fontWeight:600,
              letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer', transition:'all .18s',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* ── Step 2: Water Type ── */}
      <div style={{ background:'var(--bg3)', borderBottom:'1px solid var(--border)',
        padding:'1rem 3rem', display:'flex', alignItems:'center', gap:'1.2rem', flexWrap:'wrap' }}>
        <span style={{ ...S.stepLabel }}>Step 2 — Water Type</span>
        <div style={{ display:'flex', gap:'.5rem' }}>
          {[['river','🏞 Rivers & Streams'],['stillwater','🏔 Stillwater / Lakes']].map(([type, label]) => {
            const isActive = waterType === type;
            return (
              <button key={type} onClick={() => handleWaterTypeChange(type)} style={{
                padding:'.55rem 1.4rem',
                background: isActive ? 'var(--teal)' : 'var(--bg2)',
                border:`1px solid ${isActive ? 'var(--teal)' : 'var(--border2)'}`,
                color: isActive ? 'var(--bg)' : 'var(--mist)',
                borderRadius:3, fontSize:'.77rem', fontWeight: isActive ? 700 : 500,
                cursor:'pointer', ...S.sans, letterSpacing:'.03em', transition:'all .18s',
              }}>{label}</button>
            );
          })}
        </div>
      </div>

      {/* ── Step 3: Specific water ── */}
      <div className="step-water" style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap',
        padding:'1.2rem 3rem', background:'var(--bg2)', borderBottom:'1px solid var(--border)' }}>
        <span style={{ ...S.stepLabel, whiteSpace:'nowrap' }}>
          Step 3 — {isStillwater ? 'Lake / Reservoir' : 'River / Stream'}
        </span>
        <div style={{ display:'flex', gap:'.45rem', flexWrap:'wrap' }}>
          {waters.map(w => (
            <button key={w} onClick={() => setActiveWater(w)} style={{
              padding:'.35rem .85rem',
              background: w === activeWater ? 'var(--teal-dim)' : 'var(--bg3)',
              border:`1px solid ${w === activeWater ? 'var(--teal)' : 'var(--border2)'}`,
              color: w === activeWater ? 'var(--teal-lt)' : 'var(--mist)',
              borderRadius:20, fontSize:'.74rem', fontWeight:500,
              cursor:'pointer', ...S.sans, whiteSpace:'nowrap', transition:'all .15s',
            }}>{w}</button>
          ))}
        </div>
      </div>

      {/* ── Step 4: River Section (only for rivers with section data) ── */}
      {needsSection && (
        <div style={{ padding:'1.2rem 3rem', background:'var(--bg3)', borderBottom:'1px solid var(--border)' }}>
          <div style={{ ...S.stepLabel, marginBottom:'.8rem' }}>
            Step 4 — River Section
          </div>
          <div style={{ display:'flex', gap:'.7rem', flexWrap:'wrap' }}>
            {riverSections.map(sec => {
              const isActive = activeSection?.id === sec.id;
              return (
                <button key={sec.id} onClick={() => setActiveSection(sec)} style={{
                  padding:'.6rem 1.1rem', cursor:'pointer',
                  ...S.sans, textAlign:'left',
                  background: isActive ? 'var(--teal-dim)' : 'var(--bg2)',
                  border:`1px solid ${isActive ? 'var(--teal)' : 'var(--border2)'}`,
                  borderRadius:4, transition:'all .15s',
                }}>
                  <div style={{ fontSize:'.78rem', fontWeight:700,
                    color: isActive ? 'var(--teal-lt)' : 'var(--cream)' }}>{sec.name}</div>
                  <div style={{ fontSize:'.65rem', color:'var(--tdim)', marginTop:'.1rem' }}>{sec.subtitle}</div>
                </button>
              );
            })}
          </div>
          {/* Section character card */}
          {activeSection && (
            <div style={{ marginTop:'1rem', background:'var(--bg2)', border:'1px solid var(--border)',
              borderLeft:'3px solid var(--teal)', borderRadius:'0 4px 4px 0', padding:'.9rem 1.1rem' }}>
              <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap', marginBottom:'.6rem' }}>
                {[
                  ['📏', activeSection.length],
                  ['🏔', activeSection.elevation],
                  ['🐟', activeSection.fishType],
                ].map(([icon, val]) => val && (
                  <span key={icon} style={{ fontSize:'.72rem', color:'var(--mist)' }}>
                    {icon} {val}
                  </span>
                ))}
              </div>
              <p style={{ fontSize:'.8rem', color:'var(--mist)', lineHeight:1.6, margin:0 }}>
                {activeSection.char}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Step 4 or 5: Wade/Float or Shore/Boat ── */}
      {/* Show once: section is chosen (or not required) */}
      {(!needsSection || activeSection) && (
        <div style={{ padding:'1rem 3rem', background:'var(--bg2)', borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', gap:'1.2rem', flexWrap:'wrap' }}>
          <span style={{ ...S.stepLabel }}>
            Step {modeStep} — How Are You Fishing?
          </span>
          <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
            {modeOptions.map(([mode, label]) => {
              // Disable options not suitable for this section
              const sec = activeSection;
              let disabled = false;
              if (!isStillwater && sec) {
                if (mode === 'wade'  && !sec.wadeSuitable)  disabled = true;
                if (mode === 'float' && !sec.floatSuitable) disabled = true;
              }
              const isActive = accessMode === mode;
              return (
                <button key={mode} disabled={disabled} onClick={() => setAccessMode(mode)} style={{
                  padding:'.55rem 1.4rem',
                  background: isActive ? 'var(--gold)' : disabled ? 'transparent' : 'var(--bg3)',
                  border:`1px solid ${isActive ? 'var(--gold)' : disabled ? 'var(--border)' : 'var(--border2)'}`,
                  color: isActive ? 'var(--bg)' : disabled ? 'var(--tdim)' : 'var(--mist)',
                  borderRadius:3, fontSize:'.77rem', fontWeight: isActive ? 700 : 500,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.4 : 1,
                  ...S.sans, transition:'all .18s',
                }}>{label}</button>
              );
            })}
          </div>
          {/* Contextual note for selected mode + section */}
          {accessMode && activeSection && !isStillwater && (
            <div style={{ width:'100%', fontSize:'.75rem', color:'var(--teal-lt)', fontStyle:'italic',
              marginTop:'.2rem', lineHeight:1.5 }}>
              {accessMode === 'wade' ? activeSection.wadeNote : activeSection.floatNote}
            </div>
          )}
        </div>
      )}

      {/* ── Prompt to complete selection ── */}
      {!dashboardReady && (
        <div style={{ padding:'3rem', textAlign:'center', color:'var(--tdim)', fontSize:'.9rem' }}>
          {needsSection && !activeSection
            ? '↑ Select a river section above to continue'
            : '↑ Choose how you\'ll be fishing to see conditions & access'}
        </div>
      )}

      {/* ── Dashboard ── */}
      {dashboardReady && (
        <div className="intel-panel-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:'1px solid var(--border)' }}>

          {/* Hatch Calendar */}
          <div style={{ borderRight:'1px solid var(--border)' }}>
            <HatchPanel {...rp} waterType={waterType} />
          </div>

          {/* Conditions */}
          <div>
            {isStillwater ? (
              <div style={S.infoCard}>
                <PanelHeader icon="💧" title="Lake Conditions" river={activeWater} />
                <div style={{ ...S.tealBox, fontSize:'.82rem', color:'var(--mist)', lineHeight:1.7, marginBottom:'1rem' }}>
                  {accessMode === 'shore'
                    ? 'Shore fishing tip: early morning and late evening are prime. Work inlet areas and weed edges within casting range.'
                    : 'Boat/float tube tip: cover water systematically along depth contours. Anchor for chironomid — even a slow drift disrupts the presentation.'}
                </div>
                {[
                  ['Best Months','April–May (ice-out) and September–October offer peak fly fishing on most Mountain West lakes.'],
                  ['Water Temperature','Fish feed most actively between 48–65°F. Thermocline depth matters more than surface temp.'],
                  ['Wind & Weather','Overcast days suppress midge emergence timing and extend feeding windows. Wind concentrates food along windward shores.'],
                  [accessMode === 'boat' ? 'Float Tube Tips' : 'Shore Tips',
                    accessMode === 'boat'
                      ? 'Use a 9–10 ft rod to keep flies above the tube. Electric motor or anchor for the dead-still presentation that chironomid fishing demands.'
                      : 'Wade carefully into the shallows at first light. Callibaetis and damsel nymphs move toward shore at dawn — be there early.'],
                ].map(([title, desc]) => (
                  <div key={title} style={{ marginBottom:'.7rem', paddingBottom:'.7rem', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ fontSize:'.68rem', color:'var(--teal)', fontWeight:600, marginBottom:'.2rem' }}>{title}</div>
                    <div style={{ fontSize:'.78rem', color:'var(--mist)', lineHeight:1.55 }}>{desc}</div>
                  </div>
                ))}
              </div>
            ) : (
              <ConditionsPanel {...rp} sectionId={activeSection?.id} />
            )}
          </div>

          {/* Species */}
          <div style={{ borderTop:'1px solid var(--border)', borderRight:'1px solid var(--border)' }}>
            <SpeciesPanel {...rp} speciesMap={speciesMap} section={activeSection} />
          </div>

          {/* Techniques */}
          <div style={{ borderTop:'1px solid var(--border)' }}>
            <TechniquesPanel {...rp} isStillwater={isStillwater} />
          </div>

          {/* Access Panel — section + mode aware */}
          <div style={{ gridColumn:'1/-1', borderTop:'1px solid var(--border)' }}>
            <AccessPanel
              {...rp}
              section={activeSection}
              accessMode={accessMode}
              isStillwater={isStillwater}
            />
          </div>

        </div>
      )}
    </section>
  );
}



/* ═══════════════════════════════════════════════════════════
   HERO SECTION
═══════════════════════════════════════════════════════════ */
function TopoRings() {
  const radii = [480,400,330,270,220,175,135,100,70,45];
  return (
    <div style={{ position:'absolute', right:'-5%', top:'8%', width:600, height:600, opacity:.055, pointerEvents:'none' }}>
      {radii.map(r => (
        <div key={r} style={{
          position:'absolute', borderRadius:'50%', border:'1px solid var(--teal)',
          width:r, height:r, top:'50%', left:'50%',
          transform:'translate(-50%,-50%)',
        }} />
      ))}
    </div>
  );
}

const PILLARS = [
  { icon:'🎣', num:'01', title:'Technique Mastery', desc:'Dry fly, Euro nymphing, streamers, sight fishing — built from the ground up.' },
  { icon:'🪰', num:'02', title:'Hatch Intelligence', desc:'Live river conditions paired with precise seasonal hatch calendars.' },
  { icon:'🐟', num:'03', title:'Species Targeting',  desc:'Rainbow, brown, cutthroat, brook — each demands a different approach.' },
  { icon:'🗺', num:'04', title:'7-State Coverage',   desc:'Utah, Idaho, Wyoming, Montana, Colorado, Oregon, Washington.' },
];

function HeroSection() {
  return (
    <section id="hero" className="hero-grid" style={{
      minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr',
      alignItems:'center', position:'relative', overflow:'hidden',
    }}>
      {/* Background */}
      <div style={{ position:'absolute', inset:0,
        background:'radial-gradient(ellipse 55% 80% at 5% 50%, rgba(42,157,143,.11) 0%, transparent 60%), radial-gradient(ellipse 40% 50% at 95% 20%, rgba(233,196,106,.06) 0%, transparent 50%), linear-gradient(165deg,#0a1419 0%,#0f2030 55%,#0b1a22 100%)',
      }} />
      <TopoRings />

      {/* Left */}
      <div  className="hero-left" style={{ position:'relative', zIndex:2, padding:'8rem 2.5rem 6rem 3.5rem' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'.6rem', fontSize:'.64rem',
          letterSpacing:'.22em', textTransform:'uppercase', color:'var(--teal)', fontWeight:500,
          marginBottom:'1.4rem' }}>
          <span style={{ width:20, height:1, background:'var(--teal)', display:'block' }} />
          Coaching · River Intelligence · Mastery
        </div>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'.45rem', fontSize:'.69rem',
          color:'var(--tdim)', letterSpacing:'.1em', marginBottom:'1.1rem',
          padding:'.28rem .75rem', border:'1px solid var(--border2)', borderRadius:20 }}>
          📍 Based in Provo, Utah · Travel Available
        </div>
        <h1 style={{ ...S.serif, fontSize:'clamp(2.6rem,4.2vw,4.6rem)', lineHeight:1.06,
          color:'var(--cream)', marginBottom:'1.4rem' }}>
          Build a<br/><em style={{ fontStyle:'italic', color:'var(--teal-lt)' }}>Complete</em><br/>Angler
        </h1>
        <p style={{ fontSize:'1rem', lineHeight:1.78, color:'var(--mist)', fontWeight:300,
          maxWidth:440, marginBottom:'2.3rem' }}>
          Structured coaching in technique, entomology, and river strategy — built around real-time conditions across the Mountain West and Pacific Northwest.
        </p>
        <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
          <a href="#intel" style={{
            padding:'.7rem 1.7rem', background:'var(--teal)', color:'var(--bg)',
            ...S.sans, fontSize:'.77rem', fontWeight:700,
            letterSpacing:'.08em', textTransform:'uppercase', textDecoration:'none',
            borderRadius:2, transition:'all .25s',
          }}>Explore River Guide</a>
          <a href="#booking" style={{
            padding:'.7rem 1.7rem', background:'transparent', color:'var(--mist)',
            ...S.sans, fontSize:'.77rem', fontWeight:700,
            letterSpacing:'.08em', textTransform:'uppercase', textDecoration:'none',
            border:'1px solid rgba(196,216,223,.22)', borderRadius:2, transition:'all .25s',
          }}>Book Coaching</a>
        </div>
      </div>

      {/* Right */}
      <div className="hero-right" style={{ position:'relative', zIndex:2, padding:'8rem 3.5rem 6rem 2rem' }}>
        <div className="cond-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'var(--border)', border:'1px solid var(--border)' }}>
          {PILLARS.map(p => (
            <div key={p.num} style={{
              background:'rgba(14,29,38,.9)', padding:'1.8rem 1.5rem',
              transition:'background .25s',
            }}>
              <span style={{ fontSize:'1.5rem', marginBottom:'.7rem', display:'block' }}>{p.icon}</span>
              <span style={{ ...S.tinyLabel, letterSpacing:'.15em', color:'var(--teal)', marginBottom:'.35rem' }}>{p.num}</span>
              <h3 style={{ ...S.serif, fontSize:'1rem',
                color:'var(--cream)', marginBottom:'.4rem' }}>{p.title}</h3>
              <p style={{ fontSize:'.78rem', color:'var(--tdim)', lineHeight:1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   COACHING SECTION
═══════════════════════════════════════════════════════════ */
const PROGRAMS = [
  { name:'Half-Day Clinic',       price:'$195',     hours:'4 hours',  pax:'1–2 anglers',  extra:'Local or Travel',   desc:'4-hour focused session on a single technique. Cast evaluation, knot practice, and live-water application. Best for beginners or specific skill gaps.' },
  { name:'Full-Day Development',  price:'$350',     hours:'8 hours',  pax:'1–2 anglers',  extra:'Float or Wade',     desc:'8 hours on the water covering multiple techniques and presentations. Includes hatch reading, rigging, and position work. Most popular option.' },
  { name:'Multi-Day Immersion',   price:'$275/day', hours:'2–5 days', pax:'1–3 anglers',  extra:'Travel Available',  desc:'2–5 day intensive across multiple rivers or techniques. Ideal for traveling anglers or rapid skill development. Travel rates apply outside UT.' },
  { name:'Competition Prep',      price:'$400',     hours:'8 hours',  pax:'1 angler',     extra:'Competition Focus', desc:'Full-day Euro nymphing focus — FIPS-style scoring, tight-line control, sighter work, and sector strategy. For anglers preparing for club or sanctioned events.' },
];

const CREDENTIALS = [
  'Expert in Euro nymphing, dry fly, and streamer techniques across Rocky Mountain tailwaters and freestone streams',
  'Deep entomology knowledge — reads hatch cycles and water temps in real time to adapt presentation',
  'Home waters: Provo River, Green River (UT), Logan River — Blue Ribbon tailwaters year-round',
  'Available for travel to iconic waters across UT, ID, WY, MT, CO, OR, WA',
  'Customized sessions from beginner wading clinic to competition technique refinement',
];

function CoachingSection() {
  return (
    <section id="coaching" className="coaching-wrap" style={{ padding:'5.5rem 3.5rem', background:'var(--bg2)' }}>
      <div className="coaching-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', alignItems:'start' }}>
        {/* Left */}
        <div>
          <SectionLabel>Your Coach</SectionLabel>
          <h2 style={{ ...S.serif, fontSize:'clamp(1.7rem,3vw,2.6rem)', lineHeight:1.1,
            color:'var(--cream)', marginBottom:'.9rem' }}>
            Expert Instruction, Real Rivers
          </h2>
          <SDivider />
          <div style={{ padding:'1.4rem 1.6rem', borderLeft:'3px solid var(--teal)', marginBottom:'1.6rem' }}>
            <blockquote style={{ ...S.serif, fontStyle:'italic',
              fontSize:'1rem', color:'var(--mist)', lineHeight:1.7, marginBottom:'.45rem' }}>
              "A great angler isn't born on a trophy river — they're built through intentional
              repetition, honest feedback, and time spent watching how fish actually live."
            </blockquote>
            <div style={{ fontSize:'.68rem', color:'var(--teal)', letterSpacing:'.1em', textTransform:'uppercase' }}>
              Head Coach — Fly Fishing Guru
            </div>
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'.4rem', padding:'.3rem .8rem',
            background:'var(--gold-dim)', border:'1px solid rgba(233,196,106,.2)',
            borderRadius:2, fontSize:'.67rem', color:'var(--gold)',
            letterSpacing:'.08em', textTransform:'uppercase', marginBottom:'1.6rem' }}>
            ✈ Based in Provo, UT · Available to Travel 7-State Region
          </div>
          <div>
            {CREDENTIALS.map((c, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'.7rem',
                padding:'.5rem 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ width:6, height:6, background:'var(--teal)', borderRadius:'50%',
                  marginTop:'.4rem', flexShrink:0 }} />
                <span style={{ fontSize:'.8rem', color:'var(--mist)', lineHeight:1.55 }}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div>
          <SectionLabel>Programs</SectionLabel>
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'1rem', marginTop:'.6rem' }}>
            {PROGRAMS.map(p => (
              <div key={p.name} style={{ padding:'1.3rem 1.5rem', background:'var(--bg)',
                border:'1px solid var(--border)', borderRadius:4,
                transition:'border-color .2s' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.45rem' }}>
                  <span style={{ ...S.serif, fontSize:'1rem', color:'var(--cream)' }}>
                    {p.name}
                  </span>
                  <span style={{ fontSize:'.8rem', fontWeight:700, color:'var(--gold)' }}>{p.price}</span>
                </div>
                <p style={{ fontSize:'.78rem', color:'var(--tdim)', lineHeight:1.6, marginBottom:'.5rem' }}>
                  {p.desc}
                </p>
                <div style={{ display:'flex', gap:'1rem' }}>
                  {[['⏱',p.hours],['👤',p.pax],['📍',p.extra]].map(([ico,val]) => (
                    <span key={val} style={{ fontSize:'.67rem', color:'var(--teal)' }}>{ico} {val}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   BOOKING SECTION
═══════════════════════════════════════════════════════════ */
const BOOK_OPTIONS = [
  { icon:'📞', name:'Call or Text',    desc:'Fastest way to confirm dates and discuss river options. Response within 4 hours.' },
  { icon:'📧', name:'Email',           desc:'Detail your goals, preferred dates, and waters. Custom programs quoted within 24 hours.' },
  { icon:'📍', name:'Home Waters',     desc:'Provo River, Green River (UT), and Logan River — available year-round without travel fees.' },
];

function BookingSection() {
  const [modal, setModal]       = useState(null); // null | 'book' | 'email' | 'call'
  const [formData, setFormData] = useState({
    name:'', phone:'', email:'', preferredContact:'email',
    bestTime:'', technique:'', notes:''
  });
  const [submitState, setSubmitState] = useState('idle'); // idle | sending | success | error

  const TECHNIQUES_LIST = [
    { value:'',          label:'— Select a technique (optional) —' },
    { value:'Dry Fly',           label:'Dry Fly' },
    { value:'Euro Nymphing',     label:'Euro Nymphing' },
    { value:'Indicator Nymphing',label:'Indicator Nymphing' },
    { value:'Streamer Fishing',  label:'Streamer Fishing' },
    { value:'Beginner / All',    label:'Beginner — All Techniques' },
    { value:'Not Sure',          label:'Not Sure Yet' },
  ];

  const BEST_TIMES = [
    { value:'', label:'— Select best time to reach you —' },
    { value:'Morning (8am–11am)',    label:'Morning (8am–11am)' },
    { value:'Midday (11am–2pm)',     label:'Midday (11am–2pm)' },
    { value:'Afternoon (2pm–5pm)',   label:'Afternoon (2pm–5pm)' },
    { value:'Evening (5pm–8pm)',     label:'Evening (5pm–8pm)' },
    { value:'Anytime',              label:'Anytime' },
  ];

  const MODAL_TITLES = {
    book:  { icon:'🎣', title:'Book a Session',    sub:"Fill out the form and I'll get back to you within 24 hours." },
    email: { icon:'✉️', title:'Send a Message',    sub:"Drop me a note and I'll reply by email." },
    call:  { icon:'📞', title:'Request a Call / Text', sub:"Let me know when to reach you and I'll call or text." },
  };

  function set(field, val) {
    setFormData(d => ({ ...d, [field]: val }));
  }

  async function handleSubmit() {
    if (!formData.name || !formData.email) return;
    setSubmitState('sending');
    try {
      const payload = {
        name:               formData.name,
        phone:              formData.phone,
        email:              formData.email,
        preferredContact:   formData.preferredContact,
        bestTime:           formData.bestTime,
        technique:          formData.technique,
        notes:              formData.notes,
        requestType:        MODAL_TITLES[modal]?.title,
      };

      // Fire both requests in parallel — Formspree (email+dashboard) + Vercel (SMS)
      const [formspreeRes] = await Promise.all([
        fetch('https://formspree.io/f/mreanbbr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: `Fly Fishing Guru — ${MODAL_TITLES[modal]?.title} from ${formData.name}`,
            ...payload,
          }),
        }),
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => null), // SMS failure doesn't block success
      ]);

      if (formspreeRes.ok) {
        setSubmitState('success');
      } else {
        setSubmitState('error');
      }
    } catch {
      setSubmitState('error');
    }
  }

  function closeModal() {
    setModal(null);
    setSubmitState('idle');
    setFormData({ name:'', phone:'', email:'', preferredContact:'email', bestTime:'', technique:'', notes:'' });
  }

  const S_input = {
    width:'100%', padding:'.55rem .75rem', background:'var(--bg3)',
    border:'1px solid var(--border)', borderRadius:3, color:'var(--cream)',
    ...S.sans, fontSize:'.85rem', outline:'none',
    boxSizing:'border-box',
  };
  const S_label = {
    display:'block', fontSize:'.67rem', letterSpacing:'.12em',
    textTransform:'uppercase', color:'var(--tdim)', marginBottom:'.35rem',
  };
  const S_row = { marginBottom:'.95rem' };

  return (
    <section id="booking" className="booking-wrap" style={{ padding:'5.5rem 3.5rem', background:'var(--bg)', textAlign:'center' }}>
      <div style={{ maxWidth:680, margin:'0 auto' }}>
        <SectionLabel>Book Your Session</SectionLabel>
        <h2 style={{ ...S.serif, fontSize:'clamp(1.7rem,3vw,2.6rem)', lineHeight:1.1,
          color:'var(--cream)', margin:'.4rem 0 1rem' }}>
          Ready to Get on the Water?
        </h2>
        <SDivider />
        <p style={{ fontSize:'.95rem', color:'var(--mist)', lineHeight:1.8,
          margin:'0 0 2rem', fontWeight:300 }}>
          Sessions fill quickly during prime season (April–October). Book at least 2 weeks ahead for guaranteed availability. Based in Provo but travel throughout the Mountain West.
        </p>

        {/* Program cards */}
        <div className="programs-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem', margin:'0 0 2rem', textAlign:'left' }}>
          {BOOK_OPTIONS.map(o => (
            <div key={o.name} style={{ padding:'1.3rem', background:'var(--bg3)',
              border:'1px solid var(--border)', borderRadius:4 }}>
              <div style={{ fontSize:'1.2rem', marginBottom:'.5rem' }}>{o.icon}</div>
              <div style={{ fontSize:'.82rem', fontWeight:600, color:'var(--cream)', marginBottom:'.25rem' }}>{o.name}</div>
              <div style={{ fontSize:'.74rem', color:'var(--tdim)', lineHeight:1.55 }}>{o.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
          {[
            { key:'book',  label:'🎣  Book a Session',   primary:true  },
            { key:'email', label:'✉️  Send an Email',    primary:false },
            { key:'call',  label:'📞  Request Call / Text', primary:false },
          ].map(btn => (
            <button key={btn.key} onClick={() => setModal(btn.key)} style={{
              padding:'.72rem 1.7rem',
              background: btn.primary ? 'var(--teal)' : 'transparent',
              color: btn.primary ? 'var(--bg)' : 'var(--mist)',
              ...S.sans, fontSize:'.77rem', fontWeight:700,
              letterSpacing:'.08em', textTransform:'uppercase',
              border: btn.primary ? 'none' : '1px solid rgba(196,216,223,.22)',
              borderRadius:2, cursor:'pointer',
            }}>{btn.label}</button>
          ))}
        </div>
        <p style={{ marginTop:'1.4rem', fontSize:'.78rem', color:'var(--tdim)' }}>
          All guided trips include rigging assistance, fly selection, and streamside coaching.
        </p>
      </div>

      {/* ── MODAL OVERLAY ── */}
      {modal && (
        <div onClick={closeModal} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.72)',
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:2000, padding:'1rem',
        }}>
          <div onClick={e => e.stopPropagation()} className="booking-modal-inner" style={{
            background:'var(--bg3)', border:'1px solid var(--border)',
            borderRadius:6, padding:'2rem', width:'100%', maxWidth:480,
            maxHeight:'90vh', overflowY:'auto', textAlign:'left',
          }}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.4rem' }}>
              <div>
                <div style={{ fontSize:'1.6rem', marginBottom:'.3rem' }}>{MODAL_TITLES[modal]?.icon}</div>
                <div style={{ ...S.serif, fontSize:'1.3rem', color:'var(--cream)' }}>
                  {MODAL_TITLES[modal]?.title}
                </div>
                <div style={{ fontSize:'.78rem', color:'var(--tdim)', marginTop:'.25rem' }}>
                  {MODAL_TITLES[modal]?.sub}
                </div>
              </div>
              <button onClick={closeModal} style={{
                background:'none', border:'none', color:'var(--tdim)',
                fontSize:'1.3rem', cursor:'pointer', padding:'.2rem .4rem', lineHeight:1,
              }}>✕</button>
            </div>

            {submitState === 'success' ? (
              <div style={{ textAlign:'center', padding:'2rem 0' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'.8rem' }}>✅</div>
                <div style={{ ...S.serif, fontSize:'1.2rem', color:'var(--cream)', marginBottom:'.5rem' }}>
                  Message Received!
                </div>
                <div style={{ fontSize:'.85rem', color:'var(--mist)', lineHeight:1.7 }}>
                  Thanks {formData.name} — I'll be in touch within 24 hours via {formData.preferredContact}.
                </div>
                <button onClick={closeModal} style={{
                  marginTop:'1.4rem', padding:'.6rem 1.6rem',
                  background:'var(--teal)', color:'var(--bg)',
                  border:'none', borderRadius:2, cursor:'pointer',
                  ...S.sans, fontSize:'.77rem',
                  fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase',
                }}>Close</button>
              </div>
            ) : (
              <>
                {/* Name */}
                <div style={S_row}>
                  <label style={S_label}>Full Name *</label>
                  <input style={S_input} placeholder="John Smith"
                    value={formData.name} onChange={e => set('name', e.target.value)} />
                </div>

                {/* Phone + Email row */}
                <div className="form-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem', marginBottom:'.95rem' }}>
                  <div>
                    <label style={S_label}>Phone Number</label>
                    <input style={S_input} placeholder="(801) 555-0123"
                      value={formData.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div>
                    <label style={S_label}>Email Address *</label>
                    <input style={S_input} placeholder="you@email.com" type="email"
                      value={formData.email} onChange={e => set('email', e.target.value)} />
                  </div>
                </div>

                {/* Preferred contact */}
                <div style={S_row}>
                  <label style={S_label}>Preferred Contact Method</label>
                  <div style={{ display:'flex', gap:'.5rem' }}>
                    {[['email','Email'],['phone','Phone Call'],['text','Text']].map(([val,lbl]) => (
                      <button key={val} onClick={() => set('preferredContact', val)} style={{
                        flex:1, padding:'.45rem .5rem',
                        background: formData.preferredContact === val ? 'var(--teal)' : 'var(--bg)',
                        color: formData.preferredContact === val ? 'var(--bg)' : 'var(--tdim)',
                        border:'1px solid var(--border)', borderRadius:3, cursor:'pointer',
                        fontSize:'.75rem', fontWeight:600, ...S.sans, }}>{lbl}</button>
                    ))}
                  </div>
                </div>

                {/* Best time */}
                <div style={S_row}>
                  <label style={S_label}>Best Time to Reach You</label>
                  <select style={{ ...S_input, appearance:'none' }}
                    value={formData.bestTime} onChange={e => set('bestTime', e.target.value)}>
                    {BEST_TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                {/* Technique interest */}
                <div style={S_row}>
                  <label style={S_label}>Technique Interest</label>
                  <select style={{ ...S_input, appearance:'none' }}
                    value={formData.technique} onChange={e => set('technique', e.target.value)}>
                    {TECHNIQUES_LIST.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                {/* Notes */}
                <div style={S_row}>
                  <label style={S_label}>Additional Notes</label>
                  <textarea style={{ ...S_input, resize:'vertical', minHeight:80 }}
                    placeholder="Experience level, target river, preferred dates, group size..."
                    value={formData.notes} onChange={e => set('notes', e.target.value)} />
                </div>

                {submitState === 'error' && (
                  <div style={{ fontSize:'.78rem', color:'#f87171', marginBottom:'.8rem' }}>
                    Something went wrong. Please try again or email 13jmmq@gmail.com directly.
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!formData.name || !formData.email || submitState === 'sending'}
                  style={{
                    width:'100%', padding:'.75rem',
                    background: (!formData.name || !formData.email) ? 'var(--border)' : 'var(--teal)',
                    color: (!formData.name || !formData.email) ? 'var(--tdim)' : 'var(--bg)',
                    border:'none', borderRadius:3, cursor: (!formData.name || !formData.email) ? 'not-allowed' : 'pointer',
                    ...S.sans, fontSize:'.82rem', fontWeight:700,
                    letterSpacing:'.08em', textTransform:'uppercase',
                  }}>
                  {submitState === 'sending' ? '⟳  Sending…' : 'Submit Request'}
                </button>
                <div style={{ fontSize:'.67rem', color:'var(--tdim)', marginTop:'.6rem', textAlign:'center' }}>
                  * Required fields. Your info is only used to contact you about guiding.
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:500,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'.85rem 3rem',
        background:'rgba(10,20,25,0.95)',
        backdropFilter:'blur(16px)',
        borderBottom:'1px solid var(--border)',
      }}>
        <a href="#hero" style={{ display:'flex', alignItems:'baseline', gap:'.5rem', textDecoration:'none' }}>
          <span style={{ ...S.serif, fontSize:'1.2rem', color:'var(--cream)' }}>
            Fly Fishing Guru
          </span>
          <span style={{ fontSize:'.59rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--teal)', fontWeight:500 }}>
            Coaching
          </span>
          <span style={{ fontSize:'.59rem', color:'var(--tdim)', letterSpacing:'.1em', marginLeft:'.2rem' }}>
            · Provo, UT
          </span>
        </a>

        {/* Desktop links */}
        <ul className="nav-links" style={{ display:'flex', alignItems:'center', gap:'1.6rem', listStyle:'none' }}>
          {[['#intel','River Guide'],['#coaching','Programs']].map(([href, label]) => (
            <li key={href}>
              <a href={href} style={{ textDecoration:'none', color:'var(--slate)', fontSize:'.73rem',
                letterSpacing:'.07em', textTransform:'uppercase', fontWeight:500 }}>
                {label}
              </a>
            </li>
          ))}
          <li>
            <a href="#booking" style={{ padding:'.45rem 1.2rem', background:'var(--teal)',
              color:'var(--bg)', borderRadius:2, textDecoration:'none', fontSize:'.73rem',
              fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase' }}>
              Book a Session
            </a>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} style={{
          display:'none', background:'none', border:'1px solid var(--border2)',
          color:'var(--mist)', padding:'.35rem .65rem', cursor:'pointer',
          fontSize:'.8rem', borderRadius:2,
        }}>☰</button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position:'fixed', top:54, left:0, right:0,
          background:'rgba(10,20,25,.98)', zIndex:499,
          padding:'1rem 2rem', borderBottom:'1px solid var(--border)',
        }}>
          {[['#intel','River Guide'],['#coaching','Programs'],['#booking','Book a Session']].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}
              style={{ display:'block', padding:'.7rem 0', color:'var(--mist)',
                textDecoration:'none', fontSize:'.85rem',
                borderBottom:'1px solid var(--border)' }}>
              {label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="footer-inner" style={{
      padding:'2.2rem 3.5rem',
      borderTop:'1px solid var(--border)',
      display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem',
    }}>
      <div>
        <div style={{ ...S.serif, fontSize:'.95rem', color:'var(--mist)' }}>
          Fly Fishing Guru
        </div>
        <div style={{ fontSize:'.63rem', color:'var(--tdim)', marginTop:'.15rem',
          letterSpacing:'.1em', textTransform:'uppercase' }}>
          Provo, Utah · Mountain West & Pacific Northwest
        </div>
      </div>
      <div style={{ display:'flex', gap:'1.5rem', listStyle:'none' }}>
        {[['#intel','River Guide'],['#coaching','Programs'],['#booking','Book']].map(([href,lbl]) => (
          <a key={href} href={href} style={{ color:'var(--tdim)', textDecoration:'none', fontSize:'.72rem' }}>
            {lbl}
          </a>
        ))}
      </div>
      <div style={{ fontSize:'.67rem', color:'var(--tdim)' }}>
        Live flow data via USGS National Water Information System
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: INLINE_CSS }} />
      <div style={{ minHeight:'100vh', background:'#0a1419', color:'#f0ece4' }}>
        <Nav />
        <HeroSection />
        <IntelSection />
        <CoachingSection />
        <BookingSection />
        <Footer />
      </div>
    </>
  );
}