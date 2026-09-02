string standalone.updateOppAbnahmestelle()
{
query = {"select_query":"SELECT Abnahmestelle, id, Opp_Import_Temp_ID FROM Deals WHERE (Abnahmestelle is not null and Opp_Import_Temp_ID like '9876_01_%') and (Modified_Time >= '2025-05-11T12:57:55+05:30' AND Stage = 'Gewonnen, Projekt in Bearbeitung') "};
response = invokeurl
[
	url :"https://www.zohoapis.eu/crm/v7/coql"
	type :POST
	parameters:query.toString()
	connection:"crm_connection"
];
info response;
counter = 1;
for each  ele in response.get("data")
{
	abnahmestelle = ele.get("Abnahmestelle");
	matchcode = abnahmestelle.getSuffix("- #");
	dealId = ele.get("id");
	query = {"select_query":"SELECT id FROM Accounts WHERE (Account_Name like '%" + abnahmestelle.replaceAll("'","''") + "%' OR Matchcode ='" + matchcode + "') LIMIT 1"};
	info query;
	response = invokeurl
	[
		url :"https://www.zohoapis.eu/crm/v7/coql"
		type :POST
		parameters:query.toString()
		connection:"crm_connection"
	];
	info "RESPONSE: " + response;
	info "DATA: " + response.get("data") + " Abnahmestelle: " + abnahmestelle;
	if(response.get("data") != null)
	{
		accountId = response.get("data").get(0).get("id");
		info "dealId: " + dealId;
		info "account ID: " + accountId;
		mp = Map();
		mp.put("Opportunities",dealId);
		mp.put("Abnahmestellen_Firmen",accountId);
		counter = counter + 1;
		info zoho.crm.createRecord("Opportunities_X_Firmen",mp);
	}
	info zoho.crm.updateRecord("Deals",dealId,{"surrogat":1},{"trigger":{"workflow"}});
}
info zoho.crm.getRecords("Opportunities_X_Firmen").get(0);
info "Counter: " + counter;
return "";
}