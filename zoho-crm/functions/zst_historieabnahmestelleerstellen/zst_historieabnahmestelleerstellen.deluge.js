void automation.ZST_HistorieAbnahmestelleErstellen(Int accountId)
{
resp = invokeurl
[
	url :"https://www.zohoapis.eu/crm/v3/settings/fields?module=Accounts"
	type :GET
	connection:"crm_connection"
];
//info resp;
mp = Map();
abnahmestelleEntry = zoho.crm.getRecordById("Accounts",accountId);
for each  field in resp.get("fields")
{
	fieldName = field.get("api_name");
	if(field.get("type") == "used" && fieldName != "Opportunity" && fieldName != "Layout")
	{
		if(field.get("data_type") == "lookup" || field.get("json_type") == "jsonobject")
		{
			fieldValue = ifNull(abnahmestelleEntry.get(field.get("api_name")),{"id":""}).get("id");
		}
		else
		{
			fieldValue = abnahmestelleEntry.get(field.get("api_name"));
		}
		if(fieldValue != "")
		{
			mp.put(fieldName,fieldValue);
		}
	}
}
mp.put("Franchisenehmer",abnahmestelleEntry.get("Franchisenehmer_before"));
mp.put("Name",abnahmestelleEntry.get("Account_Name") + "_" + zoho.currentdate.toString("yyyy-MM-dd"));
mp.put("Ursprungseintrag_Firma",accountId);
mp.put("Opportunity",zoho.crm.getRelatedRecords("Opportunities2","Accounts",accountId).toList("#"));
info zoho.crm.createRecord("HistorienAbnahmestellen",mp);
zoho.crm.updateRecord("Accounts",accountId,{"Franchisenehmer_before":abnahmestelleEntry.get("Franchisenehmer").get("id"),"Historien_Datensatz_erstellen":"Historie nicht speichern"});
}