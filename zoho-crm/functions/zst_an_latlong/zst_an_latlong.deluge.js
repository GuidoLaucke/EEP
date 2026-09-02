void automation.ZST_AN_LatLong(Int an_id)
{
//an_id = 418194000004421001;
an_det = zoho.crm.getRecordById("Accounts",an_id);
url = "https://api.geoapify.com/v1/geocode/search?text=%%STRASSE%%%%PLZ%%%%ORT%%%%LAND%%";
url = url.replaceFirst("%%STRASSE%%",an_det.get("Standort_Stra_e").concat(" ").encodeUrl());
url = url.replaceFirst("%%PLZ%%",an_det.get("Standort_PLZ").concat(" ").encodeUrl());
url = url.replaceFirst("%%ORT%%",an_det.get("Standort_Stadt").concat(" ").encodeUrl());
url = url.replaceFirst("%%LAND%%",an_det.get("Standort_Land"));
url = url.concat("&apiKey=47e6e5e7cd46485ca59910a573698b0a");
results = invokeurl
[
	url :url
	type :GET
];
if(results.get("features").length() > 0)
{
	props = results.get("features").get(0).get("properties");
	upd_an = Map();
	upd_an.put("Standort_Breitengrad",props.get("lat").toString());
	upd_an.put("Standort_L_ngengrad",props.get("lon").toString());
	info zoho.crm.updateRecord("Accounts",an_id,upd_an);
}
}