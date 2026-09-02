void automation.ZST__UpdatePLnachDealProdukt(Int dealId)
{
// Guido 
dealEntry = zoho.crm.getRecordById("Deals",dealId);
produkte = dealEntry.get("Produkte");
mp = Map();
for each  produkt in produkte
{
	produktName = produkt.get("Produkt").get("name");
	if(produktName.contains("Fördermittelabwicklung / Umsetzungsbegleitung") == true)
	{
		mp.put("Ausgewaehlter_Projektleiter",418194000001619015);
		break;
	}
	else if(produktName.contains("EBN M1") == true || produktName.contains("EBN M2") == true)
	{
		mp.put("Ausgewaehlter_Projektleiter",418194000001619015);
		mp.put("EEP_Team","Energietechnik");
	}
}
info zoho.crm.updateRecord("Deals",dealId,mp);
}