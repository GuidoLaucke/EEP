string standalone.ZST_PDFMerge(String folderId, Int dealId, String EstimateNumber)
{
/**
 * Funktion: ZST_PDFMerge
 * Lädt alle PDFs aus einem WorkDrive-Ordner, führt sie zu einem Dokument zusammen
 * und hängt das Ergebnis an einen Deal an
 * 
 * @param folderId - WorkDrive Folder ID mit den zu mergenden PDFs
 * @param dealId - ID des Deals zum Anhängen des finalen PDFs
 * @param EstimateNumber - Angebotsnummer für den Dateinamen
 * @return Map - {"error": ""} bei Erfolg, {"error": "Fehlermeldung"} bei Fehler
 */
try 
{
	// ========================================
	// 1. DEAL-TYP PRÜFEN
	// ========================================
	deal_entry = zoho.crm.getRecordById("Deals",dealId);
	beratungsvertrag = ifNull(deal_entry.get("Beratungsvertrag_Typ"),"");
	is_beratungsvertrag = if(beratungsvertrag != "",true,false);
	// ========================================
	// 2. ALLE DATEIEN AUS WORKDRIVE-ORDNER LADEN
	// ========================================
	// Header für WorkDrive API
	header = Map();
	header.put("Accept","application/vnd.api+json");
	// Alle Dateien im Ordner abrufen (sortiert nach Name)
	resp = invokeurl
	[
		url :"https://www.zohoapis.eu/workdrive/api/v1/files/" + folderId + "/files?sort=name"
		type :GET
		headers:header
		connection:"zst_writer_all"
	];
	// Fehlerbehandlung für WorkDrive API
	if(resp.get("errors") != null)
	{
		return {"error":resp.get("errors")};
	}
	// ========================================
	// 3. GROSSE DATEIEN KOMPRIMIEREN (nur für reguläre Angebote)
	// ========================================
	// Beratungsverträge werden nicht komprimiert
	if(is_beratungsvertrag == false)
	{
		// Dateien über ~4.9 MB komprimieren (ConvertAPI Limit: 5 MB)
		for each  data in resp.get("data")
		{
			info "Prüfe Datei: " + data.get("attributes").get("name");
			if(data.get("attributes").get("storage_info").get("size_in_bytes") > 4900000)
			{
				fileId = data.get("id");
				info "Komprimiere große Datei (>4.9 MB): " + fileId;
				standalone.ZST_compress_file(fileId,folderId,"lossless");
			}
		}
	}
	// ========================================
	// 4. ALLE DATEIEN HERUNTERLADEN UND FÜR MERGE VORBEREITEN
	// ========================================
	fileList = List();
	header = Map();
	header.put("Accept","application/vnd.api+json");
	// Jede Datei herunterladen und in Base64 konvertieren
	for each  data in resp.get("data")
	{
		fileId = data.get("id");
		// Datei von WorkDrive herunterladen
		response = invokeurl
		[
			url :"https://download.zoho.eu/v1/workdrive/download/" + fileId
			type :GET
			headers:header
			connection:"wd_all"
		];
		// Datei für ConvertAPI vorbereiten
		fileMap = Map();
		fileMap.put("Name",response.getFileName());
		fileMap.put("Data",zoho.encryption.base64Encode(response));
		fileList.add(fileMap);
		info "Datei vorbereitet: " + response.getFileName();
	}
	// ========================================
	// 5. PDFs MIT CONVERTAPI ZUSAMMENFÜHREN
	// ========================================
	// ConvertAPI Parameter aufbauen
	param_list = list();
	param_list.add({"Name":"Files","FileValues":fileList});
	param_list.add({"Name":"StoreFile","Value":false});
	param_list.add({"Name":"ForceMerge","Value":true});
	param_list.add({"Name":"FileName","Value":"target_file_name"});
	param_list.add({"Name":"RemoveDuplicateFonts","Value":"true"});
	params = Map();
	params.put("Parameters",param_list);
	// ConvertAPI aufrufen für PDF-Merge
	// Secret Key: 4x4SgttFtIDLUYrD
	merge_url = "https://v2.convertapi.com/convert/pdf/to/merge?Secret=4x4SgttFtIDLUYrD";
	header = {"Content-Type":"application/json"};
	info "Rufe ConvertAPI auf für Merge von " + fileList.size() + " Dateien";
	resp = invokeurl
	[
		url :merge_url
		type :POST
		parameters:params + ""
		headers:header
	];
	// Fehlerbehandlung für ConvertAPI
	if(resp.get("Code") >= 4000)
	{
		info "ConvertAPI Fehler: " + resp.get("Code");
		return {"error":resp.get("Code")};
	}
	// ========================================
	// 6. GEMERGTES PDF VORBEREITEN
	// ========================================
	// Base64-Daten zurück in Datei konvertieren
	target_file = zoho.encryption.base64DecodeToFile(resp.get("Files").get(0).get("FileData"),"Name.pdf");
	target_file.setFileName(EstimateNumber + ".pdf");
	target_file.setFileType("pdf");
	// ========================================
	// 7. ALTES PDF LÖSCHEN (nur bei regulären Angeboten)
	// ========================================
	// Bei Beratungsverträgen bleibt das alte PDF erhalten
	if(is_beratungsvertrag == false)
	{
		standalone.ZST_deleteAttachment(dealId,EstimateNumber);
	}
	// ========================================
	// 8. NEUES PDF ALS ATTACHMENT ANHÄNGEN
	// ========================================
	resp2 = zoho.crm.attachFile("Deals",dealId,target_file);
	info "PDF als Attachment angehängt: " + resp2;
	// ========================================
	// 9. PDF IN FILE-FIELD SPEICHERN
	// ========================================
	// Datei für File-Upload vorbereiten
	target_file.setparamname("file");
	// Datei in CRM Files hochladen
	resp = invokeurl
	[
		url :"https://www.zohoapis.eu/crm/v2/files"
		type :POST
		files:target_file
		connection:"crm_all"
	];
	info "Datei hochgeladen zu CRM Files";
	// File ID extrahieren
	file_id = resp.get("data").get(0).get("details").get("id");
	// File-Field im Deal aktualisieren
	f_mp = Map();
	f_mp.put("file_id",file_id);
	file_list = List();
	file_list.add(f_mp);
	mp = Map();
	mp.put("Angebots_PDF",file_list);
	update = zoho.crm.updateRecord("Deals",dealId,mp);
	info "File-Field aktualisiert: " + update;
	// ========================================
	// 10. TEMPORÄREN WORKDRIVE-ORDNER LÖSCHEN
	// ========================================
	standalone.ZST_deleteFolderWorkdrive(folderId);
	info "WorkDrive Ordner gelöscht: " + folderId;
	// Erfolg zurückgeben
	return {"error":""};
}
catch (e)
{
	info "Fehler in ZST_PDFMerge: " + e;
	return {"error":e};
}
return "";
}