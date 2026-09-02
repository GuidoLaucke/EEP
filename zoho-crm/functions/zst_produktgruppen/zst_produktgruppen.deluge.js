void automation.ZST_Produktgruppen(Int deal_id)
{
//deal_id = 418194000002912037; // ohne: 418194000002585437 // mit: 418194000002912037
deal_det = zoho.crm.getRecordById("Deals",deal_id);
prod_gr = null;
if(!deal_det.get("Produkte").isNull())
{
	if(deal_det.get("Produkte").size() > 0)
	{
		prod_prod_gr = List();
		for each  prod in deal_det.get("Produkte")
		{
			prod_det = zoho.crm.getRecordById("Products",prod.get("Produkt").get("id"));
			prod_prod_gr.add(prod_det.get("Produktgruppe_intern"));
		}
		prod_prod_gr = prod_prod_gr.distinct();
		if(prod_prod_gr.size() > 0)
		{
			prod_gr = prod_prod_gr;
		}
	}
}
info zoho.crm.updateRecord("Deals",deal_id,{"Produktgruppe_intern":prod_gr});
}