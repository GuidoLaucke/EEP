string standalone.ZST_neue_Kundennummer_erzeugen()
{
letzte_kundennummer = zoho.crm.getOrgVariable("nr_letzte_kundennummer");
neue_kundennummer = letzte_kundennummer.toNumber() + 1;
set_letzte_kundennummer = Map();
set_letzte_kundennummer.put("apiname","nr_letzte_kundennummer");
set_letzte_kundennummer.put("value",neue_kundennummer);
zoho.crm.invokeConnector("crm.set",set_letzte_kundennummer);
return neue_kundennummer;
}