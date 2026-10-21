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
    { id: "ksk", name: "KSK Kontokorrent", saldo: 697380.91, zins: 0.089, art: "kk", linie: 1000000,
      // Linie sinkt zum 30.05.2027 (Monat 8 nach September 2026) auf den eingestellten Wert
      linienStufe: { abMonat: 8 } },
    { id: "cbkk", name: "Commerzbank Kontokorrent", saldo: 437805.03, zins: 0.0829, art: "kk", linie: 500000,
      // Linie zum 30.09.2026 auf 500 T€ gesenkt, danach monatlich −15 T€ bis Mai 2027 (380 T€)
      linienAbbau: { rate: 15000, monate: 8 } },
    { id: "cb", name: "Commerzbank-Darlehen", saldo: 218750, zins: 0.0552, art: "quartal", rate: 31250 },
    { id: "kfw", name: "KfW-Darlehen 2020", saldo: 265625, zins: 0.03, art: "quartal", rate: 15625, sonder: true },
    { id: "mb", name: "Mercedes-Benz Bank", saldo: 66676.4, zins: 0.049, art: "monat", rate: 1500 },
    { id: "ml", name: "Mietkauf Dt. Leasing", saldo: 44841.15, zins: 0.059, art: "monat", rate: 700 },
    // Nachrangdarlehen der GbR: tilgungsfrei, Rückführung erst nach allen anderen Krediten
    { id: "nr", name: "Nachrangdarlehen GbR", saldo: 0, zins: 0.05, art: "nachrang" },
    // PayPal-Finanzierung zur Refinanzierung der Kontokorrente: Auszahlung, dann gleiche Monatsraten
    { id: "pp", name: "PayPal-Finanzierung", saldo: 0, zins: 0.12, art: "paypal", rate: 0 },
  ],
  // Working Capital 30.09.2026 vs. Eröffnungswerte (EB) 01.01.2026
  wc: {
    vorraete: { ist: 2352191.24, eb: 2210734.9 }, // Waren + geleistete Anzahlungen
    forderungen: { ist: 473491.12, eb: 341708.01 },
    lieferanten: { ist: 553411.01, eb: 167120.71 },
  },
  verrechnung: { saldo: 245000, rate: 8000 },
};

// Konditionen aifinyo Finetrading (zzgl. USt, als Vorsteuer abziehbar)
const AIFINYO = {
  marge: { 3: 0.0299, 6: 0.0399, 9: 0.0499, 12: 0.0599 }, // Handelsmarge auf den Wareneinkauf
  transaktion: 39, // € je Einkaufstransaktion
  einrichtung: 0.0195, // einmalig auf die Einkaufslinie
  bereitstellung: (linie) => (linie >= 500000 ? 269 : linie >= 100000 ? 149 : linie > 30000 ? 89 : 49), // € pro Monat
  vertragMonate: 24,
};
// effektiver Jahressatz: Marge bezogen auf die durchschnittliche Kapitalbindung von (n+1)/2 Monaten
const aifinyoEffektiv = (n) => (AIFINYO.marge[n] / ((n + 1) / 2)) * 12;

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
  // Warenfinanzierung aifinyo (Finetrading, Fact Sheet 04/2024): aifinyo bezahlt den Lieferanten,
  // Rückführung in gleichen Monatsraten über die Laufzeit, frei werdende Linie revolvierend nutzbar
  verrAktiv: true, // Rückführung Verrechnungskonto GbR (245 T€)
  verrRate: 8000, // pro Monat
  verrStart: "2026-11",
  einlageJahr: 50000, // Mittelzufluss der Gesellschafter nach Ende der GbR-Rückführung, bis die GmbH schuldenfrei ist
  paypalAktiv: true,
  paypalBetrag: 300000,
  paypalLaufzeit: 10, // Monate
  paypalZins: 0.12,
  paypalStart: "2026-11",
  nachrangAktiv: true,
  nachrangBetrag: 500000,
  nachrangZins: 0.05,
  nachrangStart: "2027-01",
  // Rückführung Nachrangdarlehen: "nachKK" ab dem Monat, ab dem beide Kontokorrente dauerhaft auf null sind,
  // "sofort" aus jedem Überschuss, sobald die Kontokorrente auf null sind, "zuletzt" erst nach allen anderen Krediten
  nachrangRueckfuehrung: "nachKK",
  kskLinieNeu: 500000, // KSK-Linie ab 30.05.2027
  aifinyoAktiv: true,
  aifinyoRahmen: 800000,
  aifinyoLaufzeit: 6, // Monate bzw. Monatsraten (180 Tage)
  aifinyoModus: "fest", // "fest": gleichmäßig genutzter Anteil der Linie, "bedarf": nur so viel, dass die Kontokorrente auf null bleiben
  aifinyoAuslastung: 1.0, // Anteil der Einkaufslinie, der laufend genutzt wird (Modus "fest")
  aifinyoStart: "2026-11",
  aifinyoDauer: 24, // Monate mit neuen Finanzierungen (Vertragslaufzeit 24 Monate)
  aifinyoRechnungen: 20, // finanzierte Lieferantenrechnungen pro Monat
  q4Anteil: 0.28,
  bisJahr: 2036,
};

