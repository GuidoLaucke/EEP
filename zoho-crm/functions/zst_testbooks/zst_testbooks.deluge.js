string standalone.ZST_testbooks()
{
info zoho.books.getRecordsByID("Invoices",20080259560,235883000006180079,"books_connection");
//dealId = 418194000008244003;
//dealEntry = zoho.crm.getRecordById("Deals",dealId);
//owner = dealEntry.get("Owner").get("email");
//info owner;
/*response = invokeurl
[
	url :"https://www.zohoapis.eu/books/v3/contacts/235883000001551021/contactpersons?organization_id=20080259560"
	type :GET
	connection:"books_connection"
];
info response.get("contact_persons");
*/
return "";
}