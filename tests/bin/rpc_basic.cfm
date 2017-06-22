<cfparam name="guid" default="-1">
<cfparam name="directive" default="list">
<cfparam name="obj_id" default="">
<cfparam name="method" default="GET">

<cfif directive EQ "list">
  <cfquery datasource="#docsdb#" username="#dbuser#" password="#dbpassword#" name="q1">
    select object_name, object_id from objects
    where description is not null
    and obsolete = 0
    order by object_name
  </cfquery>
<cfelseif directive EQ "get">
  <cfset obj_id = trim(obj_id)>
  <cfif obj_id EQ ""><cfset obj_id = 0></cfif>
  <cfquery datasource="#docsdb#" username="#dbuser#" password="#dbpassword#" name="q1">
    select description from objects
    where object_id = #obj_id#
  </cfquery>
</cfif>

<cfif method EQ "POST">
  <html><head><script type="text/javascript">
  with(parent){
</cfif>

var response = new domapi.RPCPacket({});
<cfoutput>
response.guid = "#guid#";
response.data.add("directive","#directive#");
</cfoutput>
<cfoutput query="q1">
<cfif directive EQ "list">
  response.data.add("#object_name#",#object_id#);
<cfelseif directive EQ "get">
  response.data.add("description","#Replace(Replace(description,'"','\"','ALL'),chr(13)&chr(10),'<br />','ALL')#");
</cfif>
</cfoutput>
domapi.rpc.receivePacket(response);

<cfif method EQ "POST">
  }
  </script></head><body></body></html>
</cfif>