string standalone.ZST_convertEstimateToSalesOrder(Int deal_id)
{
// Guido 04-08-2023
// PL: Die Funktion muss ausgeführt werden, wenn eine Opp auf "Projekt in Bearbeitung" gestellt wird (Workflow ist vorhanden)
// PL: Hier ein Test-Deal:
books_org_id = 20080259560;
deal_id = if(deal_id == null,418194000003079019,deal_id);
/// GIBT ES BEREITS EINE SALESORDER???
record = zoho.books.getRecords("Salesorders",books_org_id,{"zcrm_potential_id":deal_id},"books_connection").get("salesorders");
if(record.size() > 0)
{
	return "Es gibt bereits eine Auftragsbestätigung: " + record.get(0).get("salesorder_number");
}
result = zoho.books.getRecords("Estimates",books_org_id,{"zcrm_potential_id":deal_id},"books_connection");
if(result.get("estimates").size() > 1)
{
	return "Es wurden mehrere Angebote für diesen Deal gefunden! ";
}
else if(result.get("estimates").size() == 1)
{
	estimate_id = result.get("estimates").get(0).get("estimate_id");
	status = result.get("estimates").get(0).get("status");
	info status;
	// PL: Diese Prüfung muss raus, das Estimate muss in dieser Funktion auf "accepted" gestellt werden
	if(status != "accepted")
	{
		resp = zoho.books.markStatus("Estimates",books_org_id,estimate_id,"sent","books_connection");
		resp = zoho.books.markStatus("Estimates",books_org_id,estimate_id,"accepted","books_connection");
		info resp;
	}
	estimate_entry = zoho.books.getRecordsByID("Estimates",books_org_id,estimate_id,"books_connection");
	info "estimate_entry: " + estimate_entry;
	estimate_number = estimate_entry.get("estimate").get("estimate_number");
	so_mp = estimate_entry.get("estimate");
	mp = Map();
	line_items = so_mp.get("line_items");
	for each  items in line_items
	{
		items.remove("line_item_id");
	}
	mp.put("line_items",line_items);
	mp.put("customer_id",so_mp.get("customer_id"));
	mp.put("zcrm_potential_id",so_mp.get("zcrm_potential_id"));
	mp.put("branch_id",so_mp.get("branch_id"));
	mp.put("notes",so_mp.get("notes"));
	mp.put("terms",so_mp.get("terms"));
	mp.put("payment_terms",so_mp.get("payment_terms"));
	mp.put("adjustment",so_mp.get("adjustment"));
	mp.put("reference_number",estimate_number);
	// PL: Der Parameter "estimate_id" scheint nicht zu reichen, um den KVA mit der Order richtig zu verlinken
	// PL: Also sodass man im KVA einen Link in die Sales Ordner sehen kann (wenn das überhaupt geht)
	// PL: Bitte aber auf jeden Fall die RefNr mit der KVA-Nummer vorbefüllen
	mp.put("estimate_id",estimate_id);
	// E-Mail-Adresse Projektleiter hinzufügen BOF
	dealEntry = zoho.crm.getRecordById("Deals",deal_id);
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
	result_create = zoho.books.createRecord("Salesorders",books_org_id,mp,"books_connection");
	if(result_create.get("code") == 0 && result_create.get("salesorder") != null)
	{
		so_id = result_create.get("salesorder").get("salesorder_id");
		so_number = result_create.get("salesorder").get("salesorder_number");
		url = "https://www.zohoapis.eu/books/v3/salesorders/" + so_id + "/approve?organization_id=" + books_org_id;
		response = invokeurl
		[
			url :url
			type :POST
			connection:"books_connection"
		];
		info response;
		openurl("https://books.zoho.eu/app/20080259560#/salesorders/" + so_id + "?filter_by=Status.All&per_page=25&sort_column=created_time&sort_order=D","new window");
		return "Die Auftragsbestätigung mit der Nummer " + so_number + " wurde erfolgreich erstellt und automatisch genehmigt.";
	}
	else
	{
		return "Fehler bei der Erstellung der Auftragsbestätigung. Der Grund: " + result_create.get("message");
	}
}
else
{
	return "Es wurde kein Angebot gefunden.";
}
return "";
}