string button.ZST_CreateEstimateDokument(String dealId)
{
booksOrgId = "20080259560";
deal_entry = zoho.crm.getRecordById("Deals",dealId);
ISO_beratungsvertrag = if(deal_entry.get("Beratungsvertrag_Typ") == "ISO-Beratungsvertrag",true,false);
record = zoho.books.getRecords("Estimates",booksOrgId,{"zcrm_potential_id":dealId,"status":"accepted"},"books_connection").get("estimates");
if(record.size() > 0)
{
	return "Es gibt bereits ein akzeptiertes Angebot!";
}
zoho.crm.updateRecord("Deals",dealId,{"blocked":true},{"trigger":{""}});
if(ISO_beratungsvertrag == false)
{
	returnMessage = standalone.ZST_mailMergeKVA(dealId);
	zoho.crm.updateRecord("Deals",dealId,{"blocked":false});
	if(returnMessage.contains("Fehler"))
	{
		return "Es gab ein Problem: " + returnMessage;
	}
	return "Das erstellte PDF-Dokument ist unter den Anhängen zu finden (ev. Refresh). Das reine Angebot selbst liegt unter Books und findet sich im Deal hier unter 'Zoho Books' verlinkt.";
}
else
{
	zoho.crm.updateRecord("Deals",dealId,{"blocked":false});
	return "Für ISO Beratungsverträge nutzen Sie bitte einen anderen Button!";
}
}