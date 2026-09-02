string standalone.updateFirmierung()
{
//Guido ZS 01-07-2022
// Version 0.9
resp = invokeurl
[
	url :"https://www.zohoapis.eu/crm/v2.1/Accounts/actions/count"
	type :GET
	connection:"crm_account"
];
//info "resp: " + resp;
collId = Collection();
if(resp != null)
{
	count = resp.get("count");
	info "Anzahl Accounts: " + count;
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
		resp = zoho.crm.getRecords("Accounts",page,(rowNumber + 200 - 1).toNumber());
		if(resp.size() == 0)
		{
			break;
		}
		else
		{
			for each  ele in resp
			{
				accountId = ele.get("id");
				accountEntry = zoho.crm.getRecordById("Accounts",accountId);
				if(accountEntry.get("Firmentyp") == "Abnahmestelle")
				{
					uebergeordId = accountEntry.get("bergeordnete_Firma_ID");
					if(collId.containsKey(uebergeordId))
					{
						uebergeAccountId = collId.get(uebergeordId);
					}
					else
					{
						//info "uebergeordId: " + uebergeordId;
						respSearch = zoho.crm.searchRecords("Accounts","(Firma_ID:equals:" + uebergeordId + ")");
						//info "respSearch: " + respSearch;
						uebergeAccountId = respSearch.get(0).get("id");
						//info "uebergeAccountId: " + uebergeAccountId;
						collId.insert(uebergeordId:uebergeAccountId);
					}
					updateResp = zoho.crm.updateRecord("Accounts",accountId,{"Parent_Account":uebergeAccountId});
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