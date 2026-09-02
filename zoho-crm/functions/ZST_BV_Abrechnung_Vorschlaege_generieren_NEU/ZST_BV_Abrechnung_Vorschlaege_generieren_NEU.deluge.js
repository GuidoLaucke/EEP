string button.ZST_BV_Abrechnung_Vorschlaege_generieren_NEU(String bv_abr_id)
{
//bv_abr_id = 418194000016516001;
bv_abr_det = zoho.crm.getRecordById("BV_Abrechnungen",bv_abr_id);
if(bv_abr_det.get("Status") != "In Vorbereitung" && bv_abr_det.get("Status") != "Gelöscht/Storniert")
{
	return "Die Erstellung von Vorschlägen ist nicht möglich, da die Abrechnung nicht in Vorbereitung oder gelöscht/storniert ist.";
}
//
if(bv_abr_det.get("Turnus") == "Monatlich")
{
	query_anz = "select COUNT(id) as anz from Beratungsvertr_ge where ((Turnus = '##TURNUS##')";
}
else
{
	query_anz = "select COUNT(id) as anz from Beratungsvertr_ge where ((Turnus = '##TURNUS##' and Turnus_Abrechnung like '%##TURNUS_ABRECHNUNG##%')";
}
//query_anz = "select COUNT(id) as anz from Beratungsvertr_ge where ((Turnus = 'Jährlich' and Turnus_Abrechnung like '%Februar%')";
query_anz = query_anz + " and Vertrag_nicht_abrechnen = false)";
query_anz = query_anz.replaceFirst("##TURNUS##",bv_abr_det.get("Turnus"));
query_anz = query_anz.replaceFirst("##TURNUS_ABRECHNUNG##",bv_abr_det.get("Monat"));
info query_anz;
query_anz_map = Map();
query_anz_map.put("select_query",query_anz);
response_anz = invokeurl
[
	url :"https://zohoapis.eu/crm/v6/coql"
	type :POST
	parameters:query_anz_map.toString()
	connection:"crm_coql"
];
info response_anz;
anz = response_anz.get("data").get(0).get("anz");
if(anz > 0)
{
	it_anzahl = ceil(anz / 200);
	//it_naechste = zoho.currenttime.addMinutes(3).toString("yyyy-MM-dd'T'HH:mm:ss+02:00");
	it_naechste = zoho.currenttime.addMinutes(3).toString("yyyy-MM-dd'T'HH:mm:ssX':00'");
	upd_bv_abr = Map();
	upd_bv_abr.put("Vorschlaege_Aktuelle_Iteration",0);
	upd_bv_abr.put("Vorschlaege_Anzahl_Iterationen",it_anzahl);
	upd_bv_abr.put("Vorschlaege_Naechste_Iteration",it_naechste);
	upd_bv_abr.put("Status","Vorschläge in Arbeit");
	info zoho.crm.updateRecord("BV_Abrechnungen",bv_abr_id,upd_bv_abr);
	return "Die Erstellung von Vorschlägen wurde gestartet. Nach Fertigstellung der Vorschläge erfolgt die Benachrichtigung per E-Mail.";
}
else
{
	return "Es wurden keine Beratungsverträge anhand der vorgegebenen Kritieren gefunden.";
}
/*
abr_id = 418194000012615629;
abr = zoho.crm.getRecordById("BV_Abrechnungen",abr_id);
abr_turnus = abr.get("Turnus");
if(abr.get("Status") != "In Vorbereitung" && abr.get("Status") != "Gelöscht/Storniert")
{
	return "Die Erstellung von Vorschlägen ist nicht möglich, da die Abrechnung nicht in Vorbereitung oder gelöscht/storniert ist.";
}
//
// Abrechnungs-Parameter
abr_monat = abr.get("Monat");
abr_jahr = abr.get("Jahr");
//
// Verträge für Turnus "Jährlich" auslesen
if(abr_turnus.contains("Jährlich"))
{
	query_jrl = "select id from Beratungsvertr_ge where (Turnus = 'Jährlich' and Turnus_Abrechnung = '##TURNUS_ABRECHNUNG##') limit 100";
	query_jrl = query_jrl.replaceFirst("##TURNUS_ABRECHNUNG##",abr_monat);
	query_jrl_map = Map();
	query_jrl_map.put("select_query",query_jrl);
	response_jrl = invokeurl
	[
		url :"https://zohoapis.eu/crm/v2/coql"
		type :POST
		parameters:query_jrl_map.toString()
		connection:"crm_coql"
	];
	recs_jrl = response_jrl.get("data");
}
//
// Verträge für Turnus "Halbjährlich" auslesen
if(abr_turnus.contains("Halbjährlich"))
{
	query_hjl = "select id from Beratungsvertr_ge where (Turnus = 'Halbjährlich' and Turnus_Abrechnung like '%##TURNUS_ABRECHNUNG##%') limit 100";
	query_hjl = query_hjl.replaceFirst("##TURNUS_ABRECHNUNG##",abr_monat);
	query_hjl_map = Map();
	query_hjl_map.put("select_query",query_hjl);
	response_hjl = invokeurl
	[
		url :"https://zohoapis.eu/crm/v2/coql"
		type :POST
		parameters:query_hjl_map.toString()
		connection:"crm_coql"
	];
	recs_hjl = response_hjl.get("data");
}
//
// Verträge für Turnus "Quartärlich" auslesen
if(abr_turnus.contains("Quartärlich"))
{
	query_qtl = "select id from Beratungsvertr_ge where (Turnus = 'Quartärlich' and Turnus_Abrechnung like '%##TURNUS_ABRECHNUNG##%') limit 100";
	query_qtl = query_qtl.replaceFirst("##TURNUS_ABRECHNUNG##",abr_monat);
	query_qtl_map = Map();
	query_qtl_map.put("select_query",query_qtl);
	response_qtl = invokeurl
	[
		url :"https://zohoapis.eu/crm/v2/coql"
		type :POST
		parameters:query_qtl_map.toString()
		connection:"crm_coql"
	];
	recs_qtl = response_qtl.get("data");
}
//
// Check, ob mindestens 1 Vertrag gefunden wurde
if(recs_jrl.isNull() && recs_hjl.isNull() && recs_qtl.isNull())
{
	return "Für die Einstellungen in der Abrechnung wurden keine Beratugsverträge gefunden.";
}
//
// Globale Liste für alle Abrechnungen
bv_abr_liste = List();
//
// Abrechnungsvorschlag für Turnus "Jährlich"
if(!recs_jrl.isNull())
{
	for each  recs_jrl_s in recs_jrl
	{
		bv_abr_map = Map();
		bv_id = recs_jrl_s.get("id");
		bv_det = zoho.crm.getRecordById("Beratungsvertr_ge",bv_id);
		bv_beginn = bv_det.get("Beginn").toDate();
		bv_ende = bv_det.get("Ende").toDate();
		bv_erstlaufzeit = bv_det.get("Erstlaufzeit");
		bv_turnus = bv_det.get("Turnus");
		bv_turnus_richt = bv_det.get("Turnus_Richtung");
		//
		bv_abr_beginn_jahr = abr_jahr.toNumber();
		if(bv_turnus_richt == "Nächstes Kalenderjahr")
		{
			bv_abr_beginn_jahr = bv_abr_beginn_jahr + 1;
		}
		bv_abr_beginn = (bv_abr_beginn_jahr + "-01-01").toDate();
		bv_abr_ende = (bv_abr_beginn_jahr + "-12-31").toDate();
		if(bv_abr_beginn < bv_beginn)
		{
			bv_abr_beginn = bv_beginn;
		}
		if(bv_abr_ende > bv_ende)
		{
			bv_abr_ende = bv_ende;
		}
		bv_abr_map.put("bv_id",bv_id);
		bv_abr_map.put("bv_typ","Jährlich");
		bv_abr_map.put("bv_abr_beginn",bv_abr_beginn);
		bv_abr_map.put("bv_abr_ende",bv_abr_ende);
		bv_abr_liste.add(bv_abr_map);
	}
}
//
// Abrechnungsvorschlag für Turnus "Quartärlich"
if(!recs_qtl.isNull())
{
	for each  recs_qtl_s in recs_qtl
	{
		bv_abr_map = Map();
		bv_id = recs_qtl_s.get("id");
		bv_det = zoho.crm.getRecordById("Beratungsvertr_ge",bv_id);
		bv_beginn = bv_det.get("Beginn").toDate();
		bv_ende = bv_det.get("Ende").toDate();
		bv_erstlaufzeit = bv_det.get("Erstlaufzeit");
		bv_turnus = bv_det.get("Turnus");
		bv_turnus_richt = bv_det.get("Turnus_Richtung");
		//
		if(abr_monat == "Januar" || abr_monat == "Februar" || abr_monat == "März")
		{
			bv_abr_beginn_monat = 1;
		}
		else if(abr_monat == "April" || abr_monat == "Mai" || abr_monat == "Juni")
		{
			bv_abr_beginn_monat = 4;
		}
		else if(abr_monat == "Juli" || abr_monat == "August" || abr_monat == "September")
		{
			bv_abr_beginn_monat = 7;
		}
		else if(abr_monat == "Oktober" || abr_monat == "November" || abr_monat == "Dezember")
		{
			bv_abr_beginn_monat = 10;
		}
		if(bv_turnus_richt == "Vorhergehendes Quartal")
		{
			bv_abr_beginn_monat = bv_abr_beginn_monat - 3;
		}
		bv_abr_beginn = (abr_jahr + "-" + bv_abr_beginn_monat + "-01").toDate();
		bv_abr_ende = bv_abr_beginn.eomonth(2);
		if(bv_abr_beginn < bv_beginn)
		{
			bv_abr_beginn = bv_beginn;
		}
		if(bv_abr_ende > bv_ende)
		{
			bv_abr_ende = bv_ende;
		}
		bv_abr_map.put("bv_id",bv_id);
		bv_abr_map.put("bv_typ","Quartärlich");
		bv_abr_map.put("bv_abr_beginn",bv_abr_beginn);
		bv_abr_map.put("bv_abr_ende",bv_abr_ende);
		bv_abr_liste.add(bv_abr_map);
	}
}
//
// Abrechnungsvorschlag für Turnus "Halbjährlich"
if(!recs_hjl.isNull())
{
	for each  recs_hjl_s in recs_hjl
	{
		bv_abr_map = Map();
		bv_id = recs_hjl_s.get("id");
		bv_det = zoho.crm.getRecordById("Beratungsvertr_ge",bv_id);
		bv_beginn = bv_det.get("Beginn").toDate();
		bv_ende = bv_det.get("Ende").toDate();
		bv_erstlaufzeit = bv_det.get("Erstlaufzeit");
		bv_turnus = bv_det.get("Turnus");
		bv_turnus_richt = bv_det.get("Turnus_Richtung");
		//
		if(abr_monat == "Januar" || abr_monat == "Februar" || abr_monat == "März" || abr_monat == "April" || abr_monat == "Mai" || abr_monat == "Juni")
		{
			bv_abr_beginn_monat = 1;
		}
		else if(abr_monat == "Juli" || abr_monat == "August" || abr_monat == "September" || abr_monat == "Oktober" || abr_monat == "November" || abr_monat == "Dezember")
		{
			bv_abr_beginn_monat = 7;
		}
		if(bv_turnus_richt == "Vorhergehendes Halbjahr")
		{
			bv_abr_beginn_monat = bv_abr_beginn_monat - 6;
		}
		bv_abr_beginn = (abr_jahr + "-" + bv_abr_beginn_monat + "-01").toDate();
		bv_abr_ende = bv_abr_beginn.eomonth(5);
		if(bv_abr_beginn < bv_beginn)
		{
			bv_abr_beginn = bv_beginn;
		}
		if(bv_abr_ende > bv_ende)
		{
			bv_abr_ende = bv_ende;
		}
		bv_abr_map.put("bv_id",bv_id);
		bv_abr_map.put("bv_typ","Halbjährlich");
		bv_abr_map.put("bv_abr_beginn",bv_abr_beginn);
		bv_abr_map.put("bv_abr_ende",bv_abr_ende);
		bv_abr_liste.add(bv_abr_map);
	}
}
//
// Abrechnungsvorschläge erzeugen
if(bv_abr_liste.size() == 0)
{
	return "Zu den Angaben in der Abrechnung wurrden keine Beratungsverträge gefunden.";
}
info bv_abr_liste;
for each  bv_abr_liste_s in bv_abr_liste
{
	info bv_abr_liste_s;
	bv_id = bv_abr_liste_s.get("bv_id");
	abr_beginn = bv_abr_liste_s.get("bv_abr_beginn");
	abr_ende = bv_abr_liste_s.get("bv_abr_ende");
	abr_beginn_form = abr_beginn.toString("dd.MM.yyyy");
	abr_ende_form = abr_ende.toString("dd.MM.yyyy");
	det_bv = zoho.crm.getRecordById("Beratungsvertr_ge",bv_id);
	det_abr = abr;
	det_an = zoho.crm.getRecordById("Accounts",det_bv.get("Abnahmestelle").get("id"));
	det_an_id = det_an.get("id");
	det_an_parent_id = det_an.get("Parent_Account").get("id");
	det_an_fi = zoho.crm.getRecordById("Accounts",det_an_parent_id);
	cr_abr_pos_name = "Abrechnung - " + det_an.get("Account_Name") + " - von " + abr_beginn_form + " bis " + abr_ende_form;
	cr_abr_pos_betreff = "Abrechnung Beratung EEP vom " + abr_beginn_form + " bis " + abr_ende_form;
	cr_abr_pos_monate = abr_beginn.monthsBetween(abr_ende);
	det_bv_prods = List();
	for each  det_bv_prods_map in det_bv.get("Beratungsvertragsprodukte")
	{
		det_bv_prods.add(det_bv_prods_map.get("Produkt").get("name"));
	}
	if(det_bv.get("Paketpreis_gilt_f_r") == "Monat")
	{
		cr_abr_pos_paketpreis = det_bv.get("Paketpreis");
		cr_abr_pos_positionssumme = cr_abr_pos_paketpreis * cr_abr_pos_monate;
	}
	else
	{
		cr_abr_pos_paketpreis = det_bv.get("Paketpreis");
		cr_abr_pos_positionssumme = cr_abr_pos_paketpreis / 12 * cr_abr_pos_monate;
	}
	det_bv_prods = det_bv_prods.toString().replaceAll(",",", ");
	cr_abr_pos = Map();
	cr_abr_pos.put("Name",cr_abr_pos_name);
	cr_abr_pos.put("Beratungsvertrag",bv_id);
	cr_abr_pos.put("BV_Abrechnung",abr_id);
	cr_abr_pos.put("Abnahmestelle",det_an.get("id"));
	if(!isNull(det_an.get("Billing_Street")) && !isNull(det_an.get("Billing_Code")) && !isNull(det_an.get("Billing_City")))
	{
		cr_abr_pos.put("Rechnungsempf_nger",det_an_id);
	}
	else
	{
		cr_abr_pos.put("Rechnungsempf_nger",det_an_parent_id);
	}
	cr_abr_pos.put("Rechnungs_Betreff",cr_abr_pos_betreff);
	cr_abr_pos.put("Beginn",abr_beginn);
	cr_abr_pos.put("Ende",abr_ende);
	cr_abr_pos.put("Anzahl_Monate",cr_abr_pos_monate);
	cr_abr_pos.put("Vertragsprodukte",det_bv_prods);
	cr_abr_pos.put("Paketpreis",cr_abr_pos_paketpreis);
	cr_abr_pos.put("Paketpreis_gilt_f_r",det_bv.get("Paketpreis_gilt_f_r"));
	cr_abr_pos.put("Positionssumme",cr_abr_pos_positionssumme);
	cr_abr_pos.put("SEPA_Mandat_vorhanden","Nein");
	if(det_an.get("SEPA_Mandat_vorhanden") == "Ja")
	{
		cr_abr_pos.put("SEPA_Mandat_vorhanden",det_an.get("SEPA_Mandat_vorhanden"));
		cr_abr_pos.put("SEPA_Datum",det_an.get("SEPA_Datum"));
		cr_abr_pos.put("SEPA_Mandatsreferenz",det_an.get("SEPA_Mandatsreferenz"));
		cr_abr_pos.put("SEPA_IBAN",det_an.get("SEPA_IBAN"));
		cr_abr_pos.put("SEPA_BIC",det_an.get("SEPA_BIC"));
		cr_abr_pos.put("SEPA_Bank",det_an.get("SEPA_Bank"));
	}
	cr_abr_pos.put("SEPA_USt_IdNr",det_an.get("SEPA_USt_IdNr"));
	cr_abr_pos.put("Firma",det_bv.get("Firma"));
	cr_abr_pos.put("Status","Entwurf");
	cr_abr_pos.put("Owner",det_bv.get("Owner").get("id"));
	info cr_abr_pos;
	info zoho.crm.createRecord("BV_Abrechnung_Positionen",cr_abr_pos);
	info "-------------------------";
}
//
*/
}