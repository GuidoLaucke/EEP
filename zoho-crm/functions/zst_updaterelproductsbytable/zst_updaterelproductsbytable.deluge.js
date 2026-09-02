string standalone.ZST_updateRelProductsByTable(int dealId)
{
//Guido 09-10-2021
//Version 0.2
// 
try 
{
	showInfo = true;
	// for Info Output
	//Customize this first /////
	relpot = zoho.crm.getRelatedRecords("Products","Deals",dealId);
	if(relpot.size() > 0)
	{
		for each  rec in relpot
		{
			prodid = rec.get("id");
			resp = invokeurl
			[
				url :"https://www.zohoapis.eu/crm/v2/Deals/" + dealId + "/Products/" + prodid
				type :DELETE
				connection:"crm_connection"
			];
			info "resp: " + resp;
		}
	}
	subFormName = "Produkte";
	productFieldName = "Produkt";
	dealEntry = zoho.crm.getRecordById("Deals",dealId);
	subFormData = dealEntry.get(subFormName);
	paramMap = Map();
	subFormsList = List();
	for each  objects in subFormData
	{
		productId = ifNull(objects.get(productFieldName),null).get("id");
		info "productId" + productId;
		if(productId != null)
		{
			mapper = Map();
			mapper.put("PRODUCTID",productId);
			respUpate = zoho.crm.updateRelatedRecord("Products",productId,"Deals",dealId,mapper);
			info "respUpate: " + respUpate;
		}
	}
}
catch (e)
{
	info "error: " + e;
}
return "";
}