string standalone.ZST_CreateFolderWorkdrive()
{
folder_id = "";
subFolderId = "cqzf7b3b64bf586ce4a0d88c044806d497d42";
folderName = zoho.currentdate.getYear() + "_" + zoho.currentdate.getMonth();
response = zoho.workdrive.createFolder(folderName,subFolderId,"wd_all");
info response;
folder_id = response.get("data").get("id");
permalink = response.get("data").get("attributes").get("permalink");
return {folder_id,permalink};
}