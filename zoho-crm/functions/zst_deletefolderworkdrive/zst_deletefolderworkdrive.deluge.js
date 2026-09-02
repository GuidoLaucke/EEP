string standalone.ZST_deleteFolderWorkdrive(string folderId)
{
header = Map();
header.put("Accept","application/vnd.api+json");
data = Map();
data_param1 = Map();
att_param1 = Map();
att_param1.put("status","51");
data_param1.put("attributes",att_param1);
data_param1.put("type","files");
data.put("data",data_param1);
response = invokeurl
[
	url :"https://www.zohoapis.eu/workdrive/api/v1/files/" + folderId
	type :PATCH
	parameters:data.toString()
	headers:header
	connection:"zst_writer_all"
];
info response;
return response;
}