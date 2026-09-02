string standalone.updateAccountFranchise()
{
//Guido ZS 01-07-2022
// Version 0.9
resp = invokeurl
[
	url :"https://www.zohoapis.eu/crm/v2.1/Accounts/actions/count"
	type :GET
	connection:"crm_connection"
];
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
	counter = 1;
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
				//info "ele: " + ele;
				if(ele.get("Firmentyp") == "Abnahmestelle" && ele.get("Franchisenehmer") != null && ele.get("Franchisenehmer_before") == null)
				{
					//info "est:" + ele;
					accountId = ele.get("id");
					franchizeId = ele.get("Franchisenehmer").get("id");
					zoho.crm.updateRecord("Accounts",accountId,{"Franchisenehmer_before":franchizeId});
					counter = counter + 1;
				}
			}
		}
		rowNumber = rowNumber + 200;
		page = page + 1;
	}
}
info "Counter:  " + counter;
return "";
}