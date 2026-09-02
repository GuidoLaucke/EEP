string button.ZST_BV_Abrechnung_loeschen_stornieren(String abr_id)
{
//abr_id = 418194000007011211;
abr = zoho.crm.getRecordById("BV_Abrechnungen",abr_id);
if(abr.get("Status") == "In Vorbereitung")
{
	return "Die Abrechnung kann nicht storniert/gelöscht werden, da noch keine Vorschläge erstellt wurden.";
}
if(abr.get("Status") == "Rechnungen in Arbeit" || abr.get("Status") == "Rechnungen erstellt")
{
	return "Die Abrechnung kann nicht storniert/gelöscht werden, da bereits Rechnungen in Erstellung sind / erstellt wurden.";
}
abr_posn = zoho.crm.getRelatedRecords("BV_Abrechnung_Positionen","BV_Abrechnungen",abr_id);
del_pos_ids = "";
for each  abr_pos in abr_posn
{
	del_pos_ids = del_pos_ids + abr_pos.get("id") + ",";
}
info del_pos_ids;
response = invokeurl
[
	url :"https://www.zohoapis.eu/crm/v3/BV_Abrechnung_Positionen?ids=" + del_pos_ids
	type :DELETE
	connection:"crm_coql"
];
info response;
info zoho.crm.updateRecord("BV_Abrechnungen",abr_id,{"Status":"Gelöscht/Storniert"});
return "Die Abrechnungsvorschläge wurden erfolgreich gelöscht.";
}