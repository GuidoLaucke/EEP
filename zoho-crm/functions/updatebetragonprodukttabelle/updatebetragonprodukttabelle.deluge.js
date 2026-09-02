void automation.updateBetragOnProduktTabelle(Int dealId, Float gesamtSumme)
{
//Guido
if(gesamtSumme != null)
{
	zoho.crm.updateRecord("Deals",dealId,{"Amount":gesamtSumme});
}
}