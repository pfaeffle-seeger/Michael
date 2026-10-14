# Recherche-Auftrag Runde 2: Zielkunden für EcoFlow PowerRock / Delta Pro Ultra (Branchenverzeichnis-Modus)

Produkt: mobile Akku-Großspeicher (leise, emissionsfrei) als Ersatz für Stromaggregate bei Veranstaltungen.

## Gesucht: ENDNUTZER, die die Geräte selbst einsetzen
Veranstaltungstechnik (Licht/Ton/Bühne/PA-Verleih, mobile Bühnen, DJ-/Eventtechnik, auch Kleinbetriebe), Eventagenturen mit eigener Produktion, Festival-/Open-Air-Veranstalter, Zeltverleih/Festzeltbetriebe, Bühnenbau, Event-Catering/Foodtrucks.

## NICHT aufnehmen
Händler/Shops/Distributoren (mögliche Vertriebspartner), Firmen die Powerstations/Akkuspeicher/Aggregate verkaufen oder Akkuspeicher vermieten, Hersteller, Portale, reine Hochzeitsplaner. Keine Firmen aus bestehend.txt (im selben Ordner – zuerst lesen!).

## Quelle: Branchenverzeichnisse sind ERLAUBT (Nutzer hat zugestimmt)
- Tools laden: ToolSearch "select:WebSearch". (WebFetch/curl sind blockiert – nicht versuchen.)
- Effizient: Suchen, die Verzeichnis-Listen mit MEHREREN Adressen liefern, z. B. "Veranstaltungstechnik Dortmund 11880", "Zeltverleih Münster gelbeseiten", "Veranstaltungstechnik Kreis Soest Adresse", allowed_domains z. B. ["11880.com","gelbeseiten.de","dasoertliche.de","cylex.de","werkenntdenbesten.de","firmenwissen.de","golocal.de","branchenbuch.meinestadt.de","northdata.de"]. Aus einem Ergebnis möglichst viele Firmen mit vollständiger Adresse übernehmen.
- Zuerst die für deine Region gelisteten ungeprüften Kandidaten aus kandidaten.txt (gleicher Ordner) abarbeiten.
- Nur vollständige Adressen (Straße + Hausnr., 5-stellige PLZ, Ort). Keine Postfächer. Bundesland passend zur PLZ. NICHTS aus dem Gedächtnis erfinden – nur was in Suchergebnissen steht.
- HARTES BUDGET: maximal so viele WebSearch-Aufrufe wie im Auftrag genannt. Danach sofort Datei schreiben und beenden. Das Budget wird mit anderen Agenten geteilt.

## Ausgabe
Mit dem Write-Tool in die genannte Datei, ohne Kopfzeile, Semikolon-getrennt, keine Semikolons in Feldern:
Firmenname;Straße Hausnr.;PLZ;Ort;Bundesland;Kategorie;Website (falls bekannt, sonst leer);Begründung (max. 10 Wörter);Hinweis
Hinweis: "Quelle: <Verzeichnisname>" bzw. "Quelle: eigene Website", plus ggf. Auffälligkeiten.
Antworte am Ende nur: Anzahl Zeilen (1 Satz).
