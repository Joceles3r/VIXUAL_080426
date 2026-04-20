/**
 * Generates "VIXUAL_Formules_Repartitions_V2.odt" as a flat ODT (FODT) file.
 * FODT is a single-file XML format natively openable by LibreOffice, Google Docs, and MS Word.
 *
 * Covers the 6 active profiles:
 *   Creators: Porteur, Infoporteur, Podcaster
 *   Investors: Contributeur, Contribu-lecteur, Auditeur (Listener)
 *
 * Excludes: VSLS and Petites Annonces (not in VIXUAL V1).
 */

import { writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";


const today = new Date().toISOString().split("T")[0];

// ── Helper: escape XML ──
function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Helper: paragraph ──
function p(text, style = "Standard") {
  return `<text:p text:style-name="${style}">${esc(text)}</text:p>`;
}

function heading(text, level = 1) {
  return `<text:h text:style-name="Heading_20_${level}" text:outline-level="${level}">${esc(text)}</text:h>`;
}

function bold(text) {
  return `<text:p text:style-name="Standard"><text:span text:style-name="Bold">${esc(text)}</text:span></text:p>`;
}

function bullet(text) {
  return `<text:list-item><text:p text:style-name="List_20_Bullet">${esc(text)}</text:p></text:list-item>`;
}

function bulletList(items) {
  return `<text:list text:style-name="List_20_1">${items.map(bullet).join("\n")}</text:list>`;
}

function tableRow(cells, header = false) {
  const tag = header ? "table:table-header-rows" : "";
  const cellStyle = header ? "TableHeader" : "TableCell";
  const row = cells
    .map(
      (c) =>
        `<table:table-cell table:style-name="${cellStyle}" office:value-type="string"><text:p text:style-name="Table_20_Contents">${esc(String(c))}</text:p></table:table-cell>`
    )
    .join("");
  if (header) {
    return `<table:table-header-rows><table:table-row>${row}</table:table-row></table:table-header-rows>`;
  }
  return `<table:table-row>${row}</table:table-row>`;
}

function table(name, headers, rows) {
  const cols = headers.length;
  const colDefs = Array.from({ length: cols }, () => `<table:table-column/>`).join("");
  const headerRow = tableRow(headers, true);
  const bodyRows = rows.map((r) => tableRow(r)).join("\n");
  return `<table:table table:name="${esc(name)}" table:style-name="TableStyle">
${colDefs}
${headerRow}
${bodyRows}
</table:table>`;
}

function spacer() {
  return `<text:p text:style-name="Standard"/>`;
}

// ── Build document body ──
const body = [];

// ═══════════════════════════════════════════════
// TITLE
// ═══════════════════════════════════════════════
body.push(heading("VIXUAL - Formules Mathematiques et Repartitions des Gains", 1));
body.push(p(`Version V2 - ${today}`));
body.push(p('Plateforme : VIXUAL - "Regarde-Participe-Gagne"'));
body.push(p("Reference interne : 100 VIXUpoints = 1 EUR"));
body.push(p("Hors VSLS et Petites Annonces (non deployes en V1)"));
body.push(spacer());

// ═══════════════════════════════════════════════
// SOMMAIRE
// ═══════════════════════════════════════════════
body.push(heading("SOMMAIRE", 1));
body.push(bulletList([
  "1. Les 8 Profils VIXUAL",
  "2. Bareme Commun Investisseurs (EUR -> Votes)",
  "3. VIXUpoints - Bareme Fidelite et Conversion",
  "4. Cautions",
  "5. Films / Videos / Documentaires - Cloture 40/30/7/23",
"6. Voix de l'Info - Vente 70/30 + Pot mensuel 60/40",
  "7. Livres - Vente 70/30 + Pot mensuel 60/40",
  "8. Podcasts - Vente 70/30 + Pot mensuel 40/30/20/10",
  "9. Quotas Createurs (mise en ligne Bunny.net)",
  "10. Coefficient d'Engagement et Classement TOP 10",
  "11. Regles Transverses (Arrondis, Anti-Fraude, RGPD)",
  "12. API & Settlement (Reference Technique)",
  "13. Check-list Deploiement",
]));
body.push(spacer());

// ═══════════════════════════════════════════════
// 1. LES 8 PROFILS
// ═══════════════════════════════════════════════
body.push(heading("1. Les 8 Profils VIXUAL", 1));
body.push(p("VIXUAL compte 8 profils : 1 Invite (non inscrit) + 7 inscrits (Visiteur, Porteur, Infoporteur, Podcasteur, Contributeur, Contribu-lecteur, Auditeur). Repartis en deux familles :"));
body.push(spacer());

body.push(heading("Createurs (mettent un projet en ligne)", 2));
body.push(table("ProfilsCreateurs",
  ["Profil", "Identifiant systeme", "Categorie de contenu", "Caution", "Revenu principal"],
  [
    ["Porteur", "porter", "Films / Videos / Documentaires", "10 EUR", "30% du pot (TOP 10) + Ventes"],
    ["Infoporteur", "infoporter", "Voix de l'Info (articles) + Livres", "10 EUR", "70% vente unitaire + 60% du pot (TOP 10)"],
    ["Podcaster (Podcasteur)", "podcaster", "Podcasts (episodes audio)", "10 EUR", "70% vente episode + 40% du pot mensuel"],
  ]
));
body.push(spacer());

body.push(heading("Investisseurs (investissent dans un projet)", 2));
body.push(table("ProfilsInvestisseurs",
  ["Profil", "Identifiant systeme", "Categorie d'investissement", "Caution", "Revenu principal"],
  [
    ["Investisseur", "investor", "Films / Videos / Documentaires", "20 EUR", "40% du pot (TOP 10) + 7% (rangs 11-100)"],
    ["Investi-lecteur", "investireader", "Voix de l'Info + Livres", "20 EUR", "40% du pot (Lecteurs / Investi-lecteurs gagnants)"],
    ["Auditeur (Listener)", "listener", "Podcasts", "20 EUR", "30% du pot mensuel (pro-rata votes x listen_score)"],
  ]
));
body.push(spacer());

// ═══════════════════════════════════════════════
// 2. BAREME COMMUN
// ═══════════════════════════════════════════════
body.push(heading("2. Bareme Commun Investisseurs (EUR -> Votes)", 1));
body.push(p("Application : Toutes categories (Films, Voix de l'Info, Livres, Podcasts)."));
body.push(table("BaremeVotes",
  ["Montant (EUR)", "2", "3", "4", "5", "6", "8", "10", "12", "15", "20"],
  [["Votes", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]]
));
body.push(spacer());

// ═══════════════════════════════════════════════
// 3. VISUPOINTS
// ═══════════════════════════════════════════════
body.push(heading("3. VIXUpoints - Bareme Fidelite et Conversion", 1));

body.push(heading("Bareme d'acquisition", 2));
body.push(table("BaremeVisupoints",
  ["Montant (EUR)", "2", "3", "4", "5", "6", "8", "10", "12", "15", "20"],
  [["VIXUpoints", "10", "15", "20", "25", "30", "40", "50", "60", "80", "110"]]
));
body.push(spacer());

body.push(heading("Regles de conversion", 2));
body.push(bulletList([
  "Taux de conversion : 100 VIXUpoints = 1 EUR",
  "Seuil minimum de conversion : 2 500 VIXUpoints (soit 25 EUR)",
  "Formule : EUR_convertis = floor(VIXUpoints / 100)",
  "Points restants = VIXUpoints - (EUR_convertis x 100)",
]));
body.push(spacer());

// ═══════════════════════════════════════════════
// 4. CAUTIONS
// ═══════════════════════════════════════════════
body.push(heading("4. Cautions", 1));
body.push(table("Cautions",
  ["Type de profil", "Montant", "Profils concernes"],
  [
    ["Createur", "10 EUR", "Porteur, Infoporteur, Podcaster"],
    ["Investisseur", "20 EUR", "Investisseur, Investi-lecteur, Auditeur"],
  ]
));
body.push(bulletList([
  "Depot unique lors de l'activation du profil",
  "Remboursable integralement en cas de resiliation du compte",
  "Non deductible des gains",
]));
body.push(spacer());

// ═══════════════════════════════════════════════
// 5. FILMS / VIDEOS / DOCUMENTAIRES
// ═══════════════════════════════════════════════
body.push(heading("5. Films / Videos / Documentaires - Cloture 40/30/7/23", 1));
body.push(p("Frequence de cloture : Configurable par l'admin (cycle variable)."));
body.push(p("Profils concernes : Porteur (createur) + Investisseur (investisseur)."));
body.push(spacer());

body.push(bold("Soit P le pot net (apres frais Stripe) a la cloture."));
body.push(spacer());

body.push(heading("A) 40% -> Investisseurs TOP 10", 2));
body.push(p("P_Inv_Top10 = 0,40 x P"));
body.push(p("part_i = P_Inv_Top10 x (V_i / Sum(V_j)) pour j dans TOP 10"));
body.push(p("Repartition ponderee par le nombre de votes (montant investi)."));
body.push(spacer());

body.push(heading("Detail BPS par rang TOP 10 Investisseurs", 3));
body.push(table("InvTop10BPS",
  ["Rang", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  [
    ["BPS", "1366", "683", "455", "341", "273", "228", "195", "171", "152", "137"],
    ["% de G", "13,66%", "6,83%", "4,55%", "3,41%", "2,73%", "2,28%", "1,95%", "1,71%", "1,52%", "1,37%"],
  ]
));
body.push(p("Total = 4001 BPS (40,01% - le 1 BPS supplementaire est absorbe par l'arrondi VIXUAL)"));
body.push(spacer());

body.push(heading("B) 30% -> Porteurs TOP 10", 2));
body.push(p("P_Porteurs_Top10 = 0,30 x P"));
body.push(p("part_c = P_Porteurs_Top10 x (score_c / Sum(score_Top10))"));
body.push(p("score_c = score final du projet c (votes x engagement x qualite)"));
body.push(spacer());

body.push(heading("Detail BPS par rang TOP 10 Porteurs", 3));
body.push(table("CreatorTop10BPS",
  ["Rang", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  [
    ["BPS", "1024", "512", "341", "256", "205", "171", "146", "128", "114", "102"],
    ["% de G", "10,24%", "5,12%", "3,41%", "2,56%", "2,05%", "1,71%", "1,46%", "1,28%", "1,14%", "1,02%"],
  ]
));
body.push(p("Total = 2999 BPS (29,99%)"));
body.push(spacer());

body.push(heading("C) 7% -> Investisseurs rangs 11-100", 2));
body.push(p("P_Inv_11_100 = 0,07 x P"));
body.push(p("Distribution : Equiparti (parts egales) OU Pro-rata votes (parametrage admin)."));
body.push(p("Si aucun investisseur eligible : le pool est capture par VIXUAL."));
body.push(spacer());

body.push(heading("D) 23% -> VIXUAL (Plateforme)", 2));
body.push(p("P_VISUAL = 0,23 x P"));
body.push(bulletList([
  "Frais operationnels",
  "Arrondis de calcul (bouclage au centime - methode euro-floor)",
  "Reserve technique",
  "Pools non distribues (si < 10 investisseurs eligibles par ex.)",
]));
body.push(spacer());

body.push(heading("Verification : 40 + 30 + 7 + 23 = 100%", 3));
body.push(spacer());

// ═══════════════════════════════════════════════
// 6. VOIX DE L'INFO
// ═══════════════════════════════════════════════
body.push(heading("6. Voix de l'Info - Vente 70/30 + Pot quotidien 60/40", 1));
body.push(p("Frequence : Cloture quotidienne automatique (CRON a 00:15 UTC+1)."));
body.push(p("Profils concernes : Infoporteur (createur) + Investi-lecteur (investisseur)."));
body.push(spacer());

body.push(heading("Flux A - Vente Unitaire d'Article", 2));
body.push(p("Net_vente = Prix_paye - Frais_paiement"));
body.push(p("Auteur (Infoporteur) = 0,70 x Net_vente"));
body.push(p("VIXUAL = 0,30 x Net_vente"));
body.push(p("Arrondi : Au centime pres (0,01 EUR)"));
body.push(spacer());

body.push(heading("Flux B - Pot du Jour (distribution J -> J+1 a 00:15)", 2));
body.push(bold("Soit P_day le pot net quotidien cumule."));
body.push(spacer());

body.push(heading("A) 60% -> Auteurs TOP 10", 3));
body.push(p("P_Auteurs = 0,60 x P_day"));
body.push(p("part_a = P_Auteurs x (score_a / Sum(score_Top10))"));
body.push(p("Poids degressif par rang : rang 1 = 10 pts, rang 2 = 9 pts, ..., rang 10 = 1 pt"));
body.push(p("Total poids = 55 (somme de 1 a 10)"));
body.push(spacer());

body.push(heading("B) 40% -> Lecteurs Gagnants", 3));
body.push(p("Critere d'eligibilite : Avoir achete >= 1 article d'un auteur du TOP 10."));
body.push(p("W_i = Sum(votes_i x poids_c) pour c dans articles TOP 10"));
body.push(p("part_i = 0,40 x P_day x (W_i / Sum(W))"));
body.push(p("Distribution : Equiparti si pas de ponderation, sinon pro-rata poids."));
body.push(spacer());

body.push(heading("Regles specifiques", 3));
body.push(bulletList([
  "Archivage : Classements quotidiens conserves 90 jours",
  "Delai paiement : T+2 jours ouvres",
]));
body.push(spacer());

// ═══════════════════════════════════════════════
// 7. LIVRES
// ═══════════════════════════════════════════════
body.push(heading("7. Livres - Vente 70/30 + Pot mensuel 60/40", 1));
body.push(p("Frequence : Mensuel (dernier jour du mois a 23:59)."));
body.push(p("Profils concernes : Infoporteur (createur) + Investi-lecteur (investisseur)."));
body.push(spacer());

body.push(heading("Flux A - Vente Unitaire de Livre", 2));
body.push(p("Net_vente = Prix_paye - Frais_paiement"));
body.push(p("Auteur (Infoporteur) = 0,70 x Net_vente"));
body.push(p("VIXUAL = 0,30 x Net_vente"));
body.push(spacer());

body.push(heading("Flux B - Pot Mensuel", 2));
body.push(bold("Soit P_mois le pot net mensuel."));
body.push(spacer());

body.push(heading("A) 60% -> Auteurs TOP 10", 3));
body.push(p("P_Auteurs = 0,60 x P_mois"));
body.push(p("part_a = P_Auteurs x (score_a / Sum(score_Top10))"));
body.push(p("Poids degressif : rang 1 = 10, rang 2 = 9, ..., rang 10 = 1"));
body.push(spacer());

body.push(heading("B) 40% -> Investi-lecteurs Gagnants", 3));
body.push(p("Critere : Avoir investi sur >= 1 auteur du TOP 10."));
body.push(p("W_i = Sum(votes_i x poids_c) pour c dans auteurs TOP 10"));
body.push(p("part_i = 0,40 x P_mois x (W_i / Sum(W))"));
body.push(spacer());

body.push(heading("Systeme de Repechage (Optionnel)", 3));
body.push(bulletList([
  "Cible : Auteurs classes rangs 11-100",
  "Cout : 25 EUR (ticket de repechage)",
  "Fenetre : 24 heures apres cloture mensuelle",
  "Effet : Inscription automatique au cycle suivant (file d'attente prioritaire)",
]));
body.push(spacer());

body.push(heading("Auto-Report TOP 10 et Capacite", 3));
body.push(bulletList([
  "Parametrable par l'admin : TOP 10 reconduits automatiquement OU retour en file d'attente",
  "Capacite mensuelle cible : 100 auteurs/mois (extensible jusqu'a 200)",
  "File d'attente visible jusqu'a 10 000 auteurs dans l'admin",
]));
body.push(spacer());

// ════════════════════════════════════════════����══
// 8. PODCASTS
// ═══════════════════════════════════════════════
body.push(heading("8. Podcasts - Vente 70/30 + Pot mensuel 40/30/20/10", 1));
body.push(p("Frequence : Mensuel (dernier jour du mois a 23:59)."));
body.push(p("Profils concernes : Podcaster (createur) + Auditeur/Listener (investisseur)."));
body.push(spacer());

body.push(heading("Flux A - Vente Episode", 2));
body.push(p("Net_vente = Prix_paye - Frais_paiement"));
body.push(p("Podcaster = 0,70 x Net_vente"));
body.push(p("VIXUAL = 0,30 x Net_vente"));
body.push(spacer());

body.push(heading("Flux B - Pot Mensuel", 2));
body.push(bold("Soit P le pot net mensuel."));
body.push(spacer());

body.push(heading("A) 40% -> Podcasteurs (Porteurs de Podcasts)", 3));
body.push(p("P_Podcasteurs = 0,40 x P"));
body.push(p("part_p = P_Podcasteurs x (score_audio_p / Sum(score_audio))"));
body.push(p("Repartition ponderee par poids degressif : rang 1 = 10 pts, ..., rang 10 = 1 pt (total 55)"));
body.push(spacer());

body.push(heading("Calcul score_audio", 3));
body.push(p("score_audio = impressions x completion"));
body.push(bulletList([
  "impressions = nombre total d'ecoutes",
  "completion = % moyen d'ecoute (0 a 1)",
]));
body.push(spacer());

body.push(heading("B) 30% -> Auditeurs Investisseurs (Listeners)", 3));
body.push(p("P_Auditeurs = 0,30 x P"));
body.push(p("part_i = P_Auditeurs x (weight_i / Sum(weights))"));
body.push(p("weight_i = votes_i x listen_score_i"));
body.push(spacer());

body.push(heading("Formule listen_score", 3));
body.push(p("listen_score = 0,7 x completion + 0,3 x auditeurs_uniques_norm"));
body.push(bulletList([
  "completion = % moyen d'ecoute complete (0 a 1)",
  "auditeurs_uniques_norm = ratio auditeurs uniques / total ecoutes (normalise 0-1)",
]));
body.push(spacer());

body.push(heading("CAP ANTI-CAPTURE (Obligatoire)", 3));
body.push(p("Limite par investisseur : max 20% des votes globaux mensuels."));
body.push(p("SI votes_i / Sum(votes_total) > 0,20 ALORS :"));
body.push(p("  weight_i_capped = 0,20 x Sum(votes_total) x listen_score_i"));
body.push(p("Objectif : Prevenir la monopolisation par gros investisseurs."));
body.push(spacer());

body.push(heading("C) 20% -> VIXUAL (Plateforme)", 3));
body.push(p("P_VIXUAL = 0,20 x P"));
body.push(spacer());

body.push(heading("D) 10% -> Bonus Pool", 3));
body.push(p("P_Bonus = 0,10 x P"));
body.push(bulletList([
  "TOP 10 podcasts : Primes de performance",
  "Challenges speciaux : Evenements promotionnels",
  "Reserve technique : Ajustements et arrondis",
]));
body.push(spacer());

body.push(heading("Verification : 40 + 30 + 20 + 10 = 100%", 3));
body.push(spacer());

body.push(heading("Classement & Archivage", 3));
body.push(p("score_final = votes x listen_score"));
body.push(p("Ordre : Decroissant (1 -> N)"));
body.push(p("Archives : Classements mensuels conserves indefiniment (CSV + DB)."));
body.push(spacer());

// ═══════════════════════════════════════════════
// 9. QUOTAS CREATEURS
// ═══════════════════════════════════════════════
body.push(heading("9. Quotas Createurs (mise en ligne Bunny.net)", 1));
body.push(p("Concerne : Porteur uniquement (contenu audiovisuel)."));
body.push(table("QuotasCreateurs",
  ["Type de contenu", "Duree max", "Quota", "Prix fixe"],
  [
    ["Clips", "<= 5 min", "2 par mois", "2 EUR/clip"],
    ["Documentaires", "5-30 min", "1 par mois", "5 EUR/documentaire"],
    ["Films", "> 30 min", "1 par trimestre", "7 EUR/film"],
  ]
));
body.push(spacer());

// ═══════════════════════════════════════════════
// 10. COEFFICIENT D'ENGAGEMENT
// ═══════════════════════════════════════════════
body.push(heading("10. Coefficient d'Engagement et Classement TOP 10", 1));
body.push(p("Formule de departage pour le classement :"));
body.push(p("coeff(p) = round(montantTotal(p) / max(1, nbInvestisseurs(p)), 2)"));
body.push(spacer());
body.push(bulletList([
  "montantTotal(p) = somme de tous les investissements recus par le projet p (en EUR)",
  "nbInvestisseurs(p) = nombre d'investisseurs uniques sur le projet p",
  "Arrondi a 2 decimales",
  "En cas d'egalite : departage par anciennete (premier investi = prioritaire)",
]));
body.push(spacer());

// ═══════════════════════════════════════════════
// 11. REGLES TRANSVERSES
// ═══════════════════════════════════════════════
body.push(heading("11. Regles Transverses", 1));

body.push(heading("Arrondis", 2));
body.push(bulletList([
  "Methode : Euro-floor (arrondi inferieur a l'euro le plus proche)",
  "Les centimes residuels sont captures par VIXUAL",
  "Verification : platformTake + totalUserPayout == grossEligible (bouclage exact)",
]));
body.push(spacer());

body.push(heading("Anti-Fraude", 2));
body.push(table("AntiFraude",
  ["Protection", "Valeur", "Categories"],
  [
    ["CAP investisseur podcasts", "<= 20% votes globaux/mois", "Podcasts"],
    ["Limite investissements", "<= 50 transactions/jour", "Toutes"],
    ["Scoring comportemental", "Detection bots, multi-comptes", "Toutes"],
    ["Limite parrainage", "<= 20 filleuls/mois", "Toutes"],
  ]
));
body.push(spacer());

body.push(heading("RGPD", 2));
body.push(bulletList([
  "Cookies : Banniere obligatoire (opt-in analytics)",
  "Donnees sensibles : Consentement explicite (KYC, paiements)",
  "Marketing : Opt-in separe (newsletters)",
  "Conservation limitee : 90 jours apres expiration (annonces)",
  "Droit a l'oubli : Suppression sur demande (< 30 jours)",
]));
body.push(spacer());

body.push(heading("KYC & Age", 2));
body.push(heading("Mineurs (16-17 ans)", 3));
body.push(bulletList([
  "Plafond investissement : 200 EUR cumules",
  "Retraits : Differes jusqu'a 18 ans (sauf autorisation parentale)",
  "KYC renforce : Obligatoire a la majorite (transition automatique)",
]));

body.push(heading("Majeurs", 3));
body.push(bulletList([
  "KYC standard : Piece d'identite + justificatif domicile",
  "Depot > 1 000 EUR -> KYC obligatoire",
  "Retrait > 500 EUR -> KYC + verification bancaire",
]));
body.push(spacer());

body.push(heading("Sanctions Graduees", 2));
body.push(table("Sanctions",
  ["Niveau", "Action", "Duree"],
  [
    ["1", "Avertissement", "-"],
    ["2", "Limitation actions", "7 jours"],
    ["3", "Suspension compte", "30 jours"],
    ["4", "Ban definitif", "Permanent"],
  ]
));
body.push(spacer());

// ═══════════════════════════════════════════════
// 12. API & SETTLEMENT
// ═══════════════════════════════════════════════
body.push(heading("12. API & Settlement (Reference Technique)", 1));

body.push(heading("Endpoints Principaux", 2));

body.push(heading("A) Investissement", 3));
body.push(p("POST /api/stripe/invest"));
body.push(p('Body: { category: "films"|"livres"|"podcasts", targetId, amount, currency: "EUR" }'));
body.push(p("-> Credite votes selon bareme + VIXUpoints"));
body.push(p("-> Roles autorises : investor, investireader, listener"));
body.push(spacer());

body.push(heading("B) Vente Unitaire", 3));
body.push(p("POST /api/sale"));
body.push(p('Body: { category: "voix_info"|"livres"|"podcasts", targetId, price, currency, buyerId }'));
body.push(p("-> Split 70/30 immediat (auteur/VIXUAL)"));
body.push(spacer());

body.push(heading("C) Cloture de Cycle", 3));
body.push(p("POST /api/payout/execute"));
body.push(p("Authorization: Bearer {ADMIN_TOKEN}"));
body.push(p('Body: { contentId, category }'));
body.push(p("-> Fige pot -> Calcule payouts selon formules par categorie -> Webhooks Stripe Connect"));
body.push(spacer());

body.push(heading("Moteur de Settlement (payout-engine.ts)", 2));
body.push(p("Le moteur est multi-categories. L'entree inclut un champ 'category' qui determine la formule :"));
body.push(table("SettlementCategories",
  ["Categorie", "Formule", "Frequence"],
  [
    ["films", "40/30/7/23 (rank-weighted BPS)", "Configurable (admin)"],
    ["voix_info", "60/40 (pot quotidien)", "Quotidien 00:15 UTC+1"],
    ["livres", "60/40 (pot mensuel)", "Mensuel (dernier jour)"],
    ["podcasts", "40/30/20/10 (pot mensuel)", "Mensuel (dernier jour)"],
  ]
));
body.push(spacer());

body.push(heading("Idempotence Webhooks Stripe", 2));
body.push(bulletList([
  "Chaque webhook est verifie par event.id dans la table webhook_events",
  "Si deja traite -> HTTP 200 sans retraitement",
  "Protection contre les rejeux et doublons de paiement",
]));
body.push(spacer());

body.push(heading("Stripe Connect - Configuration", 2));
body.push(bulletList([
  "Devise : EUR",
  "Retrait minimum : 25 EUR",
  "Delai de traitement des retraits : 7 jours",
  "Type de compte Stripe Connect : Express",
]));
body.push(spacer());

// ═══════════════════════════════════════════════
// 13. CHECK-LIST DEPLOIEMENT
// ═══════════════════════════════════════════════
body.push(heading("13. Check-list Deploiement", 1));

body.push(heading("Configuration", 2));
body.push(bulletList([
  "[ ] Bareme euros -> votes implemente client + serveur",
  "[ ] Cles de repartition testees :",
  "    - 40/30/7/23 (Films/Videos/Docs)",
  "    - 70/30 (Ventes unitaires)",
  "    - 60/40 (Voix de l'Info quotidien, Livres mensuel)",
  "    - 40/30/20/10 (Podcasts mensuel)",
  "[ ] Arrondis euro-floor + verification platformTake + totalUserPayout == grossEligible",
  "[ ] CAP anti-capture podcasts (20%) actif",
]));
body.push(spacer());

body.push(heading("Jobs Automatises (CRON)", 2));
body.push(bulletList([
  "[ ] Voix de l'Info : Quotidien 00:15 UTC+1",
  "[ ] Livres : Mensuel (dernier jour 23:59)",
  "[ ] Podcasts : Mensuel (dernier jour 23:59)",
  "[ ] Films/Videos/Docs : Parametrable (admin)",
  "[ ] Webhooks Stripe Connect idempotents (rejeu safe)",
  "[ ] Backup automatique avant chaque cloture",
]));
body.push(spacer());

body.push(heading("Tests", 2));
body.push(bulletList([
  "[ ] Tests unitaires payout-engine.test.ts : 4 suites (films, podcasts, voix_info, livres)",
  "[ ] Verification : platformTake + totalUserPayout == grossEligible pour chaque categorie",
  "[ ] Tests E2E : Cycle films complet (invest -> classement -> cloture)",
  "[ ] Tests E2E : Vente Voix de l'Info + pot quotidien",
  "[ ] Tests E2E : Cycle podcasts avec CAP anti-capture",
]));
body.push(spacer());

body.push(heading("Exports & Conformite", 2));
body.push(bulletList([
  "[ ] Exports CSV/Excel operationnels (auteurs, investisseurs, audits)",
  "[ ] RGPD : Consentements, conservation, droit a l'oubli",
  "[ ] Factures PDF conformes TVA",
  "[ ] Historique conserve 10 ans (obligation legale)",
]));
body.push(spacer());

// ═══════════════════════════════════════════════
// TABLEAU RECAPITULATIF FINAL
// ═══════════════════════════════════════════════
body.push(heading("ANNEXE : Tableau Recapitulatif par Profil", 1));
body.push(table("RecapProfils",
  ["Profil", "Type", "Categorie", "Vente unitaire", "Pot (frequence)", "Part dans le pot"],
  [
    ["Porteur", "Createur", "Films/Videos/Docs", "-", "Configurable (admin)", "30% TOP 10 (rank BPS)"],
    ["Infoporteur", "Createur", "Voix de l'Info", "70% vente", "Quotidien", "60% TOP 10 (rank-weighted)"],
    ["Infoporteur", "Createur", "Livres", "70% vente", "Mensuel", "60% TOP 10 (rank-weighted)"],
    ["Podcaster", "Createur", "Podcasts", "70% vente episode", "Mensuel", "40% (score_audio)"],
    ["Investisseur", "Investisseur", "Films/Videos/Docs", "-", "Configurable (admin)", "40% TOP 10 + 7% rangs 11-100"],
    ["Investi-lecteur", "Investisseur", "Voix de l'Info", "-", "Quotidien", "40% (lecteurs gagnants)"],
    ["Investi-lecteur", "Investisseur", "Livres", "-", "Mensuel", "40% (investi-lecteurs gagnants)"],
    ["Auditeur", "Investisseur", "Podcasts", "-", "Mensuel", "30% (votes x listen_score, cap 20%)"],
  ]
));
body.push(spacer());

body.push(p("--- Fin du document ---"));
body.push(p(`Document genere automatiquement depuis le code VIXUAL V2 le ${today}.`));

// ═══════════════════════════════════════════════
// ASSEMBLE FODT XML
// ═══════════════════════════════════════════════
const fodt = `<?xml version="1.0" encoding="UTF-8"?>
<office:document
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"
  office:version="1.3"
  office:mimetype="application/vnd.oasis.opendocument.text">

  <office:automatic-styles>
    <style:style style:name="Bold" style:family="text">
      <style:text-properties fo:font-weight="bold" fo:font-size="11pt"/>
    </style:style>
    <style:style style:name="TableStyle" style:family="table">
      <style:table-properties style:width="17cm" table:align="margins"/>
    </style:style>
    <style:style style:name="TableHeader" style:family="table-cell">
      <style:table-cell-properties fo:padding="0.15cm" fo:border="0.5pt solid #000000" fo:background-color="#E8E8E8"/>
    </style:style>
    <style:style style:name="TableCell" style:family="table-cell">
      <style:table-cell-properties fo:padding="0.15cm" fo:border="0.5pt solid #000000"/>
    </style:style>
  </office:automatic-styles>

  <office:body>
    <office:text>
${body.join("\n")}
    </office:text>
  </office:body>
</office:document>`;

const outPath = "public/VISUAL_Formules_Repartitions_V2.fodt";
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, fodt, "utf-8");
console.log(`[v0] FODT generated: ${outPath} (${(fodt.length / 1024).toFixed(1)} KB)`);
