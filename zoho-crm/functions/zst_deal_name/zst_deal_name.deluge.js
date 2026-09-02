void automation.ZST_Deal_Name(Int deal_id)
{
// deal_id = 418194000008742061;
deal_det = zoho.crm.getRecordById("Deals",deal_id);
//
// Produkt-Teil
bundle = ifNull(deal_det.get("Bundle_Produkt"),"");
prod_str = "";
if(bundle != "")
{
	prod_str = bundle.get("name");
}
else if(deal_det.get("Produkte").size() > 0)
{
	for each  prod in deal_det.get("Produkte")
	{
		prod_str = prod_str.concat(" - ").concat(prod.get("Produkt").get("name"));
	}
	prod_str = prod_str.replaceFirst(" - ","");
}
else
{
	prod_str = "KEIN PRODUKT ANGEGEBEN";
}
//
// FI-Teil
acc_str = ifNull(deal_det.get("Account_Name"),{"name"}).get("name");
acc_entry = zoho.crm.getRecordById("Accounts",Ifnull(deal_det.get("Account_Name"),{"id":null}).get("id"));
if(acc_entry != null)
{
	matchcode = ifNull(acc_entry.get("Matchcode"),"");
	city = ifNull(acc_entry.get("Standort_Stadt"),"");
}
deal_str = prod_str.concat(" // ").concat(acc_str) + if(matchcode != ""," // " + matchcode,"") + if(city != ""," // " + city,"");
//
// AN-Teil
rel_ans = zoho.crm.getRelatedRecords("Firmen2","Deals",deal_id);
if(rel_ans.size() > 0)
{
	an_str = "";
	for each  rel_an in rel_ans
	{
		rel_an_id = rel_an.get("Abnahmestellen_Firmen").get("id");
		rel_an_det = zoho.crm.getRecordById("Accounts",rel_an_id);
		an_str = an_str.concat(", ").concat(rel_an_det.get("Matchcode"));
	}
	an_str = an_str.replaceFirst(", ","");
}
if(!an_str.isNull())
{
	deal_str = deal_str + " // " + an_str;
}
//
// Trim und Update
deal_str = if(deal_str.len() > 120,substring(deal_str,0,120),deal_str);
info zoho.crm.updateRecord("Deals",deal_id,{"Deal_Name":deal_str});
}