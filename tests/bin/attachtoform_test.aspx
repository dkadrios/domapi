<%@ Page language="c#" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>DomAPI - Form Properties</title>
</head>
<body>
<h3>Form Properties</h3>
<%
Response.Write("array("+Request.Form.Count+"){");
for (int i=0; i<Request.Form.Count; i++) {
  string key = Request.Form.GetKey(i);
  string[] vals = Request.Form.GetValues(i);
  Response.Write("[\""+key+"\"]=> string("+vals[0].Length+") \""+vals[0]+"\";");
}
Response.Write("}");
%>
<br />
<button onclick="self.close()">Close</button>
</body>
</html>