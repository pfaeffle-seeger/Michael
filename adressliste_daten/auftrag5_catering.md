# Recherche-Auftrag: EVENT-CATERING & FOODTRUCKS (Zielkunden EcoFlow PowerRock / Delta Pro Ultra)

Produkt: mobile Akku-Großspeicher (leise, emissionsfrei) – ersetzt Benzin-/Dieselaggregate an Foodtrucks, Verkaufsständen, mobilen Küchen, Kühlung, Kaffeebars bei Outdoor-Events, Märkten, Festivals, Firmenfeiern.

## Gesucht (ENDNUTZER, die selbst mobil vor Ort arbeiten)
- Foodtruck-Betreiber, Food-Trailer, Street-Food-Caterer
- Event-Caterer mit Outdoor-/Location-Catering (mobile Küche vor Ort)
- Mobile Kaffeebars/Barista-Mobile, Cocktail-/Getränkebars, Crêpes-/Waffel-/Eiswagen, Grill-/Spanferkel-Catering
- Street-Food-Markt-Veranstalter (z. B. Street-Food-Festivals, Foodtruck-Round-ups) – Kategorie dann "Foodtruck-/Streetfood-Veranstalter"

## Nicht aufnehmen
Reine Restaurants ohne Catering, Kantinen-/Betriebsgastronomie-Konzerne, Lieferdienste, Foodtruck-HERSTELLER/-Ausbauer und -Händler, Vermietplattformen/Vermittlungsportale (z. B. reine Buchungsportale), Bäckerei-Filialketten. Keine Einträge aus bestehend.txt (gleicher Ordner – zuerst lesen!).

## Quellen
- Tools: ToolSearch "select:WebSearch". WebFetch/curl blockiert – nicht versuchen.
- Branchenverzeichnisse erlaubt (11880, Gelbe Seiten, Das Örtliche, cylex, golocal, werkenntdenbesten, foodtruck-Verzeichnisse mit Impressumsangaben) und eigene Website. Quelle im Hinweis nennen.
- Effizient: Suchen, die Listen mit mehreren Adressen liefern, z. B. "Foodtruck Catering Stuttgart 11880", "Event Catering Heilbronn gelbeseiten", "Kaffeemobil mieten Köln Adresse".
- Nur vollständige Adressen (Straße+Nr., 5-stellige PLZ, Ort), keine Postfächer. Bundesland passend zur PLZ. NICHTS erfinden.
- HARTES BUDGET laut Auftrag; danach sofort Datei schreiben und beenden.

## Ausgabe
Write-Tool, genannte Datei, ohne Kopfzeile, Semikolon-getrennt, keine Semikolons in Feldern:
Name;Straße Hausnr.;PLZ;Ort;Bundesland;Kategorie;Website (falls bekannt);Begründung (max. 10 Wörter);Hinweis (Quelle + Auffälligkeiten)
Kategorie exakt eine von: "Foodtruck", "Event-Catering", "Mobile Bar/Kaffeemobil", "Foodtruck-/Streetfood-Veranstalter".
Antworte am Ende nur: Anzahl Zeilen (1 Satz).
