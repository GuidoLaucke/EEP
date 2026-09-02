string standalone.updateKontakteFirma()
{
//Guido ZS 01-07-2022
// Version 0.9
resp = invokeurl
[
	url :"https://www.zohoapis.eu/crm/v2.1/Contacts/actions/count"
	type :GET
	connection:"crm_contact"
];
info "resp: " + resp;
collId = Collection();
if(resp != null)
{
	count = resp.get("count");
	info "Anzahl Contacts: " + count;
	add = 0;
	if(frac(count / 200) > 0)
	{
		add = 1;
	}
	iterations = "".leftpad(count / 200 + add).toList("");
	rowNumber = 1;
	page = 1;
	for each  val in iterations
	{
		resp = zoho.crm.getRecords("Contacts",page,(rowNumber + 200 - 1).toNumber());
		if(resp.size() == 0)
		{
			break;
		}
		else
		{
			for each  ele in resp
			{
				contactId = ele.get("id");
				contactEntry = zoho.crm.getRecordById("Contacts",contactId);
				firmaEEPId = ifNull(contactEntry.get("Firma_ID_eep"),"");
				uebergeAccountId = "";
				if(firmaEEPId != "")
				{
					info "firmaEEPId: " + firmaEEPId;
					respSearch = zoho.crm.searchRecords("Accounts","(Firma_ID:equals:" + firmaEEPId + ")");
					//info "respSearch: " + respSearch;
					if(respSearch.size() > 0)
					{
						uebergeAccountId = respSearch.get(0).get("id");
						//info "uebergeAccountId: " +uebergeAccountId;
					}
				}
				if(uebergeAccountId != "")
				{
					updateResp = zoho.crm.updateRecord("Contacts",contactId,{"Account_Name":uebergeAccountId});
					info "updateResp: " + updateResp;
				}
			}
		}
		rowNumber = rowNumber + 200;
		page = page + 1;
	}
}
return "";
}