function simuliere(p) {
  const d = BASIS.darlehen.map((x) => ({ ...x }));
  const by = Object.fromEntries(d.map((x) => [x.id, x]));
  by.nr.zins = p.nachrangZins;
  const [nrJ, nrM] = String(p.nachrangStart || "2027-01").split("-").map(Number);
  const nrIdx = (nrJ - 2026) * 12 + nrM - 10;
  by.pp.zins = p.paypalZins;
  const [vJ, vM] = String(p.verrStart || "2026-11").split("-").map(Number);
  const verrStartIdx = (vJ - 2026) * 12 + vM - 10;
  const [ppJ, ppM] = String(p.paypalStart || "2026-11").split("-").map(Number);
  const ppIdx = (ppJ - 2026) * 12 + ppM - 10;
  // Für "nachKK": den Monat suchen, ab dem die Kontokorrente dauerhaft auf null bleiben. Erst ohne Rückführung
  // rechnen; zieht die GmbH danach doch wieder Kontokorrent, den Beginn entsprechend nach hinten schieben.
  if (p.nachrangAktiv && p.nachrangRueckfuehrung === "nachKK" && p._nrRueckAb === undefined) {
    // Kontokorrent und aifinyo zählen hier gemeinsam als kurzfristige Finanzierung
    const kkIdx = (r) => (r.kkAifFrei ? r.monate.indexOf(r.kkAifFrei) : Infinity);
    let ab = kkIdx(simuliere({ ...p, nachrangRueckfuehrung: "nie" }));
    let r = simuliere({ ...p, _nrRueckAb: ab });
    for (let i = 0; i < 5 && kkIdx(r) > ab; i++) {
      ab = kkIdx(r);
      r = simuliere({ ...p, _nrRueckAb: ab });
    }
    return r;
  }
  let guthaben = 0;
  let verrechnung = BASIS.verrechnung.saldo;
  const steuerVz2026 = BASIS.ytd.steuern / 9;
  const ebtJahr = { 2026: BASIS.ytd.ebt };
  const steuerVorausJahr = { 2026: BASIS.ytd.steuern };
  const steuerSoll = {};
  const monate = [];
  let linieUeberschritten = null;
  let unterdeckungMax = null;
  let freiraumMin = null;

  // Umsatz 2026 Q4 aus Jahresziel
  const umsatz2026 = p.umsatz2026;
  const q4_2026 = Math.max(0, umsatz2026 - BASIS.ytd.umsatz);
  const umsatzJahr = { 2026: umsatz2026 };

  let lagerAbgebaut = 0;
  const [aifStartJ, aifStartM] = String(p.aifinyoStart || "2026-11").split("-").map(Number);
  const aifStartIdx = (aifStartJ - 2026) * 12 + aifStartM - 10;
  const aifN = p.aifinyoLaufzeit;
  const aifMarge = AIFINYO.marge[aifN];
  const aifNeu = []; // neu finanzierte Einkäufe je Monat
  let aifSaldo = 0;
  let aifKosten = 0;
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

    // aifinyo: fällige Raten früherer Einkäufe, neuer finanzierter Einkauf, Kosten
    const idx = aifNeu.length;
    const aktivMonat = p.aifinyoAktiv && idx >= aifStartIdx && idx < aifStartIdx + p.aifinyoDauer;
    let aifRueck = 0, aifGebuehr = 0;
    for (let k = Math.max(0, idx - aifN); k < idx; k++) {
      aifRueck += aifNeu[k] / aifN;
      aifGebuehr += (aifNeu[k] * aifMarge) / aifN;
    }
    const aifZiel = (p.aifinyoRahmen * p.aifinyoAuslastung) / ((aifN + 1) / 2);
    // höchstens der Wareneinkauf des Monats kann über aifinyo laufen
    const wareneinkauf = umsatz * (1 - p.rohertrag);
    aifSaldo -= aifRueck;
    const bedarfsModus = p.aifinyoModus === "bedarf";
    let aifZugang = aktivMonat && !bedarfsModus ? Math.max(0, Math.min(aifZiel, wareneinkauf, p.aifinyoRahmen - aifSaldo)) : 0;
    if (p.aifinyoAktiv && idx >= aifStartIdx) {
      if (idx === aifStartIdx) aifGebuehr += p.aifinyoRahmen * AIFINYO.einrichtung;
      if (idx < aifStartIdx + Math.max(AIFINYO.vertragMonate, p.aifinyoDauer)) aifGebuehr += AIFINYO.bereitstellung(p.aifinyoRahmen);
      if (aifZugang > 0) aifGebuehr += AIFINYO.transaktion * p.aifinyoRechnungen;
    }
    aifKosten += aifGebuehr;
    zinsen += aifGebuehr;
    let ebt = rohertrag + p.sonstErtragMonat - fix - varK - p.afaMonat - zinsen;
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

    // Monatliche Rückführung des Verrechnungskontos durch die GbR (Beginn und Betrag einstellbar)
    const verrAktivMonat = p.verrAktiv && idx >= verrStartIdx;
    const rueckVerr = verrAktivMonat ? Math.min(p.verrRate, verrechnung) : 0;
    verrechnung -= rueckVerr;
    // Einlage ab Mai 2029 (ursprünglich im Anschluss an die Rückführung), solange noch Bankschulden bestehen
    const schuldenVorher = d.reduce((s, x) => s + x.saldo, 0) + aifSaldo - by.nr.saldo;
    const einlage = idx >= 31 && schuldenVorher > guthaben + 1 ? p.einlageJahr / 12 : 0;
    const invest = p.investJahr / 12;

    const ausschuettung = p.ausschuettungJahr / 12;

    // Planmäßige Tilgungen
    let tilgung = 0;
    const quartal = m % 3 === 0;
    for (const x of d) {
      let t = 0;
      if (x.art === "quartal" && quartal) t = Math.min(x.rate, x.saldo);
      if (x.art === "monat" || x.art === "paypal") t = Math.min(x.rate, x.saldo);
      x.saldo -= t;
      tilgung += t;
    }

    // Auszahlung Nachrangdarlehen
    const nrZugang = p.nachrangAktiv && idx === nrIdx ? p.nachrangBetrag : 0;
    by.nr.saldo += nrZugang;
    // Auszahlung PayPal-Finanzierung, Tilgung ab dem Folgemonat in gleichen Raten
    const ppZugang = p.paypalAktiv && idx === ppIdx ? p.paypalBetrag : 0;
    if (ppZugang) {
      by.pp.saldo += ppZugang;
      by.pp.rate = ppZugang / p.paypalLaufzeit;
    }

    const cfOperativ = ebt + p.afaMonat - steuer + wc;
    let freierCf = cfOperativ - invest - ausschuettung + rueckVerr + einlage - tilgung - aifRueck + nrZugang + ppZugang;
    // Modus "bedarf": nur so viel Wareneinkauf über aifinyo finanzieren, dass die Kontokorrente auf null bleiben
    if (aktivMonat && bedarfsModus) {
      const bedarf = by.ksk.saldo + by.cbkk.saldo - guthaben - freierCf + AIFINYO.transaktion * p.aifinyoRechnungen;
      aifZugang = Math.max(0, Math.min(bedarf, wareneinkauf, p.aifinyoRahmen - aifSaldo));
      if (aifZugang > 0) {
        const tx = AIFINYO.transaktion * p.aifinyoRechnungen;
        aifGebuehr += tx; aifKosten += tx; zinsen += tx; ebt -= tx; ebtJahr[jahr] -= tx; freierCf -= tx;
      }
    }
    aifNeu.push(aifZugang);
    aifSaldo += aifZugang;
    freierCf += aifZugang;

    // aktuelle Kreditlinien
    const n = (jahr - 2026) * 12 + m - 9;
    for (const x of d) if (x.linienAbbau) x.linieAktuell = x.linie - x.linienAbbau.rate * Math.min(n, x.linienAbbau.monate);
    by.ksk.linieAktuell = n >= by.ksk.linienStufe.abMonat ? p.kskLinieNeu : by.ksk.linie;

    // Überschuss/Fehlbetrag über Kontokorrent ausgleichen (teuerste Linie zuerst zurückführen)
    let rest = freierCf;
    if (rest >= 0) {
      for (const id of ["ksk", "cbkk"]) {
        const t = Math.min(rest, by[id].saldo);
        by[id].saldo -= t;
        rest -= t;
      }
      // Nachrangdarlehen aus dem Cashflow zurückführen, der nach Bedienung allen Fremdkapitals
      // (planmäßige Raten, aifinyo, Kontokorrente auf null) übrig bleibt
      const andere = by.cb.saldo + by.kfw.saldo + by.mb.saldo + by.ml.saldo + aifSaldo;
      const nrFrei =
        p.nachrangRueckfuehrung === "zuletzt" ? andere < 1 && !aktivMonat :
        p.nachrangRueckfuehrung === "nachKK" ? idx >= p._nrRueckAb :
        p.nachrangRueckfuehrung !== "nie";
      if (rest > 0 && by.nr.saldo > 0 && nrFrei) {
        const t = Math.min(rest, by.nr.saldo);
        by.nr.saldo -= t;
        rest -= t;
      }
      // bei "nachKK" auch ein bis dahin angespartes Guthaben in das Nachrangdarlehen geben
      if (p.nachrangRueckfuehrung === "nachKK" && nrFrei && guthaben > 0 && by.nr.saldo > 0) {
        const t = Math.min(guthaben, by.nr.saldo);
        by.nr.saldo -= t;
        guthaben -= t;
      }
      if (rest > 0 && p.sondertilgungKfw && by.kfw.saldo > 0 && aifSaldo < 1 && !aktivMonat) {
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
    const linien = by.ksk.linieAktuell + by.cbkk.linieAktuell;
    const freiraum = linien - by.ksk.saldo - by.cbkk.saldo;
    if (freiraum < -0.5 && !linieUeberschritten) linieUeberschritten = `${String(m).padStart(2, "0")}/${jahr}`;

    const kk = by.ksk.saldo + by.cbkk.saldo;
    // Fremdkapital ohne Nachrangdarlehen; das Nachrangdarlehen wird separat ausgewiesen
    const fk = d.reduce((s, x) => s + x.saldo, 0) - by.nr.saldo + aifSaldo;
    monate.push({
      jahr, m, umsatz, rohertrag, ebt, zinsen, aifGebuehr, aifZugang, aifRueck, steuer, wc, tilgung, freierCf, rueckVerr, einlage,
      salden: { ...Object.fromEntries(d.map((x) => [x.id, x.saldo])), aif: aifSaldo },
      kk, fk, bankFk: fk, nachrang: by.nr.saldo, guthaben, netto: fk - guthaben, linien, freiraum, nrZugang, ppZugang,
    });
    if (!freiraumMin || freiraum < freiraumMin.freiraum) freiraumMin = monate[monate.length - 1];
    if (freiraum < -0.5 && (!unterdeckungMax || freiraum < unterdeckungMax.freiraum)) unterdeckungMax = monate[monate.length - 1];
    if (jahr === 2026 && m === 12) steuerSoll[2026] = Math.max(0, ebtJahr[2026]) * p.steuersatz;
    if (m === 12 && jahr > 2026) steuerSoll[jahr] = Math.max(0, ebtJahr[jahr]) * p.steuersatz;
  }

  // Meilenstein = erster Monat, ab dem die Bedingung dauerhaft erfüllt ist
  const find = (f) => {
    let i = monate.length;
    while (i > 0 && f(monate[i - 1])) i--;
    return i < monate.length ? monate[i] : null;
  };
  return {
    monate,
    umsatzJahr,
    ebtJahr,
    kkFrei: find((x) => x.kk < 1),
    kkAifFrei: find((x) => x.kk + x.salden.aif < 1),
    schuldenfrei: find((x) => x.fk < 1),
    nettoFrei: find((x) => x.netto < 1),
    bankFrei: find((x) => x.bankFk - x.guthaben < 1),
    gesamtFrei: find((x) => x.fk + x.nachrang - x.guthaben < 1),
    nrFrei: find((x) => x.salden.nr < 1),
    linieUeberschritten,
    unterdeckungMax,
    unterdeckungMonate: monate.filter((x) => x.freiraum < -0.5).length,
    freiraumMin,
    aifKosten,
    aifSpitze: monate.reduce((a, x) => Math.max(a, x.salden.aif), 0),
    kkSpitze: monate.reduce((a, x) => (x.kk > a.kk ? x : a), monate[0]),
  };
}

if (typeof module !== "undefined") module.exports = { BASIS, SZENARIEN, STANDARD, AIFINYO, aifinyoEffektiv, simuliere };
