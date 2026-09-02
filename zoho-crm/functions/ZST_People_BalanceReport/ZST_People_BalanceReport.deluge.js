string standalone.ZST_People_BalanceReport()
{
url = "https://people.zoho.eu/people/api/v2/leavetracker/reports/bookedAndBalance";
mp = Map();
mp.put("from","01-Jan-2023");
mp.put("to","31-Aug-2023");
mp.put("unit","Day");
resp = invokeurl
[
	url :url
	type :GET
	parameters:mp
	connection:"people_connection"
];
//info resp;
c_leavetypes = Collection();
l_leavetypes = resp.get("leavetypes").keys();
for each  ele in l_leavetypes
{
	name = resp.get("leavetypes").get(ele).get("name");
	c_leavetypes.insert(ele:name);
}
l_report = resp.get("report").keys();
for each  rep in l_report
{
	info "Employee_id: " + rep;
	//info  resp.get("report").get(rep);
	l_rep = resp.get("report").get(rep).keys();
	for each  ele in l_rep
	{
		info "ele: " + ele;
		info "leaves: " + c_leavetypes.get(ele);
		info "vlues: " + resp.get("report").get(rep).get(ele);
	}
}
return "";
}