//------------------------------------------------------------------------------
// DomAPI Notebook Component
// D. Kadrioski 7/19/2003
//------------------------------------------------------------------------------
// Additional contributors where noted
//------------------------------------------------------------------------------

domapi.registerComponent("notebook");
//------------------------------------------------------------------------------
domapi.Notebook = function(arg){return domapi.comps.notebook.constructor(arg)};
//------------------------------------------------------------------------------
domapi.comps.notebook.constructor = function(arg){
  var e              = domapi.Component(arg,"notebook");
  e.index            = -1;
  e.onbeforechange   = function(i){return true}; // virtual
  e.onchange         = function(i){}; // virtual
  e.pages            = e.childNodes;

  domapi._finalizeComp( e);
  return e;
};
//------------------------------------------------------------------------------
domapi.comps.notebook._draw = function(){
  if(domapi.trace)dump(this.toString()+'._draw()');
  this.notebookDraw();
};
//------------------------------------------------------------------------------
domapi.comps.notebook._layout = function(w,h){
  if(domapi.trace)dump(this.toString()+'._layout()');
  w -= 13;
  h -= 13;
  var t;
  var p = this.pages;
  for(var i=0;i<p.length;i++){
    t        = p[i];
    t.setM(    5);
    t.setSize( w,h);
  }
};
//------------------------------------------------------------------------------
domapi.comps.notebook.notebookDraw = function(){
 if(domapi.trace)dump(this.toString()+'.notebookDraw()');
  var t               = domapi.theme;
  var s               = this.style;
  var b               = this.doBorder?t.border.width:0;
  var f               = domapi.theme.fonts.buttonface;
  this.setB(            b);
  s.borderStyle = this.doBorder?t.border.solid:"none";
  s.borderColor = t.border.getOutset();

  // apply style to pages
  if(this.doManage){
    var p = this.pages;
    var m = this.paneManage;
    var h = (m=="display"?"none":"hidden");
    var v = (m=="display"?""    :"visible");
    for(var i=0;i<p.length;i++)
      p[i].style[m] = this.index==i?v:h;
  }
};
//------------------------------------------------------------------------------
domapi.comps.notebook.addPage = function(arg){ // note: url only applies to type IFRAME // RH: Changed
  if(domapi.trace)dump(this.toString()+'.addPage()');
  domapi._assert(arg, "type", "DIV");
  var controlType = arg["type"];
  var url         = arg["url"];
  var delayLoad   = arg["delayLoad"];
  var refreshPage = arg["refreshPage"];
  var e = null;
  switch(controlType){
    case "DIV":
    case "IFRAME":
    case "TEXTAREA":
    case "P":
      e =
        domapi.Elm({
          parent:this,
          x:0,y:0,
          w:100,h:100,
          type:controlType,
          frameBorder:0
        });
      break;
  }
  if(!e)return;

  e.controlType = controlType;         // RH: Added (now we know what type of content is in the page)
  e.DA_TYPE     = "PAGECONTROLPAGE";
  if(controlType=="IFRAME"){
    e.url               = url;         // RH: Added (Now we later knows the url to ask for)
    e.delayLoad         = delayLoad;   // RH: Added (Supports delaying loading the IFRAME until it is activated)
    e.refreshPage       = refreshPage; // RH: Added (Supports refreshing the IFRAME every time it is activated, good for dynamic content in the iframe)
    e.loaded            = false;       // RH: Added (Tells whether this page is loaded or not (actually; src has been set or not))
    if (!e.delayLoad){                 // RH: Added
      setTimeout("document.getElementById('" + e.id + "').getDocument().location.replace('" + domapi.rVal(url,"about:blank") + "')", 25);
      e.loaded = true;                 // RH: Added
    }                                   // RH: Added
    e.frameBorder       = "0";
    e.style.margin      = "2px";
    e.style.overflow    = "auto";
  }
  if(this.pages.length == 1)this.index = 0;
  //----------
  if(!this._inUpdate && !this.parentNode._inUpdate)this.layout();
  this.draw(); // sets the styles and positions the objects
  return e;
};
//------------------------------------------------------------------------------
domapi.comps.notebook.removePage = function(i){
  var p = this.pages;
  var n = p.length - 1;
  if(n < 0 || i > n)return null;
  return p[i].parentNode.removeChild(p[i]);
};
//------------------------------------------------------------------------------
domapi.comps.notebook.setIndex = function(i){
  if(domapi.trace)dump(this.toString()+'.setIndex('+i+' of '+(this.pages.length-1)+')');
  var n = this.pages.length - 1;
  if(!this.enabled || n<0 || i>n)return false;
  if(!this.onbeforechange(i))return false;
  domapi.closeAllDropdowns();
  var p = this.pages[i];
  if (p.refreshPage || (p.delayLoad && !p.loaded)){// RH: Added
    setTimeout("document.getElementById('" + p.id + "').getDocument().location.replace('" + p.url + "')", 20);
    p.loaded = true;  // RH: Added
    if(domapi.trace)dump(this.toString()+' RefreshDelayLoading:'+p.url);
  }
  this.index = i;
  this.onchange(i);
  this._draw();
  return true;
};
//------------------------------------------------------------------------------
// RH: Load the URL (default if url is not sent in, URL if sent) into the given
// pageNo in the pagecontrol.
// BeamGate:  Added delay mode and index tracking
domapi.comps.notebook.loadPage = function(i,url,delay){
  var p = this.pages;
  if(i<0 || i>=p.length)return;
  var page=p[i];
  delay  = domapi.rBool(delay,false);
  if(page.controlType != "IFRAME")return;
  url= url?url:page.url;
  page.loaded=false;
  if(!delay){
    setTimeout("document.getElementById('" + page.id + "').getDocument().location.replace('" + url + "')", 20);
    page.loaded=true;
  }else{
   page.delayLoad=true;
  }
  page.url = url; //keep url insynch with changes
  if(domapi.trace)dump(this.toString()+".loadPage("+i+",'"+url+"',"+delay+")");

};

