//------------------------------------------------------------------------------
// DomAPI example routines
// D. Kadrioski 1/25/2002
//
// THIS FILE IS FOR SUPPORTING THE EXAMPLES ONLY!
// YOU DO NOT USE IT OR CALL exampleInit() IN YOUR OWN FILES!!!
//
//------------------------------------------------------------------------------
domapi.loadUnit( "debugger");  // this is to support the 'dump' features of the examples
//domapi.loadLang("spa");   // enabling this line causes components to appear in Spanish
//------------------------------------------------------------------------------
document.write('<link rel="stylesheet" type="text/css" href="../bin/examples.css">');
//------------------------------------------------------------------------------
function exampleApplyTheme(nm,force){
  // this method just styles various elements on the example pages so they match
  // the theme being used
  var t = domapi.theme;
  var f = t.fonts;
  var m = domapi.getElm("main");
  if(m)with(m.style){
    color           = f.buttonface.color;
    backgroundColor = f.buttonface.bgcolor;
    font            = f.buttonface.asString();
    borderWidth     = t.border.width + "px";
    borderStyle     = t.border.solid;
    borderColor     = t.border.shadow;
  }
  m = domapi.getElm("h31");
  if(m)with(m.style){
    color           = f.buttonface.color;
    backgroundColor = f.buttonface.bgcolor;
    fontFamily      = f.buttonface.family;
    borderColor     = t.border.shadow;
  }
  m = domapi.getElm("p1");
  if(m)with(m.style){
    color           = f.highlight.color;
    backgroundColor = f.highlight.bgcolor;
    fontFamily      = f.highlight.family;
    borderWidth     = t.border.width + "px";
    borderStyle     = t.border.solid;
    borderColor     = t.border.shadow;
  }
  m = domapi.getElm("th1");
  if(m)with(m.style){
    color           = f.activecaption.color;
    backgroundColor = f.activecaption.bgcolor;
    fontFamily      = f.activecaption.family;
    borderWidth     = t.border.width + "px";
    borderStyle     = t.border.solid;
    borderColor     = t.border.shadow;
  }
};
//------------------------------------------------------------------------------
function exampleInit(){
  f = document.forms["f1"];
  f.reset();
  f.elements["dbg"].checked = domapi.trace;
  exampleApplyTheme();
  if(domapi.trace)setTimeout("domapi.debug.bringUpConsole()", 500);
};
//------------------------------------------------------------------------------
function printLinks(){
  var div = "&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;";
  var c   = domapi;
  document.write(
    '<span id="p1">' +
    "&nbsp;v"            +  domapi.version                    + div +
                           (domapi.isStrict?"strict":"loose") + div +
    "BoxFix:&nbsp;"      + (domapi.needsBoxFix?"YES":"NO")    + div +
    "Compression:&nbsp;" + (domapi.compressed? "ON":"OFF")    + div +
    "Theme:&nbsp;"       +  domapi.theme.name                 + div +
    "Skin:&nbsp;"        + (domapi.doSkin?     "ON":"OFF")    + div +
    "Browser:&nbsp;"     + (c._pt[c.platform] + "&nbsp;" + c._bt[c.browser] + "&nbsp;" + c.major + "." + c.minor) +
    (typeof domapi.msXmlValidProgId != 'undefined'?div+"IE HTTP:&nbsp;"+domapi.msXmlValidProgId+"&nbsp;":"&nbsp;") +
    '</span>'
  );
};
//------------------------------------------------------------------------------
function showGrid(s){
  with(domapi.bodyElm().style)
    if(s){
      backgroundImage='url(../bin/grid.gif)';
      backgroundRepeat='repeat';
    }else backgroundImage='none';
};
//------------------------------------------------------------------------------
function selectServerScript(radio){
  if (radio && radio.value)
    document.f1.setAttribute('action',"../bin/attachtoform_test."+radio.value);
};
//------------------------------------------------------------------------------
function printScriptRadios(){
  document.write("<br />");
  document.write('CFM<input alt="#" type="radio" name="ss" value="cfm" checked="checked" onclick="selectServerScript(this)"/>attachtoform_test.cfm<br />');
  document.write('PHP<input alt="#" type="radio" name="ss" value="php" onclick="selectServerScript(this)"/>attachtoform_test.php<br />');
  document.write('ASP<input alt="#" type="radio" name="ss" value="aspx" onclick="selectServerScript(this)"/>attachtoform_test.aspx');
};
//------------------------------------------------------------------------------
function printHeader(nm){
  printLinks();
  document.write(
    '<form name="f1" target="_blank" method="post" action="../bin/attachtoform_test.cfm">'+
    '<h3 id="h31" style="margin:0px 5px 5px">'+nm+' Testbed</h3>'+
    '<div id="main">'+
    '<a href="#" onclick="domapi.debug.bringUpConsole()">[console]</a>'+
    '&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;'+
    '<a href="#" onclick="domapi.debug.dumpProps(elm1);return false">[properties]</a>'+
    '&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;'+
    '<a href="#" onclick="domapi.dumpSource();return false">[source]</a><br />'+
    '<input alt="#" name="x" value="" type="checkbox" onclick="showGrid(this.checked);return true" /> Grid'+
    '&nbsp;&nbsp;<input alt="#" name="dbg" value="" type="checkbox" onclick="domapi.trace=this.checked;return true" /> Trace'+
    '<hr />'
  );
  document.title = nm+' Testbed';
};
//------------------------------------------------------------------------------
function printFooter(){
  var elems = document.forms["f1"].elements;
  for (var i=0; i<elems.length; i++){
    if(elems[i].type == "submit" && elems[i].value == "Test attachToForm()"){
      printScriptRadios();
      break;
    }
  }
  document.write('</div></form>')
};
//------------------------------------------------------------------------------
