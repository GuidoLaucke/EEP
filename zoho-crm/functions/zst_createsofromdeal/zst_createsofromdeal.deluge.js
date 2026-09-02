void automation.ZST_createSOFromDeal(Int deal_id)
{
// Guido 04-08-2023
message = "";
/*
books_org_id = 20080259560;
deal_id = if(deal_id == null,418194000003079019,deal_id);
result = zoho.books.getRecords("Estimates",books_org_id,{"zcrm_potential_id":deal_id},"books_connection");
if(result.get("estimates").size() > 1)
{
	message = "Es wurden mehrere Angebote für diesen Deal gefunden! ";
}
else if(result.get("estimates").size() == 1)
{
	estimate_id = result.get("estimates").get(0).get("estimate_id");
	status = result.get("estimates").get(0).get("status");
	info status;
	if(status != "accepted")
	{
		message = "Nur angenommene Angebote können in Aufträge umgewandelt werden!";
	}
	estimate_entry = zoho.books.getRecordsByID("Estimates",books_org_id,estimate_id,"books_connection");
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
	mp.put("estimate_id",estimate_id);
	result_create = zoho.books.createRecord("Salesorders",books_org_id,mp,"books_connection");
	if(result_create.get("code") == 0 && result_create.get("salesorder") != null)
	{
		so_id = result_create.get("salesorder").get("salesorder_id");
		so_number = result_create.get("salesorder").get("salesorder_number");
		url = "https://books.zoho.eu/app/20080259560#/salesorders/" + so_id + "?filter_by=Status.All&per_page=25&sort_column=created_time&sort_order=D";
		message = "Die Auftragsbestätigung mit der Nummer " + so_number + " wurde erfolgreich erstellt. Die Books url ist: " + url;
	}
	else
	{
		message = "Fehler bei der Erstellung der Auftragsbestätigung. Der Grund: " + result_create.get("message");
	}
}
*/
message = standalone.ZST_convertEstimateToSalesOrder(deal_id);
zoho.crm.updateRecord("Deals",deal_id,{"SalesOrder_Report":message});
}