void automation.ZST__VNVFristAufgabeerstellen(Int dealId)
{
dealEntry = zoho.crm.getRecordById("Deals",dealId);
ausgewPl = ifNull(dealEntry.get("Ausgewaehlter_Projektleiter"),{"id":""}).get("id");
////***** GET USER EMAIL FOR PL ******//////
m = Map();
resp = zoho.crm.invokeConnector("crm.getusers",m);
respMap = resp.get("response").toMap();
users = respMap.get("users");
userList = users.toJSONList();
//get user's email
for each  user in userList
{
	eachUser = user.toMap();
	if(ausgewPl == eachUser.get("id"))
	{
		email = eachUser.get("email");
		break;
	}
}
info "email:" + email;
/////******************************/////
VNVzeitpunkt = dealEntry.get("VNV_Frist").toString("yyyy-MM-dd");
subjectName = "Erinnerung 6 Wochen vor VNV Frist (Ende: " + VNVzeitpunkt + ") für Opp " + dealEntry.get("Deal_Name");
mp = Map();
mp.put("Subject",subjectName);
mp.put("$se_module","Deals");
mp.put("What_Id",dealId);
mp.put("Owner",ausgewPl);
//mp.put("Due_Date",bewillungszeitpunkt); zoho.currentdate.toString("yyyy-MM-dd");
mp.put("Due_Date",zoho.currentdate.toString("yyyy-MM-dd"));
mp.put("Remind_At",{"ALARM":"FREQ=WEEKLY;ACTION=EMAILANDPOPUP;TRIGGER=DATE-TIME:" + zoho.currentdate.addDay(7).toString("yyyy-MM-dd'T'HH:mm:ss'+01:00'")});
mp.put("Status","Not Started");
createTask = zoho.crm.createRecord("Tasks",mp);
info createTask;
emailTo = "foerderung@eep-energy.eu";
//emailTo = "gl@langheinrichco.de";
emailCC = "office@eep-energy.eu";
//emailCC = "";
sendmail
[
	from :zoho.loginuserid
	to :emailTo
	cc:emailCC
	subject :"In 6 Wochen endet die VNV Frist (" + VNVzeitpunkt + ") für Opp " + dealEntry.get("Deal_Name")
	message :"Liebe(r) PL,<p>bald endet die VNV Frist für den Abschluss <a href='https://crm.zoho.eu/crm/eepenergy/tab/Potentials/" + dealId + "'>" + dealEntry.get("Deal_Name") + "</a>  (Ende " + VNVzeitpunkt + ").<p><p>Dein Zoho CRM System"
]
}