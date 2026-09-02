string standalone.ZST_updateProductsInDeals()
{
//Guido ZS 01-07-2022
// Version 0.9
resp = invokeurl
[
	url :"https://www.zohoapis.eu/crm/v3/Deals/actions/count"
	type :GET
	connection:"crm_account"
];
//info "resp: " + resp;
collId = Collection();
if(resp != null)
{
	count = resp.get("count");
	info "Anzahl Deals: " + count;
	add = 0;
	if(frac(count / 200) > 0)
	{
		add = 1;
	}
	iterations = "".leftpad(count / 200 + add).toList("");
	rowNumber = 1;
	page = 1;
	for each  val in iterations
	{
		resp = zoho.crm.getRecords("Deals",page,(rowNumber + 200 - 1).toNumber(),{"sort_by":"Created_Time","sort_order":"desc"});
		if(resp.size() == 0)
		{
			break;
		}
		else
		{
			for each  ele in resp
			{
				dealId = ele.get("id");
				info "DealId: " + dealId;
				standalone.ZST_updateRelProductsByTable(dealId);
			}
		}
		rowNumber = rowNumber + 200;
		page = page + 1;
		break;
	}
}
return "";
}