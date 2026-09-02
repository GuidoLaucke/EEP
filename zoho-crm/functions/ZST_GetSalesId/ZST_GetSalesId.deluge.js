string standalone.ZST_GetSalesId(string name)
{
salesPersonID = "";
booksOrgId = "20080259560";
params = Map();
params.put("organization_id",booksOrgId);
response = invokeurl
[
	url :"https://books.zoho.eu/api/v3/salespersons"
	type :GET
	parameters:params
	connection:"books_connection"
];
info response;
for each  salesPerson in response.get("data")
{
	if(name.matches(salesPerson.get('salesperson_email')))
	{
		info salesPerson;
		salesPersonID = salesPerson.get('salesperson_id');
		return salesPersonID;
	}
}
return salesPersonID;
}