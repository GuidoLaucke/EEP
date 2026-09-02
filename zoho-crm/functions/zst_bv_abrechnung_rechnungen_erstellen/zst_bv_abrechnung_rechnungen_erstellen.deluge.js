string button.ZST_BV_Abrechnung_Rechnungen_erstellen(String abr_id)
{
//abr_id = 418194000014192057;
// 418194000011795240
abr = zoho.crm.getRecordById("BV_Abrechnungen",abr_id);
if(abr.get("Status") != "Vorschläge generiert")
{
	return "Es können keine Rechnungen erzeugt werden, da noch keine Vorschläge erstellt wurden.";
}
abr_posn_cnt = 0;
abr_posn = zoho.crm.getRelatedRecords("BV_Abrechnung_Positionen","BV_Abrechnungen",abr_id,1,100);
for each  abr_pos in abr_posn
{
	info abr_pos.get("id");
	if(!abr_pos.get("Zoho_Books_ID").isNull())
	{
		info "Für die Position wurde bereits eine Rechnung erstellt.";
	}
	else
	{
		abr_posn_cnt = abr_posn_cnt + 1;
		if(abr_pos.get("Firma") == "EEP AT")
		{
			cr_inv_map_branch_id = 235883000001208049;
			cr_inv_map_template_id = 235883000001438041;
			// Books DE: cr_inv_map_itm_tax_id = 235883000001957091;
			cr_inv_map_itm_tax_id = 235883000022879903;
		}
		else if(abr_pos.get("Firma") == "ENC")
		{
			cr_inv_map_branch_id = 235883000001208083;
			cr_inv_map_template_id = 235883000001438079;
			// Books DE: cr_inv_map_itm_tax_id = 235883000001957107;
			cr_inv_map_itm_tax_id = 235883000022879691;
		}
		else
		{
			cr_inv_map_branch_id = 235883000001208009;
			cr_inv_map_template_id = 235883000001438033;
			// Books DE: cr_inv_map_itm_tax_id = 235883000001957107;
			cr_inv_map_itm_tax_id = 235883000022879691;
		}
		// Rechnungs-Header
		cr_inv_map = Map();
		an_det = zoho.crm.getRecordById("Accounts",abr_pos.get("Rechnungsempf_nger").get("id"));
		an_det_id = an_det.get("id");
		an_det_fi_name = an_det.get("Name_Firmierung");
		books_cont = zoho.books.getRecords("Contacts",20080259560,{"zcrm_account_id":an_det_id},"books_connection");
		inv_acc_id = books_cont.get("contacts").get(0).get("contact_id");
		cr_inv_map.put("customer_id",inv_acc_id);
		cr_inv_map.put("customer_name",an_det_fi_name);
		cr_inv_map.put("branch_id",cr_inv_map_branch_id);
		cr_inv_map.put("template_id",cr_inv_map_template_id);
		cr_inv_map.put("payment_terms",10);
		cr_inv_map.put("payment_terms_label","10 Tage rein netto");
		cr_inv_map.put("date",abr.get("Rechnungsdatum").toDate());
		cr_inv_map.put("is_draft",true);
		// Primäre Kontakte
		acc = zoho.books.getRecordsByID("contacts",20080259560,inv_acc_id,"books_connection");
		pr_cont = acc.get("contact").get("primary_contact_id");
		pr_conts_list = List();
		pr_conts_list.add(pr_cont);
		if(pr_conts_list.get(0) != "")
		{
			cr_inv_map.put("contact_persons",pr_conts_list);
		}
		// FI-Informationen
		cr_inv_custom_fields = List();
		fi_revenue_type_map = Map();
		fi_revenue_type_map.put("label","Revenue Type");
		fi_revenue_type_map.put("value","EW");
		cr_inv_custom_fields.add(fi_revenue_type_map);
		fi_kst_bezeichnung_map = Map();
		fi_kst_bezeichnung_map.put("label","Kostenstellen-Bezeichnung");
		fi_kst_bezeichnung_map.put("value","EW");
		cr_inv_custom_fields.add(fi_kst_bezeichnung_map);
		fi_kst_nummer_map = Map();
		fi_kst_nummer_map.put("label","Kostenstellen-Nummer");
		fi_kst_nummer_map.put("value","1");
		cr_inv_custom_fields.add(fi_kst_nummer_map);
		fi_rec_revenue_map = Map();
		fi_rec_revenue_map.put("label","Recurring Revenue");
		fi_rec_revenue_map.put("value","Recurring");
		cr_inv_custom_fields.add(fi_rec_revenue_map);
		// Betreff
		cr_inv_beginn = abr_pos.get("Beginn").toString("dd.MM.yyyy");
		cr_inv_ende = abr_pos.get("Ende").toString("dd.MM.yyyy");
		cr_inv_subj_cont = "Für unsere Beratungsdienstleistung für den Zeitraum vom " + cr_inv_beginn + " bis " + cr_inv_ende + " berechnen wir Ihnen gemäß Beratungsvereinbarung wie folgt:";
		cr_inv_subj_cont = cr_inv_subj_cont + hexToText("0A");
		cr_inv_subj_cont = cr_inv_subj_cont + hexToText("0A");
		if(!an_det.get("Standort_Bezeichnung").isNull())
		{
			cr_inv_subj_cont = cr_inv_subj_cont + "Objekt: " + an_det.get("Standort_Bezeichnung");
		}
		else
		{
			cr_inv_subj_cont = cr_inv_subj_cont + "Objekt: " + an_det.get("Standort_Stadt") + ", " + an_det.get("Standort_Stra_e");
		}
		if(!an_det.get("Matchcode").isNull())
		{
			cr_inv_subj_cont = cr_inv_subj_cont + ", " + an_det.get("Matchcode");
		}
		if(!an_det.get("Standort_Lieferplanzahl").isNull())
		{
			cr_inv_subj_cont = cr_inv_subj_cont + hexToText("0A");
			cr_inv_subj_cont = cr_inv_subj_cont + "Lieferplanzahl: " + an_det.get("Standort_Lieferplanzahl");
		}
		if(abr_pos.get("Firma") == "EEP AT")
		{
			cr_inv_subj_cont = cr_inv_subj_cont + hexToText("0A");
			cr_inv_subj_cont = cr_inv_subj_cont + "Ihr USt-ID: " + abr_pos.get("SEPA_USt_IdNr");
		}
		cr_inv_map.put("subject_content",cr_inv_subj_cont);
		// Owner-Verknüpfung
		bv_det = zoho.crm.getRecordById("Beratungsvertr_ge",abr_pos.get("Beratungsvertrag").get("id"));
		if(!bv_det.get("Opportunity").isNull())
		{
			opp_det = zoho.crm.getRecordById("Deals",bv_det.get("Opportunity").get("id"));
			usr_det = zoho.crm.getRecordById("users",opp_det.get("Owner").get("id"));
			usr_email = usr_det.get("users").get(0).get("email");
			books_users = zoho.books.getRecords("users",20080259560,{"email":usr_email},"books_connection");
			if(books_users.get("message") == "success")
			{
				books_users = books_users.get("users");
				if(books_users.size() == 1)
				{
					books_user_id = books_users.get(0).get("user_id");
					cr_inv_custom_field = Map();
					cr_inv_custom_field.put("api_name","cf_verk_ufer");
					cr_inv_custom_field.put("value",books_user_id);
					cr_inv_custom_fields.add(cr_inv_custom_field);
				}
			}
		}
		// Zahlungs-Infos
		if(abr_pos.get("SEPA_Mandat_vorhanden") == "Ja")
		{
			cr_inv_map_notes = "Den fälligen Betrag ziehen wir per SEPA-Lastschrift (Mandatsreferenz ";
			cr_inv_map_notes = cr_inv_map_notes + abr_pos.get("SEPA_Mandatsreferenz") + ", Gläubiger-ID DE62ZZZ00000595403) ";
			cr_inv_map_notes = cr_inv_map_notes + "von Ihrem Konto (" + abr_pos.get("SEPA_IBAN") + ") bei der ";
			cr_inv_map_notes = cr_inv_map_notes + abr_pos.get("SEPA_Bank") + " zum Fälligkeitstag ein.";
			sepa_map = Map();
			sepa_map.put("label","SEPA-Mandat");
			sepa_map.put("value","Ja");
			cr_inv_custom_fields.add(sepa_map);
		}
		else
		{
			cr_inv_map_notes = "Bitte überweisen Sie den fälligen Betrag bis zum angegebenen Zahlungsziel auf unser unten genanntes Konto.";
			cr_inv_map_notes = cr_inv_map_notes + hexToText("0A");
			cr_inv_map_notes = cr_inv_map_notes + hexToText("0A");
			cr_inv_map_notes = cr_inv_map_notes + "Bitte beachten Sie unsere neue Bankverbindung!";
		}
		cr_inv_map.put("notes",cr_inv_map_notes);
		// Rechnungspositionen
		cr_inv_map_itm_lst = List();
		cr_inv_map_itm1 = Map();
		cr_inv_map_itm1.put("name",abr_pos.get("Vertragsprodukte"));
		if(!abr_pos.get("Pos_1_Beginn").isNull() && !abr_pos.get("Pos_1_Ende").isNull())
		{
			cr_inv_map_itm1_desc = abr_pos.get("Pos_1_Beginn").toString("dd.MM.yyyy") + " bis ";
			cr_inv_map_itm1_desc = cr_inv_map_itm1_desc + abr_pos.get("Pos_1_Ende").toString("dd.MM.yyyy");
			cr_inv_map_itm1.put("description",cr_inv_map_itm1_desc);
		}
		if(abr_pos.get("Paketpreis_gilt_f_r") == "Jahr")
		{
			cr_inv_map_itm1.put("quantity",1);
		}
		else
		{
			if(!abr_pos.get("Pos_1_Beginn").isNull() && !abr_pos.get("Pos_1_Ende").isNull())
			{
				cr_inv_map_itm1_monate = abr_pos.get("Pos_1_Beginn").monthsBetween(abr_pos.get("Pos_1_Ende").addDay(1));
			}
			else
			{
				cr_inv_map_itm1_monate = abr_pos.get("Beginn").monthsBetween(abr_pos.get("Ende").addDay(1));
			}
			cr_inv_map_itm1.put("quantity",cr_inv_map_itm1_monate);
		}
		cr_inv_map_itm1.put("rate",abr_pos.get("Paketpreis"));
		cr_inv_map_itm1.put("tax_id",cr_inv_map_itm_tax_id);
		cr_inv_map_itm_lst.add(cr_inv_map_itm1);
		if(!abr_pos.get("Pos_2_Beginn").isNull() && !abr_pos.get("Pos_2_Ende").isNull())
		{
			cr_inv_map_itm2 = Map();
			cr_inv_map_itm2.put("name",abr_pos.get("Vertragsprodukte"));
			cr_inv_map_itm2_desc = abr_pos.get("Pos_2_Beginn").toString("dd.MM.yyyy") + " bis ";
			cr_inv_map_itm2_desc = cr_inv_map_itm2_desc + abr_pos.get("Pos_2_Ende").toString("dd.MM.yyyy");
			cr_inv_map_itm2.put("description",cr_inv_map_itm2_desc);
			if(abr_pos.get("Paketpreis_gilt_f_r") == "Jahr")
			{
				cr_inv_map_itm2.put("quantity",1);
			}
			else
			{
				cr_inv_map_itm2_monate = abr_pos.get("Pos_2_Beginn").monthsBetween(abr_pos.get("Pos_2_Ende"));
				cr_inv_map_itm2.put("quantity",cr_inv_map_itm2_monate);
			}
			cr_inv_map_itm2.put("rate",abr_pos.get("Pos_2_Paketpreis"));
			cr_inv_map_itm2.put("tax_id",cr_inv_map_itm_tax_id);
			cr_inv_map_itm_lst.add(cr_inv_map_itm2);
		}
		cr_inv_map.put("line_items",cr_inv_map_itm_lst);
		// Custom-Felder aufbauen
		cr_inv_map.put("custom_fields",cr_inv_custom_fields);
		//
		info cr_inv_map;
		/****/
		// Books DE: Workaround USt-Behandlung AUSschalten BOF
		if(abr_pos.get("Firma") == "EEP AT")
		{
			upd_cont_vat = Map();
			upd_cont_vat.put("tax_treatment","eu_vat_not_registered");
			upd_cont_vat_resp = invokeurl
			[
				url :"https://www.zohoapis.eu/books/v3/contacts/" + inv_acc_id + "?organization_id=20080259560"
				type :PUT
				parameters:upd_cont_vat.toString()
				connection:"books_connection"
			];
			info upd_cont_vat_resp;
		}
		// Books DE: Workaround USt-Behandlung AUSschalten EOF
		cr_inv_ret = zoho.books.createRecord("Invoices",20080259560,cr_inv_map,"books_connection");
		//info cr_inv_ret;
		info cr_inv_ret.get("message");
		// Books DE: Workaround USt-Behandlung wieder EINschalten BOF
		if(abr_pos.get("Firma") == "EEP AT")
		{
			upd_cont_vat = Map();
			upd_cont_vat.put("tax_treatment","eu_vat_registered");
			upd_cont_vat_resp = invokeurl
			[
				url :"https://www.zohoapis.eu/books/v3/contacts/" + inv_acc_id + "?organization_id=20080259560"
				type :PUT
				parameters:upd_cont_vat.toString()
				connection:"books_connection"
			];
			info upd_cont_vat_resp;
		}
		// Books DE: Workaround USt-Behandlung wieder EINschalten EOF
		upd_abr_pos = Map();
		new_inv_id = cr_inv_ret.get("invoice").get("invoice_id");
		new_inv_url = "https://books.zoho.eu/app/20080259560#/invoices/" + new_inv_id;
		upd_abr_pos.put("Zoho_Books_ID",new_inv_id);
		upd_abr_pos.put("Zoho_Books_Link_zur_Rechnung",new_inv_url);
		//info upd_abr_pos;
		zoho.crm.updateRecord("BV_Abrechnung_Positionen",abr_pos.get("id"),upd_abr_pos);
		/****/
		info "Update-Nummer: " + abr_posn_cnt;
	}
	info "---------------------";
}
////info zoho.crm.updateRecord("BV_Abrechnungen",abr_id,{"Status":"Rechnungen erstellt"});
return "Die Rechnungen wurden erfolgreich erstellt.";
}