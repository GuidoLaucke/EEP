void automation.ZST_RevType_KSt_berechnen(Int opp_id)
{
//opp_id = 418194000007526171;
opp_det = zoho.crm.getRecordById("Deals",opp_id);
if(opp_det.get("Produkte").size() > 0)
{
	// Teuerste Position rausfinden
	opp_prods = opp_det.get("Produkte");
	last_prod_id = opp_prods.get(0).get("Produkt").get("id");
	last_prod_price = opp_prods.get(0).get("Summe");
	for each  opp_prod in opp_prods
	{
		curr_prod_id = opp_prod.get("Produkt").get("id");
		curr_prod_price = opp_prod.get("Summe");
		if(curr_prod_price > last_prod_price)
		{
			last_prod_id = curr_prod_id;
			last_prod_price = curr_prod_price;
		}
	}
	// Finance-Infos aus Produkt auslesen und in Opp schreiben
	prod_det = zoho.crm.getRecordById("Products",last_prod_id);
	if(!prod_det.get("Revenue_Type").isNull())
	{
		upd_opp_map = Map();
		upd_opp_map.put("Revenue_Type",prod_det.get("Revenue_Type"));
		upd_opp_map.put("Kostenstellen_Bezeichnung",prod_det.get("Kostenstellen_Bezeichnung"));
		upd_opp_map.put("Kostenstellen_Nummer",prod_det.get("Kostenstellen_Nummer"));
		info zoho.crm.updateRecord("Deals",opp_id,upd_opp_map);
	}
}
}