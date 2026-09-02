string standalone.ZST_updateRechnungskontaktFuerAccount()
{
moduleName = "Accounts";
resp = invokeurl
[
	url :"https://www.zohoapis.eu/crm/v5/" + moduleName + "/actions/count"
	type :GET
	connection:"crm_connection"
];
info resp;
cvid = 418194000009608241;
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
counter = 0;
for each  val in iterations
{
	info "Page: " + page;
	info "Pages: " + (rowNumber + 200 - 1).toNumber();
	resp = zoho.crm.getRecords(moduleName,page,(rowNumber + 200 - 1).toNumber(),{"cvid":cvid,"sort_order":"desc"});
	if(resp.size() == 0)
	{
		break;
	}
	else
	{
		for each  ele in resp
		{
			id = ele.get("id");
			rel_contacts = zoho.crm.getRelatedRecords("Contacts","Accounts",id);
			//info rel_contacts;
			b_found = false;
			for each  contact in rel_contacts
			{
				if(contact.get("First_Name") == "Rechnungskontakt")
				{
					b_found = true;
					break;
				}
			}
			if(b_found == false)
			{
				counter = counter + 1;
				automation.ZST_Rechnungskontakt(id);
			}
		}
	}
	rowNumber = rowNumber + 200;
	page = page + 1;
}
info "Gefunden: " + counter;
return "";
}