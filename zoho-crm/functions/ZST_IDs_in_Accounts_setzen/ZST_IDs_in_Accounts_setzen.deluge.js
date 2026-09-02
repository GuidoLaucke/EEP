void automation.ZST__IDs_in_Accounts_setzen(Int acc_id)
{
//acc_id = 418194000008334112;
acc_det = zoho.crm.getRecordById("Accounts",acc_id);
upd_acc = Map();
if(!acc_det.get("Parent_Account").isNull())
{
	upd_acc.put("Uebergeordnete_Firma_CRM_ID",acc_det.get("Parent_Account").get("id"));
}
else
{
	upd_acc.put("Uebergeordnete_Firma_CRM_ID",null);
}
if(!acc_det.get("Franchisenehmer").isNull())
{
	upd_acc.put("Franchisenehmer_CRM_ID",acc_det.get("Franchisenehmer").get("id"));
}
else
{
	upd_acc.put("Franchisenehmer_CRM_ID",null);
}
if(upd_acc.size() > 0)
{
	info zoho.crm.updateRecord("Accounts",acc_id,upd_acc);
}
}