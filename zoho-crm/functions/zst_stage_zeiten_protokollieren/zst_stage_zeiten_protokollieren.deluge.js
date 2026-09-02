void automation.ZST_Stage_Zeiten_protokollieren(Int dealId)
{
deal_det = zoho.crm.getRecordById("Deals",dealId);
deal_stage = deal_det.get("Stage");
curr_time = zoho.currenttime.toString("yyyy-MM-dd'T'HH:mm:ss+00:00");
upd_deal_map = Map();
liste = List();
//liste.addAll({"Chancenpool","Erstkontakt stattgefunden","Interesse vorhanden (Infos fehlen)","Angebot kalkulieren","Angebot erstellen","Angebot fertig","Angebot verschickt","Abgeschlossen, gewonnen","Abgeschlossen, verloren","Gewonnen, Projekt in Bearbeitung","Projekt abgeschlossen"});
liste.addAll({"Chancenpool","Erstkontakt stattgefunden","Interesse vorhanden (Infos fehlen)","Angebot kalkulieren","Angebot erstellen","Angebot fertig","Angebot verschickt","Abgeschlossen, gewonnen","Abgeschlossen, verloren","Gewonnen, Projekt in Bearbeitung","Projekt 100% abgerechnet"});
indexOf = liste.indexOf(deal_stage);
info "indexOf: " + indexOf;
if(indexOf >= 0)
{
	name = liste.get(indexOf);
	//name = "Interesse vorhanden (Infos fehlen)";
	name = name.replaceAll(" ","_");
	name = name.replaceAll("\(","");
	name = name.replaceAll("\)","");
	info "name: " + name;
	upd_deal_map.put("Datum_" + name,curr_time);
}
info "MAP: " + upd_deal_map;
info zoho.crm.updateRecord("Deals",dealId,upd_deal_map);
}