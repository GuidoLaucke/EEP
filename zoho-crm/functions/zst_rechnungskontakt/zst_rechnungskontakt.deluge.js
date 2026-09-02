void automation.ZST_Rechnungskontakt(Int accountId)
{
// Guido 05-07-2023
accountEntry = zoho.crm.getRecordById("Accounts",accountId);
accountName = accountEntry.get("Account_Name");
info "accountName:" + accountName;
email = accountEntry.get("Rechnungsadresse_E_Mail");
hat_rechnungskontakt = false;
contact_id = null;
rel = zoho.crm.getRelatedRecords("Contacts","Accounts",accountId);
for each  ele in rel
{
	if(ele.get("Auto_Rechnungskontakt"))
	{
		hat_rechnungskontakt = true;
		contact_id = ele.get("id");
		break;
	}
}
if(hat_rechnungskontakt == true)
{
	if(accountName.len() > 80)
	{
		info "Update: " + zoho.crm.updateRecord("Contacts",contact_id,{"Email":email,"Last_Name":accountName.left(80)});
	}
	else
	{
		info "Update: " + zoho.crm.updateRecord("Contacts",contact_id,{"Email":email,"Last_Name":accountName});
	}
}
else
{
	mp = Map();
	mp.put("Layout",{"id":418194000000032039});
	mp.put("Typ","Ansprechpartner");
	mp.put("First_Name","AAA_Rechnungskontakt");
	if(accountName.len() > 80)
	{
		mp.put("Last_Name",accountName.left(80));
	}
	else
	{
		mp.put("Last_Name",accountName);
	}
	mp.put("Email",email);
	mp.put("Auto_Rechnungskontakt",true);
	respCreate = zoho.crm.createRecord("Contacts",mp);
	info respCreate;
	/////////////////////////////// Verknüpfe Account ////////////////////
	contactId = respCreate.get("id");
	accMp = Map();
	accMp.put("id",accountId);
	contactMp = Map();
	contactMp.put("Account_Name",accMp);
	updateContact = zoho.crm.updateRecord("Contacts",contactId,contactMp);
	info updateContact;
	////////////////////////////////////////////////////////////////////
}
response = invokeurl
[
	url :"https://www.zohoapis.eu/books/v3/crm/account/" + accountId + "/import?organization_id=20080259560"
	type :POST
	connection:"books_connection"
];
info response;
}