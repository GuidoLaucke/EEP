void automation.ZST_FN_Art_der_Foerderung(Int deal_id)
{
//deal_id = 418194000002912037; // ohne: 418194000002585437 // mit: 418194000002912037
deal_det = zoho.crm.getRecordById("Deals",deal_id);
art_d_f = null;
if(!deal_det.get("Produkte").isNull())
{
	if(deal_det.get("Produkte").size() > 0)
	{
		prod_art_d_f = List();
		for each  prod in deal_det.get("Produkte")
		{
			prod_det = zoho.crm.getRecordById("Products",prod.get("Produkt").get("id"));
			artdFoederung = ifNull(prod_det.get("Art_der_F_rderung"),"");
			if(artdFoederung != "")
			{
				prod_art_d_f.add(artdFoederung);
			}
		}
		prod_art_d_f = prod_art_d_f.distinct();
		prod_art_d_f.removeElement("Keine");
		if(prod_art_d_f.size() > 0)
		{
			art_d_f = prod_art_d_f;
		}
	}
}
if(art_d_f != null)
{
	info zoho.crm.updateRecord("Deals",deal_id,{"Art_der_F_rderung_NEU":art_d_f});
}
}