string standalone.ZST_UpdateProjectsSubtasks(Int project_id, Int task_id, String work)
{
// Beispiel: Decimal-Wert in Stunden
zeit_decimal = work.toDecimal();
// Ganze Stunden
stunden = floor(zeit_decimal);
// Minuten (Nachkommastunden * 60, gerundet)
minuten = round((zeit_decimal - stunden) * 60,0);
// Immer zweistellig formatieren
if(stunden < 10)
{
	stunden_str = "0" + stunden.toString();
}
else
{
	stunden_str = stunden.toString();
}
if(minuten < 10)
{
	minuten_str = "0" + minuten.toString();
}
else
{
	minuten_str = minuten.toString();
}
// Ergebnis als hh:mm
zeit_string = stunden_str + ":" + minuten_str;
info zeit_string;
mp = Map();
mp2 = Map();
mp3 = Map();
//mp3.put("name", "Unassigned User");
mp3.put("work_values",zeit_string);
mp3.put("zpuid",156882000000029637);
liste = List();
liste.add(mp3);
mp2.put("work_type","standard");
mp2.put("unit","hours");
mp2.put("owners",liste);
mp.put("owners_and_work",mp2);
mp.put("description","Arbeitsstunden sind aktualisiert worden: " + work);
url = "https://projectsapi.zoho.eu/api/v3/portal/20080259926/projects/" + project_id + "/tasks/" + task_id;
info "URL:  " + url;
update_resp = invokeurl
[
	url :url
	type :PATCH
	parameters:mp.toString()
	connection:"projects_connection"
];
info "update_resp: " + update_resp + " ---->work: " + work;
//info "Task: " + update_resp.get("tasks").get(0).get("name") + " key: " + update_resp.get("tasks").get(0).get("key") + " id: " + update_resp.get("tasks").get(0).get("id") + " work: " + update_resp.get("tasks").get(0).get("work");
//info zoho.projects.update(projectPortal,project_id,"subtasks",156882000001570020,mp,"projects_connection");
return "";
}