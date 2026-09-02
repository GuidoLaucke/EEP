string standalone.ZST_createEstimate(Int dealId)
{
// Guido 12-05-2023
newLine = hexToText("0A");
//Version 0.1
// Create estimate with products in Subform from deals
///////// INITIALISATION //////////
//////// PARAMETERS      //////////
booksOrgId = "20080259560";
subFormName = "Produkte";
numberOfFieldName = "Menge";
unitPriceFieldName = "Einzelpreis";
productFieldName = "Produkt";
totalPriceFieldName = "Summe";
termsBundle = "";
termsAccount = "";
adminEmail = ifNull(zoho.crm.getOrgVariable("adminEmail"),"gl@langheinrichco.de");
branches = Collection();
branches.insert("EEP":"235883000001208009");
branches.insert("EEP AT":"235883000001208049");
branches.insert("ENC":"235883000001208083");
estimate_template = Collection();
estimate_template.insert("EEP":"235883000001212052");
estimate_template.insert("EEP AT":"235883000002813347");
estimate_template.insert("ENC":"235883000002813355");
////////////////////////////////////
try 
{
	dealEntry = zoho.crm.getRecordById("Deals",dealId);
	angebot_von_eep_enc = dealEntry.get("EEP_ENC");
	zahlungsbedingung = dealEntry.get("Zahlungsbedingungen");
	zahlungsziel = dealEntry.get("Zahlungsziel");
	owner_email = dealEntry.get("Owner").get("email");
	books_owner_id = standalone.ZST_GetBooksUser(owner_email);
	b_ist_bundleProdukt = if(dealEntry.get("Bundle_Produkt") != null,true,false);
	ergaenzenderTextinBeschreibung = ifNull(dealEntry.get("Erg_nzende_Produktbeschreibung"),"");
	contactName = dealEntry.get("Account_Name");
	info zoho.crm.getRecordById("Accounts",dealEntry.get("Account_Name").get("id"));
	subFormData = dealEntry.get(subFormName);
	/////////// GET BOOKS CONTACTID /////////////
	searchParam = {"contact_name":contactName.get("name"),"status":"active"};
	info "ZST_createEstimate searchParam: " + searchParam;
	contactBooks = zoho.books.getRecords("Contacts",booksOrgId,searchParam,"books_connection");
	info "ZST_createEstimate contactBooks: " + contactBooks;
	if(contactBooks.get("contacts").size() == 0)
	{
		return {"error":"Fehler: Kontakt ist nicht in Books vorhanden. Bitte synchronisieren oder manuell in Books anlegen."};
	}
	contactIdBooks = ifNull(contactBooks.get("contacts").get(0).get("contact_id"),null);
	contactNameBooks = ifNull(contactBooks.get("contacts").get(0).get("contact_name"),null);
	//info "contactBooks: " + contactBooks;
	info "ZST_createEstimate contactIdBooks: " + contactIdBooks;
	//info "contactNameBooks: " + contactNameBooks;
	///////////////////////////////////////////////
	prodList = List();
	description = "";
	allGErgaenzung = "";
	if(ergaenzenderTextinBeschreibung != "")
	{
		description = ergaenzenderTextinBeschreibung;
	}
	for each  objects in subFormData
	{
		productId = ifNull(objects.get(productFieldName),{"id":""}).get("id");
		if(productId == "")
		{
			info "productFieldName:" + productFieldName;
			info objects;
			continue;
		}
		productEntry = zoho.crm.getRecordById("Products",productId);
		productname = objects.get(productFieldName).get("name");
		numberOfProduct = ifnull(objects.get(numberOfFieldName),0);
		price = ifnull(objects.get(unitPriceFieldName),productEntry.get("Unit_Price"));
		prodmp = Map();
		prodmp.put("name",productname);
		prodmp.put("rate",price);
		prodmp.put("quantity",numberOfProduct);
		allGErgaenzung = ifnull(objects.get("allg_Ergaenzung"),"");
		if(allGErgaenzung != "")
		{
			prodmp.put("description",allGErgaenzung);
		}
		//prodmp.put("tax_id", 235883000001957107);
		// Books DE: nicht geändert, da auskommentiert
		prodmp.put("tax_id","");
		//// WENN BUNDLE PRODUKT DANN IM ANGEBOT NUR DAS BUNDLE ALS ITEM UND DIE PRODUKTE IN DIE BESCHREIBUNG
		if(b_ist_bundleProdukt == false)
		{
			prodList.add(prodmp);
		}
		else
		{
			description = description + if(description == "","",newLine) + "- " + productname + if(allGErgaenzung != "",newLine + allGErgaenzung,"");
		}
	}
	//info "description: " + description;
	if(b_ist_bundleProdukt == true)
	{
		bundleProduktname = dealEntry.get("Bundle_Produkt").get("name");
		bundleProduktId = dealEntry.get("Bundle_Produkt").get("id");
		productEntry = zoho.crm.getRecordById("Products",bundleProduktId);
		numberOfProduct = 1;
		price = dealEntry.get("Amount");
		//productEntry.get("Unit_Price");
		prodmp = Map();
		prodmp.put("name",bundleProduktname);
		prodmp.put("rate",price);
		prodmp.put("quantity",numberOfProduct);
		prodmp.put("description",description);
		prodmp.put("tax_id","");
		prodList.add(prodmp);
	}
	mp = Map();
	mp.put("customer_id",contactIdBooks);
	mp.put("customer_name",contactNameBooks);
	mp.put("line_items",prodList);
	mp.put("date",if(dealEntry.get("Angebotsdatum") != null,dealEntry.get("Angebotsdatum"),zoho.currentdate));
	mp.put("zcrm_potential_id",dealId);
	mp.put("owner_id",books_owner_id);
	mp.put("salesperson_id",standalone.ZST_GetSalesId(owner_email));
	mp.put("notes","Zahlungsbedingungen" + newLine + zahlungsbedingung + newLine + "Zahlungsziel: " + zahlungsziel);
	payment_terms = 0;
	if(!dealEntry.get("Zahlungsziel").isNull())
	{
		if(dealEntry.get("Zahlungsziel") == "Zahlbar innerhalb 10 Tage ab Rechnungsstellung")
		{
			payment_terms = 10;
		}
		else if(dealEntry.get("Zahlungsziel") == "Zahlbar innerhalb 20 Tage ab Rechnungsstellung")
		{
			payment_terms = 20;
		}
		else if(dealEntry.get("Zahlungsziel") == "Zahlbar innerhalb 30 Tage ab Rechnungsstellung")
		{
			payment_terms = 30;
		}
	}
	mp.put("payment_terms",payment_terms);
	mp.put("branch_id",if(branches.get(angebot_von_eep_enc) == null,235883000001208009,branches.get(angebot_von_eep_enc)));
	mp.put("template_id",if(estimate_template.get(angebot_von_eep_enc) == null,235883000001212052,estimate_template.get(angebot_von_eep_enc)));
	if(dealEntry.get("Rabatt") > 0)
	{
		mp.put("discount",dealEntry.get("Rabatt"));
		mp.put("discount_type","entity_level");
	}
	// E-Mail-Adresse Projektleiter hinzufügen BOF
	if(!dealEntry.get("Ausgewaehlter_Projektleiter").isNull())
	{
		pl_user_id = dealEntry.get("Ausgewaehlter_Projektleiter").get("id");
		pl_user_det = zoho.crm.getRecordById("users",pl_user_id);
		pl_user_email = pl_user_det.get("users").get(0).get("email");
		mp_cust_fields = List();
		mp_cust_field_pl_email = Map();
		mp_cust_field_pl_email.put("label","Projektleiter (E-Mail)");
		mp_cust_field_pl_email.put("value",pl_user_email);
		mp_cust_fields.add(mp_cust_field_pl_email);
		mp.put("custom_fields",mp_cust_fields);
	}
	// E-Mail-Adresse Projektleiter hinzufügen EOF
	// Books DE: Workaround USt-Behandlung AUSschalten BOF
	if(angebot_von_eep_enc == "EEP AT")
	{
		upd_cont_vat = Map();
		upd_cont_vat.put("tax_treatment","eu_vat_not_registered");
		upd_cont_vat_resp = invokeurl
		[
			url :"https://www.zohoapis.eu/books/v3/contacts/" + contactIdBooks + "?organization_id=" + booksOrgId
			type :PUT
			parameters:upd_cont_vat.toString()
			connection:"books_connection"
		];
		info upd_cont_vat_resp;
	}
	// Books DE: Workaround USt-Behandlung AUSschalten EOF
	respCreate = zoho.books.createRecord("Estimates",booksOrgId,mp,"books_connection");
	// Books DE: Workaround USt-Behandlung wieder EINschalten BOF
	if(angebot_von_eep_enc == "EEP AT")
	{
		upd_cont_vat = Map();
		upd_cont_vat.put("tax_treatment","eu_vat_registered");
		upd_cont_vat_resp = invokeurl
		[
			url :"https://www.zohoapis.eu/books/v3/contacts/" + contactIdBooks + "?organization_id=" + booksOrgId
			type :PUT
			parameters:upd_cont_vat.toString()
			connection:"books_connection"
		];
		info upd_cont_vat_resp;
	}
	// Books DE: Workaround USt-Behandlung wieder EINschalten EOF
	info "map mp: " + mp;
	info "create: " + respCreate;
	if(respCreate.get("code") == 0)
	{
		info "Estimate Nr. " + respCreate.get("estimate").get("estimate_number") + " erfolgreich angelegt";
		/// APPROVE ESTIMATE
		response = invokeurl
		[
			url :"https://www.zohoapis.eu/books/v3/estimates/" + respCreate.get("estimate").get("estimate_id") + "/approve?organization_id=" + booksOrgId
			type :POST
			connection:"books_connection"
		];
		if(respCreate.get("estimate").get("estimate_number") == "aktivieren Sie ihn bitte in den angebot-Voreinstellungen.")
		{
			estimate_number = "";
		}
		else
		{
			estimate_number = respCreate.get("estimate").get("estimate_number");
		}
		return {"estimate_id":respCreate.get("estimate").get("estimate_id"),"estimate_number":estimate_number,"date":mp.get("date"),"error":""};
	}
	else
	{
		info "Fehler: " + respCreate.get("message");
		return {"error":respCreate.get("message")};
	}
}
catch (e)
{
	info "error: " + e;
	sendmail
	[
		from :zoho.loginuserid
		to :adminEmail
		subject :"Fehler bei der Erstellung des Angebots bei der " + ifNull(zoho.crm.getOrgVariable("orgName"),"")
		message :"fehler in deluge script 'ZST_createEstimate(Int dealId '" + dealId + "' )" + e + " am " + zoho.currenttime
	]
	return {"error":e};
}
return {};
}