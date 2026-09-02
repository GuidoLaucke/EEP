string standalone.ZST_AnalyticsStundenuebersicht(String fuer_MA, Bool email_bericht, Int first, Int last)
{
first = if(first == null,1,first);
last = if(last == null,100,last);
responseP = zoho.people.getRecords("P_Employee",0,200);
//info "responseP: " + responseP;
workdrive_result = standalone.ZST_CreateFolderWorkdrive();
folder_id = workdrive_result.get(0);
permalink = workdrive_result.get(1);
//info folder_id + " " + permalink;
//info responseP;
////// COLLECTION VARS //////
collMA = Collection();
collMAID = Collection();
personalEmail = "personal@eep-consulting.com";
//personalEmail = "guido.laucke@gmail.com";
collRefEmail = Collection();
collVorname = Collection();
collUebertrag = Collection();
collUrlaub = Collection();
collJoining = Collection();
////////////////////////////
vormonat_zahl = 0;
vormonat = zoho.currentdate.subMonth(1);
abrechnungs_monat_name = vormonat.toString("MMMMM");
monthStringTranslate = zoho.ai.translate(abrechnungs_monat_name,"de","en");
monthStringGerman = monthStringTranslate.get("translation").get(0).get("translate");
vormonat_zahl = vormonat.toString("MM").toNumber();
//info "Vormonat Zahl: " + vormonat_zahl;
/// email des Vorgesetzten
counter = 0;
for each  ma in responseP
{
	counter = counter + 1;
	if(counter >= first && counter <= last)
	{
		date_of_joining = if(ma.get("Dateofjoining").isDate(),ma.get("Dateofjoining").toDate(),"31-Dec-2100".toDate());
		if(ma.get("Employeestatus") == "Inactive" || ma.get("Employeestatus") == "Terminated" || ma.get("Employeestatus") == "Resigned" || vormonat < date_of_joining)
		{
			//info ma;
			continue;
		}
		collMA.insert(ma.get("EmailID"):ma.get("FirstName") + " " + ma.get("LastName"));
		collVorname.insert(ma.get("EmailID"):ma.get("FirstName"));
		collMAID.insert(ma.get("EmailID"):ma.get("Zoho_ID"));
		collRefEmail.insert(ma.get("EmailID"):ma.get("Reporting_To.MailID"));
		//collUebertrag.insert(ma.get("EmailID"):ma.get("bertrag_aus_Vorjahr"));
		collUebertrag.insert(ma.get("EmailID"):ma.get("bertrag_aus_2023"));
		collUrlaub.insert(ma.get("EmailID"):ifNull(ma.get("Urlaubsanpruch"),0));
		collJoining.insert(ma.get("EmailID"):date_of_joining);
	}
}
info "Anzahl der MA: " + collMA.size();
coll_uebertrag_2023 = Collection();
// URLAUB /// Stunden werden in People eingetragen
coll_uebertrag_2023.insert("zoho.admin@eep-energy.eu":9);
coll_uebertrag_2023.insert("ws2@eep-consulting.com":-8);
coll_uebertrag_2023.insert("h.zwerschke@eep-consulting.com":27);
coll_uebertrag_2023.insert("b.stephens@eep-consulting.com":15);
coll_uebertrag_2023.insert("j.irnich@eep-energy.eu":46);
coll_uebertrag_2023.insert("m.rueckert@eep-consulting.com":8);
coll_uebertrag_2023.insert("m.sengstock@eep-consulting.com":33);
coll_uebertrag_2023.insert("f.wuerth@eep-energy.eu":33);
coll_uebertrag_2023.insert("z.rzyek@eep-consulting.com":54);
coll_uebertrag_2023.insert("s.wiggenhauser@eep-consulting.com":14);
coll_uebertrag_2023.insert("w.prestl@eep-energy.eu":40);
coll_uebertrag_2023.insert("l.toscano@eep-consulting.com":38);
coll_uebertrag_2023.insert("r.vonderdovenmuehle@eep-energy.eu":28);
coll_uebertrag_2023.insert("n.neumann@eep-consulting.com":23);
coll_uebertrag_2023.insert("d.gryzik@eep-consulting.com":26);
coll_uebertrag_2023.insert("d.lechermann@eep-consulting.com":43);
coll_uebertrag_2023.insert("j.ashri@eep-energy.at":28);
coll_uebertrag_2023.insert("s.darius@eep-consulting.com":54);
coll_uebertrag_2023.insert("m.velten@eep-consulting.com":28);
coll_uebertrag_2023.insert("i.kun@eep-energy.eu":28);
coll_uebertrag_2023.insert("m.wolf@eep-energy.eu":32);
coll_uebertrag_2023.insert("c.holdermann@eep-energy.eu":33);
coll_uebertrag_2023.insert("m.iuga@eep-consulting.com":32);
coll_uebertrag_2023.insert("a.bergler@eep-consulting.com":46);
//coll_uebertrag_2023.insert("a.bergler@eep-consulting.com":16.5);
coll_uebertrag_2023.insert("a.bauer@eep-energy.eu":20);
coll_uebertrag_2023.insert("g.loska@eep-energy.eu":56);
coll_uebertrag_2023.insert("c.starke@eep-consulting.com":33);
/////////////// TESTEN ///////////////////////////
//// WENN MAN TESTEN WILL UND NUR EINE BEGRENZTE ANZAHL MA VERWENDEN WILL
//// HIER DIE COLLECTION SETZEN UND DIE EMAIL EINTRAGEN 
//collMA = Collection();
//collMA.insert("i.kun@eep-energy.eu":"Isabelle Kun");
//collMA.insert("ws7@eep-energy.eu":"Jan Dethling");
//collMA.insert("ws3@eep-energy.eu":"Luis Karwat");
//collMA.insert("b.huber@eep-consulting.com":"Benno Huber");
//collMA.insert("r.zangl@eep-energy.eu":"Raimund Zangl");
//collMA.insert("j.huber@eep-energy.eu":"Jürgen Huber");
//collMA.insert("m.velten@eep-consulting.com":"Marisa Velten");
//collMA.insert("s.darius@eep-consulting.com":"Simon Darius");
//collMA.insert("s.wiggenhauser@eep-consulting.com":"Sebastian Wiggenhauser");
//collMA.insert("i.kun@eep-energy.eu":"Isabelle Kun");
//collMA.insert("j.huber@eep-energy.eu":"Jürgen Huber");
//collMA.insert("m.iuga@eep-consulting.com":"Mark Iuga");
//collMA.insert("m.rueckert@eep-consulting.com":"Madlen Rückert");
//collMA.insert("r.zangl@eep-energy.eu":"Raimund Zangl");
//collMA.insert("s.wiggenhauser@eep-consulting.com":"Sebastian Wiggenhauser");
//collMA.insert("w.prestl@eep-energy.eu":"Wolfgang Prestl");
//collMA.insert("z.rzyek@eep-consulting.com":"Zakaria Rzyek");
//collMA.insert("a.bergler@eep-consulting.com":"Andrea Bergler");
//collMA.insert("p.fein@eep-consulting.com":"Patrizia Fein");
//collMA.insert("c.fest@eep-consulting.com":"Cindy Fest");
//collMA.insert("y.barak@eep-consulting.com":"Yaren Barak");
//collMA.insert("b.stephens@eep-consulting.com":"Bryn Stephens");
//collMA.insert("d.gryzik@eep-consulting.com":"Daniel Gryzik");
//collMA.insert("j.ashri@eep-energy.at":"Jamin Ashri");
//collMA.insert("s.starke@eep-consulting.com":"Sarah Starke");
//collMA.insert("c.starke@eep-consulting.com":"Claudia Starke");
//collMA.insert("g.loska@eep-energy.eu":"Gabriel Loska");
/////////////////////////////////////////////////
Log_Sheet_ID = "";
//info collMA;
//info "collMAID: " + collMAID;
///// ANALYTICS /////////////
orgId = "20080259923";
workspaceId = "142290000000849002";
viewId = "142290000003832006";
// Stundenübersicht 2025 V1
headersMap = Map();
headersMap.put("ZANALYTICS-ORGID",orgId);
config = Map();
config.put("responseFormat","json");
paramsMap = Map();
paramsMap.put("CONFIG",config.toString());
response = invokeurl
[
	url :"https://analyticsapi.zoho.eu/restapi/v2/bulk/workspaces/" + workspaceId + "/views/" + viewId + "/data"
	type :GET
	parameters:paramsMap
	headers:headersMap
	connection:"analytics_connection"
];
//info response;
jobId = response.get("data").get("jobId");
for each  wait in {1,2,3,4,5,5}
{
	try 
	{
		url = "https://postman-echo.com/delay/wait";
		delayResponseCall = invokeurl
		[
			url :url
			type :GET
		];
	}
	catch (e)
	{
		info "error in wait: " + e;
	}
	response = invokeurl
	[
		url :"https://analyticsapi.zoho.eu/restapi/v2/bulk/workspaces/" + workspaceId + "/exportjobs/" + jobId
		type :GET
		headers:headersMap
		connection:"analytics_connection"
	];
	//info response;
	downloadUrl = response.get("data").get("downloadUrl");
	if(downloadUrl != null)
	{
		break;
	}
}
//info "downloadUrl: " + downloadUrl;
file_mergedDoc = invokeurl
[
	url :downloadUrl
	type :get
	headers:headersMap
	connection:"analytics_connection"
];
anzahl_der_erstellten_dateien = 0;
//info collMA.keys();
//////////////////////////////////	
for each  maEmail in collMA.keys()
{
	//info maEmail;
	try 
	{
		///// AUS TEMPLATE EIN SHEET ERSTELLEN /////
		if(maEmail == "r.zangl@eep-energy.eu" || maEmail == "s.darius@eep-consulting.com" || maEmail == "j.huber@eep-energy.eu")
		{
			continue;
		}
		if(fuer_MA != null && fuer_MA != "" && maEmail != fuer_MA)
		{
			continue;
		}
		userName = collMA.get(maEmail);
		info maEmail + " " + userName + " MA ID: " + collMAID.get(maEmail);
		//// URLAUBSGUTSCHRIFT nur 2023!/////
		employee_id = collMAID.get(maEmail);
		// für 2024 erst
		//urlaubsgutschrift = ifNull(coll_uebertrag_2023.get(maEmail),"");
		//urlaubsgutschrift = standalone.ZST_getUrlaubCreditFromPeople("01-Jan-2023","26-Sep-2023",employee_id);
		///////////////////////////////////
		Log_Sheet_ID = standalone.ZST_GetSheetResourceID(null,userName.replaceFirst(" ","_") + "_" + vormonat.toString("MMM_yyyy"));
		if(Log_Sheet_ID != null && Log_Sheet_ID != "")
		{
			anzahl_der_erstellten_dateien = anzahl_der_erstellten_dateien + 1;
			sollStundenText = "";
			fracStundenText = "";
			prozStundenText = "";
			checkInStunden = "";
			checkInStundenText = "";
			abwInStundenText = "";
			summeCheckIn_AbwText = "";
			sollStunden = List();
			saldoStundenText = "";
			sollStdGesamt = 0;
			fracStundenGesamt = 0;
			prozStundenGesamt = 0;
			checkInStundenGesamt = 0;
			abwInStundenGesamt = 0;
			saldoStundenGesamt = 0;
			summeCheckIn_AbwGesamt = 0;
			urlaubText = "";
			sonderurlaubText = "";
			krankheitText = "";
			freizeitausgleichText = "";
			urlaubTageGesamt = 0;
			freizeitausgleichTageGesamt = 0;
			krankheitTageGesamt = 0;
			sonderurlaubTageGesamt = 0;
			monatText = "";
			urlaubsanspruch = 0;
			auszahlungText = "";
			auszahlungGesamt = 0;
			// für die bedingte Formatierung
			gesSoll = 0;
			line = 1;
			for each  ele in file_mergedDoc.get("data")
			{
				if(ele.get("User E-Mail") == maEmail && ele.get("year") == "2026")
				{
					monats_zahl = ele.get("Month_Number").toNumber();
					info "monats_zahl: " + monats_zahl + " vormonat_zahl: " + vormonat_zahl;
					//info ele;
					///// ARBEITSSTUNDEN //////
					hCheckin = ifNull(ele.get("h: Checkin"),0);
					checkInStundenText = checkInStundenText + if(checkInStundenText != "",",","") + if(monats_zahl > vormonat_zahl,"-",if(hCheckin == "",0,hCheckin.toDecimal()));
					checkInStundenGesamt = checkInStundenGesamt + if(monats_zahl > vormonat_zahl || hCheckin == "",0,hCheckin.toDecimal());
					///// ABWESENHEITEN //////
					hAbwesenheit = ifNull(ele.get("Abwesenheiten Stunden"),0);
					abwInStundenText = abwInStundenText + if(abwInStundenText != "",",","") + if(monats_zahl > vormonat_zahl,"-",if(hAbwesenheit == "",0,hAbwesenheit.toDecimal()));
					abwInStundenGesamt = abwInStundenGesamt + if(hAbwesenheit == "",0,hAbwesenheit.toDecimal());
					/// SUMME AUS BEIDEN /////
					summeCheckIn_AbwText = summeCheckIn_AbwText + if(summeCheckIn_AbwText != "",",","") + if(monats_zahl > vormonat_zahl,"-",if(hCheckin == "",0,hCheckin.toDecimal() + hAbwesenheit.toDecimal()));
					summeCheckIn_AbwGesamt = summeCheckIn_AbwGesamt + if(monats_zahl > vormonat_zahl || hCheckin == "",0,hCheckin.toDecimal()) + if(monats_zahl > vormonat_zahl || hAbwesenheit == "",0,hAbwesenheit.toDecimal());
					///////////////////////////
					///// ABRECHENBARE STUNDEN
					hFakt = ifNull(ele.get("h: fakturierbar"),0);
					fracStundenText = fracStundenText + if(fracStundenText != "",",","") + if(monats_zahl > vormonat_zahl,"-",if(hFakt == "",0.0,hFakt.toDecimal()));
					fracStundenGesamt = if(hFakt == "",0.0,hFakt.toDecimal()) + fracStundenGesamt.toDecimal();
					////////////////////////
					////// IN PROZENT ABRECHENBARE STUNDEN
					prozAbrh = ifNull(ele.get("% abrechnenbare Stunden"),0);
					prozStundenText = prozStundenText + if(prozStundenText != "",",","") + if(monats_zahl > vormonat_zahl,"-",if(prozAbrh == "",0 + "%",prozAbrh + "%"));
					///////////////////////
					////// SOLLSTUNDEN ////
					sollProM = if(monats_zahl > vormonat_zahl,"0",ifNull(ele.get("Sollstunden im Monat"),0));
					sollStundenText = sollStundenText + if(sollStundenText != "",",","") + if(monats_zahl > vormonat_zahl,"-",if(sollProM == "",0,sollProM.toDecimal()));
					sollStdGesamt = sollStdGesamt + if(monats_zahl <= vormonat_zahl && sollProM.isNumber(),sollProM.toDecimal(),0);
					///////////////////////
					/////// SALDO PRO MONAT
					saldoProM = ifNull(ele.get("Saldo pro Monat"),0);
					info ">>saldoProM: " + saldoProM;
					if(monats_zahl <= vormonat_zahl)
					{
						saldoStdGesamt = ifNull(ele.get("Saldo Stunden Gesamt"),0);
					}
					saldoStundenText = saldoStundenText + if(saldoStundenText != "",",","") + if(monats_zahl > vormonat_zahl,"-",if(saldoProM == "" && !saldoProM.isNumber(),0,saldoProM.toDecimal()));
					info "saldoStundenText: " + saldoStundenText;
					auszahlung = ifNull(ele.get("Auszahlung"),0);
					auszahlungText = auszahlungText + if(auszahlungText != "",",","") + if(monats_zahl > vormonat_zahl,"-",if(auszahlung == "" && !auszahlung.isNumber(),0,auszahlung.toDecimal()));
					auszahlungGesamt = auszahlungGesamt + if(auszahlung.isNumber(),auszahlung.toDecimal(),0);
					///// AKTUELLER MONAT ////
					monatText = monatText + if(monatText != "",",","") + if(monats_zahl <= vormonat_zahl,"1",0);
					//////////////////////
					/////// URLAUB
					urlaub = ifNull(ele.get("Urlaub"),0);
					urlaubText = urlaubText + if(urlaubText != "",",","") + if(monats_zahl > vormonat_zahl,"-",urlaub);
					urlaubTageGesamt = urlaubTageGesamt + if(urlaub.isNumber(),urlaub.toDecimal(),0);
					urlaubsanspruch = ifNull(ele.get("Urlaubsanspruch"),0);
					urlaubsgutschrift = ifNull(ele.get("Urlaubsuebertrag"),0);
					//////////////////////
					//// Freizeitausgleich
					freizeitausgleich = ifNull(ele.get("Freizeitausgleich"),0);
					freizeitausgleichText = freizeitausgleichText + if(freizeitausgleichText != "",",","") + if(monats_zahl > vormonat_zahl,"-",freizeitausgleich);
					freizeitausgleichTageGesamt = freizeitausgleichTageGesamt + if(monats_zahl <= vormonat_zahl && freizeitausgleich.isNumber(),freizeitausgleich.toDecimal(),0);
					//////////////////////
					//// Freizeitausgleich
					krankheit = ifNull(ele.get("Krankheit"),0);
					krankheitText = krankheitText + if(krankheitText != "",",","") + if(monats_zahl > vormonat_zahl,"-",krankheit);
					krankheitTageGesamt = krankheitTageGesamt + if(krankheit.isNumber(),krankheit.toDecimal(),0);
					//////////////////////
					//// Sonderurlaub
					sonderurlaubsgutschrift = ele.get("Sonderurlaubsuebertrag");
					sonderurlaubsanspruch = ifNull(ele.get("Sonderurlaubsanspruch"),0);
					sonderurlaub = ifNull(ele.get("Sonderurlaub"),0);
					sonderurlaubText = sonderurlaubText + if(sonderurlaubText != "",",","") + if(monats_zahl > vormonat_zahl,"-",sonderurlaub);
					sonderurlaubTageGesamt = sonderurlaubTageGesamt + if(sonderurlaub.isNumber(),sonderurlaub.toDecimal(),0);
				}
			}
			prozAbrhGesamt = if(checkInStundenGesamt > 0,round(fracStundenGesamt / checkInStundenGesamt * 100,2),0);
			/////////          SHEET TABLE       ////
			/// ARBEITSSTUNDEN
			///
			/// UNMITTELBARE ABRECHENDBARE STUNDEN
			/// IN PROZENT
			////
			/// SOLLSTUNDEN
			///
			//// SALDO
			sollStunden.add(checkInStundenText + "," + checkInStundenGesamt);
			sollStunden.add(abwInStundenText + "," + abwInStundenGesamt);
			sollStunden.add(summeCheckIn_AbwText + "," + summeCheckIn_AbwGesamt);
			sollStunden.add(fracStundenText + "," + fracStundenGesamt);
			sollStunden.add(prozStundenText + "," + prozAbrhGesamt + "%");
			sollStunden.add(sollStundenText + "," + sollStdGesamt);
			sollStunden.add(monatText);
			sollStunden.add(auszahlungText + "," + auszahlungGesamt);
			sollStunden.add(saldoStundenText + "," + saldoStdGesamt);
			info "saldoStundenText: " + saldoStundenText;
			sollStunden.add("");
			sollStunden.add(freizeitausgleichText + "," + freizeitausgleichTageGesamt);
			info ">>>>>>>" + urlaubsgutschrift + "<<<<<<<>>>>>>>>" + urlaubsanspruch + "<<<<<<<";
			sollStunden.add(urlaubText + "," + urlaubTageGesamt + ", (Rest: " + (if(urlaubsgutschrift.isNumber(),urlaubsgutschrift.toNumber(),0) + urlaubsanspruch.toNumber() - urlaubTageGesamt).toString() + ")");
			sollStunden.add(krankheitText + "," + krankheitTageGesamt);
			sollStunden.add(sonderurlaubText + "," + sonderurlaubTageGesamt + ", (Rest: " + (if(sonderurlaubsgutschrift.isNumber(),sonderurlaubsgutschrift.toNumber(),0) + sonderurlaubsanspruch.toNumber() - sonderurlaubTageGesamt).toString() + ")");
			Log_Sheet_Name = "Blatt1";
			EmptyMap = Map();
			Row_Data_Map = Map();
			actual_year = if(zoho.currentdate.getMonth() == 1,zoho.currentdate.subYear(1).toString("yyyy"),zoho.currentdate.toString("yyyy"));
			Add_Row_to_Log_Response = zoho.sheet.insertCSV(Log_Sheet_ID,Log_Sheet_Name,sollStunden.toString(zoho.encryption.urlDecode("%0A")),11,3,"sheet_connection");
			Add_Row_to_Log_Response = zoho.sheet.insertCSV(Log_Sheet_ID,Log_Sheet_Name,userName,6,2,"sheet_connection");
			Add_Row_to_Log_Response = zoho.sheet.insertCSV(Log_Sheet_ID,Log_Sheet_Name,"Übertrag: " + ifNull(collUebertrag.get(maEmail),""),7,2,"sheet_connection");
			Add_Row_to_Log_Response = zoho.sheet.insertCSV(Log_Sheet_ID,Log_Sheet_Name,"Übertrag Urlaub: " + ifNull(urlaubsgutschrift,0),8,2,"sheet_connection");
			Add_Row_to_Log_Response = zoho.sheet.insertCSV(Log_Sheet_ID,Log_Sheet_Name,"Urlaub " + actual_year + ": " + urlaubsanspruch,8,3,"sheet_connection");
			Add_Row_to_Log_Response = zoho.sheet.insertCSV(Log_Sheet_ID,Log_Sheet_Name,"Übertrag Sond.url.: " + sonderurlaubsgutschrift,9,2,"sheet_connection");
			Add_Row_to_Log_Response = zoho.sheet.insertCSV(Log_Sheet_ID,Log_Sheet_Name,"Sonderurlaub: " + sonderurlaubsanspruch,9,3,"sheet_connection");
			Add_Row_to_Log_Response = zoho.sheet.insertCSV(Log_Sheet_ID,Log_Sheet_Name,actual_year,4,6,"sheet_connection");
			//info collUrlaub.get(maEmail) + " > " + collUrlaub;
			paramMap = Map();
			paramMap.put("method","workbook.download");
			paramMap.put("format","pdf");
			dataObj = Map();
			dataObj.put("print_type","SHEET");
			dataObj.put("orientation",1);
			dataObj.put("scale",1);
			//dataObj.put("margin_bottom",0.5);
			dataObj.put("add_gridlines",false);
			paramMap.put("page_settings",dataObj);
			sheetFile = invokeurl
			[
				url :"https://sheet.zoho.eu/api/v2/download/" + Log_Sheet_ID
				type :POST
				parameters:paramMap
				connection:"sheet_connection"
			];
			info "sheetFile: " + sheetFile;
			respUpload = zoho.workdrive.uploadFile(sheetFile,folder_id,sheetFile,true,"wd_all");
			//info respUpload;
			//maEmail2 = "s.darius@eep-consulting.com";
			maEmail2 = "gl@langheinrichco.deg";
			ccEmail = "";
			if(fuer_MA && email_bericht == true)
			{
				maEmail2 = "j.huber@eep-energy.eu";
			}
			//maEmail2 = "j.huber@eep-energy.eu";
			//ccEmail = personalEmail;
			// + if(collRefEmail.get(maEmail) != null,"," + collRefEmail.get(maEmail),"");
			//ccEmail = "gl@langheinrichco.de";
			//ccEmail = "j.huber@eep-energy.eu";
			ccEmail = "";
			/*
			sendmail
			[
				from :zoho.loginuserid
				to :maEmail2
				cc:ccEmail
				subject :"Monatliche Stundenübersicht"
				message :"Hallo " + collVorname.get(maEmail) + ",<p>Du findest beigefügt Deine monatliche Stundenübersicht für den Monat " + monthStringGerman + ".<p>Bitte prüfe die Stundensalden, ob diese mit Deinen Aufzeichnungen übereinstimmen und melde Dich bei mir, falls es Rückfragen gibt.<p>Die Auswertung enthält zusätzlich u.a. Informationen zu den Urlaubs- und Krankheitstagen.<p>Fragen immer gern, danke!<p>Liebe Grüße<p>Jürgen"
				Attachments :file:sheetFile
			]
			*/
			//maEmail = "zoho.admin@eep-energy.eu";
			/*param = Map();
		param.put("uploadfile",sheetFile);
		param.put("fileName",userName + "_" + zoho.currentdate.toString("MMM-yyyy") + ".pdf");
		param.put("fileDesc","Stundenübersicht " + userName + " " + zoho.currentdate.toString("MMM-yyyy"));
		param.put("employeeId",collMAID.get(maEmail));
		param.put("fileType",0);
		param.put("confidential",0);
		param.put("catId",32401000000753219);
		header = Map();
		respPeople = invokeurl
		[
			url :"https://people.zoho.eu/people/api/files/uploadFileMultipart"
			type :POST
			parameters:param
			headers:header
			connection:"people_connection"
			content-type:"multipart/form-data"
		];
		info respPeople;
		*/
		}
		else
		{
			info ">>>>>>>>>>>>><<<<<<<<<<<<<<<<<";
			info "   error to create sheet for " + userName;
			info ">>>>>>>>>>>>><<<<<<<<<<<<<<<<<";
		}
		/*
	getFile = invokeUrl
	[
		url : "https://people.zoho.eu/people/api/files/getAllFiles?fileType=0&start=0&limit=25&employeeId=32401000000143001"
		type : GET
		connection: "people_connection"
	];
	info getFile;
	*/
		try 
		{
			url = "https://postman-echo.com/delay/5";
			delayResponseCall = invokeurl
			[
				url :url
				type :GET
			];
		}
		catch (e)
		{
			info "wait error: " + e;
		}
	}
	catch (e)
	{
		info "error in loop: " + e + " email: " + maEmail;
	}
}
sendmail
[
	from :zoho.loginuserid
	to :"gl@langheinrichco.de"
	subject :"Monatliche Stundenübersicht"
	message :"Anzahl der MA: " + collMA.size() + "<p>Anzahl der erstellten Dateien: " + anzahl_der_erstellten_dateien + "<p>Link zu den Daten: " + permalink
]
info "---------------------------------------------";
info "Anzahl der MA: " + collMA.size();
info "Anzahl der erstellten Dateien: " + anzahl_der_erstellten_dateien;
info "---------------------------------------------";
return "";
}