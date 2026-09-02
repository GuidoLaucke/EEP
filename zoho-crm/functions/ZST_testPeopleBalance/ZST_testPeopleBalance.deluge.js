string standalone.ZST_testPeopleBalance()
{
/*url :"https://people.zoho.com/people/api/leave/addBalance?balanceData={" + eid + ":{" + leaveId + ":{date:" + reqdate + ",count:" + count + "}}}&dateFormat=dd-MMM-yyyy"
32401000000143001

*/
users = invokeurl
[
	url :"https://people.zoho.eu/people/api/v2/leavetracker/reports/user?employee=32401000000143001"
	type :GET
	connection:"people_connection"
];
info users;
resp = invokeurl
[
	url :"https://people.zoho.eu/api/leave/addBalance?balanceData={32401000000143001:{32401000000758581:{date:2023-11-23,count:-197}}}&dateFormat=yyyy-MM-dd"
	type :POST
	connection:"people_connection"
];
info resp;
users = invokeurl
[
	url :"https://people.zoho.eu/people/api/v2/leavetracker/reports/user?employee=32401000000143001"
	type :GET
	connection:"people_connection"
];
info users;
return "";
}