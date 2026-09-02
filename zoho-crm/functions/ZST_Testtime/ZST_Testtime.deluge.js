string standalone.ZST_Testtime()
{
info zoho.currentdate.toString("MMM-yyyy");
maEMail = "guido.laucke@gmail.com";
sendmail
[
	from :zoho.loginuserid
	to :maEMail
	subject :"Monatliche Stundenübersicht"
	message :"Hallo userName" + "<p> Du findest beigefügt Deine monatliche Stundenübersicht.<p>Liebe Grüße<p>Dein Zoho Admin"
]
return "";
}