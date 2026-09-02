string standalone.ZST_AttendancePeople()
{
// Construct a map to supply as parameter to the Zoho People API 
query_map = Collection();
query_map.insert("sdate":zoho.currenttime.subMonth(1));
query_map.insert("edate":zoho.currenttime.subMonth(2).eomonth(1));
//query_map.insert("startIndex":16); 
query_map.insert("emailId":"g.loska@eep-energy.eu");
// Invoke the Zoho People API to fetch attendance record of all employees 
get_rec = invokeurl
[
	url :"https://people.zoho.eu/people/api/attendance/getUserReport"
	type :POST
	parameters:query_map.toMap()
	connection:"people_connection"
];
//info get_rec;//.subString(0,10000);
for each  ele in get_rec
{
	headerString = ele.toMap().keys().sort().toString();
	l_header = ele.toMap().keys().sort();
	break;
}
l_date = List();
for each  ele in get_rec.keys()
{
	l_date.add(ele);
}
dataString = "";
dataString = "'DATUM'," + headerString + zoho.encryption.urlDecode("%0A");
for each  datum in l_date.sort(true)
{
	info "datum: " + datum;
	dataString = dataString + "'" + datum + "',";
	for each  schluessel in l_header
	{
		info "schluessel: " + schluessel + " : " + get_rec.get(datum).get(schluessel);
		dataString = dataString + "'" + get_rec.get(datum).get(schluessel) + "',";
	}
	dataString = dataString + zoho.encryption.urlDecode("%0A");
}
orgId = "20080259923";
workspaceId = "142290000000849002";
viewId = "142290000001606048";
headersMap = Map();
headersMap.put("ZANALYTICS-ORGID",orgId);
config = Map();
//config.put("importType","truncateadd");
config.put("fileType","csv");
config.put("autoIdentify","false");
config.put("tableName","newAttendance");
config.put("delimiter","0");
config.put("commentChar","#");
config.put("quoted","1");
info dataString;
parameters = "DATA=" + dataString + "&CONFIG=" + zoho.encryption.urlEncode(config.toString());
//url :"https://analyticsapi.zoho.eu/restapi/v2/workspaces/" + workspaceId + "/views/" + viewId + "/data" + "?" + parameters
//url :"https://analyticsapi.zoho.eu/restapi/v2/workspaces/" + workspaceId + "/data" + "?" + parameters
response = invokeurl
[
	url :"https://analyticsapi.zoho.eu/restapi/v2/workspaces/" + workspaceId + "/data" + "?" + parameters
	type :POST
	headers:headersMap
	connection:"analytics_connection"
];
info response;
return "";
}