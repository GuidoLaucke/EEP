string standalone.ZST_getMailMergeFields()
{
fillabel_fields = zoho.writer.getAllFields("jmpwd0a312544a6f74e3ea40257daeb63fcbb","zst_writer_all");
return fillabel_fields.get("merge");
}