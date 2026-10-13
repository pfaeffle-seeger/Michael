// Liquiditäts- und Entschuldungsmodell Albert Pfäffle GmbH
// Startpunkt: Salden 30.09.2026 (SuSa/Bankenspiegel), Ertragsbasis: BWA Jan–Sep 2026.
// Simuliert monatlich ab Oktober 2026. Alle Beträge in EUR.

const BASIS = {
  start: { jahr: 2026, monat: 9 }, // letzter Ist-Monat (September)
  ytd: {
    // BWA Jan–Sep 2026
    umsatz: 5599831.37,
    rohertrag: 2117618.36,
    soErloese: 48141.19,
    kostenOhneAfa: 1938477.28 - 65132.59,
    kostenWarenabgabe: 206675.35,
    afa: 65132.59,
    zinsaufwand: 92245.09,
    neutralErtrag: 38867.34,
    neutralAufwandSonst: 210.0,
    ebt: 173694.52,
    steuern: 26085.18,
    umsatzVj: 4651114.46,
  },
  // Verschuldung 30.09.2026
  darlehen: [
    { id: "ksk", name: "KSK Kontokorrent", saldo: 697380.91, zins: 0.089, art: "kk", linie: 1000000 },
    { id: "cbkk", name: "Commerzbank Kontokorrent", saldo: 437805.03, zins: 0.0829, art: "kk", linie: 500000,
      // Linie zum 30.09.2026 auf 500 T€ gesenkt, danach monatlich −15 T€ bis Mai 2027 (380 T€)
      linienAbbau: { rate: 15000, monate: 8 } },
    { id: "cb", name: "Commerzbank-Darlehen", saldo: 218750, zins: 0.0552, art: "quartal", rate: 31250 },
    { id: "kfw", name: "KfW-Darlehen 2020", saldo: 265625, zins: 0.03, art: "quartal", rate: 15625, sonder: true },
    { id: "mb", name: "Mercedes-Benz Bank", saldo: 66676.4, zins: 0.049, art: "monat", rate: 1500 },
    { id: "ml", name: "Mietkauf Dt. Leasing", saldo: 44841.15, zins: 0.059, art: "monat", rate: 700 },
  ],
  // Working Capital 30.09.2026 vs. Eröffnungswerte (EB) 01.01.2026
  wc: {
    vorraete: { ist: 2352191.24, eb: 2210734.9 }, // Waren + geleistete Anzahlungen
    forderungen: { ist: 473491.12, eb: 341708.01 },
    lieferanten: { ist: 553411.01, eb: 167120.71 },
  },
  verrechnung: { saldo: 245000, rate: 8000 },
};

const SZENARIEN = {
  vorsichtig: { label: "Vorsichtig", wachstum: 0.01, rohertrag: 0.373, kostenSteigerung: 0.025 },
  realistisch: { label: "Realistisch", wachstum: 0.02, rohertrag: 0.378, kostenSteigerung: 0.025 },
  optimistisch: { label: "Optimistisch", wachstum: 0.03, rohertrag: 0.383, kostenSteigerung: 0.02 },
};

const STANDARD = {
  umsatz2026: 7300000, // Erwartung Geschäftsführung (Jan–Sep Ist: 5,60 Mio. €)
  fixSenkung: 85000, // geplanter Rückgang der Fixkosten ab 2027 (p. a.)
  rohertragPlus: 50000, // geplante Rohertragssteigerung ab 2027 (p. a., zusätzlich zur Quote)
  fixkostenMonat: (BASIS.ytd.kostenOhneAfa - BASIS.ytd.kostenWarenabgabe) / 9,
  varKostenQuote: BASIS.ytd.kostenWarenabgabe / BASIS.ytd.umsatz,
  sonstErtragMonat: (BASIS.ytd.soErloese + BASIS.ytd.neutralErtrag - BASIS.ytd.neutralAufwandSonst) / 9,
  afaMonat: 7000,
  steuersatz: 0.3,
  investJahr: 0,
  ausschuettungJahr: 0,
  lagerAbbauJahr: 0, // zusätzlicher Lagerabbau ab 2027
  lagerAbbauMax: 0,
  lieferantenZiel: BASIS.wc.lieferanten.eb,
  forderungenZiel: BASIS.wc.forderungen.eb,
  vorraeteZiel: BASIS.wc.vorraete.eb,
  sondertilgungKfw: true,
  q4Anteil: 0.28,
  bisJahr: 2036,
};

