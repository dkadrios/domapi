//==============================================
// DomAPI Imagetabset Component
// D. Kadrioski 1/12/2004
//==============================================

domapi.loadUnit(         "imagelist");
domapi.registerComponent("imagetabset" );
var daImagetabsetSel  = 0;
var daImagetabsetOver = 1;
var daImagetabsetDown = 2;
var daImagetabsetNorm = 3;
var daImagetabsetDis  = 4;
//------------------------------------------------------------------------------
domapi.Imagetabset = function(arg){return domapi.comps.imagetabset.constructor(arg)};
//------------------------------------------------------------------------------
domapi.comps.imagetabset.constructor = function(arg){
  var e   = domapi.Component(arg,"imagetabset");
  e.tabs  = [];
  e.index = -1;
  e.onbeforechange   = function(i){return true}; // virtual
  e.onchange         = function(i){}; // virtual

  var p = domapi._private.imagetabset;
  domapi.addEvent(e,"mouseover",p.domouseover);
  domapi.addEvent(e,"mouseout", p.domouseout );
  domapi.addEvent(e,"mousedown",p.domousedown);
  domapi.addEvent(e,"mouseup",  p.domouseup  );
  domapi.disallowSelect(e);
  domapi._finalizeComp( e);
  return e;
};
//------------------------------------------------------------------------------
domapi.comps.imagetabset._draw = function(){
  this.imagetabsetDraw();
};
//------------------------------------------------------------------------------
domapi.comps.imagetabset.imagetabsetDraw = function(){};
//------------------------------------------------------------------------------
domapi.comps.imagetabset._layout = function(w,h){
  if(this._inUpdate)return;
  var x,y,i,z;
  var I = this.tabs;
  y = 0; x = 0; z = 255;
  for(i=0;i<I.length;i++){
    I[i].moveTo(x,y);
    if(this.orientation == "horizontal")
      x += I[i].getW() - this.overlap;
    else
      y += I[i].getH() - this.overlap;
    if(i == this.index){
      I[i].setZ(256);
    }else{
      I[i].setZ(z);
      z--;
    }
  }
  this.managePanes();
};
//------------------------------------------------------------------------------
domapi.comps.imagetabset.addTab = function(arg){
  var I = this.tabs;
  I.push(domapi.Imagelist({
    parent : this,
    src    : arg["src"],
    count  : 5,
    name   : arg["name"],
    w      : domapi.rInt(arg["w"],this.getW()),
    h      : domapi.rInt(arg["h"],this.getH()),
    orientation :arg["orientation"]})
  );
  var e = I[I.length-1];
  e.enabled = domapi.rBool(arg["enabled"], true);
  if(!e.enabled)
    e.setIndex(daImagetabsetDis);
  else{
    if(this.index == -1){
      this.index = I.length-1;
      e.setIndex(daImagetabsetSel);
    }else{
      e.setIndex(daImagetabsetNorm);
    }
  }
  e.DA_TYPE             = "IMAGETABSETTAB";
  domapi.css.addClass(e,  "DA_IMAGETABSET_TAB");
  if(arg["pane"])e.pane = arg["pane"];
  if(arg["func"])e.func = arg["func"]; // GX PK

  this.layout();
  return e;
};
//------------------------------------------------------------------------------
domapi.comps.imagetabset.setEnabled = function(b, i){
  if(arguments.length == 1)
    this.enabled = b;
  else{
    this.tabs[i].enabled = b;
    if(!b){
      domapi.css.addClass(this.tabs[i], "DA_TAB_DISABLED", !b);
      this.tabs[i].setIndex(daImagetabsetDis);
    }else{
      domapi.css.addClass(this.tabs[i], "DA_TAB_ENABLED", !b);
      this.tabs[i].setIndex(daImagetabsetNorm);
    }
  }
};
//------------------------------------------------------------------------------
domapi.comps.imagetabset.clear = function(){
  var t = this.tabs;
  for(var i=t.length;i>0;i--)
    this.removeTab(i-1);
  this.index = -1;
  this.layout();
};
//------------------------------------------------------------------------------
domapi.comps.imagetabset.removeTab = function(i){
  var t = this.tabs;
  var n = t.length - 1;
  if(n < 0 || i > n)return null;
  var e = t[i].parentNode.removeChild(t[i]);
  t.deleteItem(i);
  return e;
};
//------------------------------------------------------------------------------
domapi.comps.imagetabset.managePanes = function(){//dump("manage")
  var m = this.paneManage;
  var h = (m=="display"?"none":"hidden");
  var v = (m=="display"?""    :"visible");
  var t = null;
  for(var i=0;i<this.tabs.length;i++){
    t = this.tabs[i];
    if(t.pane){
      t.pane.style[m] = ((i == this.index)?v:h);
      if(i == this.index){
        for(var j=0;j<t.pane.childNodes.length;j++){
          if(t.pane.childNodes[j].draw  )t.pane.childNodes[j].draw();
          if(t.pane.childNodes[j].layout)t.pane.childNodes[j].layout();
        }
      }
    }
  }
};
//------------------------------------------------------------------------------
domapi.comps.imagetabset.setIndex = function(index){ // GX PK
  if(this.index <0 || this.index >= this.tabs.length)return false;
  if(!this.onbeforechange(index))return false;
  var t=this.tabs[index];
  if( !t || !t.enabled || t.index == daImagetabsetSel)return false;
  if(index <0 || index >= this.tabs.length)return false;
  var ok  = true;
  if(this.indexRelation && (typeof this.indexRelation._setIndex == 'function'))ok=this.indexRelation._setIndex(index);
  if(!ok)return false;
  this.tabs[this.index].setIndex(daImagetabsetNorm);
  this.index = domapi.getNodeIndex(t);
  t.setIndex(daImagetabsetSel);
  this.layout();
  if (typeof t.func == 'function') t.func();
  if(this.onchange)this.onchange(this.index);
  return true;

};
//------------------------------------------------------------------------------
domapi.comps.imagetabset.setIndexByName = function(nm){
  for(var i=0;i<this.tabs.length;i++)
    if(this.tabs[i].name == nm){
      return this.setIndex(i);
      break;
    }
};
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
// private members
domapi._private.imagetabset.domouseover = function(E){
  var e = domapi.findTarget(E,"IMAGETABSET");
  var t = domapi.findTarget(E,"IMAGETABSETTAB");
  if(!e || !t || !e.enabled || !t.enabled || !e.doRollover || t.index == daImagetabsetSel)return;
  t.setIndex(daImagetabsetOver);
};
//------------------------------------------------------------------------------
domapi._private.imagetabset.domouseout = function(E){
  var e = domapi.findTarget(E,"IMAGETABSET");
  var t = domapi.findTarget(E,"IMAGETABSETTAB");
  if(!e || !t || !e.enabled || !t.enabled || !e.doRollover || t.index == daImagetabsetSel)return;
  t.setIndex(daImagetabsetNorm);
};
//------------------------------------------------------------------------------
domapi._private.imagetabset.domousedown = function(E){
  var e = domapi.findTarget(E,"IMAGETABSET");
  var t = domapi.findTarget(E,"IMAGETABSETTAB");
  if(!e || !t || !e.enabled || !t.enabled || !e.doDepress || t.index == daImagetabsetSel)return;
  t.setIndex(daImagetabsetDown);
};
//------------------------------------------------------------------------------
domapi._private.imagetabset.domouseup = function(E){
  var e = domapi.findTarget(E,"IMAGETABSET");
  var t = domapi.findTarget(E,"IMAGETABSETTAB");
  if(!e || !t || !e.enabled || !t.enabled || t.index == daImagetabsetSel)return;

  if(e.index <0 || e.index >= e.tabs.length)return;
  e.setIndex( domapi.getNodeIndex(t));

  /*if(!e.onbeforechange(index))return;
  e.tabs[e.index].setIndex(daImagetabsetNorm);
  e.index = index;
  t.setIndex(daImagetabsetSel);
  e.layout();
  if(e.onchange)e.onchange(index);*/

};
//------------------------------------------------------------------------------
