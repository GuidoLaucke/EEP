void automation.ZST_UpdateOrtAbnahmestelle_Firma(Int dealId)
{
dealEntry = zoho.crm.getRecordById("Deals",dealId);
abnahme = ifNull(dealEntry.get("Abnahmestellen_Firmen"),"");
if(abnahme != "")
{
	abnahme = abnahme.replaceAll('\(','\\(');
	abnahme = abnahme.replaceAll('\)','\\)');
	respSearch = zoho.crm.searchRecords("Accounts","(Account_Name:equals:" + abnahme + ")");
	info respSearch;
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
}
}