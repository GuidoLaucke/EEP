string standalone.ZST_testorgid()
{
response = invokeurl
[
	url :"https://www.zohoapis.eu/crm/v3/org"
	type :GET
	connection:"crm_connection"
];
info response;
return "";
}