string standalone.ZST_importMessstellenbetrieb()
{
//https://sheet.zoho.eu/sheet/open/2mykh963a8214e8704ad784650a38dcee428a
resource_id = "2mykh963a8214e8704ad784650a38dcee428a";
sheetName = "EB RP";
fileContent = zoho.sheet.getRecords(resource_id,sheetName,Map(),"sheet_connection");
counter = 0;
for each  rec in fileContent.get("records")
{
	counter = counter + 1;
	info rec;
	be_id = rec.get("Eintrag-ID").remove("zcrm_");
	kombi = rec.get("Produkt-Kombi");
	if(kombi.contains("Messstellen"))
	{
		info be_id + " " + kombi;
		be_entry = zoho.crm.getRecordById("Beratungsvertr_ge",be_id);
		subform = List();
		subform = be_entry.get("Beratungsvertragsprodukte");
		//info subform;
		newSubform = List();
		for each  ele in subform
		{
			info ele.get("Produkt").get("name");
			if(ele.get("Produkt").get("name") != "Messstellenbetrieb")
			{
				newSubform.add(ele);
			}
		}
		mp = Map();
		mp.put("Produkt",418194000005221001);
		newSubform.add(mp);
		info zoho.crm.updateRecord("Beratungsvertr_ge",be_id,{"Beratungsvertragsprodukte":newSubform});
	}
}
return "";
}