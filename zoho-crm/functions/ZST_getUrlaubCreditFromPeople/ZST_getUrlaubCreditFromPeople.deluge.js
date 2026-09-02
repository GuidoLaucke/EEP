string standalone.ZST_getUrlaubCreditFromPeople(Date from, Date to, Int employee_id)
{
url = "https://people.zoho.eu/people/api/v2/leavetracker/reports/bookedAndBalance";
mp = Map();
mp.put("from",ifNull(from,"01-Jan-2023").toString("dd-MMM-yyyy"));
mp.put("to",ifNull(to,"26-Sep-2023").toString("dd-MMM-yyyy"));
mp.put("unit","Day");
//info mp;
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
//info "c_leavetypes: " + c_leavetypes;
l_report = resp.get("report").keys();
c_employee_balance = Collection();
urlaub_gutschrift = 0;
for each  rep in l_report
{
	//info  resp.get("report").get(rep);
	if(rep == employee_id)
	{
		//info "Employee_id: " + rep;
		liste = List();
		l_rep = resp.get("report").get(rep).keys();
		name = "";
		for each  ele in l_rep
		{
			if(c_leavetypes.containsKey(ele))
			{
				freizeitsart = c_leavetypes.get(ele);
				if(freizeitsart.contains("Urlaub"))
				{
					urlaub_gutschrift = ifNull(resp.get("report").get(rep).get(ele).get("balance"),0);
					break;
				}
			}
		}
	}
}
return urlaub_gutschrift;
}