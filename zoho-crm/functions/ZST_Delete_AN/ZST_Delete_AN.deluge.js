string standalone.ZST__Delete_AN()
{
an_lst = {418194000006328602,418194000006328634,418194000006328517,418194000006328549,418194000006328581,418194000006328613,418194000006328645,418194000006328496,418194000006328528,418194000006328560,418194000006328592,418194000006328624,418194000006328507,418194000006328539,418194000006328571,418194000006328603,418194000006328635,418194000006328518,418194000006328550,418194000006328582,418194000006328614,418194000006328646,418194000006328497,418194000006328529,418194000006328561,418194000006328593,418194000006328625,418194000006328508,418194000006328540,418194000006328572,418194000006328604,418194000006328636,418194000006328519,418194000006328551,418194000006328583,418194000006328615,418194000006328647,418194000006328498,418194000006328530,418194000006328562,418194000006328594,418194000006328626,418194000006328509,418194000006328541,418194000006328573,418194000006328605,418194000006328637,418194000006328520,418194000006328552,418194000006328584,418194000006328616,418194000006328648,418194000006328499,418194000006328531,418194000006328563,418194000006328595,418194000006328627,418194000006328510,418194000006328542,418194000006328574,418194000006328606,418194000006328638,418194000006328521,418194000006328553,418194000006328585,418194000006328617,418194000006328649,418194000006328486,418194000006328487,418194000006328488,418194000006328458,418194000006328459,418194000005758060,418194000006589062};
for each  an_id in an_lst
{
	info an_id;
	ok_to_delete = true;
	// Check if AN
	an_det = zoho.crm.getRecordById("Accounts",an_id);
	if(an_det.get("Firmentyp") != 'Abnahmestelle')
	{
		ok_to_delete = false;
	}
	// Check related notes
	an_rel_notes = zoho.crm.getRelatedRecords("Notes","Accounts",an_id);
	if(an_rel_notes.size() > 0)
	{
		ok_to_delete = false;
	}
	// Check related attachments
	an_rel_att = invokeurl
	[
		url :"https://www.zohoapis.eu/crm/v5/Accounts/" + an_id + "/Attachments?fields=id"
		type :GET
		connection:"crm_all"
	];
	if(!an_rel_att.isNull())
	{
		ok_to_delete = false;
	}
	// Check related contacts
	an_rel_cont = zoho.crm.getRelatedRecords("Contacts","Accounts",an_id);
	if(an_rel_cont.size() > 0)
	{
		ok_to_delete = false;
	}
	// Check related opps
	an_rel_opp = zoho.crm.getRelatedRecords("Deals","Accounts",an_id);
	if(an_rel_opp.size() > 0)
	{
		ok_to_delete = false;
	}
	// Check related projects
	// Check related books estimates and invoices
	fi_accs = invokeurl
	[
		url :"https://www.zohoapis.eu/books/v3/contacts/?organization_id=20080259560&zcrm_account_id=" + an_id
		type :GET
		connection:"books_connection"
	];
	if(fi_accs.get("code") == 0)
	{
		fi_acc_id = fi_accs.get("contacts").get(0).get("contact_id");
		// Check related books estimates
		an_rel_fi_ests = invokeurl
		[
			url :"https://www.zohoapis.eu/books/v3/estimates/?organization_id=20080259560&customer_id=" + fi_acc_id
			type :GET
			connection:"books_connection"
		];
		if(an_rel_fi_ests.get("code") == 0)
		{
			if(an_rel_fi_ests.get("estimates").length() > 0)
			{
				ok_to_delete = false;
			}
		}
		// Check related books invoices
		an_rel_fi_invs = invokeurl
		[
			url :"https://www.zohoapis.eu/books/v3/invoices/?organization_id=20080259560&customer_id=" + fi_acc_id
			type :GET
			connection:"books_connection"
		];
		if(an_rel_fi_invs.get("code") == 0)
		{
			if(an_rel_fi_invs.get("invoices").length() > 0)
			{
				ok_to_delete = false;
			}
		}
	}
	// Check related BVs
	an_rel_bv = zoho.crm.getRelatedRecords("Beratungsvertr_ge","Accounts",an_id);
	if(an_rel_bv.size() > 0)
	{
		ok_to_delete = false;
	}
	// Check related BV positions (AN)
	an_rel_bv_pos_an = zoho.crm.getRelatedRecords("BV_Abrechnung_Positionen","Accounts",an_id);
	if(an_rel_bv_pos_an.size() > 0)
	{
		ok_to_delete = false;
	}
	// Check related BV positions (RE)
	an_rel_bv_pos_re = zoho.crm.getRelatedRecords("BV_Abrechnung_Pos_Rechnungsempf_nger","Accounts",an_id);
	if(an_rel_bv_pos_re.size() > 0)
	{
		ok_to_delete = false;
	}
	//
	// Check if something has been found
	info "OK to delete: " + ok_to_delete;
	if(ok_to_delete)
	{
		// If not: delete AN
		del_an_resp = invokeurl
		[
			url :"https://www.zohoapis.eu/crm/v5/Accounts?ids=" + an_id
			type :DELETE
			connection:"crm_all"
		];
		info del_an_resp;
	}
	else
	{
		// If yet: tag AN
		upd_an = Map();
		upd_an.put("tag_names","BITTE_MANUELL_LOESCHEN");
		upd_an_resp = invokeurl
		[
			url :"https://www.zohoapis.eu/crm/v2/Accounts/" + an_id + "/actions/add_tags"
			type :POST
			parameters:upd_an
			connection:"crm_all"
		];
		info upd_an_resp;
	}
	info "----------------------------------";
}
return "";
}