string standalone.ZST_updateMileStonesProjects(Int project_id, Int deal_id, Float rate)
{
try 
{
	project_id = ifNull(project_id,156882000001570275);
	deal_id = ifNull(deal_id,418194000013815129);
	projectPortal = "eepenergy";
	response = zoho.projects.getRecords(projectPortal,project_id,"milestones",0,0,"projects_connection").get("milestones");
	info "MileStones response: " + response;
	milestones = Collection();
	milestone_budget = Collection();
	milestone_task = Collection();
	for each  milestone in response
	{
		//info milestone;
		name = milestone.get("name");
		name = name.remove(" und ").remove("02").remove("07");
		name = if(name.contains(" -"),name.getPrefix(" -"),name);
		id = milestone.get("id");
		milestones.insert(name:{id,milestone.get("name"),milestone.get("start_date"),milestone.get("end_date"),milestone.get("flag"),milestone.get("owner_id")});
	}
	///// TASKS ////////
	response_task = zoho.projects.getRecords(projectPortal,project_id,"tasks",0,100,"projects_connection");
	//info response_task;
	info "------";
	info "Size tasks:  " + response_task.get("tasks").size();
	for each  task in response_task.get("tasks")
	{
		info task.get("key");
		task_id = task.get("id");
		value_task = 0.0;
		//info "cf: " + task.get("custom_fields");
		//info "milestone_id: " + task.get("milestone_id");
		for each  ele in task.get("custom_fields")
		{
			if(ele.get("label_name") == "Prozentuale Verteilung des MS-Budgets")
			{
				value_task = ele.get("value");
			}
		}
		milestone_task.insert(task_id:{task.get("milestone_id"),value_task});
		url = "https://projectsapi.zoho.eu/restapi/portal/" + projectPortal + "/projects/" + project_id + "/tasks/" + task_id + "/subtasks/";
		subtask_resp = invokeurl
		[
			url :url
			type :GET
			connection:"projects_connection"
		];
		value_subtask = 0.0;
		list_of_subtasks = subtask_resp.get("tasks");
		for each  subtask in list_of_subtasks
		{
			task_id = subtask.get("id");
			//info "cf: " + task.get("custom_fields");
			//info "milestone_id: " + task.get("milestone_id");
			for each  ele in subtask.get("custom_fields")
			{
				if(ele.get("label_name") == "Prozentuale Verteilung des MS-Budgets")
				{
					value_subtask = ele.get("value");
				}
			}
			milestone_task.insert(task_id:{task.get("milestone_id"),ifNull(value_subtask,0)});
			value_subtask = 0.0;
		}
		value_task = 0.0;
	}
	//////////////////////
	//info milestones;
	produkte = zoho.crm.getRecordById("Deals",deal_id).get("Produkte");
	sum = 0;
	summen = Collection();
	/// Anpassung wegen REQ Simon vom 26.02.2026
	gesamt_minuten_alt = 160 * 60 + 22;
	// = 9622
	gesamt_minuten_neu = gesamt_minuten_alt + floor(260 * 60);
	// + 104 min = 9726
	//faktor = gesamt_minuten_neu / gesamt_minuten_alt;
	faktor = 1;
	info "faktor: " + faktor;
	gesamt_stunden = 0;
	gesamt_minuten = 0;
	for each  prod in produkte
	{
		try 
		{
			sum = prod.get("Summe");
			produkt = prod.get("Produkt").get("name");
			//info "produkt: " + produkt;
			prefix = if(produkt.contains(" -"),produkt.getPrefix(" -"),produkt);
			info "prefix: " + prefix;
			hours = 0;
			minutes = 0;
			if(prefix != null)
			{
				summen.insert(prefix:sum);
				sum = sum + if(prefix = "LP 02",summen.get("LP 01"),0);
				sum = sum + if(prefix = "LP 07",summen.get("LP 06"),0);
				info "updateMileStonesProjects sum und rate: " + sum + " rate: " + rate;
				if(sum > rate)
				{
					// 150
					zeit = (sum.toDecimal() / rate.toDecimal()).toDecimal();
					// 150
					hours = floor(zeit);
					minutes = floor((zeit - hours) * 60);
					// anteilig erhöhen
					info "total_minutes bevor: " + (hours * 60 + minutes);
					total_minutes = (hours * 60 + minutes) * faktor;
					total_minutes_rounded = round(total_minutes,5);
					hours = floor(total_minutes_rounded / 60);
					minutes = round(total_minutes_rounded - hours * 60,0);
					minutes_str = if(minutes < 10,"0" + minutes,minutes.toString());
					info hours + ":" + minutes_str;
					if(prefix != "LP 01" && prefix != "LP 06")
					{
						gesamt_stunden = gesamt_stunden + hours;
						gesamt_minuten = gesamt_minuten + minutes;
					}
				}
				if(produkt.contains("02"))
				{
					prefix = "LP 01";
				}
				else if(produkt.contains("07"))
				{
					prefix = "LP 06";
				}
				//info "prefix: " + prefix;
				milestone_id = milestones.get(prefix).get(0);
				mp = Map();
				budget = hours + ":" + minutes;
				budget = if(budget == "null:null" || budget == "0:0","00:00",budget);
				mp.put("budget",budget);
				mp.put("name",milestones.get(prefix).get(1));
				mp.put("start_date",milestones.get(prefix).get(2));
				mp.put("end_date",milestones.get(prefix).get(3));
				mp.put("flag",milestones.get(prefix).get(4));
				mp.put("owner",milestones.get(prefix).get(5));
				info "mp: " + mp;
				milestone_budget.insert(milestone_id:budget);
				resp_update = zoho.projects.update(projectPortal,project_id,"milestones",milestone_id,mp,"projects_connection");
				info "resp_update: " + resp_update;
				standalone.ZST_wait(1);
			}
		}
		catch (e)
		{
			info "error: " + e;
		}
	}
	// Minuten normalisieren
	gesamt_stunden = gesamt_stunden + floor(gesamt_minuten / 60);
	gesamt_minuten = floor(gesamt_minuten - floor(gesamt_minuten / 60) * 60);
	info "Gesamt: " + gesamt_stunden + ":" + if(gesamt_minuten < 10,"0" + gesamt_minuten,gesamt_minuten.toString());
	info "////// COLLECTION DATA MILESTONES /////";
	//info "milestone_task: " + milestone_task;
	//info "milestone_budget: "  + milestone_budget;
	info "////// END COLLECTION DATA MILESTONES /////";
	for each  task_id in milestone_task.keys()
	{
		milestone_id = milestone_task.get(task_id).get(0);
		info "updateMileStonesProjects milestone_id: " + milestone_id;
		budget = ifNull(milestone_budget.get(milestone_id.toNumber()),"00:00");
		value = ifNull(milestone_task.get(task_id).get(1),0).toDecimal();
		hours = budget.getPrefix(":").toNumber();
		minutes = budget.getSuffix(":").toNumber() / 60;
		budget = hours + minutes;
		task_aufwand_stunden = round(budget * ifNull(value,0) / 100,2);
		//info "milestone_id: " + milestone_id;
		//info "task_id: " + task_id + " task_aufwand_stunden " + task_aufwand_stunden;
		if(budget.toDecimal() > -1)
		{
			standalone.ZST_UpdateProjectsSubtasks(project_id,task_id,task_aufwand_stunden);
		}
		standalone.ZST_wait(3);
	}
}
catch (e)
{
	info "ZST_updateMileStonesProjects: " + e;
}
return "";
}