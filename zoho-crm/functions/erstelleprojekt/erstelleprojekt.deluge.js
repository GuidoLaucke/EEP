string button.erstelleProjekt(String dealId)
{
//createProjectFromDeal(string budget,string budgetType,string startDate,string endDate,string projectName,string rate,string billingType,string notizen,string firmierung)
//// HOLE DEAL DATEN
try 
{
	returnValue = "";
	resp = zoho.crm.getRecordById("Deals",dealId);
	b_has_bundle = if(resp.get("Bundle_Produkt") != null,true,false);
	deal_name = resp.get("Deal_Name");
	angebot = ifNull(resp.get("Angebotsnummer"),"");
	//info resp;
	produkte = resp.get("Produkte");
	firmaName = ifNull(resp.get("Account_Name"),{"name":""}).get("name");
	account_id = ifNull(resp.get("Account_Name"),{"id":""}).get("id");
	matchcode = ifNull(zoho.crm.getRecordById("Accounts",account_id),{"Matchcode":null}).get("Matchcode");
	endDate = ifNull(resp.get("Projektabschlussdatum"),"");
	ort = ifNull(resp.get("Ort_der_Abnahmestelle_Firma"),"");
	//// PLAUSI CHECK
	if(produkte.size() < 1)
	{
		return "Kein Produkt eingegeben!";
	}
	else if(resp.get("Account_Name") == "" || resp.get("Account_Name") == null)
	{
		return "Keinen Firmenname eingegeben!";
	}
	else if(endDate == null)
	{
		returnValue = "Projektabschlussdatum wird auf den nächsten Monat gesetzt!";
	}
	// FELD PROJEKTVORLAGE AUS DEM PRODUKT HERAUS
	produkt_info = standalone.ZST_get_produkt_template_vorlage(dealId);
	projekt_template_name = produkt_info.get(0);
	projektGruppe = standalone.ZST_Getprojektgroups(produkt_info.get(1));
	//projektVorlage = standalone.getTemplateIdProjects(projekt_template_name);
	projektVorlage = standalone.ZS_get_projects_template_id_new(projekt_template_name);
	info "projekt_template_name: " + projekt_template_name + " projektGruppe: " + projektGruppe + " projektVorlage: " + projektVorlage;
	if(1 == 2)
	{
		return "";
	}
	/////////////////////////////////
	budget = ifNull(resp.get("Amount"),1);
	budgetType = "1";
	if(b_has_bundle == true)
	{
		budgetType = "4";
	}
	startDate = zoho.currentdate.toString("MM-dd-yyyy");
	info "Abschlussdatum: " + resp.get("Projektabschlussdatum");
	endDate = if(endDate == "",zoho.currentdate.addMonth(1).toString("MM-dd-yyyy"),endDate.toString("MM-dd-yyyy"));
	//projectName = resp.get("Angebotsnummer") + " || ";
	//projectName = projectName + produkte.get(0).get("Produkt").get("name") + " || " + firmaName + if(ort != ""," || " + ort,"");
	projectName = deal_name + "_" + firmaName + if(matchcode != null,"_" + matchcode,"") + if(ort != "","_" + ort,"");
	projectName = if(projectName.len() > 100,projectName.subString(0,100),projectName);
	info "projectName: " + projectName;
	rate = ifNull(resp.get("Stundensatz"),zoho.crm.getOrgVariable("RateProject"));
	billingType = "Based on project hours";
	firmierung = firmaName;
	notizen = "";
	////////////////////////////////
	notes = zoho.crm.getRelatedRecords("Notes","Deals",dealId);
	for each  note in notes
	{
		notizen = notizen + " " + note.get("Note_Content");
	}
	notizen = if(notizen.len() > 2000,notizen.substring(0,2000),notizen);
	////////////////////////////////
	////////////////////////////////
	udfMulti = "";
	EBN = false;
	for each  ele in resp.get("Produkte")
	{
		produktName = ele.get("Produkt").get("name");
		udfMulti = "UDF_MULTI1=" + encodeUrl(produktName) + if(udfMulti != "","&" + udfMulti,udfMulti);
	}
	//udfMulti = udfMulti.removeLastOccurence("&");
	info udfMulti;
	collAbrechnung = Collection();
	if(resp.get("Abrechnungsdatum_1") != null && resp.get("Abrechnungsdatum_1") != "")
	{
		collAbrechnung.insert(resp.get("Abrechnungsdatum_1"):resp.get("Abschlagsbetrag_1"));
	}
	if(resp.get("Abrechnungsdatum_2") != null && resp.get("Abrechnungsdatum_2") != "")
	{
		collAbrechnung.insert(resp.get("Abrechnungsdatum_2"):resp.get("Abschlagsbetrag_2"));
	}
	if(resp.get("Abrechnungsdatum_3") != null && resp.get("Abrechnungsdatum_3") != "")
	{
		collAbrechnung.insert(resp.get("Abrechnungsdatum_3"):resp.get("Abschlagsbetrag_3"));
	}
	if(resp.get("Abrechnungsdatum_4") != null && resp.get("Abrechnungsdatum_4") != "")
	{
		collAbrechnung.insert(resp.get("Abrechnungsdatum_4"):resp.get("Abschlagsbetrag_4"));
	}
	if(resp.get("Abrechnungsdatum_5") != null && resp.get("Abrechnungsdatum_5") != "")
	{
		collAbrechnung.insert(resp.get("Abrechnungsdatum_5"):resp.get("Abschlagsbetrag_5"));
	}
	userName = ifNull(resp.get("Ausgewaehlter_Projektleiter"),{"name":"Zoho Admin"}).get("name");
	ownerId = standalone.getProjectOwnerID(userName);
	respCreate = null;
	//projektVorlage
	respCreate = standalone.createProjectFromDeal(budget,budgetType,startDate,endDate,projectName,rate,billingType,notizen,firmierung,produkte,udfMulti,collAbrechnung,ownerId,dealId,projektVorlage,angebot,EBN,projektGruppe);
	info "respCreate: " + respCreate;
	if(respCreate.get(0) == 0)
	{
		return "Fehler bei der Erstellung des Projektes. Message: " + respCreate.get(1);
	}
	else
	{
		//info respCreate;
		projectId = respCreate.get("projects").get(0).get("id").toLong();
		projectName = respCreate.get("projects").get(0).get("name");
		info "projectName: " + projectName;
		info "projectId: " + projectId;
		mp = Map();
		mp.put("name",projectName);
		datalist = List();
		datalist.add(mp);
		datamp = Map();
		datamp.put("data",datalist);
		resp2 = invokeurl
		[
			url :"https://www.zohoapis.eu/crm/v2/Deals/" + dealId + "/Zoho_Projects/" + projectId
			type :POST
			parameters:datamp.toString()
			connection:"projects_connection"
		];
		NewTag = {"Tag":{{"name":"Projekt angelegt"}},"Stage":"Projekt in Bearbeitung","Projektname":projectName,"ProjektID":projectId};
		info "updateDeal: " + zoho.crm.updateRecord("Deals",dealId,NewTag);
		returnValue = returnValue + " Das Projekt wurde erstellt und mit der Opp verknüpft.";
		projectPortal = "eepenergy";
		try 
		{
			url = "https://postman-echo.com/delay/5";
			delayResponseCall = invokeurl
			[
				url :url
				type :GET
			];
			delayResponseCall = invokeurl
			[
				url :url
				type :GET
			];
			delayResponseCall = invokeurl
			[
				url :url
				type :GET
			];
			response = zoho.projects.getRecords(projectPortal,projectId,"milestones",0,12,"projects_connection");
			if(response.size() = 0)
			{
				info "WAITING 20 SEC MORE";
				delayResponseCall = invokeurl
				[
					url :url
					type :GET
				];
				delayResponseCall = invokeurl
				[
					url :url
					type :GET
				];
				delayResponseCall = invokeurl
				[
					url :url
					type :GET
				];
				delayResponseCall = invokeurl
				[
					url :url
					type :GET
				];
			}
			updateData = Map();
			updateData.put("budget_info",{"cost_per_hour":{"amount":rate}});
			// url = "https://projectsapi.zoho.com/api/v3/portal/739121528/projects/1752587000000097024";
			params = Map();
			response_update_cost = invokeurl
			[
				url :"https://projectsapi.zoho.eu/api/v3/portal/20080259926/projects/" + projectId
				type :PATCH
				parameters:updateData.toString()
				connection:"projects_connection"
			];
			info response_update_cost;
			info "ProjectId: " + projectId + " dealId:" + dealId;
			standalone.ZST_updateMileStonesProjects(projectId,dealId,rate);
			info ">>>>>>>>>>>>>>>>>>>>>>>>done with milestones<<<<<<<<<<<<<<<<<";
		}
		catch (e)
		{
			info e;
		}
	}
	return returnValue;
}
catch (e)
{
	return "Fehler beim Erstellen des Projektes " + e;
}
return returnValue;
}