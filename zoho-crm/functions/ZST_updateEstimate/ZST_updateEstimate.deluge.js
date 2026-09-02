string standalone.ZST_updateEstimate(Int estimate_id, Int dealId)
{
// Guido 01-11-2023
newLine = hexToText("0A");
dealEntry = zoho.crm.getRecordById("Deals",dealId);
//Version 0.1
// Create estimate with products in Subform from deals
///////// INITIALISATION //////////
//////// PARAMETERS      //////////
booksOrgId = "20080259560";
/// IST DAS ANGEBOT SCHON AKZEPTIERT?
resp = zoho.books.getRecordsByID("Estimates",booksOrgId,estimate_id,"books_connection");
status = resp.get("estimate").get("status");
if(status == "accepted")
{
	return {"estimate_id":estimate_id,"estimate_number":resp.get("estimate").get("estimate_number"),"date":if(dealEntry.get("Angebotsdatum") != null,dealEntry.get("Angebotsdatum"),zoho.currentdate.toString("yyyy-MM-dd")),"error":""};
}
/////////////////////////////////////
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
	angebot_von_eep_enc = dealEntry.get("EEP_ENC");
	b_ist_bundleProdukt = if(dealEntry.get("Bundle_Produkt") != null,true,false);
	ergaenzenderTextinBeschreibung = ifNull(dealEntry.get("Erg_nzende_Produktbeschreibung"),"");
	contactName = dealEntry.get("Account_Name");
	info zoho.crm.getRecordById("Accounts",dealEntry.get("Account_Name").get("id"));
	zahlungsbedingung = dealEntry.get("Zahlungsbedingungen");
	zahlungsziel = dealEntry.get("Zahlungsziel");
	subFormData = dealEntry.get(subFormName);
	/////////// GET BOOKS CONTACTID /////////////
	searchParam = {"contact_name":contactName.get("name"),"status":"active"};
	//info "searchParam: " + searchParam;
	contactBooks = zoho.books.getRecords("Contacts",booksOrgId,searchParam,"books_connection");
	//info "contactBooks: " + contactBooks;
	if(contactBooks.isEmpty())
	{
		contactBooks_resp = invokeurl
		[
			url :"https://www.zohoapis.eu/books/v3/crm/account/" + contactName.get("id") + "/import?organization_id=" + booksOrgId
			type :POST
			connection:"books_connection"
		];
		//info contactBooks_resp;
		if(contactBooks_resp.get("code") == 0)
		{
			contactIdBooks = contactBooks_resp.get("data").get("customer_id");
		}
		else
		{
			return "Customer " + dealEntry.get("Account_Name").get("name") + " could not be found in Books!";
		}
	}
	else
	{
		//info "contactBooks: " + contactBooks;
		if(contactBooks.get("contacts").size() > 0)
		{
			contactIdBooks = ifNull(contactBooks.get("contacts").get(0).get("contact_id"),null);
			//info contactIdBooks;
		}
		else
		{
			return "Customer " + dealEntry.get("Account_Name").get("name") + " could not be found in Books!";
		}
	}
	//info "contactBooks: " + contactBooks;
	//info "contactIdBooks: " + contactIdBooks;
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
		productId = objects.get(productFieldName).get("id");
		productEntry = zoho.crm.getRecordById("Products",productId);
		productname = objects.get(productFieldName).get("name");
		numberOfProduct = ifnull(objects.get(numberOfFieldName),0);
		price = ifnull(objects.get(unitPriceFieldName),productEntry.get("Unit_Price"));
		prodmp = Map();
		prodmp.put("name",productname);
		prodmp.put("rate",price);
		prodmp.put("quantity",numberOfProduct);
		prodmp.put("tax_id","");
		allGErgaenzung = ifnull(objects.get("allg_Ergaenzung"),"");
		if(allGErgaenzung != "")
		{
			prodmp.put("description",allGErgaenzung);
		}
		//prodmp.put("tax_id",235883000000080138);
		//// WENN BUNDLE PRODUKT DANN IM ANGEBOT NUR DAS BUNDLE ALS ITEM UND DIE PRODUKTE IN DIE BESCHREIBUNG
		if(b_ist_bundleProdukt == false)
		{
			prodList.add(prodmp);
		}
		else
		{
			description = description + if(description == "","",newLine) + "- " + productname + if(allGErgaenzung != "",newLine + allGErgaenzung,"");
			termsBundle = ifNull(ifNull(dealEntry.get("Zahlungsbedingungen"),"") + newLine + "Zahlungsziel: Zahlbar innerhalb 10 Tage ab Rechnungsstellung","Zahlungsziel: Zahlbar innerhalb 10 Tage ab Rechnungsstellung");
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
	mp.put("line_items",prodList);
	mp.put("date",if(dealEntry.get("Angebotsdatum") != null,dealEntry.get("Angebotsdatum"),zoho.currentdate.toString("yyyy-MM-dd")));
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
	else
	{
		mp.put("discount","");
		mp.put("discount_type","");
	}
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
	respUpdate = zoho.books.updateRecord("Estimates",booksOrgId,estimate_id,mp,"books_connection");
	//info "map mp: " + mp;
	//info "create: " + respCreate;
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
	if(respUpdate.get("code") == 0)
	{
		info "Estimate Nr. " + respUpdate.get("estimate").get("estimate_number") + " erfolgreich geupdated";
		/// APPROVE ESTIMATE
		/*response = invokeurl
		[
			url :"https://www.zohoapis.eu/books/v3/estimates/" + respCreate.get("estimate").get("estimate_id") + "/approve?organization_id=" + booksOrgId
			type :POST
			connection:"books_connection"
		];
		info response;
		*/
		estimate_number = null;
		if(respUpdate.get("estimate").get("estimate_number") == "aktivieren Sie ihn bitte in den angebot-Voreinstellungen.")
		{
			estimate_number = "";
		}
		else
		{
			estimate_number = respUpdate.get("estimate").get("estimate_number");
		}
		return {"estimate_id":respUpdate.get("estimate").get("estimate_id"),"estimate_number":estimate_number,"date":mp.get("date"),"error":""};
	}
	else
	{
		info mp;
		info "Fehler: " + respUpdate.get("message");
		return {"error":"Fehlermeldung von Books " + respUpdate.get("message")};
	}
}
catch (e)
{
	info "error: " + e;
	sendmail
	[
		from :zoho.loginuserid
		to :adminEmail
		subject :"Fehler beim Update des Angebots bei der " + ifNull(zoho.crm.getOrgVariable("orgName"),"")
		message :"fehler in deluge script 'ZST_updateEstimate(estimate_id, dealId '" + estimate_id + "," + dealId + "' )" + e + " am " + zoho.currenttime
	]
}
return {};
}