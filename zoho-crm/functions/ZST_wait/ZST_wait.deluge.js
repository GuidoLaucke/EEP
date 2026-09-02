string standalone.ZST_wait(Int waitTimeInSeconds)
{
try 
{
	url = "https://postman-echo.com/delay/" + waitTimeInSeconds;
	delayResponseCall = invokeurl
	[
		url :url
		type :GET
	];
}
catch (err)
{
	info err;
}
return true;
}