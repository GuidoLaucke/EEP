string standalone.ZST_mailMergeKVA(Int dealId)
{
// Guido 
filesList = List();
newLine = hexToText("0A");
booksOrgId = "20080259560";
deckblatt = Collection();
deckblatt.insert("EEP":"0emhg8c2ccab32722427f8b61dc9e45bf5e14");
deckblatt.insert("EEP AT":"d03zp755871d55ad74f04af0e0cd19493228f");
deckblatt.insert("ENC":"d03zp333187cec6cb40d49e226ceca1dc85ca");
auftragbestaetigung = Collection();
auftragbestaetigung.insert("EEP":"0emhgba5c952cad294713bf09949c7c91539a");
auftragbestaetigung.insert("EEP AT":"d03zp742a4534233642359809593edbb33755");
auftragbestaetigung.insert("ENC":"d03zp2530454cb0904ffa8f8fbb082e46b40e");
dealEntry = zoho.crm.getRecordById("Deals",dealId);
angebot_von_eep_enc = ifNull(dealEntry.get("EEP_ENC"),"EEP");
///// IF ESTIMATE EXISTS ? //////
/// DELETES OLD ESTIMATE IF EXISTS/////
estimateOld = standalone.ZST_findOldEstimate(dealId,ifNull(dealEntry.get("Angebotsnummer"),""));
info "estimateOld in ZST_mailMergeKVA: " + estimateOld;
//////////////////////////////
mailmergeTemplateId = deckblatt.get(angebot_von_eep_enc);
mailmergeTemplateIdAuftragsbestaetigung = auftragbestaetigung.get(angebot_von_eep_enc);
// FELDER
// zoho.writer.getMergeFields(mailmergeTemplateId,"zst_writer_all");
// WORKDRIVE PREPARE
respFolder = zoho.workdrive.createFolder(dealId,"bapprc74c003b46a34492978429843cb4b662","zst_writer_all");
folderId = respFolder.get("data").get("id");
//info respFolder;
//////////////////////////////////////////// ANGEBOT //////////
if(estimateOld.size() > 0)
{
	estimate = standalone.ZST_updateEstimate(estimateOld.get(1),dealId);
}
else
{
	estimate = standalone.ZST_createEstimate(dealId);
	if(estimate.get("error") != "")
	{
		info "Estimate ZST_mailMergeKVA: " + estimate;
		return estimate.get("error");
	}
}
//info "Angebot: " + estimate;
if(estimate == "" || estimate == null)
{
	return "Estimate couldn't be created";
}
////////// CREATE ESTIMATE PDF ////////////////////
estimateId = estimate.get("estimate_id");
estimateNumber = estimate.get("estimate_number");
info "AngebotsId: " + estimateId;
downloadFile = invokeurl
[
	url :"https://books.zoho.eu/api/v3/estimates/" + estimateId + "?organization_id=" + booksOrgId + "&accept=pdf"
	type :GET
	connection:"books_connection"
];
//info downloadFile;
zoho.workdrive.uploadFile(downloadFile,folderId,"02_Angebot.pdf",true,"zst_writer_all");
///// ENDE ANGEBOT //////
//
rabatt = ifNull(dealEntry.get("Rabatt"),0);
b_ist_bundleProdukt = if(dealEntry.get("Bundle_Produkt") != null,true,false);
accountEntry = zoho.crm.getRecordById("Accounts",dealEntry.get("Account_Name").get("id"));
contactEntry = zoho.crm.getRecordById("Contacts",dealEntry.get("Contact_Name").get("id"));
//abnahmestelleEntry = zoho.crm.getRecordById("Accounts", dealEntry.get("").get("id"));
//USER
info zoho.loginuserid;
userinfo = zoho.crm.searchRecords("users","(email:equals:" + dealEntry.get("Owner").get("email") + ")").get("users").get(0);
//info "userinfo: " + userinfo;
userid = userinfo.get("id");
username = userinfo.get("full_name");
userphone = userinfo.get("phone");
useremail = userinfo.get("email");
userEntry = "";
bundleName = ifNull(dealEntry.get("Bundle_Produkt"),{"name":""}).get("name");
produktName = if(dealEntry.get("Produkte").size() == 1,dealEntry.get("Produkte").get(0).get("Produkt").get("name"),"");
///////////////////////////////// DECKBLATT ANFANG //////////////////////////////////////////
outputMp = Map();
outputMp.put("Bundle_Produkt",if(bundleName != "" && bundleName != null,bundleName,if(produktName != "",produktName,"")));
//outputMp.put("Account_Name",accountEntry.get("Account_Name"));
outputMp.put("Account_Name.Account_Name",accountEntry.get("Account_Name"));
// checked
outputMp.put("Contact_Name",contactEntry.get("Full_Name"));
//Checked
outputMp.put("Account_Name.Billing_Street",accountEntry.get("Billing_Street"));
outputMp.put("Account_Name.Billing_Code",accountEntry.get("Billing_Code"));
outputMp.put("Account_Name.Billing_City",accountEntry.get("Billing_City"));
outputMp.put("Angebotsnummer",estimateNumber);
outputMp.put("Owner",username);
outputMp.put("user.phone",userphone);
outputMp.put("user.email",useremail);
///// ABNAHMESTELLE ////
//matchcode = ifNull(dealEntry.get("Matchcode_Abnahmestelle"), "");
deal_url = "https://www.zohoapis.eu/crm/v3/Deals/" + dealId;
deal = invokeurl
[
	url :deal_url
	type :GET
	connection:"crm_connection"
];
l_abnahmestellen = ifNull(deal.get("data").get(0),{"Abnahmestellen_Firmen":{}}).get("Abnahmestellen_Firmen");
//info l_abnahmestellen.get(0);
//l_abnahmestellen = if(dealEntry.get("Abnahmestellen_Firmen") != null,dealEntry.get("Abnahmestellen_Firmen").toList(","),null);
info "l_abnahmestelle: " + l_abnahmestellen;
outputMp.put("StandortExists","false");
if(l_abnahmestellen.size() == 1)
{
	//result = zoho.crm.searchRecords("Accounts","(Account_Name:equals:" + l_abnahmestellen.get(0) + ")");
	abnahmestelle_entry = zoho.crm.getRecordById("Accounts",l_abnahmestellen.get(0).get("Abnahmestellen_Firmen").get("id"));
	outputMp.put("Account_Name.Beschreibung_Standort",abnahmestelle_entry.get("Beschreibung_Standort"));
	outputMp.put("Account_Name.Matchcode",abnahmestelle_entry.get("Matchcode"));
	outputMp.put("Account_Name.Standort_Stra_e",ifNull(abnahmestelle_entry.get("Standort_Stra_e"),""));
	outputMp.put("Account_Name.Standort_PLZ",ifNull(abnahmestelle_entry.get("Standort_PLZ"),""));
	outputMp.put("Account_Name.Standort_Stadt",ifNull(abnahmestelle_entry.get("Standort_Stadt"),""));
	outputMp.put("StandortExists","true");
}
outputMp.put("Angebotsdatum",if(dealEntry.get("Angebotsdatum") != null,dealEntry.get("Angebotsdatum").toString("dd.MM.yyyy"),zoho.currentdate.toString("dd.MM.yyyy")));
// checked
outputMap = Map();
outputMap.put("doc_name","01_Angebotsdeckblatt");
outputMap.put("output_format","pdf");
outputMap.put("folder_id",folderId);
respDeckblattWriter = zoho.writer.mergeAndStore(mailmergeTemplateId,outputMp,outputMap,"zst_writer_all");
///////////////////////////////// DECKBLATT ENDE //////////////////////////////////////////
///////////////////////////////// AUFTRAGSBESTÄTIGUNG /////////////////////////////////////
info "----";
outputMp = Map();
outputMp.put("Owner",username);
outputMp.put("Account_Name.Account_Name",accountEntry.get("Account_Name"));
outputMp.put("Angebotsnummer",estimateNumber);
outputMp.put("Angebotsdatum",if(dealEntry.get("Angebotsdatum") != null,dealEntry.get("Angebotsdatum").toString("dd.MM.yyyy"),zoho.currentdate.toString("dd.MM.yyyy")));
// checked
matchcode = "";
standort = "";
street = "";
city = "";
outputMp.put("AbnahmestelleJa","false");
for each  abnstelle in l_abnahmestellen
{
	account_abn_id = abnstelle.get("Abnahmestellen_Firmen").get("id");
	abnahmestelle_entry = zoho.crm.getRecordById("Accounts",account_abn_id);
	info "Matchcode: " + abnahmestelle_entry.get("Matchcode");
	standort = standort + ifNull(abnahmestelle_entry.get("Beschreibung_Standort"),"") + newLine;
	matchcode = matchcode + ifNull(abnahmestelle_entry.get("Matchcode"),"") + newLine;
	street = street + ifNull(abnahmestelle_entry.get("Standort_Stra_e"),"") + newLine;
	city = city + ifNull(abnahmestelle_entry.get("Standort_Stadt"),"") + newLine;
	outputMp.put("AbnahmestelleJa","true");
}
outputMp.put("Account_Name.Beschreibung_Standort",standort);
outputMp.put("Account_Name.Matchcode",matchcode);
outputMp.put("Account_Name.Standort_Stra_e",street);
outputMp.put("Account_Name.Standort_Stadt",city);
info "outputMp: " + outputMp;
//outputMp.put("Account_Name", abn_l);
listProd = List();
if(b_ist_bundleProdukt == true)
{
	prodMp = Map();
	prodMp.put("Produkte.Produkt",ifNull(dealEntry.get("Bundle_Produkt"),{"name":""}).get("name"));
	prodMp.put("Produkte.Menge",1);
	prodMp.put("pos",1);
	prodMp.put("Produkte.Einzelpreis",dealEntry.get("Gesamtsumme").replaceAll("\.",","));
	prodMp.put("SummePreis",dealEntry.get("Gesamtsumme").replaceAll("\.",","));
	//prodMp.put("Produkte.Summe",123456789);
	text = "";
	for each  prod in dealEntry.get("Produkte")
	{
		name = prod.get("Produkt").get("name");
		text = text + if(text == "","",newLine) + "- " + name;
	}
	prodMp.put("prodDesc",text);
	info "text: " + text;
	listProd.add(prodMp);
	info "prodMp: " + prodMp;
}
else
{
	counter = 1;
	for each  prod in dealEntry.get("Produkte")
	{
		name = prod.get("Produkt").get("name");
		einzelpreis = prod.get("Einzelpreis");
		menge = prod.get("Menge");
		summe = if(prod.get("Summe") != null,prod.get("Summe").toDecimal(),0);
		prodMp = Map();
		prodMp.put("Produkte.Produkt",name);
		prodMp.put("Produkte.Menge",ifNull(menge,1));
		prodMp.put("Produkte.Einzelpreis",ifNull(einzelpreis,prod.get("Einzelpreis")));
		prodMp.put("SummePreis",ifNull(prod.get("Summe"),0));
		prodMp.put("prodDesc",ifNull(prod.get("allg_Ergaenzung"),"") + newLine);
		//prodMp.put("Produkte.Summe", 99999);
		info "prod.get('Summe'): " + prod.get("Summe");
		prodMp.put("pos",counter);
		listProd.add(prodMp);
		counter = counter + 1;
	}
}
//outputMp.put("Opportunity.Rabatt", rabatt);
if(rabatt > 0)
{
	outputMp.put("Rabatt",rabatt);
}
outputMp.put("Gesamtsumme",if(dealEntry.get("Gesamtsumme") != null,dealEntry.get("Gesamtsumme").toDecimal() - if(rabatt > 0,rabatt,0),0).replaceAll("\.",",").toString().replaceAll("(?<=[0-9])(?=([0-9][0-9][0-9])+(?![0-9]))","."));
//outputMp.put("Gesamtsumme",777777);
outputMp.put("Produkte",listProd);
//info "outputMp 2: " + outputMp;
outputMap = Map();
outputMap.put("doc_name","04_Auftragsbestaetigung");
outputMap.put("output_format","pdf");
outputMap.put("folder_id",folderId);
respDeckblattWriter = zoho.writer.mergeAndStore(mailmergeTemplateIdAuftragsbestaetigung,outputMp,outputMap,"zst_writer_all");
//info respDeckblattWriter;
///////////////////////////////// AUFTRAGSBESTÄTIGUNG /////////////////////////////////////
/// GET PRODUKTBLATT
produktListe = List();
if(b_ist_bundleProdukt == true)
{
	bundleMap = Map();
	bundleMap.put("Produkt",dealEntry.get("Bundle_Produkt"));
	produktListe.add(bundleMap);
}
produktListe.addAll(dealEntry.get("Produkte"));
//info "produktListe: " + produktListe;
counter = 4;
for each  prod in produktListe
{
	//info "prod:" + prod;
	productId = prod.get("Produkt").get("id");
	//productEntry = zoho.crm.getRecordById("Products", prod.get("Produkt").get("id"));
	relatedrecords = zoho.crm.getRelatedRecords("Attachments","Products",productId);
	for each  ele in relatedrecords
	{
		if(ele.get("$type") == "Attachment")
		{
			attachmentId = ele.get("id");
			filename = ele.get("File_Name");
			name = "0" + counter + "_" + encodeurl(filename).toString();
			file = invokeurl
			[
				url :"https://www.zohoapis.eu/crm/v4/Products/" + productId + "/Attachments/" + attachmentId
				type :GET
				connection:"crm_connection"
			];
			response = zoho.workdrive.uploadFile(file,folderId,name,false,"zst_writer_all");
			//info response;
			counter = counter + 1;
		}
	}
}
info "folderId: " + folderId + " " + dealId + " " + estimateNumber;
mpUpdate = Map();
mpUpdate.put("Angebotsnummer",estimateNumber);
dealTagList = dealEntry.get("Tag").toList();
for each  ele in dealTagList
{
	ele.remove("id");
}
dealTagList.add({"name":"Angebot aktual. " + zoho.currentdate.toString("dd.MM.yy")});
mpUpdate.put("Tag",dealTagList);
zoho.crm.updateRecord("Deals",dealId,mpUpdate);
standalone.ZST_PDFMerge(folderId,dealId,estimateNumber);
return "";
/*
["Account_Name","Abnahmestelle","Account_Name.Account_Name","Account_Name.Billing_Street","Account_Name.Billing_Code","Account_Name.Billing_City","Abnahmestelle","Abnahmestelle_Strasse","Abnahmestelle_PLZ","Ort_der_Abnahmestelle_Firma","user.first_name","user.last_name","user.email","user.phone","Datum"]
["Produkte.Produkt","Produkte.Menge","Produkte.Summe"],"info":{"module":"Produkte","id":"Produkte","type":"subform","display_name":"Opportunity-Produkte","groupname":"Unterformular"}}],"fields":["user.first_name","user.last_name","Angebotsnummer","Account_Name.Billing_Street","Account_Name.Billing_Code","Account_Name.Billing_City","Bundle_Produkt","Produkte.Produkt","Produkte.Menge","Produkte.Summe","Gesamtsumme"]}
*/
}