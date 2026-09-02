string standalone.testProjects()
{
projectPortal = "eepenergy";
projectId = 156882000003184065;
//response = zoho.projects.getRecords(projectPortal, projectId, "tasklists", 0, 0, "projects_connection");
//response = zoho.projects.getRecordById(projectPortal, projectId, "tasklists", 156882000001495599,"projects_connection");
//info response;
//info zoho.projects.getProjectDetails(projectPortal, "active", "projects_connection");
//156882000000285068/156882000000284018
//info zoho.projects.getRecordById(projectPortal, projectId);//156882000000285022 156882000000283025/156882000000285022
//info zoho.projects.getRecordById(projectPortal,projectId,"milestones", ,"projects_connection");
//projectsDomainURL + "/restapi/portal/" + portalId + "/projects/" + projectId + "/bugs/" +
///                                        portal/[PORTALID]/module/projects/layouts/
//url = "https://projectsapi.zoho.eu/restapi/portal/eepenergy/module/projects/layouts/";
url = "https://projectsapi.zoho.eu/restapi/portal/eepenergy/projects/customfields/";
//GET     https://projectsapi.zoho.com/api/v3/portal/{PORTALID}/projects/{PROJECTID/milestones/{MILESTONEID}
//url = "https://projectsapi.zoho.eu/api/v3/portal/eepenergy/projects/156882000000312029/milestones/156882000000312097";
//GET  /portal/[PORTALID]/projects/
url = "https://projectsapi.zoho.eu/restapi/portal/eepenergy/projects/" + projectId + "/";
response = invokeurl
[
	url :url
	type :GET
	connection:"projects_connection"
];
info response;
return "";
/*
projmp = Map();
projmp.put("budget_value","10000.00");
projmp.put("budget_type","2");
projmp.put("start_date","08-08-2022");
projmp.put("end_date","09-08-2023");
projmp.put("name","testprojekt26");
projmp.put("rate","150.00");
projmp.put("billing_type","Based on project hours");
//projmp.put("template_id","");
//laymmp = Map();
//mp = Map();
//mp.put("name","EBN");
//mp.put("id","156882000000157261");
//mp.put("name", "EBN");
//laymmp.put("project",mp);
//laymmp.put("task", mp);
//laymmp.put("bug", mp);
projmp.put("template_id","156882000000274071");
//projmp.put("layout_id","156882000000157261");
//projmp.put("layout_details",laymmp);
//projmp.put("UDF_TEXT1","testz");
//projmp.put("UDF_TEXT2","testz");
//projmp.put("UDF_CHAR3","guidoz");
//projmp.put("UDF_CHAR2","guidoz");
//mpp = Map();
//liste = list();
//mmp.put(17,"1305.3 - EMAS");
//mmp.put(15,"1305.1 - ISO 50001");
//mmp.put(16, "1305.2 - ISO 14001");
//liste.add("1305.1 - ISO 50001");
//liste.add("1305.2 - ISO 14001");
//liste.add(17);
//mpp.put("UDF_MULTI1",liste);
//projmp.put("UDF_MULTI1",liste);
//((projmp.put("UDF_MULTI1",liste.toString(","));
//projmp.put("UDF_MULTI1","'1305.1 - ISO 50001'&'1305.2 - ISO 14001'");
//info projmp;
//info "create projects> " + zoho.projects.createProject(projectPortal,projmp,"projects_connection");
//info zoho.projects.update(<TEXT>, <NUMBER>, <TEXT>, <NUMBER>, <KEY-VALUE>)
//info zoho.projects.updateProject(projectPortal, "156882000000235071", "milestones", "156882000000234055", mpp,"projects_connection");
//zoho.projects.update(<TEXT>, <NUMBER>, <TEXT>, <NUMBER>, <KEY-VALUE>)
//projmp = Map();
//val1 = "1305.2 - ISO 14001".encodeUrl();
//val2 = "1305.1 - ISO 50001".encodeUrl();
//url = "https://projectsapi.zoho.eu/restapi/portal/eepenergy/projects/156882000000235071/?UDF_MULTI1=" + val1 + "&UDF_MULTI1=" + val2;
//response = invokeurl
//[
//	url :url
//	type :POST
//	connection:"projects_connection"
//];
//info "test" + response;
return "";
*/
}