void automation.ZST_DeleteRechnungskontakt(Int accountId)
{
//Guido 05-07-2023
accountEntry = zoho.crm.getRecordById("Accounts",accountId);
accountName = accountEntry.get("Account_Name");
email = accountEntry.get("Rechnungsadresse_E_Mail");
respSearch = zoho.crm.searchRecords("Contacts","((Last_Name:equals:" + accountName.encodeURL() + ") And (First_Name:equals:Rechnungskontakt" + "))");
//info "respSearch: " + respSearch;
if(respSearch.size() > 0)
{
	contactId = respSearch.get(0).get("id");
	deleteRecordMap = Map();
	deleteRecordMap = {"module":"Contacts","id":contactId};
	deleteResp = zoho.crm.invokeConnector("crm.delete",deleteRecordMap);
	info deleteResp;
}
response = invokeurl
[
	url :"https://www.zohoapis.eu/books/v3/crm/account/" + accountId + "/import?organization_id=20080259560"
	type :POST
	connection:"books_connection"
];
info response;
}