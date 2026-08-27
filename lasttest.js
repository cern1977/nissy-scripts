// Lasttest for NISSY-injiserte skript. Kjører hele modulkroppen i en DOM-stub.
//
// Hvorfor: `node --check` fanger BARE syntaks. Den ser ikke udefinerte variabler eller
// temporal-dead-zone-feil — begge slapp gjennom til drift 24.08.2026:
//   · BEHOV_PAAVIRKER_ADRESSE brukt, aldri deklarert  → ReferenceError ved skanning
//   · VIS_VEDTAK_KOLONNE leste CONFIG før deklarasjon → skriptet startet ikke i det hele tatt
//
//   node lasttest.js                          (tester overvaaker_avvik_dev.js)
//   node lasttest.js verktoykasse_dev.js      (eller en annen fil)
//
// «OK — skriptet initialiserte uten a kaste» betyr at modulkroppen kjørte gjennom.
// Feil ETTER den linjen kommer fra stubbens grenser (popup-vindu, nettverk) — sammenlign
// alltid med prod-fila: oppfører de seg likt, er det stubben og ikke koden.

const src = require("fs").readFileSync(process.argv[2] || "overvaker-avvik/overvaaker_avvik_dev.js", "utf8");
const noop = () => {};
function lagEl() {
  return new Proxy({
    style: {}, classList: { add: noop, remove: noop, contains: () => false },
    children: [], cells: [], options: [], innerHTML: "", textContent: "", value: "", id: "",
    appendChild: noop, addEventListener: noop, setAttribute: noop, getAttribute: () => null,
    remove: noop, querySelector: () => null, querySelectorAll: () => [],
    insertAdjacentHTML: noop, focus: noop, click: noop, contains: () => false,
  }, { get: (t, k) => (k in t ? t[k] : undefined) });
}
const el = lagEl();
const doc = {
  createElement: () => lagEl(), getElementById: () => null, querySelector: () => null,
  querySelectorAll: () => [], addEventListener: noop, body: el, head: el, cookie: "",
  documentElement: el, scripts: [], forms: [], title: "",
};
global.document = doc;
global.location = { hostname: "pastrans-sorost.mq.nhn.no", origin: "https://pastrans-sorost.mq.nhn.no", href: "", pathname: "/planlegging/" };
global.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
global.BroadcastChannel = function () { this.postMessage = noop; this.close = noop; this.onmessage = null; };
global.fetch = () => Promise.reject(new Error("ingen nett i test"));
global.crypto = { subtle: { digest: () => Promise.resolve(new ArrayBuffer(32)) } };
global.XMLHttpRequest = function () { this.open = noop; this.send = noop; this.setRequestHeader = noop; };
global.setInterval = () => 0; global.setTimeout = () => 0; global.clearTimeout = noop; global.clearInterval = noop;
global.addEventListener = noop; global.removeEventListener = noop;
global.open = () => null;
global.alert = noop; global.confirm = () => true; global.prompt = () => null;
global.navigator = { clipboard: {}, userAgent: "test" };
global.MutationObserver = function (cb) { this.observe = noop; this.disconnect = noop; this.takeRecords = () => []; };
global.window = global;
try { new Function(src)(); console.log("OK — skriptet initialiserte uten a kaste"); }
catch (e) { console.log("KASTET: " + e.constructor.name + ": " + e.message); process.exit(1); }
