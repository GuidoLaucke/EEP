string standalone.ZST_initialerUpdateIDs()
{
cvid = 418194000009034003;
moduleName = "Accounts";
resp = invokeurl
[
	url :"https://www.zohoapis.eu/crm/v5/" + moduleName + "/actions/count"
	type :GET
	connection:"crm_connection"
];
info resp;
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
			try 
			{
				id = ele.get("id");
				info "account id:" + id;
				parent_account_id = ifNull(ele.get("Parent_Account"),{"id":null}).get("id");
				fn_id = ifNull(ele.get("Franchisenehmer"),{"id":null}).get("id");
				info "id: " + id + " parent account: " + parent_account_id + " FN: " + fn_id;
				info zoho.crm.updateRecord("Accounts",id,{"Franchisenehmer_CRM_ID":fn_id,"Uebergeordnete_Firma_CRM_ID":parent_account_id});
			}
			catch (e)
			{
				info e;
			}
		}
	}
	rowNumber = rowNumber + 200;
	page = page + 1;
}
return "";
}