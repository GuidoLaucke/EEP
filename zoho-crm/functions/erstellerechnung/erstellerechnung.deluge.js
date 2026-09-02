string standalone.erstelleRechnung(Int dealId, String itemName, Float itemRate)
{
//try
//{
booksOrgId = "20080259560";
itemList = List();
itemList1 = List();
contactMap = Map();
dealEntry = zoho.crm.getRecordById("Deals",dealId);
accountName = ifNull(dealEntry.get("Account_Name"),"");
if(accountName == "")
{
	return "Fehler: Keinen Account Namen angegeben!";
}
searchParam = {"contact_name":accountName.get("name")};
info "searchParam: " + searchParam;
contactBooks = zoho.books.getRecords("Contacts",booksOrgId,searchParam,"books_connection");
info "contactBooks: " + contactBooks;
contactIdBooks = ifNull(contactBooks.get("contacts").get(0).get("contact_id"),null);
contactNameBooks = ifNull(contactBooks.get("contacts").get(0).get("contact_name"),null);
invoiceMap = Map();
invoiceMap.put("customer_id",contactIdBooks);
invoiceMap.put("customer_name",contactNameBooks);
//invoiceMap.put("invoice_number",1);//invoiceNumber);
//invoiceMap.put("subject_content","Buchungsreferenz: " + buchungsreferenz + " // Kunde: " + kunde + " // " + typ);
invoiceMap.put("date",today);
invoiceMap.put("is_draft",true);
invoiceMap.put("zcrm_potential_id",dealId);
mapItems = Map();
mapItems.put("description","");
mapItems.put("name",itemName);
mapItems.put("item_custom_fields",{});
mapItems.put("rate",itemRate);
itemList.add(mapItems);
info "itemList: " + itemList;
invoiceMap.put("line_items",itemList);
responseBooks = zoho.books.createRecord("Invoices",booksOrgId,invoiceMap,"books_connection");
info responseBooks;
if(responseBooks.get("code") == 0)
{
	invoiceId = responseBooks.get("invoice").get("invoice_id");
	info "invoiceId: " + invoiceId;
}
//catch (e)
//{
//return "Error in erstelleRechnung" + e;
//}
return "";
}