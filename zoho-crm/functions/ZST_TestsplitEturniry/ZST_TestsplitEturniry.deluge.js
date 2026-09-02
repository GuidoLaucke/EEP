string standalone.ZST_TestsplitEturniry()
{
fileList = List();
header = Map();
header.put("Accept","application/vnd.api+json");
response = invokeurl
[
	url :"https://download.zoho.eu/v1/workdrive/download/" + "2jz2sb4a656e24aed4d4aac37dba51a4785e6"
	type :GET
	headers:header
	connection:"wd_all"
];
fileMap = Map();
info "response File:  " + response;
fileMap.put("Name",response.getFileName());
fileMap.put("Data",zoho.encryption.base64Encode(response));
fileList.add(fileMap);
param_list = list();
param_list.add({"Name":"File","FileValue":fileMap});
param_list.add({"Name":"StoreFile","Value":false});
param_list.add({"Name":"SplitByCustomRange","Value":"4-8,25"});
param_list.add({"Name":"FileName","Value":"target_file_name"});
params = Map();
params.put("Parameters",param_list);
merge_url = "https://v2.convertapi.com/convert/pdf/to/split?Secret=jpBnnrqi87oqXhyo";
header = {"Content-Type":"application/json"};
//header.put("Content-Type","multipart/form-data");
resp = invokeurl
[
	url :merge_url
	type :POST
	parameters:params.toString()
	headers:header
];
info "resp: " + resp;
target_file = zoho.encryption.base64DecodeToFile(resp.get("Files").get(0).get("FileData"),"Name.pdf");
target_file.setFileName("test" + ".pdf");
target_file.setFileType("pdf");
resp2 = zoho.crm.attachFile("Deals",418194000008734094,target_file);
return "";
}