void automation.ZST_FI_Aenderungsmanagement(Int acc_id)
{
acc_id = 418194000002912027;
post_acc_det = zoho.crm.getRecordById("Accounts",acc_id);
// Vor-JSON auslesen und historisieren
pre_json_compl = zoho.crm.getRecordById("Accounts",acc_id);
pre_json = pre_json_compl.get("Akt_JSON");
create_his = Map();
create_his.put("Name","Accounts - ".concat(acc_id.toString()));
create_his.put("Datensatz_Typ","Accounts");
create_his.put("Datensatz_ID",acc_id.toString());
create_his.put("Datensatz_JSON",pre_json);
info zoho.crm.createRecord("Datensatz_Historie",create_his);
// Firmendatensatz aktualisieren
upd_acc = Map();
upd_acc.put("Account_Name",post_acc_det.get("Neuer_Firmenname"));
upd_acc.put("Art_der_Aenderung","");
upd_acc.put("Neuer_Firmenname","");
upd_acc.put("Akt_JSON",{"Akt_JSON":post_acc_det.toString()});
info zoho.crm.updateRecord("Accounts",acc_id,upd_acc);
}