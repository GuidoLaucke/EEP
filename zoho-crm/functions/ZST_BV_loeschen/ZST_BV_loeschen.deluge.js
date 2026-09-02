string standalone.ZST_BV_loeschen()
{
//https://workdrive.zoho.eu/file/2mykhab28f0f5c2764e0db7b0791752a395bc
//2mykh625ee7e2ad684ce4a57246d1ba5571ee https://workdrive.zoho.eu/file/2mykh625ee7e2ad684ce4a57246d1ba5571ee
resource_id = "2mykh625ee7e2ad684ce4a57246d1ba5571ee";
sheetName = "MSB";
fileContent = zoho.sheet.getRecords(resource_id,sheetName,Map(),"sheet_connection");
counter = 0;
for each  rec in fileContent.get("records")
{
	bv_id = rec.get("Eintrag-ID").remove("zcrm_");
	//bv_id = "418194000006904382";
	/*deleteRecordMap = Map();
	deleteRecordMap = {"module":"Beratungsvertr_ge","id":bv_id};
	deleteResp = zoho.crm.invokeConnector("crm.delete",deleteRecordMap);
	info deleteResp;
	*/
	info zoho.crm.getRecordById("Beratungsvertr_ge",bv_id).get("id");
}
return "";
}