string standalone.ZST_KVA_PDF_Beratungsvertrag(Int deal_id)
{
output_mp_beratung = null;
m_vorlagen = Map();
newLine = hexToText("0A");
booksOrgId = "20080259560";
////////////// VORLAGEN /////////////////
m_vorlagen.put("deckblatt",{"EEP_Beratungsvertrag":"jmpwdadbdbaef327c4b74a9e179d681012bd2"});
m_vorlagen.put("vertragszusammenfassung",{"EEP_Beratungsvertrag":"jmpwd0a312544a6f74e3ea40257daeb63fcbb","EEP AT":"","ENC":""});
m_vorlagen.put("sepa",{"EEP_Beratungsvertrag":"4lecb69a15028b56744b5bb937d25afca884d","EEP AT":"","ENC":""});
/////////////////////////////////////////
////////// DEAL DATEN //////////////////
error = "";
deal_entry = zoho.crm.getRecordById("Deals",deal_id);
rabatt = ifNull(deal_entry.get("Rabatt"),0);
b_ist_bundle_produkt = if(deal_entry.get("Bundle_Produkt") != null,true,false);
account_entry = zoho.crm.getRecordById("Accounts",deal_entry.get("Account_Name").get("id"));
contact_entry = zoho.crm.getRecordById("Contacts",deal_entry.get("Contact_Name").get("id"));
bundle_name = ifNull(deal_entry.get("Bundle_Produkt"),{"name":""}).get("name");
produkt_name = if(deal_entry.get("Produkte").size() == 1,deal_entry.get("Produkte").get(0).get("Produkt").get("name"),"");
angebotsdatum = if(deal_entry.get("Angebotsdatum") != null,deal_entry.get("Angebotsdatum").toString("dd.MM.yyyy"),zoho.currentdate.toString("dd.MM.yyyy"));
gesamt_preis = deal_entry.get("Gesamtsumme").replaceAll("\.",",");
zahlungsbedingung = deal_entry.get("Zahlungsbedingungen");
beginn = deal_entry.get("BV_und_BV_ISO_Beginn");
if(beginn == null)
{
	error = error + "Beginndatum fehlt";
}
erstlaufzeit = deal_entry.get("BV_Erstlaufzeit");
if(erstlaufzeit == null)
{
	error = if(error != "",error + " und ","") + " Erstlaufzeit fehlt";
}
if(error != "")
{
	return error;
}
verlaengerung = deal_entry.get("BV_Verlaengerung_Monate");
//////// USER DATEN ///////////////////////
userinfo = zoho.crm.searchRecords("users","(email:equals:" + deal_entry.get("Owner").get("email") + ")").get("users").get(0);
userid = userinfo.get("id");
username = userinfo.get("full_name");
userphone = userinfo.get("phone");
useremail = userinfo.get("email");
///////////////////////////////////////////
/////// 		ABNAHMESTELLEN ////////////
deal_url = "https://www.zohoapis.eu/crm/v3/Deals/" + deal_id;
deal = invokeurl
[
	url :deal_url
	type :GET
	connection:"crm_connection"
];
l_abnahmestellen = ifNull(deal.get("data").get(0),{"Abnahmestellen_Firmen":{}}).get("Abnahmestellen_Firmen");
///////////////////////////////////////////////
angebot_von_eep_enc = ifNull(deal_entry.get("EEP_ENC"),"EEP");
angebot_von_eep_enc = "EEP_Beratungsvertrag";
deckblatt_template_id = m_vorlagen.get("deckblatt").get(angebot_von_eep_enc);
/////// 				WORKDRIVE ORDERN VORBEREITEN
respFolder = zoho.workdrive.createFolder(deal_id,"bapprc74c003b46a34492978429843cb4b662","zst_writer_all");
master_folder_id = respFolder.get("data").get("id");
////// 					ANGEBOT NEU ODER UPDATE? ///////
///// WENN DAS ANGEBOT EXISTIERT
//// UND DIE KVA NUMMER UND DIE ID ZURÜCKGEGEBEN
l_estimate_exists = standalone.ZST_findOldEstimate(deal_id,"");
/// returns estimate_number, estimate_id
if(l_estimate_exists.size() > 0)
{
	estimate_id = l_estimate_exists.get(1);
	info estimate_id;
	estimate = standalone.ZST_updateEstimate(estimate_id,deal_id);
	if(estimate.toString().containsIgnoreCase("Fehler"))
	{
		info "Estimate ZST_mailMergeKVA: " + estimate;
		return if(estimate.toString().len() > 2000,estimate.toString().substring(0,2000),estimate.toString());
	}
}
else
{
	estimate = standalone.ZST_createEstimate(deal_id);
	if(estimate.toString().containsIgnoreCase("Fehler"))
	{
		info "Estimate ZST_mailMergeKVA: " + estimate;
		return if(estimate.toString().len() > 2000,estimate.toString().substring(0,2000),estimate.toString());
	}
}
estimate_id = null;
estimate_number = null;
estimate_date = null;
if(estimate == "" || estimate == null)
{
	return "KVA konnte nicht erstellt werden";
}
else
{
	estimate_id = estimate.get("estimate_id");
	estimate_number = estimate.get("estimate_number");
	estimate_date = estimate.get("date");
}
/////////    PDF ERSTELLUNG 	/////////////
////////    1. DECKBLATT ERSTELLEN   /////////////
output_mp = Map();
output_mp.put("Bundle_Produkt",if(bundle_name != "" && bundle_name != null,bundle_name,if(produkt_name != "",produkt_name,"")));
output_mp.put("Account_Name.Account_Name",account_entry.get("Account_Name"));
output_mp.put("Contact_Name",contact_entry.get("Full_Name"));
output_mp.put("Account_Name.Billing_Street",account_entry.get("Billing_Street"));
output_mp.put("Account_Name.Billing_Code",account_entry.get("Billing_Code"));
output_mp.put("Account_Name.Billing_City",account_entry.get("Billing_City"));
output_mp.put("Angebotsnummer",estimate_number);
output_mp.put("Owner",username);
output_mp.put("user.phone",userphone);
output_mp.put("user.email",useremail);
output_mp.put("StandortExists","false");
output_mp.put("Angebotsnummer",estimate_number);
output_mp.put("Angebotsdatum",estimate_date);
output_mp.put("Angebotsdatum",angebotsdatum);
output_mp.put("Beginn",beginn.toString("dd.MM.yyyy"));
output_meta_mp = Map();
output_meta_mp.put("doc_name","01_Angebotsdeckblatt");
output_meta_mp.put("output_format","pdf");
output_meta_mp.put("folder_id",master_folder_id);
info "deckblatt_template_id: " + deckblatt_template_id + " master_folder_id: " + master_folder_id;
deckblatt_writer = zoho.writer.mergeAndStore(deckblatt_template_id,output_mp,output_meta_mp,"zst_writer_all");
info "deckblatt_writer: " + deckblatt_writer;
///////////////////////////////// DECKBLATT ENDE //////////////////////////////////////////
////////    3. AUTRAGSBESTÄTIGUNG ERSTELLEN   /////////////
matchcode = "";
standort = "";
street = "";
city = "";
output_mp = Map();
output_mp.put("Owner",username);
output_mp.put("Account_Name.Account_Name",account_entry.get("Account_Name"));
output_mp.put("Angebotsnummer",estimate_number);
output_mp.put("Angebotsdatum",angebotsdatum.toString("dd.MM.yyyy"));
output_mp.put("AbnahmestelleJa","false");
for each  abnstelle in l_abnahmestellen
{
	account_abn_id = abnstelle.get("Abnahmestellen_Firmen").get("id");
	abnahmestelle_entry = zoho.crm.getRecordById("Accounts",account_abn_id);
	info "Matchcode: " + abnahmestelle_entry.get("Matchcode");
	standort = standort + ifNull(abnahmestelle_entry.get("Beschreibung_Standort"),"") + newLine;
	matchcode = matchcode + ifNull(abnahmestelle_entry.get("Matchcode"),"") + newLine;
	street = street + ifNull(abnahmestelle_entry.get("Standort_Stra_e"),"") + newLine;
	city = city + ifNull(abnahmestelle_entry.get("Standort_Stadt"),"") + newLine;
	output_mp.put("AbnahmestelleJa","true");
}
output_mp.put("Account_Name.Beschreibung_Standort",standort);
output_mp.put("Account_Name.Matchcode",matchcode);
output_mp.put("Account_Name.Standort_Stra_e",street);
output_mp.put("Account_Name.Standort_Stadt",city);
l_produkte = List();
if(b_ist_bundle_produkt == true)
{
	prod_mp = Map();
	prod_mp.put("Produkte.Produkt",bundle_name);
	prod_mp.put("Produkte.Menge",1);
	prod_mp.put("pos",1);
	prod_mp.put("Produkte.Einzelpreis",gesamt_preis);
	prod_mp.put("SummePreis",gesamt_preis);
	//prodMp.put("Produkte.Summe",123456789);
	text = "";
	for each  prod in deal_entry.get("Produkte")
	{
		name = prod.get("Produkt").get("name");
		text = text + if(text == "","",newLine) + "- " + name;
	}
	prod_mp.put("prodDesc",text);
	l_produkte.add(prod_mp);
}
else
{
	counter = 1;
	for each  prod in deal_entry.get("Produkte")
	{
		name = prod.get("Produkt").get("name");
		einzelpreis = prod.get("Einzelpreis");
		menge = prod.get("Menge");
		summe = if(prod.get("Summe") != null,prod.get("Summe").toDecimal(),0);
		prod_mp = Map();
		prod_mp.put("Produkte.Produkt",name);
		prod_mp.put("Produkte.Menge",ifNull(menge,1));
		prod_mp.put("Produkte.Einzelpreis",ifNull(einzelpreis,prod.get("Einzelpreis")).toString().replaceAll("(?<=[0-9])(?=([0-9][0-9][0-9])+(?![0-9]))","."));
		prod_mp.put("SummePreis",ifNull(prod.get("Summe"),0).toString().replaceAll("(?<=[0-9])(?=([0-9][0-9][0-9])+(?![0-9]))","."));
		prod_mp.put("prodDesc",ifNull(prod.get("allg_Ergaenzung"),"") + newLine);
		prod_mp.put("pos",counter);
		l_produkte.add(prod_mp);
		counter = counter + 1;
	}
}
if(rabatt > 0)
{
	output_mp.put("Rabatt",rabatt.toString().replaceAll("(?<=[0-9])(?=([0-9][0-9][0-9])+(?![0-9]))","."));
}
output_mp.put("Gesamtsumme",if(gesamt_preis != null,gesamt_preis.toDecimal() - if(rabatt > 0,rabatt,0),0).replaceAll("\.",",").toString().replaceAll("(?<=[0-9])(?=([0-9][0-9][0-9])+(?![0-9]))","."));
output_mp.put("Produkte",l_produkte);
/// DATEN ÜBERNEHMEN FÜR BERATUNGSVERTRÄGE
output_mp_beratung = output_mp;
/// OPP TYP ANGEBOT ODER RAHMENVERTRAG
///////////////////////////////// ENDE AUFTRAGSBESTÄTIGUNG /////////////////////////////////////
////////    4. LEISTUNGSBESCHREIBUNG EINHOLEN   /////////////
l_produkte = List();
if(b_ist_bundle_produkt == true)
{
	bundle_mp = Map();
	bundle_mp.put("Produkt",deal_entry.get("Bundle_Produkt"));
	l_produkte.add(bundle_mp);
}
l_produkte.addAll(deal_entry.get("Produkte"));
counter = 1;
for each  prod in l_produkte
{
	product_id = prod.get("Produkt").get("id");
	relatedrecords = zoho.crm.getRelatedRecords("Attachments","Products",product_id);
	for each  ele in relatedrecords
	{
		if(ele.get("$type") == "Attachment")
		{
			attachmentId = ele.get("id");
			filename = ele.get("File_Name");
			if(filename.contains("Leistungsbeschreibung"))
			{
				name = "04_" + counter + "_" + encodeurl(filename).toString();
				produkt_datei = invokeurl
				[
					url :"https://www.zohoapis.eu/crm/v4/Products/" + product_id + "/Attachments/" + attachmentId
					type :GET
					connection:"crm_connection"
				];
				response = zoho.workdrive.uploadFile(produkt_datei,master_folder_id,name,false,"zst_writer_all");
				//info response;
				counter = counter + 1;
			}
		}
	}
}
////////////////////////// ENDE LEISTUNGSBESCHREIBUNG
///// KOPIEN PDF /////
////////    5. Vertragswerk  Konditionen /////////////
header = Map();
header.put("Accept","application/vnd.api+json");
data = Map();
data_list = List();
data_param1 = Map();
att_param1 = Map();
///// KONDITIONEN Beratungsvertrag_Vertragswerk_Konditionen.pdf
att_param1.put("resource_id","jmpwd344e479de2894d57959a5792bb849a6b");
data_param1.put("attributes",att_param1);
data_param1.put("type","files");
data_list.add(data_param1);
data.put("data",data_list);
response = invokeurl
[
	url :"https://www.zohoapis.eu/workdrive/api/v1/files/" + master_folder_id + "/copy"
	type :POST
	parameters:data.toString()
	headers:header
	connection:"zst_writer_all"
];
info response;
/////// KOPIEREN ENDE /////////
vertragszusammenfassung_template_id = m_vorlagen.get("vertragszusammenfassung").get(angebot_von_eep_enc);
//// VERTRAGSZUSAMMENFASSUNG
l_produkte = List();
produkte_abn = "";
counter = 1;
for each  prod in deal_entry.get("Produkte")
{
	name = prod.get("Produkt").get("name");
	produkte_abn = produkte_abn + if(produkte_abn != "",", ","") + name;
	einzelpreis = prod.get("Einzelpreis");
	menge = prod.get("Menge");
	summe = if(prod.get("Summe") != null,prod.get("Summe").toDecimal(),0);
	prod_mp = Map();
	prod_mp.put("Produkte.Produkt",name);
	prod_mp.put("Produkte.Menge",ifNull(menge,1));
	prod_mp.put("Produkte.Einzelpreis",ifNull(einzelpreis,prod.get("Einzelpreis")).toString().replaceAll("(?<=[0-9])(?=([0-9][0-9][0-9])+(?![0-9]))","."));
	prod_mp.put("Produkte.Summe",ifNull(prod.get("Summe"),0).toString().replaceAll("(?<=[0-9])(?=([0-9][0-9][0-9])+(?![0-9]))","."));
	prod_mp.put("prodDesc",ifNull(prod.get("allg_Ergaenzung"),"") + newLine);
	prod_mp.put("pos",counter);
	l_produkte.add(prod_mp);
	counter = counter + 1;
}
l_abn = List();
for each  abnstelle in l_abnahmestellen
{
	account_abn_id = abnstelle.get("Abnahmestellen_Firmen").get("id");
	abnahmestelle_entry = zoho.crm.getRecordById("Accounts",account_abn_id);
	standort = ifNull(abnahmestelle_entry.get("Beschreibung_Standort"),"");
	matchcode = ifNull(abnahmestelle_entry.get("Matchcode"),"");
	street = ifNull(abnahmestelle_entry.get("Standort_Stra_e"),"");
	city = ifNull(abnahmestelle_entry.get("Standort_Stadt"),"");
	mp_abn = Map();
	mp_abn.put("Abn.name",city);
	mp_abn.put("Abn.Strasse",street);
	mp_abn.put("Abn.Matchcode",matchcode);
	mp_abn.put("Abn.Produkt_Dienstleistung",produkte_abn);
	l_abn.add(mp_abn);
}
output_mp_beratung.put("Gesamtsumme",if(gesamt_preis != null,gesamt_preis.toDecimal() - if(rabatt > 0,rabatt,0),0).replaceAll("\.",",").toString().replaceAll("(?<=[0-9])(?=([0-9][0-9][0-9])+(?![0-9]))","."));
output_mp_beratung.put("Produkte",l_produkte);
output_mp_beratung.put("Angebotsnummer",estimate_number);
output_mp_beratung.put("Angebotsdatum",estimate_date.toString("dd.MM.yyyy"));
output_mp_beratung.put("Zahlungsbedingungen",zahlungsbedingung);
output_mp_beratung.put("Verl_ngerung_Monate",verlaengerung);
output_mp_beratung.put("Erstlaufzeit",erstlaufzeit.toString("dd.MM.yyyy"));
output_mp_beratung.put("Beginn",beginn.toString("dd.MM.yyyy"));
output_mp_beratung.put("Abn",l_abn);
output_mp_beratung.put("Account_Name",account_entry.get("Account_Name"));
output_mp_beratung.put("abnahme_exists",if(l_abn.size() > 0,"wahr",""));
output_mp_beratung.put("Rabatt",if(rabatt == null || rabatt == 0,null,rabatt.toString().replaceAll("(?<=[0-9])(?=([0-9][0-9][0-9])+(?![0-9]))",".")));
info "output_mp_beratung: " + output_mp_beratung;
output_meta_mp = Map();
output_meta_mp.put("doc_name","07_Vertragszusammenfassung");
output_meta_mp.put("output_format","pdf");
output_meta_mp.put("folder_id",master_folder_id);
vertragwerk_writer = zoho.writer.mergeAndStore(vertragszusammenfassung_template_id,output_mp_beratung,output_meta_mp,"zst_writer_all");
update_mp = Map();
update_mp.put("Angebotsnummer",estimate_number);
zoho.crm.updateRecord("Deals",deal_id,update_mp);
////// SEPA /////
if(l_abnahmestellen.size() <= 1)
{
	sepa_template_id = m_vorlagen.get("sepa").get(angebot_von_eep_enc);
	output_mp = Map();
	output_mp.put("Angebotsdatum",estimate_date.toString("dd.MM.yyyy"));
	output_meta_mp = Map();
	output_meta_mp.put("doc_name","08_SEPA");
	output_meta_mp.put("output_format","pdf");
	output_meta_mp.put("folder_id",master_folder_id);
	vertragwerk_writer = zoho.writer.mergeAndStore(sepa_template_id,output_mp,output_meta_mp,"zst_writer_all");
}
// Dort wird das alte PDF Angebot aus dem Attachment gelöscht
info "master_folder_id: " + master_folder_id + " deal_id: " + deal_id + " estimate_number: " + estimate_number;
response = standalone.ZST_PDFMerge(master_folder_id,deal_id,estimate_number);
if(response.get("error") != "")
{
	return "Leider wurde ein Fehler bei der Erstellung des PDF festgestellt: " + response.get("error");
}
else
{
	return "Das Angebot wurde erzeugt und in den Anhängen abgelegt";
}
}