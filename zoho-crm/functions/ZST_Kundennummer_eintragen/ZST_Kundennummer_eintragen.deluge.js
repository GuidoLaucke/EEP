void automation.ZST__Kundennummer_eintragen(Int org_id)
{
//org_id = 418194000009120091;
neue_kundennummer = invokeurl
[
	url :"https://www.zohoapis.eu/crm/v2/functions/zst_neue_kundennummer_erzeugen/actions/execute?auth_type=oauth"
	type :GET
	connection:"crm_all"
];
if(neue_kundennummer.get("code") == "success")
{
	info zoho.crm.updateRecord("Accounts",org_id,{"Kundennummer":neue_kundennummer.get("details").get("output")});
}
}