void automation.ZST_UpdateZahlungsbedingung(Int deal_id)
{
deal_entry = zoho.crm.getRecordById("Deals",deal_id);
product_id_product_tabelle = null;
product_id_bundle = null;
product_zahlungsbedingung = "";
product_id_bundle = ifNull(deal_entry.get("Bundle_Produkt"),{"id":null}).get("id");
try 
{
	product_id_product_tabelle = deal_entry.get("Produkte").get(0).get("Produkt").get("id");
}
catch (e)
{
	info e;
}
product_id = if(product_id_bundle != null,product_id_bundle,product_id_product_tabelle);
info "product_id:" + product_id;
if(product_id != null)
{
	product_entry = zoho.crm.getRecordById("Products",product_id.toLong());
	product_zahlungsbedingung = ifNull(product_entry.get("Zahlungsbedingung"),"");
}
if(product_zahlungsbedingung != "")
{
	info zoho.crm.updateRecord("Deals",deal_id,{"Zahlungsbedingungen":product_zahlungsbedingung},{"trigger":{}});
}
}