string standalone.ZST_RV_Produkte_verteilen()
{
/*
upd_map = Map();
new_sf = List();
sf_line_1 = Map();
sf_line_1.put("Produkt", 418194000006324071);
new_sf.add(sf_line_1);
sf_line_2 = Map();
sf_line_2.put("Produkt", 418194000001231055);
new_sf.add(sf_line_2);
sf_line_3 = Map();
sf_line_3.put("Produkt", 418194000001231054);
new_sf.add(sf_line_3);
upd_map.put("Beratungsvertragsprodukte", new_sf);
info zoho.crm.updateRecord("Beratungsvertr_ge", 418194000006627508, upd_map);
*/
/*
upd_map = Map();
new_sf = List();
bv = zoho.crm.getRecordById("Beratungsvertr_ge", 418194000006627508); // n: 418194000006627508 // 1: 418194000006699680
vps = bv.get("Vertragsprodukte_Import").toList();
for each vp in vps
{
	sf_line = Map();
	sf_line.put("Produkt", vp);
	new_sf.add(sf_line);
	upd_map.put("Beratungsvertragsprodukte", new_sf);
}
info zoho.crm.updateRecord("Beratungsvertr_ge", 418194000006627508, upd_map);
*/
//loop = {1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22};
loop = {22};
for each  line in loop
{
	bvs = zoho.crm.getRecords("Beratungsvertr_ge",line,200);
	for each  bv in bvs
	{
		upd_map = Map();
		new_sf = List();
		bv = zoho.crm.getRecordById("Beratungsvertr_ge",bv.get("id"));
		vps = bv.get("Vertragsprodukte_Import").toList();
		for each  vp in vps
		{
			sf_line = Map();
			sf_line.put("Produkt",vp);
			new_sf.add(sf_line);
			upd_map.put("Beratungsvertragsprodukte",new_sf);
		}
		info zoho.crm.updateRecord("Beratungsvertr_ge",bv.get("id"),upd_map);
	}
}
return "";
}