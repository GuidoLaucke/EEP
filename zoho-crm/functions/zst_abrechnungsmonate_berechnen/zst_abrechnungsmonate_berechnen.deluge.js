void automation.ZST_Abrechnungsmonate_berechnen(Int bv_id)
{
//bv_id = 418194000005107960;
bv_det = zoho.crm.getRecordById("Beratungsvertr_ge",bv_id);
abr_mon = List();
try 
{
	if(bv_det.get("Januar"))
	{
		abr_mon.add("January");
	}
	if(bv_det.get("Februar"))
	{
		abr_mon.add("February");
	}
	if(bv_det.get("Maerz"))
	{
		abr_mon.add("March");
	}
	if(bv_det.get("April"))
	{
		abr_mon.add("April");
	}
	if(bv_det.get("Mai"))
	{
		abr_mon.add("May");
	}
	if(bv_det.get("Juni"))
	{
		abr_mon.add("June");
	}
	if(bv_det.get("Juli"))
	{
		abr_mon.add("July");
	}
	if(bv_det.get("August"))
	{
		abr_mon.add("August");
	}
	if(bv_det.get("September"))
	{
		abr_mon.add("September");
	}
	if(bv_det.get("Oktober"))
	{
		abr_mon.add("October");
	}
	if(bv_det.get("November"))
	{
		abr_mon.add("November");
	}
	if(bv_det.get("Dezember"))
	{
		abr_mon.add("December");
	}
	info zoho.crm.updateRecord("Beratungsvertr_ge",bv_id,{"Abrechnungsmonate":abr_mon});
}
catch (e)
{
	info e;
}
}