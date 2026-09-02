string standalone.createProjectFromDeal(String budget, String budgetType, String startDate, String endDate, String projectName, String rate, String billingType, String notizen, String firmierung, String productName, String udfMulti, String milestones, Int ownerId, Int dealId, String projektVorlage, String angebot, Bool EBN, String projektGruppe)
{
//Guido ZS 10-08-2022
try 
{
	/*
	info "budget: " + budget;
	info "budjetType: " + budgetType;
	info "startDate: " + startDate;
	info "endDate: " + endDate;
	info "ProjectName: " + projectName;
	info "rate: " + rate;
	info "BillingType: " + billingType;
	info "ownerId: " + ownerId;
	info "notizen: " + notizen;
	info "firmierung: " + firmierung;
	info "dealId: " + dealId;
	info "projektVorlage: " + projektVorlage;
	info "productName: " + productName;
	*/
	projectPortal = "eepenergy";
	projmp = Map();
	projmp.put("budget_value",budget);
	projmp.put("budget_type",budgetType.toString());
	projmp.put("start_date",startDate);
	projmp.put("end_date",endDate);
	projmp.put("name",projectName);
	projmp.put("rate",rate);
	projmp.put("billing_type",billingType);
	projmp.put("owner",ownerId);
	laymmp = Map();
	mp = Map();
	laymmp.put("project",mp);
	// gelöscht projmp.put("layout_details",laymmp);
	projmp.put("UDF_TEXT1",notizen);
	projmp.put("UDF_CHAR2",firmierung);
	projmp.put("UDF_CHAR4",dealId.toString());
	projmp.put("UDF_CHAR7",angebot);
	projmp.put("UDF_TEXT4",dealId);
	projmp.put("UDF_CHAR5","Fakturierbar");
	projmp.put("layout_id","156882000000157261");
	projmp.put("template_id",projektVorlage);
	//projmp.put("template_id",156882000001527433);
	projmp.put("group_id",projektGruppe);
	//projmp.put("template_id",156882000000925934);
	if(budgetType == "4")
	{
		//projmp.put("enable_rollup","yes");
	}
	info "projmp: " + projmp;
	resp = zoho.projects.createProject(projectPortal,projmp,"projects_connection");
	info "resp Create Projects in createProjectFromDeal: " + resp;
	if(resp.get("error") == null && resp != null)
	{
		projId = resp.get("projects").get(0).get("id");
		url = "https://projectsapi.zoho.eu/restapi/portal/eepenergy/projects/" + projId + "/?" + udfMulti + "&enable_rollup=" + if(budgetType == "4","yes","no");
		response = invokeurl
		[
			url :url
			type :POST
			connection:"projects_connection"
		];
		//info "update produkte: " + response + udfMulti;
		numberMilestone = 1;
		if(milestones.size() > 0 && budgetType != "4")
		{
			for each  ele in milestones.keys()
			{
				values_map = Map();
				betrag = ifNull(milestones.get(ele),"-");
				if(milestones.get(ele) != null && milestones.get(ele) != "")
				{
					betrag = milestones.get(ele).toString().replaceAll("(?<=[0-9])(?=([0-9][0-9][0-9])+(?![0-9]))",".");
				}
				values_map.put("name","Meilenstein " + numberMilestone + ": Teilabrechnung " + numberMilestone + " " + ele + " (" + betrag + " Euro)");
				numberMilestone = numberMilestone + 1;
				//values_map.put("Abschlagswert",milestones.get(ele));
				values_map.put("flag","internal");
				values_map.put("start_date","01-01-2024");
				values_map.put("end_date","01-01-2024");
				values_map.put("owner",ownerId);
				//values_map.put("budget", "10");
				respMile = zoho.projects.create("eepenergy",projId,"milestones",values_map,"projects_connection");
				info "respMile: " + respMile;
			}
		}
		return {resp,"Das Projekt " + projectName + " wurde erfolgreich erstellt."};
	}
	else
	{
		return {0,resp.toString()};
	}
}
catch (e)
{
	return {0,"try: " + e.toString()};
}
return "";
}