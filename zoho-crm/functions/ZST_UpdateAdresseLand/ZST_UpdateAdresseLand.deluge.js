string standalone.ZST_UpdateAdresseLand()
{
moduleName = "Accounts";
resp = invokeurl
[
	url :"https://www.zohoapis.eu/crm/v5/" + moduleName + "/actions/count"
	type :GET
	connection:"crm_connection"
];
info resp;
cvid = 418194000009378866;
count = resp.get("count");
info count;
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
	info "Page: " + page;
	info "Pages: " + (rowNumber + 200 - 1).toNumber();
	resp = zoho.crm.getRecords(moduleName,page,(rowNumber + 200 - 1).toNumber(),{"cvid":cvid});
	if(resp.size() == 0)
	{
		break;
	}
	else
	{
		for each  ele in resp
		{
			id = ele.get("id");
			mp = Map();
			standort_land = ele.get("Standort_Land");
			shipping_country = ele.get("Shipping_Country");
			billing_country = ele.get("Billing_Country");
			if(standort_land == "AT")
			{
				mp.put("Standort_Land","Österreich");
			}
			else if(standort_land == "LU")
			{
				mp.put("Standort_Land","Luxemburg");
			}
			if(shipping_country == "AT")
			{
				mp.put("Shipping_Country","Österreich");
			}
			else if(shipping_country == "LU")
			{
				mp.put("Shipping_Country","Luxemburg");
			}
			if(billing_country == "AT")
			{
				mp.put("Billing_Country","Österreich");
			}
			else if(billing_country == "LU")
			{
				mp.put("Billing_Country","Luxemburg");
			}
			zoho.crm.updateRecord("Accounts",id,mp);
		}
	}
	rowNumber = rowNumber + 200;
	page = page + 1;
}
return "";
}