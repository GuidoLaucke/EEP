string standalone.testURLProjects()
{
//156882000000285068/156882000000284018
//GET  /portal/[PORTALID]/projects/[PROJECTID]/milestones/[MILESTONEID]/
//https://projectsapi.zoho.eu/api/v3/portal/{PORTALID}/projects/156882000000312029/milestones/156882000000312097
url = "https://projectsapi.zoho.eu/api/v3/portal/20080259926/projects/156882000000285068/milestones/156882000000284018";
mapper = Map();
mapper.put("Abschlagswert",1000);
response = invokeurl
[
	url :url
	type :POST
	parameters:mapper.toString()
	connection:"projects_connection"
];
info "test" + response;
return "";
/*

info zoho.projects.getPortals("projects_connection");
url = "https://projectsapi.zoho.eu/restapi/portal/";
response = invokeurl
[
	url :url
	type :GET
	connection:"projects_connection"
];
info "test" + response;
return "";
*/
}