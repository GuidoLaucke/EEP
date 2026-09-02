void automation.ZST_Akt_JSON_Firmen(Int curr_id)
{
rec_type = "Accounts";
curr_json = zoho.crm.getRecordById(rec_type,curr_id);
info zoho.crm.updateRecord(rec_type,curr_id,{"Akt_JSON":curr_json.toString()});
}