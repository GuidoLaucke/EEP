string standalone.updateOrt1(int dealId)
{
dealEntry = zoho.crm.getRecordById("Deals",dealId);
abnahme = dealEntry.get("Abnahmestellen_Firmen");
info abnahme;
respSearch = zoho.crm.searchRecords("Accounts","(Account_Name:equals:" + abnahme + ")");
if(respSearch.isEmpty() == false)
{
	accountId = respSearch.get(0).get("id");
	accountEntry = zoho.crm.getRecordById("Accounts",accountId);
	ort = ifNull(accountEntry.get("Standort_Stadt"),"");
	if(ort != "")
	{
		info zoho.crm.updateRecord("Deals",dealId,{"Ort_der_Abnahmestelle_Firma":ort});
	}
}
return "";
}