string standalone.ZST_updateAbnahmestelle_in_opp()
{
deals = "418194000034087442, 418194000034087463, 418194000034087469, 418194000034087459, 418194000034087450, 418194000034087471, 418194000034087446, 418194000034087438, 418194000034087439, 418194000034087457, 418194000034087481, 418194000034087448, 418194000034087452, 418194000034087444, 418194000034087474, 418194000034087462, 418194000034087472, 418194000034087468, 418194000034087458, 418194000034087441, 418194000034087449, 418194000034087460, 418194000034087461, 418194000034087479, 418194000034087437, 418194000034087480, 418194000034087470, 418194000034087476, 418194000034087443, 418194000034087477, 418194000034087478, 418194000034087454";
deal_ids = deals.toList(",");
deal_ids = {418194000034087454};
for each  deal_id in deal_ids
{
	info "deal_id: " + deal_id;
	deal_entry = zoho.crm.getRecordById("Deals",deal_id.trim());
	annahmestelle = ifNull(deal_entry.get("Abnahmestelle"),"");
	if(annahmestelle != "")
	{
		info "Abnahmestelle: " + annahmestelle;
		result = zoho.crm.searchRecords("Contacts","(Account_Name:equals:" + annahmestelle + ")");
		info result;
		if(result.size() == 1)
		{
			account_id = result.get(0).get("id");
			mp = Map();
			info "fields: " + deal_id + " " + account_id;
			mp.put("Opportunities",deal_id);
			mp.put("Accounts",account_id);
			info zoho.crm.createRecord("Opportunities_X_Firmen",mp);
		}
	}
}
return "";
}