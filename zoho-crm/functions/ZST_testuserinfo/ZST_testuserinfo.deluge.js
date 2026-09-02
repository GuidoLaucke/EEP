string standalone.ZST_testuserinfo()
{
dealEntry = zoho.crm.getRecordById("Deals",418194000011565028);
info dealEntry.get("Owner");
return "";
}