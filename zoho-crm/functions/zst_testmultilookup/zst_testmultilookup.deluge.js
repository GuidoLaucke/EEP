string standalone.ZST_TESTMULTILOOKUP()
{
moduleName = "Accounts";
response = invokeurl
[
	url :"https://www.zohoapis.eu/crm/v2/settings/related_lists?module=" + moduleName
	type :GET
	connection:"crm_connection"
];
info response;
relatedlist = response.get("related_lists").toJSONList();
for each  ele in relatedlist
{
	layoutdet = ele.get("module");
	info "layout: " + layoutdet;
	info "apiname : " + ele.get("api_name");
	info "--------------------------------";
}
opp_id = 418194000013213001;
account_id = 418194000031740008;
mp = Map();
mp.put("Opportunities",opp_id);
mp.put("Abnahmestellen_Firmen",account_id);
info zoho.crm.createRecord("Opportunities_X_Firmen",mp);
return "";
}