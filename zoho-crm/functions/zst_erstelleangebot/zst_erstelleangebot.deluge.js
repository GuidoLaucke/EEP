string standalone.ZST_erstelleAngebot(Int dealId)
{
//Guido 11-10-2022
//Version 0.1
// Create estimate with products in Subform from deals
///////// INITIALISATION //////////
//////// PARAMETERS      //////////
booksOrgId = "20080259560";
subFormName = "Produkte";
adminEmail = ifNull(zoho.crm.getOrgVariable("adminEmail"),"gl@langheinrichco.de");
newLine = hexToText("0A");
////////////////////////////////////
try 
{
	dealEntry = zoho.crm.getRecordById("Deals",dealId);
	accountName = ifNull(dealEntry.get("Account_Name"),"");
	if(accountName == "")
	{
		return "Fehler: Keinen Account Namen angegeben!";
	}
	subFormData = dealEntry.get(subFormName);
	/////////// GET BOOKS CONTACTID /////////////
	searchParam = {"contact_name":accountName.get("name")};
	info "searchParam: " + searchParam;
	contactBooks = zoho.books.getRecords("Contacts",booksOrgId,searchParam,"books_connection");
	info "contactBooks: " + contactBooks;
	contactIdBooks = ifNull(contactBooks.get("contacts").get(0).get("contact_id"),null);
	contactNameBooks = ifNull(contactBooks.get("contacts").get(0).get("contact_name"),null);
	if(contactIdBooks == null)
	{
		return "Kunde " + accountName + " in Books nicht gefunden!";
	}
	//info "contactBooks: " + contactBooks;
	//info "contactIdBooks: " + contactIdBooks;
	//info "contactNameBooks: " + contactNameBooks;
	///////////////////////////////////////////////
	prodList = List();
	//info "SubFormData" + subFormDataDiscount;
	for each  objects in subFormData
	{
		info objects;
		prodmp = Map();
		productId = objects.get("Produkt").get("id");
		productname = objects.get("Produkt").get("name");
		listPrice = ifNull(objects.get("Einzelpreis"),"0.0").toDecimal();
		numberOfProduct = ifnull(objects.get("Menge"),1);
		prodmp.put("name",productname);
		prodmp.put("rate",listPrice);
		prodmp.put("quantity",numberOfProduct);
		prodList.add(prodmp);
	}
	mp = Map();
	mp.put("customer_id",contactIdBooks);
	mp.put("customer_name",contactNameBooks);
	//mp.put("estimate_number",zoho.crm.getOrgVariable("EstimateNummer"));
	mp.put("line_items",prodList);
	mp.put("date",zoho.currentdate);
	mp.put("zcrm_potential_id",dealId);
	// entity_level or item_level
	if(dealEntry.get("Rabatt") > 0)
	{
		mp.put("discount",dealEntry.get("Rabatt"));
		mp.put("discount_type","entity_level");
	}
	else
	{
		mp.put("discount_type","item_level");
	}
	info mp;
	respCreate = zoho.books.createRecord("Estimates",booksOrgId,mp,"books_connection");
	standalone.updateEstimateNumber();
	info "respCreate: " + respCreate;
	if(respCreate.get("code") == 0)
	{
		info zoho.crm.updateRecord("Deals",dealId,{"Angebotsnummer":respCreate.get("estimate").get("estimate_number")});
		return "Estimate Nr. " + respCreate.get("estimate").get("estimate_number") + " erfolgreich angelegt";
	}
	else
	{
		return "Fehler: " + respCreate.get("message");
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
		message :"fehler in deluge script 'ZST_erstelleAngebot (Int dealId '" + dealId + "' )" + e + " am " + zoho.currenttime
	]
	return "Fehler bei der Erstellung des Angebots " + e;
}
return "";
}