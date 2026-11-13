// All companies and incidents are fictional.
// Tokens: {co} company, {fans} what they call customers, {short} euphemism for the incident, {feature} the guilty product feature.
window.SCANDALS = [
  { co: "Glimmr", fans: "Glimmr Fam", feature: "FridgeCam™", short: "the fridge livestreams",
    headline: "Glimmr smart fridges caught livestreaming customers' kitchens to a public Twitch channel" },
  { co: "Plainfield Oat Co.", fans: "Oat Community", feature: "our sourcing page", short: "the oat situation",
    headline: "Plainfield oat milk found to contain zero oats. Lab report lists main ingredient as \"vibes\"" },
  { co: "SkyBuddy Airlines", fans: "Frequent Flyers", feature: "Cozy Class", short: "seating capacity",
    headline: "SkyBuddy sold 412 seats on a 180-seat plane, told passengers to \"get cozy\"" },
  { co: "Stillwell", fans: "Mindful Ones", feature: "Calm Check-Ins", short: "the 3am notifications",
    headline: "Meditation app Stillwell sends 3am push notifications asking \"are you calm yet?\"" },
  { co: "Crumbly", fans: "Crumbly Eaters", feature: "Driver Snack Allowance", short: "fry integrity",
    headline: "Leaked memo: Crumbly delivery drivers officially allowed to eat \"up to 30%\" of your fries" },
  { co: "PawPal", fans: "Pet Parents", feature: "Bark-to-Text", short: "the translation outputs",
    headline: "PawPal's AI dog translator told 2 million owners their dogs are planning to unionize" },
  { co: "Nimbus Cloud", fans: "valued customers", feature: "Auto-Optimize", short: "the region-wide deletion",
    headline: "Nimbus Cloud deleted an entire data center region \"to save costs\" and didn't tell anyone" },
  { co: "Wristly", fans: "Wristly Movers", feature: "Health Insights", short: "the vital sign alerts",
    headline: "Wristly smartwatch informed 40,000 users that they were clinically deceased" },
  { co: "Brightside Bank", fans: "Brightsiders", feature: "Smart Round-Up", short: "the rounding update",
    headline: "Brightside Bank app update rounds every account balance to the nearest $0" },
  { co: "Moodboard", fans: "Moodboarders", feature: "Memories For You", short: "the feed changes",
    headline: "Moodboard's new algorithm only shows users posts from their exes" },
  { co: "Hearthly", fans: "Hearthly Family", feature: "Cozy Cabin™", short: "the scent profile",
    headline: "Hearthly's best-selling \"Cozy Cabin\" candle confirmed to smell exactly like a gas leak" },
  { co: "TurboTutor", fans: "Learners", feature: "Homework Helper", short: "the tutoring feedback loop",
    headline: "TurboTutor's AI has been doing students' homework, then reporting them for cheating" },
  { co: "Gigglebox", fans: "Gigglebox Subscribers", feature: "Pay-Per-Laugh", short: "the pricing update",
    headline: "Gigglebox raises prices for the 9th time this year, now charges per laugh" },
  { co: "Peak Fuel", fans: "Fuel Squad", feature: "Peak Fuel MAX", short: "the caffeine content",
    headline: "Peak Fuel energy drink contains more caffeine than scientists thought physically possible" },
  { co: "Hollo", fans: "riders", feature: "Autopilot", short: "the route preferences",
    headline: "Hollo self-driving cars have started refusing to drive anywhere \"that seems boring\"" },
  { co: "Snugg", fans: "Snugg Sleepers", feature: "SleepSync", short: "the album release",
    headline: "Snugg smart mattress quietly released users' snoring recordings as a lo-fi album" },
  { co: "Kindred HR", fans: "Kindred customers", feature: "Auto-Share", short: "the compensation transparency event",
    headline: "Kindred HR software posted every employee's salary in the all-company chat" },
  { co: "Sproutly", fans: "Plant Parents", feature: "Smart Care", short: "the watering guidance",
    headline: "Sproutly plant app has been telling users to water their cacti every hour" },
];

