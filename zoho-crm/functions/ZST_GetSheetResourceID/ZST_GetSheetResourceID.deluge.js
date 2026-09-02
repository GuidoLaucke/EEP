string standalone.ZST_GetSheetResourceID(String templateId, String workbookName)
{
templateId = if(templateId == null,"c2zep3098b1aa0657456e97b173fe36f0ddba",templateId);
url = "https://sheet.zoho.eu/api/v2/createfromtemplate?method=workbook.createfromtemplate&resource_id=" + templateId + "&workbook_name=" + workbookName;
response = invokeurl
[
	url :url
	type :POST
	connection:"sheet_connection"
];
return response.get("resource_id");
}