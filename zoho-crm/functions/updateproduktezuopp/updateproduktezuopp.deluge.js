string standalone.updateProdukteZuOpp()
{
//Guido ZS
// 09-08-2022
// DATENPFLEGE 
resp = zoho.crm.getRecords("Deals");
for each  ele in resp
{
	dealId = ele.get("id");
	info "Deal ID: " + dealId;
	produktName = ele.get("Produkt");
	if(produktName != null)
	{
		//info "produktName: " + produktName;
		if(produktName.contains("Projektsteuerung ("))
		{
			produktName = "Projektsteuerung (RLT,Dach,PV)";
		}
		else if(produktName.contains("Förderabwicklung"))
		{
			produktName = "Fördermittelabwicklung";
		}
		produktName = produktName.replaceAll("\(","\\(");
		produktName = produktName.replaceAll("\)","\\)");
		searchResp = zoho.crm.searchRecords("Products","(Product_Name:starts_with:" + produktName + ")");
		if(searchResp.size() == 1)
		{
			productId = searchResp.get(0).get("id");
			price = ifNull(searchResp.get(0).get("Unit_Price"),0);
			code = searchResp.get(0).get("Product_Code");
			menge = 1;
			liste = List();
			mp = Map();
			mp.put("Produkt",productId);
			mp.put("Menge",menge);
			mp.put("Einzelpreis",price);
			mp.put("Artikelnummer",code);
			mp.put("Summe",price);
			liste.add(mp);
			param = Map();
			param.put("Produkte",liste);
			info zoho.crm.updateRecord("Deals",dealId,param);
		}
		else
		{
			info "Nicht gefunden: " + ele.get("Produkt");
		}
	}
}
return "";
}