// s = sincerity, d = deflection, c = cringe. Traps are lines Legal will not approve (+time penalty, redacted).
window.SLOTS = [
  {
    key: "open", label: "Open the statement",
    options: [
      { t: "To our {fans},", s: 1, d: 0, c: 1 },
      { t: "Dear valued stakeholders,", s: 0, d: 1, c: 1 },
      { t: "Hey besties 💛", s: 0, d: 0, c: 3 },
      { t: "A note from the {co} team", s: 1, d: 1, c: 0 },
      { t: "To everyone who was impacted (allegedly),", s: 0, d: 2, c: 1 },
      { t: "Hi. It's us. Again.", s: 2, d: 0, c: 1 },
    ],
    traps: [
      { t: "To whoever leaked this,", why: "Do not address the leaker." },
      { t: "To the 6 people still defending us,", why: "Do not confirm the number." },
      { t: "Dear Judge,", why: "It's not court. Yet." },
    ],
  },
  {
    key: "ack", label: "Acknowledge (sort of)",
    options: [
      { t: "We've seen the conversation around {short}.", s: 1, d: 2, c: 0 },
      { t: "Mistakes were made.", s: 0, d: 3, c: 0 },
      { t: "We hear you. We see you. We are you.", s: 0, d: 1, c: 3 },
      { t: "Some of you may have experienced {short}.", s: 0, d: 3, c: 1 },
      { t: "We fell short of the values we wrote down at a 2019 offsite.", s: 2, d: 1, c: 1 },
      { t: "We take {short} incredibly seriously, as of this morning.", s: 1, d: 1, c: 1 },
      { t: "There's no excuse for what happened. Here is our excuse.", s: 1, d: 2, c: 2 },
    ],
    traps: [
      { t: "Yes, we did it on purpose. It was on the roadmap.", why: "Never confirm intent." },
      { t: "Honestly, we assumed nobody would check.", why: "Never admit we assumed anything." },
      { t: "Our internal emails say way worse, honestly.", why: "Those are literally discoverable." },
    ],
  },
  {
    key: "explain", label: "Explain (blame someone)",
    options: [
      { t: "This was caused by a third-party vendor we will not be naming.", s: 0, d: 3, c: 0 },
      { t: "A small number of employees acted outside our values.", s: 0, d: 3, c: 0 },
      { t: "{feature} did this on its own, and we've had a talk with it.", s: 0, d: 2, c: 2 },
      { t: "Mercury was in retrograde during sprint planning.", s: 0, d: 2, c: 3 },
      { t: "We moved fast and broke things, including {short}.", s: 2, d: 0, c: 1 },
      { t: "The intern responsible has been placed on a learning journey.", s: 0, d: 3, c: 1 },
      { t: "Like many of you, we were shocked to learn what we did.", s: 0, d: 2, c: 2 },
    ],
    traps: [
      { t: "The CEO approved it in a group chat called \"lol\".", why: "That group chat does not exist." },
      { t: "It made us $40M, so you do the math.", why: "Never do math in public." },
      { t: "We were warned 14 times. 15 if you count the fire.", why: "We were warned zero times." },
    ],
  },
  {
    key: "action", label: "Promise action (vaguely)",
    options: [
      { t: "We're launching an internal review led by people who report to us.", s: 1, d: 2, c: 0 },
      { t: "We've paused {feature} for now (48 hours).", s: 1, d: 1, c: 0 },
      { t: "We're taking a moment to reflect, as a brand.", s: 0, d: 1, c: 3 },
      { t: "We've formed a task force, a working group, and a vibe council.", s: 0, d: 1, c: 2 },
      { t: "We'll be donating an undisclosed amount to an unnamed cause.", s: 1, d: 2, c: 1 },
      { t: "Everyone affected gets a free 7-day trial of {co} Premium.", s: 0, d: 1, c: 3 },
      { t: "Our CEO will step down, effective eventually.", s: 1, d: 2, c: 1 },
    ],
    traps: [
      { t: "We will issue full refunds to everyone, no questions asked.", why: "Absolutely not." },
      { t: "We accept full liability. Lawyers, stand down.", why: "We will not be standing down." },
      { t: "Our CEO will testify under oath, live on Twitch.", why: "He will not." },
    ],
  },
  {
    key: "close", label: "Close it out",
    options: [
      { t: "This isn't who we are.", s: 1, d: 2, c: 0 },
      { t: "We're committed to doing better. Starting Q3.", s: 1, d: 1, c: 1 },
      { t: "We remain on a journey. 🌱", s: 0, d: 1, c: 3 },
      { t: "Thank you for holding us accountable. Replies are now limited.", s: 0, d: 2, c: 2 },
      { t: "Use code SORRY20 for 20% off.", s: 0, d: 0, c: 3 },
      { t: "We're so sorry. Truly. This is not a template.", s: 2, d: 0, c: 2 },
    ],
    traps: [
      { t: "Anyway, it will absolutely happen again.", why: "Never forecast." },
      { t: "Please stop emailing my mom.", why: "Leave the CEO's mom out of this." },
      { t: "This statement will self-delete in 24 hours.", why: "The internet is forever." },
    ],
  },
];

window.SCANDALS.push(
  { co: "Velvetine", fans: "Velvet Fam", feature: "SkinSync AI", short: "the shade matching",
    headline: "Velvetine's AI shade-matcher has been recommending the same beige to all 9 million users" },
  { co: "Nestful", fans: "Nestful Hosts", feature: "Instant Book", short: "the listing accuracy",
    headline: "Nestful \"beachfront villa\" listings revealed to be 400 photos of the same parking garage" },
  { co: "Quillo", fans: "Quillo Writers", feature: "Smart Compose", short: "the autocomplete behavior",
    headline: "Quillo's Smart Compose has been signing every email \"love you\" since Tuesday" },
  { co: "FitForge", fans: "Forgers", feature: "Rep Counter", short: "the rep counting",
    headline: "FitForge gym app has been counting each blink as a full push-up" },
  { co: "Breadly", fans: "Bread Heads", feature: "Artisan Line", short: "the artisanal process",
    headline: "Breadly's \"hand-crafted\" sourdough confirmed to be made by one very tired robot named Greg" },
  { co: "Orbitly", fans: "Orbiters", feature: "Space Tourism Lite", short: "the altitude situation",
    headline: "Orbitly's $250,000 space flights found to be a very tall elevator in Nevada" },
);

