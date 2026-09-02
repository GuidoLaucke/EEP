string button.ZST_BV_Abrechnung_Vorschlaege_generieren(String abr_id)
{
abr_id = 418194000014618001;
abr = zoho.crm.getRecordById("BV_Abrechnungen",abr_id);
abr_turnus = abr.get("Turnus");
info abr.get("Status");
if(abr.get("Status") != "In Vorbereitung" && abr.get("Status") != "Gelöscht/Storniert")
{
	return "Die Erstellung von Vorschlägen ist nicht möglich, da die Abrechnung nicht in Vorbereitung oder gelöscht/storniert ist.";
}
//
// Abrechnungs-Parameter
abr_monat = abr.get("Monat");
abr_jahr = abr.get("Jahr");
//
// Globale Liste
bv_abr_liste = List();
//
// Verträge für Turnus "Jährlich" auslesen
if(abr_turnus.contains("Jährlich"))
{
	/**** LOOP WIEDER REIN MACHEN
	attempt = " ";
	retry_loop = attempt.leftPad(4).replaceAll(" ",",");
	retry_attempt = 0;
	recs_jrl_list = List();
	for each  retry in retry_loop
	{
	
		query_jrl = "select id from Beratungsvertr_ge where (Turnus = 'Jährlich' and Turnus_Abrechnung = '##TURNUS_ABRECHNUNG##') limit " + retry_attempt * 200 + ", 200";
		****/
	//query_jrl = "SELECT id FROM Beratungsvertr_ge WHERE ((Turnus = 'Jährlich' and Turnus_Abrechnung = '##TURNUS_ABRECHNUNG##') AND Test = true)  LIMIT 0, 5";
	query_jrl = "SELECT id FROM Beratungsvertr_ge WHERE (Turnus = 'Jährlich' and Turnus_Abrechnung = '##TURNUS_ABRECHNUNG##')";
	query_jrl = query_jrl + " LIMIT 1400, 200";
	//query_jrl = "SELECT id FROM Beratungsvertr_ge WHERE id=418194000006883272";
	//query_jrl = "SELECT id FROM Beratungsvertr_ge WHERE id between 418194000006883200 and 418194000006883299  and ((Turnus = 'Jährlich') and Turnus_Abrechnung = '##TURNUS_ABRECHNUNG##') limit 20, 10";
	query_jrl = query_jrl.replaceFirst("##TURNUS_ABRECHNUNG##",abr_monat);
	info query_jrl;
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
	//info recs_jrl;
	for each  recs_jrl_elem in recs_jrl
	{
		bv_id = recs_jrl_elem.get("id");
		info bv_id;
		bv_det = zoho.crm.getRecordById("Beratungsvertr_ge",bv_id);
		// Beginn und Ende generell bestimmen (anhand Turnus und Richtung, ohne Einschränkung)
		bv_id = recs_jrl_elem.get("id");
		bv_det = zoho.crm.getRecordById("Beratungsvertr_ge",bv_id);
		bv_beginn = bv_det.get("Beginn").toDate();
		bv_turnus_richt = bv_det.get("Turnus_Richtung");
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
		if(!bv_det.get("Ende").isNull())
		{
			bv_ende = bv_det.get("Ende").toDate();
			if(bv_abr_ende > bv_ende)
			{
				bv_abr_ende = bv_ende;
			}
		}
		//
		// Auslesen der Schließung aus AN
		det_an = zoho.crm.getRecordById("Accounts",bv_det.get("Abnahmestelle").get("id"));
		continue_loop = true;
		// Wenn Schließung eingetragen
		if(!det_an.get("Standort_Schlie_ung").isNull())
		{
			det_an_closing = det_an.get("Standort_Schlie_ung").toDate();
			// Wenn Schließung VOR dem Beginn
			if(det_an_closing < bv_abr_beginn)
			{
				// ENDE-VARIABLE SETZEN
				continue_loop = false;
			}
			// Wenn Schließung NACH dem Beginn
			else
			{
				// Wenn Schließung VOR dem Ende: Ende überschreiben
				if(det_an_closing < bv_abr_ende)
				{
					bv_abr_ende = det_an_closing;
				}
				// Wenn Schließung NACH dem Ende: nichts weiter machen
			}
		}
		// Wenn es in der Loop weitergeht
		if(continue_loop)
		{
			// Auslesen der Preiserhöhung aus dem BV für aktuelles Jahr
			adj_newpricefrom_api = "Paketpreis_" + zoho.currentdate.year() + "_ab";
			adj_newpricefrom = bv_det.get(adj_newpricefrom_api);
			// Wenn keine Preiserhöhung
			if(adj_newpricefrom.isNull())
			{
				// Nur 1 Position notwendig; Beginn und Ende in Position 1 eintragen  inkl. Paketpreis
				pos1_paketpreis = bv_det.get("Paketpreis");
				//pos1_beginn = bv_abr_beginn;
				//pos1_ende = bv_abr_ende;
			}
			// Wenn Preiserhöhung enthalten
			else
			{
				adj_newpricefrom = adj_newpricefrom.toDate();
				adj_percent_api = "Anpassung_" + zoho.currentdate.year() + "_in_Prozent";
				adj_percent = bv_det.get(adj_percent_api);
				adj_newprice_api = "Paketpreis_" + zoho.currentdate.year();
				adj_newprice = bv_det.get(adj_newprice_api);
				// Wenn Preiserhöhung VOR Beginn: 1 Position
				if(adj_newpricefrom < bv_abr_beginn)
				{
					pos1_paketpreis = bv_det.get("Paketpreis");
					//pos1_beginn = bv_abr_beginn;
					//pos1_ende = bv_abr_ende;
				}
				// Wenn Preiserhöhung GLEICH Beginn: 1 Position
				else if(adj_newpricefrom == bv_abr_beginn)
				{
					pos1_paketpreis = adj_newprice;
					//pos1_beginn = bv_abr_beginn;
					//pos1_ende = bv_abr_ende;
				}
				// Wenn Preiserhöhung NACH Beginn
				else
				{
					// Wenn Preiserhöhung NACH Ende: 1 Position
					if(adj_newpricefrom > bv_abr_ende)
					{
						pos1_paketpreis = bv_det.get("Paketpreis");
						//pos1_beginn = bv_abr_beginn;
						//pos1_ende = bv_abr_ende;
					}
					// Wenn Preiserhöhung VOR Ende
					else
					{
						// Beginn und "1 Tag vor Preiserhöhung" in Position 1 eintragen inkl. Paketpreis
						// "Tag der Preiserhöhung" und Ende in Position 2 eintragen inkl. Paketpreis
						pos1_paketpreis = bv_det.get("Paketpreis");
						pos1_beginn = bv_abr_beginn;
						pos1_ende = adj_newpricefrom.addDay(-1);
						pos2_paketpreis = adj_newprice;
						pos2_beginn = adj_newpricefrom;
						pos2_ende = bv_abr_ende;
					}
				}
			}
		}
		// Wenn es in der Loop weitergeht
		if(continue_loop)
		{
			cr_abr_pos = Map();
			// Kopfdaten für Abrechnung
			abr_beginn_form = bv_abr_beginn.toString("dd.MM.yyyy");
			abr_ende_form = bv_abr_ende.toString("dd.MM.yyyy");
			det_an_id = det_an.get("id");
			det_an_parent_id = det_an.get("Parent_Account").get("id");
			det_an_fi = zoho.crm.getRecordById("Accounts",det_an_parent_id);
			cr_abr_pos_name = "Abrechnung - " + det_an.get("Account_Name") + " - von " + abr_beginn_form + " bis " + abr_ende_form;
			cr_abr_pos.put("Name",cr_abr_pos_name);
			cr_abr_pos.put("BV_Abrechnung",abr_id);
			cr_abr_pos.put("Beratungsvertrag",bv_id);
			cr_abr_pos.put("Abnahmestelle",det_an.get("id"));
			if(!isNull(det_an.get("Standort_Stra_e")) && !isNull(det_an.get("Standort_Stadt")) || !isNull(det_an.get("Standort_Bezeichnung")))
			{
				cr_abr_pos.put("Rechnungsempf_nger",det_an_id);
			}
			else
			{
				cr_abr_pos.put("Rechnungsempf_nger",det_an_parent_id);
			}
			cr_abr_pos.put("Firma",bv_det.get("Firma"));
			cr_abr_pos.put("Status","Entwurf");
			cr_abr_pos.put("Owner",bv_det.get("Owner").get("id"));
			cr_abr_pos.put("Beginn",bv_abr_beginn);
			cr_abr_pos.put("Ende",bv_abr_ende);
			det_bv_prods = List();
			for each  det_bv_prods_map in bv_det.get("Beratungsvertragsprodukte")
			{
				det_bv_prods.add(det_bv_prods_map.get("Produkt").get("name"));
			}
			det_bv_prods = det_bv_prods.toString().replaceAll(",",", ");
			cr_abr_pos.put("Vertragsprodukte",det_bv_prods);
			cr_abr_pos.put("Paketpreis_gilt_f_r",bv_det.get("Paketpreis_gilt_f_r"));
			// Positionsdaten für Abrechnung
			cr_abr_pos.put("Paketpreis",pos1_paketpreis);
			cr_abr_pos.put("Pos_1_Beginn",pos1_beginn);
			cr_abr_pos.put("Pos_1_Ende",pos1_ende);
			cr_abr_pos.put("Pos_2_Paketpreis",pos2_paketpreis);
			cr_abr_pos.put("Pos_2_Beginn",pos2_beginn);
			cr_abr_pos.put("Pos_2_Ende",pos2_ende);
			// SEPA-Informationen wenn vorhanden
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
			//
			info cr_abr_pos;
			info zoho.crm.createRecord("BV_Abrechnung_Positionen",cr_abr_pos);
			cr_abr_pos.clear();
			pos1_paketpreis = null;
			pos1_beginn = null;
			pos1_ende = null;
			pos2_paketpreis = null;
			pos2_beginn = null;
			pos2_ende = null;
			bv_id = null;
			det_an_id = null;
			det_an_parent_id = null;
			bv_abr_beginn = null;
			bv_abr_ende = null;
			det_bv_prods = null;
		}
		info "============================";
	}
	/**** LOOP WIEDER REIN MACHEN
		if(response_jrl.get("info").get("more_records") == false)
		{
			break;
		}
		retry_attempt = retry_attempt + 1;
	}
	****/
}
//
// Verträge für Turnus "Quartärlich" auslesen
if(abr_turnus.contains("Quartärlich"))
{
	attempt = " ";
	retry_loop = attempt.leftPad(4).replaceAll(" ",",");
	retry_attempt = 0;
	recs_jrl_list = List();
	for each  retry in retry_loop
	{
		query_qtl = "select id from Beratungsvertr_ge where (Turnus = 'Quartärlich' and Turnus_Abrechnung like '%##TURNUS_ABRECHNUNG##%') limit " + retry_attempt * 200 + ", 200";
		//query_qtl = "SELECT id FROM Beratungsvertr_ge WHERE (Turnus = 'Quartärlich' and Turnus_Abrechnung like '%##TURNUS_ABRECHNUNG##%')";
		//query_qtl = query_qtl + " LIMIT 0, 200";
		//query_qtl = "SELECT id FROM Beratungsvertr_ge where id = 418194000006804281";
		query_qtl = query_qtl.replaceFirst("##TURNUS_ABRECHNUNG##",abr_monat);
		info query_qtl;
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
		info recs_qtl;
		for each  recs_qtl_elem in recs_qtl
		{
			bv_id = recs_qtl_elem.get("id");
			info bv_id;
			bv_det = zoho.crm.getRecordById("Beratungsvertr_ge",bv_id);
			// Beginn und Ende generell bestimmen (anhand Turnus und Richtung, ohne Einschränkung)
			bv_id = recs_qtl_elem.get("id");
			bv_det = zoho.crm.getRecordById("Beratungsvertr_ge",bv_id);
			bv_beginn = bv_det.get("Beginn").toDate();
			bv_turnus_richt = bv_det.get("Turnus_Richtung");
			abr_jahr_beginn = abr_jahr;
			if(abr_monat == "Januar" || abr_monat == "Februar" || abr_monat == "März")
			{
				if(bv_turnus_richt == "Vorhergehendes Quartal")
				{
					bv_abr_beginn_monat = 10;
					abr_jahr_beginn = abr_jahr.toNumber() - 1;
				}
				else
				{
					bv_abr_beginn_monat = 1;
				}
			}
			else if(abr_monat == "April" || abr_monat == "Mai" || abr_monat == "Juni")
			{
				if(bv_turnus_richt == "Vorhergehendes Quartal")
				{
					bv_abr_beginn_monat = 1;
				}
				else
				{
					bv_abr_beginn_monat = 4;
				}
			}
			else if(abr_monat == "Juli" || abr_monat == "August" || abr_monat == "September")
			{
				if(bv_turnus_richt == "Vorhergehendes Quartal")
				{
					bv_abr_beginn_monat = 4;
				}
				else
				{
					bv_abr_beginn_monat = 7;
				}
			}
			else if(abr_monat == "Oktober" || abr_monat == "November" || abr_monat == "Dezember")
			{
				if(bv_turnus_richt == "Vorhergehendes Quartal")
				{
					bv_abr_beginn_monat = 7;
				}
				else
				{
					bv_abr_beginn_monat = 10;
				}
			}
			bv_abr_beginn = (abr_jahr_beginn + "-" + bv_abr_beginn_monat + "-01").toDate();
			bv_abr_ende = bv_abr_beginn.eomonth(2);
			if(bv_abr_beginn < bv_beginn)
			{
				bv_abr_beginn = bv_beginn;
			}
			if(!bv_det.get("Ende").isNull())
			{
				bv_ende = bv_det.get("Ende").toDate();
				if(bv_abr_ende > bv_ende)
				{
					bv_abr_ende = bv_ende;
				}
			}
			//
			// Auslesen der Schließung aus AN
			det_an = zoho.crm.getRecordById("Accounts",bv_det.get("Abnahmestelle").get("id"));
			continue_loop = true;
			// Wenn Schließung eingetragen
			if(!det_an.get("Standort_Schlie_ung").isNull())
			{
				det_an_closing = det_an.get("Standort_Schlie_ung").toDate();
				// Wenn Schließung VOR dem Beginn
				if(det_an_closing < bv_abr_beginn)
				{
					// ENDE-VARIABLE SETZEN
					continue_loop = false;
				}
				// Wenn Schließung NACH dem Beginn
				else
				{
					// Wenn Schließung VOR dem Ende: Ende überschreiben
					if(det_an_closing < bv_abr_ende)
					{
						bv_abr_ende = det_an_closing;
					}
					// Wenn Schließung NACH dem Ende: nichts weiter machen
				}
			}
			// Wenn es in der Loop weitergeht
			if(continue_loop)
			{
				// Auslesen der Preiserhöhung aus dem BV für aktuelles Jahr
				adj_newpricefrom_api = "Paketpreis_" + zoho.currentdate.year() + "_ab";
				adj_newpricefrom = bv_det.get(adj_newpricefrom_api);
				// Wenn keine Preiserhöhung
				if(adj_newpricefrom.isNull())
				{
					// Nur 1 Position notwendig; Beginn und Ende in Position 1 eintragen  inkl. Paketpreis
					pos1_paketpreis = bv_det.get("Paketpreis");
					//pos1_beginn = bv_abr_beginn;
					//pos1_ende = bv_abr_ende;
				}
				// Wenn Preiserhöhung enthalten
				else
				{
					adj_newpricefrom = adj_newpricefrom.toDate();
					adj_percent_api = "Anpassung_" + zoho.currentdate.year() + "_in_Prozent";
					adj_percent = bv_det.get(adj_percent_api);
					adj_newprice_api = "Paketpreis_" + zoho.currentdate.year();
					adj_newprice = bv_det.get(adj_newprice_api);
					// Wenn Preiserhöhung VOR Beginn: 1 Position
					if(adj_newpricefrom < bv_abr_beginn)
					{
						pos1_paketpreis = bv_det.get("Paketpreis");
						//pos1_beginn = bv_abr_beginn;
						//pos1_ende = bv_abr_ende;
					}
					// Wenn Preiserhöhung GLEICH Beginn: 1 Position
					else if(adj_newpricefrom == bv_abr_beginn)
					{
						pos1_paketpreis = adj_newprice;
						//pos1_beginn = bv_abr_beginn;
						//pos1_ende = bv_abr_ende;
					}
					// Wenn Preiserhöhung NACH Beginn
					else
					{
						// Wenn Preiserhöhung NACH Ende: 1 Position
						if(adj_newpricefrom > bv_abr_ende)
						{
							pos1_paketpreis = bv_det.get("Paketpreis");
							//pos1_beginn = bv_abr_beginn;
							//pos1_ende = bv_abr_ende;
						}
						// Wenn Preiserhöhung VOR Ende
						else
						{
							// Beginn und "1 Tag vor Preiserhöhung" in Position 1 eintragen inkl. Paketpreis
							// "Tag der Preiserhöhung" und Ende in Position 2 eintragen inkl. Paketpreis
							pos1_paketpreis = bv_det.get("Paketpreis");
							pos1_beginn = bv_abr_beginn;
							pos1_ende = adj_newpricefrom.addDay(-1);
							pos2_paketpreis = adj_newprice;
							pos2_beginn = adj_newpricefrom;
							pos2_ende = bv_abr_ende;
						}
					}
				}
			}
			// Wenn es in der Loop weitergeht
			if(continue_loop)
			{
				cr_abr_pos = Map();
				// Kopfdaten für Abrechnung
				abr_beginn_form = bv_abr_beginn.toString("dd.MM.yyyy");
				abr_ende_form = bv_abr_ende.toString("dd.MM.yyyy");
				det_an_id = det_an.get("id");
				det_an_parent_id = det_an.get("Parent_Account").get("id");
				det_an_fi = zoho.crm.getRecordById("Accounts",det_an_parent_id);
				cr_abr_pos_name = "Abrechnung - " + det_an.get("Account_Name") + " - von " + abr_beginn_form + " bis " + abr_ende_form;
				cr_abr_pos.put("Name",cr_abr_pos_name);
				cr_abr_pos.put("BV_Abrechnung",abr_id);
				cr_abr_pos.put("Beratungsvertrag",bv_id);
				cr_abr_pos.put("Abnahmestelle",det_an.get("id"));
				if(!isNull(det_an.get("Standort_Stra_e")) && !isNull(det_an.get("Standort_Stadt")) || !isNull(det_an.get("Standort_Bezeichnung")))
				{
					cr_abr_pos.put("Rechnungsempf_nger",det_an_id);
				}
				else
				{
					cr_abr_pos.put("Rechnungsempf_nger",det_an_parent_id);
				}
				cr_abr_pos.put("Firma",bv_det.get("Firma"));
				cr_abr_pos.put("Status","Entwurf");
				cr_abr_pos.put("Owner",bv_det.get("Owner").get("id"));
				cr_abr_pos.put("Beginn",bv_abr_beginn);
				cr_abr_pos.put("Ende",bv_abr_ende);
				det_bv_prods = List();
				for each  det_bv_prods_map in bv_det.get("Beratungsvertragsprodukte")
				{
					det_bv_prods.add(det_bv_prods_map.get("Produkt").get("name"));
				}
				det_bv_prods = det_bv_prods.toString().replaceAll(",",", ");
				cr_abr_pos.put("Vertragsprodukte",det_bv_prods);
				cr_abr_pos.put("Paketpreis_gilt_f_r",bv_det.get("Paketpreis_gilt_f_r"));
				// Positionsdaten für Abrechnung
				cr_abr_pos.put("Paketpreis",pos1_paketpreis);
				cr_abr_pos.put("Pos_1_Beginn",pos1_beginn);
				cr_abr_pos.put("Pos_1_Ende",pos1_ende);
				cr_abr_pos.put("Pos_2_Paketpreis",pos2_paketpreis);
				cr_abr_pos.put("Pos_2_Beginn",pos2_beginn);
				cr_abr_pos.put("Pos_2_Ende",pos2_ende);
				// SEPA-Informationen wenn vorhanden
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
				//
				info cr_abr_pos;
				info zoho.crm.createRecord("BV_Abrechnung_Positionen",cr_abr_pos);
				cr_abr_pos.clear();
				pos1_paketpreis = null;
				pos1_beginn = null;
				pos1_ende = null;
				pos2_paketpreis = null;
				pos2_beginn = null;
				pos2_ende = null;
				bv_id = null;
				det_an_id = null;
				det_an_parent_id = null;
				bv_abr_beginn = null;
				bv_abr_ende = null;
				det_bv_prods = null;
			}
			info "============================";
		}
		if(response_qtl.get("info").get("more_records") == false)
		{
			break;
		}
		retry_attempt = retry_attempt + 1;
	}
}
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ALLES WAS AB HIER KOMMT IST ALT /////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Verträge für Turnus "Halbjährlich" auslesen
/****
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
****/
//
// Verträge für Turnus "Quartärlich" auslesen
/****
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
****/
//
// Check, ob mindestens 1 Vertrag gefunden wurde
/****
if(recs_jrl.isNull() && recs_hjl.isNull() && recs_qtl.isNull())
{
	return "Für die Einstellungen in der Abrechnung wurden keine Beratugsverträge gefunden.";
}
****/
//
// Globale Liste für alle Abrechnungen
/****bv_abr_liste = List();****/
//
// Abrechnungsvorschlag für Turnus "Jährlich"
if(!recs_jrl.isNull())
{
	/****
	for each recs_jrl_list_elem in recs_jrl_list
    {
		info recs_jrl_list_elem;
		bv_abr_map = Map();
		bv_id = recs_jrl_list_elem;
		bv_det = zoho.crm.getRecordById("Beratungsvertr_ge",bv_id);
		bv_beginn = bv_det.get("Beginn").toDate();
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
		if ( !bv_det.get("Ende").isNull() ) 
        {
			bv_ende = bv_det.get("Ende").toDate();
			if(bv_abr_ende > bv_ende)
			{
				bv_abr_ende = bv_ende;
			}
        }
		bv_abr_map.put("bv_id",bv_id);
		bv_abr_map.put("bv_typ","Jährlich");
		bv_abr_map.put("bv_abr_beginn",bv_abr_beginn);
		bv_abr_map.put("bv_abr_ende",bv_abr_ende);
		bv_abr_liste.add(bv_abr_map);
    }
	****/
	/*
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
	*/
}
//
// Abrechnungsvorschlag für Turnus "Quartärlich"
/****
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
****/
//
// Abrechnungsvorschlag für Turnus "Halbjährlich"
/****
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
****/
//
// Abrechnungsvorschläge erzeugen
/****
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
	//info zoho.crm.createRecord("BV_Abrechnung_Positionen",cr_abr_pos);
	info "-------------------------";
}
****/
//
return "Die Vorschläge wurden erfolgreich erstellt.";
}