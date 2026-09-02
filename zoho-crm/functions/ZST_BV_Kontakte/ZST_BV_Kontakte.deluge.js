string standalone.ZST__BV_Kontakte()
{
response = invokeurl
[
	url :"https://www.zohoapis.eu/books/v3/invoices?organization_id=20080259560&status=draft&page=5&per_page=200"
	type :GET
	connection:"books_connection"
];
invs = response.get("invoices");
for each  inv in invs
{
	info inv.get("invoice_id");
	inv_id = inv.get("invoice_id");
	inv_acc_id = inv.get("customer_id");
	acc = zoho.books.getRecordsByID("contacts",20080259560,inv_acc_id,"books_connection");
	pr_cont = acc.get("contact").get("primary_contact_id");
	info inv_id;
	info inv_acc_id;
	info pr_cont;
	pr_conts_list = List();
	pr_conts_list.add(pr_cont);
	pr_cont_map = Map();
	pr_cont_map.put("contact_persons",pr_conts_list);
	//info pr_cont_map;	
	info zoho.books.updateRecord("invoices",20080259560,inv_id,pr_cont_map,"books_connection");
	//break;
	info "----------------------";
}
/*****
invs = zoho.books.getRecords("invoices", 20080259560, {"status":"draft"}, "books_connection");
invs = invs.get("invoices");
for each inv in invs
{
	inv_id = inv.get("invoice_id");
	inv_acc_id = inv.get("customer_id");
	acc = zoho.books.getRecordsByID("contacts", 20080259560, inv_acc_id, "books_connection");
	pr_cont = acc.get("contact").get("primary_contact_id");
	info inv_id;
	info inv_acc_id;
	info pr_cont;
	pr_conts_list = List();
	pr_conts_list.add(pr_cont);
	pr_cont_map = Map();
	pr_cont_map.put("contact_persons", pr_conts_list);
	info pr_cont_map;
	//info zoho.books.updateRecord("invoices", 20080259560, inv_id, pr_cont_map, "books_connection");
	break;
}
*****/
/*
acc = zoho.books.getRecordsByID("contacts", 20080259560, 235883000000735168, "books_connection");
info acc;
pr_cont = acc.get("contact").get("primary_contact_id");
info pr_cont;
*/
/*
response = invokeurl
[
	url: "https://www.zohoapis.eu/books/v3/contacts/contactpersons/235883000001368674?organization_id=20080259560"
	type: GET
	connection: "books_connection"
];
info response;
*/
return "";
}