string standalone.getTemplateIdProjects(String vorlage)
{
// Guido Update 16-03-2023
collVorlagen = Collection();
collVorlagen.insert("Vorlage Peter Pane":156882000000918960);
collVorlagen.insert("Vorlage Mer Germany":156882000000920612);
collVorlagen.insert("Vorlage McDonald's DE":156882000000920128);
collVorlagen.insert("Vorlage McDonald's AT":156882000000920174);
collVorlagen.insert("Vorlage McD DE Neueröffnung":156882000000373275);
collVorlagen.insert("Vorlage Hans im Glück":156882000000921104);
collVorlagen.insert("Vorlage EMK - Entstörung":156882000000918294);
collVorlagen.insert("Vorlage EMK":156882000000373133);
collVorlagen.insert("Vorlage DAA Deutsche Angestellten Akademie":156882000000918986);
collVorlagen.insert("VDI Inspektion":156882000000578003);
collVorlagen.insert("Standardprojektvorlage EEP - IN ARBEIT":156882000000276171);
collVorlagen.insert("SEA":156882000000456031);
collVorlagen.insert("Projektsteuerung (Lüftung/PV/Dach) - IN ARBEIT - Stand 31.08.23":156882000000915445);
collVorlagen.insert("Netzeinkaufsberichte / Netzanschlussoptimierung / Österreich":156882000000908673);
collVorlagen.insert("Kliaaktiv McDonalds AT":156882000000928423);
collVorlagen.insert("HSC Energiecontrolling":156882000000932854);
collVorlagen.insert("Fördermittelabwicklung / Umsetzungsbegleitung":156882000000272191);
collVorlagen.insert("Energiekostenzuschuss":156882000000932974);
collVorlagen.insert("Energieeinkauf Strom/Gas ohne BV":156882000000908956);
collVorlagen.insert("EMK":156882000000925934);
collVorlagen.insert("EEP360 Entstörung (nicht fakturierbar)":156882000000932594);
collVorlagen.insert("EEP360 Entstörung (fakturierbar)":156882000000932638);
collVorlagen.insert("eep.start (green)":156882000000396019);
collVorlagen.insert("EDL-G/EEffG-Audit":156882000002575064);
collVorlagen.insert("EBN Modul 1 (ohne Messung)":156882000000930837);
collVorlagen.insert("EBN II":156882000000918124);
collVorlagen.insert("EBN I (ohne Messung)":156882000000396387);
collVorlagen.insert("EBN I (mit Messung)":156882000000375212);
collVorlagen.insert("E-Mobilität":156882000000375514);
collVorlagen.insert("Dachsanierung":156882000000931256);
collVorlagen.insert("Betreuung ISO 50.001 McDonalds":156882000000929120);
collVorlagen.insert("Betreiberwechsel":156882000000934133);
collVorlagen.insert("BEG Einzelmaßnahme Fenster (Göbert GmbH)":156882000000908914);
collVorlagen.insert("2023 Zoho Software Entwicklung Zeiterfassung Intern":156882000000915465);
collVorlagen.insert("2023 TEG Energieportal Entwicklung Zeiterfassung Intern":156882000000908689);
collVorlagen.insert("2023 Entwicklung Website/Homepage Zeiterfassung Intern":156882000000919455);
collVorlagen.insert("Sonderprojekt Energietechnik":156882000000456031);
collVorlagen.insert("Projektsteuerung (Lüftung/PV/Dach) - IN ARBEIT - Stand 28.09.23_SWI":156882000000915445);
collVorlagen.insert("GEG-Begleitung McD":156882000001080055);
collVorlagen.insert("Wärmeschutznachweis McD":156882000001074003);
collVorlagen.insert("Projektsteuerung (Lüftung) - Vorlage - Stand 14.04.24":156882000001266060);
collVorlagen.insert("ISO 50001":156882000001545031);
collVorlagen.insert("ISO 14001":156882000001527433);
collVorlagen.insert("Abwärmemeldung BfEE":156882000002479057);
collVorlagen.insert("Projektsteuerung - Vorlage Lüftungstausch | Stand 02-10-2025":156882000004160009);
collVorlagen.insert("eep.companion Projektentwicklung Brandschutz":156882000006032007);
if(!collVorlagen.get(vorlage).isNull())
{
	return collVorlagen.get(vorlage);
}
else
{
	return "156882000002823031";
}
}