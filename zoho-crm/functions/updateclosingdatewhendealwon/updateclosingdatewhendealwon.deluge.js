void automation.updateClosingDateWhenDealWon(Int dealId, Int ownerId)
{
//Guido 16-08-2022
zoho.crm.updateRecord("Deals",dealId,{"Closing_Date":zoho.currentdate});
mp = Map();
mp.put("Subject","Rechnung erstellen");
mp.put("$se_module","Deals");
mp.put("What_Id",dealId);
mp.put("Owner",ownerId);
mp.put("Due_Date",zoho.currentdate.addBusinessDay(7));
mp.put("Status","Not Started");
mp.put("Send_Notification_Email",false);
createTask = zoho.crm.createRecord("Tasks",mp);
}