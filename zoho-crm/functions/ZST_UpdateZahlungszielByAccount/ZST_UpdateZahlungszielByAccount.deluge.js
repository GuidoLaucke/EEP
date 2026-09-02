void automation.ZST_UpdateZahlungszielByAccount(Int deal_id)
{
deal_entry = zoho.crm.getRecordById("Deals",deal_id);
zahlungsziel = "";
account_id = ifNull(deal_entry.get("Account_Name"),{"id":null}).get("id");
if(account_id != null)
{
	account_entry = zoho.crm.getRecordById("Accounts",account_id);
	zahlungsziel = ifNull(account_entry.get("Zahlungsziel"),"");
}
if(zahlungsziel != "")
{
	info zoho.crm.updateRecord("Deals",deal_id,{"Zahlungsziel":zahlungsziel},{"trigger":{}});
}
}