//------------------------------------------------------------------------------
// this will take a given DOMElement and move it into page number toIndex
// if toIndex is null, it appends a new page for it.
// if toIndex is greater that current number of pages, it will add enough blank pages
// to equal toIndex
domapi.comps.notebook.assignElement=function(arg){
  if(domapi.trace)dump(this.toString()+'.assignElement()');
  var elmid     = arg["id"       ];
  var index     = arg["index"    ];
  var overwrite = arg["overwrite"];
  var original  = domapi.getElm(elmid);
  if(!original)return;
  if(overwrite == null)overwrite = true;
  original.parentNode.removeChild(original); // remove from dom tree
  if(!index && index != 0){ // if no index passed, append a new page for the transfer
    this.addPage({});
    index = this.pages.length-1;
  }
  while(this.pages.length<index+1)this.addPage({}); // make sure we have enough pages
  if(overwrite)this.pages[index].innerHTML = "";
  this.pages[index].appendChild(original);  // add it to the component
};
//------------------------------------------------------------------------------
// this clears all pages
domapi.comps.notebook.clearPages = function(){
  var p = this.pages;
  for(var i=p.length;i>0;i--){ this.removePage(i-1);}
  this.index = -1;
  this.draw();
};

//------------------------------------------------------------------------------
domapi.comps.notebook.setEnabled = function(b, i){
  if(arguments.length == 1){
    this.enabled = b;
  }else{
     var p = this.pages;
     var n = p.length - 1;
     if(n < 0 || i > n)return;
     p[i].enabled=b;
  }
};
//------------------------------------------------------------------------------
domapi.comps.notebook.next = function(){
  var n = this.pages.length - 1;
  if(n<0)return false;
  return this.setIndex((this.index < n)?this.index + 1:0);
};
//------------------------------------------------------------------------------
domapi.comps.notebook.previous = function(){
  var n = this.pages.length - 1;
  if(n<0)return false;
  return this.setIndex((this.index > 0)?this.index - 1:n);
};
//------------------------------------------------------------------------------
