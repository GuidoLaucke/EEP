string standalone.ZST_GetBooksUser(string uemail)
{
booksOrgId = "20080259560";
BooksuserID = 235883000000038001;
// default User
users = invokeurl
[
	url :"https://books.zoho.eu/api/v3/users/?organization_id=" + booksOrgId
	type :GET
	connection:"books_connection"
];
users = users.get("users");
for each  f in users
{
	Bemail = f.get("email");
	//info Bemail;
	if(uemail == Bemail)
	{
		info "Bemail=" + Bemail;
		info "uemail=" + uemail;
		BooksuserID = f.get("user_id");
		break;
	}
}
return BooksuserID;
}