function simuliere(p) {
  const d = BASIS.darlehen.map((x) => ({ ...x }));
  const by = Object.fromEntries(d.map((x) => [x.id, x]));
  let guthaben = 0;
  let verrechnung = BASIS.verrechnung.saldo;
  const steuerVz2026 = BASIS.ytd.steuern / 9;
  const ebtJahr = { 2026: BASIS.ytd.ebt };
  const steuerVorausJahr = { 2026: BASIS.ytd.steuern };
  const steuerSoll = {};
  const monate = [];
  let linieUeberschritten = null;
  let freiraumMin = null;

  // Umsatz 2026 Q4 aus Jahresziel
  const umsatz2026 = p.umsatz2026;
  const q4_2026 = Math.max(0, umsatz2026 - BASIS.ytd.umsatz);
  const umsatzJahr = { 2026: umsatz2026 };

  let lagerAbgebaut = 0;
  for (let jahr = 2026, m = 10; jahr <= p.bisJahr; m === 12 ? (jahr++, (m = 1)) : m++) {
    if (!umsatzJahr[jahr]) umsatzJahr[jahr] = umsatzJahr[jahr - 1] * (1 + p.wachstum);
    const jIdx = jahr - 2026;
    const umsatz =
      jahr === 2026 ? q4_2026 / 3 : m >= 10 ? (umsatzJahr[jahr] * p.q4Anteil) / 3 : (umsatzJahr[jahr] * (1 - p.q4Anteil)) / 9;

    // Ergebnis
    const rohertrag = umsatz * p.rohertrag + (jahr >= 2027 ? p.rohertragPlus / 12 : 0);
    const fix = (p.fixkostenMonat - (jahr >= 2027 ? p.fixSenkung / 12 : 0)) * Math.pow(1 + p.kostenSteigerung, jIdx);
    const varK = umsatz * p.varKostenQuote;
    let zinsen = 0;
    for (const x of d) zinsen += (x.saldo * x.zins) / 12;
    const ebt = rohertrag + p.sonstErtragMonat - fix - varK - p.afaMonat - zinsen;
    ebtJahr[jahr] = (ebtJahr[jahr] || 0) + ebt;

    // Steuern: Vorauszahlungen auf Basis Vorjahr, Abschlusszahlung im September des Folgejahres
    let steuer = jahr === 2026 ? steuerVz2026 : (steuerSoll[jahr - 1] || 0) / 12;
    steuerVorausJahr[jahr] = (steuerVorausJahr[jahr] || 0) + steuer;
    if (m === 9 && jahr > 2026) steuer += (steuerSoll[jahr - 1] || 0) - (steuerVorausJahr[jahr - 1] || 0);

    // Working Capital
    let wc = 0;
    if (jahr === 2026) {
      const w = BASIS.wc;
      wc += (w.vorraete.ist - p.vorraeteZiel) / 3;
      wc += (w.forderungen.ist - p.forderungenZiel) / 3;
      wc -= (w.lieferanten.ist - p.lieferantenZiel) / 3;
    } else if (p.lagerAbbauJahr > 0 && lagerAbgebaut < p.lagerAbbauMax) {
      const x = Math.min(p.lagerAbbauJahr / 12, p.lagerAbbauMax - lagerAbgebaut);
      lagerAbgebaut += x;
      wc += x;
    }

    const rueckVerr = Math.min(BASIS.verrechnung.rate, verrechnung);
    verrechnung -= rueckVerr;
    const invest = p.investJahr / 12;
    const ausschuettung = p.ausschuettungJahr / 12;

    // Planmäßige Tilgungen
    let tilgung = 0;
    const quartal = m % 3 === 0;
    for (const x of d) {
      let t = 0;
      if (x.art === "quartal" && quartal) t = Math.min(x.rate, x.saldo);
      if (x.art === "monat") t = Math.min(x.rate, x.saldo);
      x.saldo -= t;
      tilgung += t;
    }

    const cfOperativ = ebt + p.afaMonat - steuer + wc;
    const freierCf = cfOperativ - invest - ausschuettung + rueckVerr - tilgung;

    // aktuelle Kreditlinien
    const n = (jahr - 2026) * 12 + m - 9;
    for (const x of d) if (x.linienAbbau) x.linieAktuell = x.linie - x.linienAbbau.rate * Math.min(n, x.linienAbbau.monate);
    by.ksk.linieAktuell = by.ksk.linie;

    // Überschuss/Fehlbetrag über Kontokorrent ausgleichen (teuerste Linie zuerst zurückführen)
    let rest = freierCf;
    if (rest >= 0) {
      for (const id of ["ksk", "cbkk"]) {
        const t = Math.min(rest, by[id].saldo);
        by[id].saldo -= t;
        rest -= t;
      }
      if (rest > 0 && p.sondertilgungKfw && by.kfw.saldo > 0) {
        const t = Math.min(rest, by.kfw.saldo);
        by.kfw.saldo -= t;
        rest -= t;
      }
      guthaben += rest;
    } else {
      let bedarf = -rest;
      const g = Math.min(guthaben, bedarf);
      guthaben -= g;
      bedarf -= g;
      // günstigere Linie (Commerzbank) zuerst ziehen
      for (const id of ["cbkk", "ksk"]) {
        const frei = Math.max(0, by[id].linieAktuell - by[id].saldo);
        const t = id === "ksk" ? bedarf : Math.min(bedarf, frei);
        by[id].saldo += t;
        bedarf -= t;
      }
    }
    // Absenkung der Commerzbank-Linie: Überhang muss über die KSK-Linie finanziert werden
    if (by.cbkk.saldo > by.cbkk.linieAktuell) {
      by.ksk.saldo += by.cbkk.saldo - by.cbkk.linieAktuell;
      by.cbkk.saldo = by.cbkk.linieAktuell;
    }
    if (by.ksk.saldo > by.ksk.linie + 0.5 && !linieUeberschritten) linieUeberschritten = `${String(m).padStart(2, "0")}/${jahr}`;
    const linien = by.ksk.linieAktuell + by.cbkk.linieAktuell;
    const freiraum = linien - by.ksk.saldo - by.cbkk.saldo;

    const kk = by.ksk.saldo + by.cbkk.saldo;
    const fk = d.reduce((s, x) => s + x.saldo, 0);
    monate.push({
      jahr, m, umsatz, rohertrag, ebt, zinsen, steuer, wc, tilgung, freierCf, rueckVerr,
      salden: Object.fromEntries(d.map((x) => [x.id, x.saldo])),
      kk, fk, guthaben, netto: fk - guthaben, linien, freiraum,
    });
    if (!freiraumMin || freiraum < freiraumMin.freiraum) freiraumMin = monate[monate.length - 1];
    if (jahr === 2026 && m === 12) steuerSoll[2026] = Math.max(0, ebtJahr[2026]) * p.steuersatz;
    if (m === 12 && jahr > 2026) steuerSoll[jahr] = Math.max(0, ebtJahr[jahr]) * p.steuersatz;
  }

  const find = (f) => monate.find(f) || null;
  return {
    monate,
    umsatzJahr,
    ebtJahr,
    kkFrei: find((x) => x.kk < 1),
    schuldenfrei: find((x) => x.fk < 1),
    nettoFrei: find((x) => x.netto < 1),
    linieUeberschritten,
    freiraumMin,
    kkSpitze: monate.reduce((a, x) => (x.kk > a.kk ? x : a), monate[0]),
  };
}

if (typeof module !== "undefined") module.exports = { BASIS, SZENARIEN, STANDARD, simuliere };
