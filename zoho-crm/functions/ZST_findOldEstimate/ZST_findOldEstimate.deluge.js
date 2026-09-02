string standalone.ZST_findOldEstimate(Int deal_id, String Angebotsnummer)
{
booksOrgId = "20080259560";
info "Deal ID in ZST_findOldEstimate: " + deal_id;
info "Angebotsnummer in ZST_findOldEstimate: " + Angebotsnummer;
try 
{
	list = List();
	if(Angebotsnummer != "")
	{
		record = zoho.books.getRecords("Estimates",booksOrgId,{"estimate_number":Angebotsnummer},"books_connection").get("estimates");
	}
	else
	{
		record = zoho.books.getRecords("Estimates",booksOrgId,{"zcrm_potential_id":deal_id},"books_connection").get("estimates");
	}
	if(record.size() > 0)
	{
		list.add(record.get(0).get("estimate_number"));
		list.add(record.get(0).get("estimate_id"));
	}
	//////////////////////////////////
}
catch (e)
{
	info "list: " + list + " error: " + e;
	return null;
}
return list;
}