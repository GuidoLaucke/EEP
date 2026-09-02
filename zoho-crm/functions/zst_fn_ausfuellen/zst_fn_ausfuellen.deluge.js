void automation.ZST_FN_ausfuellen(Int deal_id)
{
//deal_id = 418194000002912037;
deal_det = zoho.crm.getRecordById("Deals",deal_id);
if(!deal_det.get("Account_Name").isNull())
{
	fi_det = zoho.crm.getRecordById("Accounts",deal_det.get("Account_Name").get("id"));
	fn_id = null;
	if(!fi_det.get("Franchisenehmer").isNull())
	{
		fn_id = fi_det.get("Franchisenehmer").get("id");
	}
	if(fn_id != null)
	{
		info zoho.crm.updateRecord("Deals",deal_id,{"Franchisenehmer":fn_id});
	}
}
}