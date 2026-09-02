string standalone.testRelList()
{
moduleName = "Accounts";
response = invokeurl
[
	url :"https://www.zohoapis.eu/crm/v3/settings/related_lists?module=" + moduleName
	type :GET
	connection:"crm_connection"
];
//info response;
relatedlist = response.get("related_lists").toJSONList();
for each  ele in relatedlist
{
	info "ele: " + ele;
	layoutdet = ele.get("module");
	info "Layoutdet: " + layoutdet;
	info "api_name: " + ele.get("api_name");
}
return "";
}