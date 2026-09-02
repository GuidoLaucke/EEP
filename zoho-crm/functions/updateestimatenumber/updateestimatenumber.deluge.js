string standalone.updateEstimateNumber()
{
try 
{
	estimateNumber = zoho.crm.getOrgVariable("EstimateNummer");
	estimateZahl = estimateNumber.toNumber() + 1;
	returnValue = leftpad(toString(estimateZahl),estimateNumber.len()).replaceAll(" ","0");
	valueMap = Map();
	valueMap.put("apiname","EstimateNummer");
	valueMap.put("value",returnValue);
	resp = zoho.crm.invokeConnector("crm.set",valueMap);
	return returnValue;
}
catch (e)
{
	return "";
}
return "";
}