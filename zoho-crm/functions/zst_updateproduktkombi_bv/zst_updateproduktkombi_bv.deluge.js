void automation.ZST_UpdateProduktkombi_BV(Int bv_id)
{
// Guido 04-08-2023
bv_entry = zoho.crm.getRecordById("Beratungsvertr_ge",bv_id);
kombi = "";
for each  produkt in bv_entry.get("Beratungsvertragsprodukte")
{
	if(produkt.get("Produkt") != null)
	{
		produkt_name = produkt.get("Produkt").get("name");
		kombi = kombi + if(kombi != "",", ","") + produkt_name;
	}
}
info "kombi: " + kombi;
if(kombi != "")
{
	info zoho.crm.updateRecord("Beratungsvertr_ge",bv_id,{"Produkt_Kombi":kombi});
}
}