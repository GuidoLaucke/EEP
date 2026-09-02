void automation.ZST_FranchisenehmerBeforeSetzen(String fran, Int accountId)
{
info zoho.crm.updateRecord("Accounts",accountId,{"Franchisenehmer_before":fran});
}