window.ESCALATIONS = [
  "{co} confirms this has been going on since 2019",
  "it was also happening in Canada",
  "leaked Slack shows the team called it \"Project Oopsie\"",
  "{co}'s CEO was spotted buying a yacht named \"Accountability\"",
  "an internal slide titled \"Should We Tell Them? (No)\" has surfaced",
  "{co} board says it learned about this from TikTok",
];

window.UPDATE_SLOT = {
  key: "update", label: "Address the UPDATE",
  options: [
    { t: "We're aware of new reports and are choosing to remain aware of them.", s: 0, d: 3, c: 1 },
    { t: "These reports lack important context, which we will not be providing.", s: 0, d: 3, c: 0 },
    { t: "Yes, there's more. There's always more.", s: 2, d: 0, c: 1 },
    { t: "Like a family, we are also learning about this from the news.", s: 0, d: 2, c: 2 },
    { t: "Our original statement remains accurate in spirit.", s: 0, d: 2, c: 1 },
    { t: "Please stop digging. We are begging you.", s: 1, d: 1, c: 2 },
  ],
  traps: [
    { t: "Honestly, that's not even the worst part.", why: "There is no worse part. Officially." },
    { t: "Wait until you hear about the other thing.", why: "There is no other thing." },
    { t: "The yacht is non-refundable, so.", why: "Do not mention the yacht." },
  ],
};

window.CEO_NAMES = ["Chad", "Brayden", "Tanner", "Kyle", "Bryce", "Skyler", "Trent", "Hunter"];
window.CEO_LINES = [
  "Personally, I think I'm the real victim here.",
  "Some of history's greatest leaders were also criticized. Just saying.",
  "I've been crying in my car. A nice car, but still.",
  "I'll be taking a short sabbatical in Bali to reflect. 🙏",
  "Also, I'm launching a podcast about resilience.",
  "To the haters: I read every reply. Every single one.",
  "Grateful for this learning moment. Agree?",
  "My lawyers told me not to write this, but I'm a disruptor.",
];

// Fake replies. Handles are invented.
window.HANDLES = [
  "normalguy_4471", "corpo_watcher99", "grandma_online", "pr_girlie_xo", "ratio_enjoyer", "lawprof_maybe",
  "anon_intern_22", "touchgrass_pls", "sentient_spreadsheet", "burner_burner_7", "quietquitter88", "lurker_since_09",
  "mid_manager_mike", "chronically_offline_not", "deleted_my_account_twice", "screenshot_archive_bot",
];
window.REPLIES = {
  waiting: [
    "{co} been real quiet since this dropped",
    "the notes app is warming up as we speak",
    "intern is typing… 👀",
    "any minute now we get the white-background screenshot",
    "{co} comms team right now: 🏃‍♂️🏃‍♀️🏃",
    "still nothing from {co}?? it's been SECONDS",
  ],
  trap: [
    "they forgot to delete the draft LMAOOO",
    "the black bars are doing a lot of heavy lifting",
    "legal team is speedrunning a resignation",
    "screenshotted before they edit it 📸",
    "what was under the black bar. WHAT WAS UNDER THE BLACK BAR",
    "most honest thing {co} has ever posted and it's redacted",
  ],
  d: [
    "\"mistakes were made\" by WHOM",
    "this apology was written by a fog machine",
    "passive voice so strong it's legally a wall",
    "not one verb in this is doing any work",
    "translation: we're sorry you noticed",
    "they apologized to the concept of an issue",
  ],
  c: [
    "who let the social media intern cook",
    "bestie this is a hostage situation",
    "deleting the app. reinstalling it just to delete it again",
    "{co} social team after typing this: 😌",
    "this reads like it was approved by a vibe council",
    "the emoji is doing hate crimes",
  ],
  s: [
    "wait… this is actually kind of decent??",
    "a human wrote this. someone check on them",
    "PR is going to fire whoever wrote this",
    "suspiciously sincere. what are they hiding",
    "ok i'll allow it. still unsubscribing",
  ],
  ceo: [
    "the CEO grabbing the phone mid-apology is cinema",
    "sir this is an apology",
    "he really said that in a crisis statement",
    "CEO didn't log out of the brand account again",
    "comms team watching him hit post: 🧍",
  ],
  update: [
    "oh it's getting WORSE worse",
    "the update to the update is coming, i can feel it",
    "{co} really said \"there's more\" huh",
  ],
};
