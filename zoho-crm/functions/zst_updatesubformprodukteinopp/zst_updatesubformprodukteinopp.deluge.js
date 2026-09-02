void automation.ZST_updateSubformProdukteInOpp(Int dealId)
{
// Guido 12-05-2023
//
oppEntry = zoho.crm.getRecordById("Deals",dealId);
productId = ifNull(oppEntry.get("Bundle_Produkt"),{"id":""}).get("id");
productEntry = zoho.crm.getRecordById("Products",productId);
// NUR WENN DIE SUBFORM IM DEAL LEER IST
b_subform_empty = if(oppEntry.get("Produkte").size() == 0,true,false);
info "b_subform_empty: " + b_subform_empty;
if(b_subform_empty == true)
{
	// GET PRODUCTS IN BUNDLE
	liste = List();
	for each  prod in productEntry.get("Enthaltene_Produkte")
	{
		mp = Map();
		prodId = prod.get("Produkt").get("id");
		unitprice = prod.get("Einzelpreis");
		menge = prod.get("Anzahl");
		mp.put("Produkt",prodId);
		mp.put("Menge",menge);
		mp.put("Einzelpreis",unitprice);
		liste.add(mp);
	}
	updateMp = Map();
	updateMp.put("Produkte",liste);
	info zoho.crm.updateRecord("Deals",dealId,updateMp,{"trigger":{"workflow"}});
	updateMp = Map();
	updateMp.put("Amount",productEntry.get("Unit_Price"));
	updateMp.put("Gesamtsumme",productEntry.get("Unit_Price"));
	info zoho.crm.updateRecord("Deals",dealId,updateMp,{"trigger":{""}});
}
}