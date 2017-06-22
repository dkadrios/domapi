//==============================================
// DomAPI Combobox Component
// D. Kadrioski 11/13/2001
//==============================================
// additional contributors:
// Dostick
//==============================================

domapi.loadUnit(         "dropdown");
domapi.loadUnit(         "listbox" );
domapi.registerComponent("combobox");
//------------------------------------------------------------------------------
domapi.Combobox = function(arg){return domapi.comps.combobox.constructor(arg)};
//------------------------------------------------------------------------------
domapi.comps.combobox.constructor = function(arg){
  var e          = domapi.Component(arg,"combobox",false);
  e._constructor = domapi.comps.combobox._constructor;
  e._constructor(  arg);
  domapi._finalizeComp(e);
  domapi._private.dropdown.ensurePositionSet(e);
  e._draw(); //toddfx had a sample that needed this line if the combo was in a parent...
  return e;
};
//------------------------------------------------------------------------------
domapi.comps.combobox._constructor = function(arg){
  var w = arg["w"]; var h = arg["h"];
  domapi._inherit(               this,"dropdown");
  this._constructor();
  domapi._inherit(               this,"combobox");
  this.value                   = domapi.rVal(arg["value"]);
  this.edit.value              = this.value;
  this.dropDown                = domapi.Listbox({
                                   parent      : this.parent,
                                   x           : 0,
                                   y           : h,
                                   w           : null,
                                   h           : domapi.rInt( arg["dropdownH"  ], 100 ),
                                   doAutoWidth : domapi.rBool(arg["doAutoWidth"], true),
                                   minWidth    : domapi.rInt( arg["minWidth"   ], 50),
                                   doAllowNoSelect : true
                                 });
  this.dropDown.doHLines       = arg["doLines"];
  this.dropDown.hide           = function(){this.style.visibility = "hidden";this.setX(-500);};
  var p                        = domapi._private.combobox;
  this.dropDown.onbeforechange = p.dodropdownbeforechange;
  this.dropDown.onchange       = p.dodropdownchange;
  domapi.addEvent(this,     "keydown", p.dokeydown   );
  domapi.addEvent(this,     "click",   p.doclick     );
  domapi.addEvent(this.edit,"change",  p.doeditchange);
  this.dropDown.parent         = this;
  this.dropDown.hide();
  this.dropDown.allowNoSelect  = true;
};
//------------------------------------------------------------------------------
domapi.comps.combobox._draw = function(){
  this.dropdownDraw();
  this.comboboxDraw();
};
//------------------------------------------------------------------------------
domapi.comps.combobox.comboboxDraw = function(){this.dropDown.draw()};
//------------------------------------------------------------------------------
domapi.comps.combobox._layout = function(w,h){
  var e = this.edit;
  this._dropdownLayout(w,h);
  h = domapi.theme.skin.metrics.dropdown.h;
  e.setSize(w,h);
};
//------------------------------------------------------------------------------
// overwrite setEnabled and setDoRollover - these were defined in dropdown, but we need to add some stuff
domapi.comps.combobox.setEnabled = function(b){
  this.enabled          = b;
  this.dropBtn.enabled  = b;
  this.dropDown.enabled = b;
  this.edit.disabled    = !b;
  this.dropBtn.setEnabled(b);
};
//------------------------------------------------------------------------------
domapi.comps.combobox.setDoRollover = function(b){
  this.doRollover          = b;
  this.dropBtn.doRollover  = b;
  this.dropDown.doRollover = b;
};
//------------------------------------------------------------------------------
domapi.comps.combobox.setDoAllowEdit = function(b){
  if(domapi.isGecko){
    if(b)this.edit.removeAttribute("readonly");
    else this.edit.setAttribute("readonly", "readonly");
  }else{
    if(b)this.edit.onfocus = null;
    else this.edit.onfocus = function(){this.blur()};
  }
  if(!b && domapi.isNil(this.value) && (this.dropDown.items.length>0)){ // no items selected, select one
    this.dropDown.selectItem(0,true);
    this.close();
  }
  this.doAllowEdit = b;
};
//------------------------------------------------------------------------------
domapi.comps.combobox.addItem = function(t,v){
  if(typeof v == "undefined")v = t;
  this.dropDown.addItem({text:t,value:v});
};
//------------------------------------------------------------------------------
domapi.comps.combobox.selectItem = function(i){
  if(domapi.trace)dump(this.toString() + '.combobox.selectItem()<--');
  var d = this.dropDown;
  i = domapi.rInt(i);
  if(i<0 || i>=d.items.length){
    if(domapi.trace)dump(this.toString() + '.combobox.selectItem() EARLY-->');
    return;
  }
  //d.selectNone();
 // d.selectItem(i,true);
  if(domapi.trace)dump(this.toString() + '.combobox.selectItem()-->');
};
//------------------------------------------------------------------------------
domapi.comps.combobox.selectItemByValue = function(i){ //Dostick
  this.dropDown.selectNone();
  this.dropDown.selectItemByValue(i,true);
};
//------------------------------------------------------------------------------
domapi.comps.combobox.setValue = function(v){
  if(domapi.trace)dump(this.toString() + '.combobox.setValue()<--');
//  v = this.getValue();
  this.value = v;
  domapi._setFormElementValue(this._formElement, String(v));
  if(this.onchange)this.onchange(this.value);
  if(domapi.trace)dump(this.toString() + '.combobox.setValue()-->');
};
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
// private members
domapi._private.combobox.dodropdownbeforechange = function(v){ // scope is dropdown
  return this.parent.onbeforechange(v?v.value:"");
};
//------------------------------------------------------------------------------
domapi._private.combobox.dodropdownchange = function(i){ // scope is dropdown
  var r = this.parent;
  if(!r)return;
  i = domapi.rInt(i, -1);
  if(i == -1)return;
  var v             = i>-1?this.items[i].innerHTML:"";
  var vv            = i>-1?this.items[i].value:"";		// line added by Dostick
  if(typeof r.onbeforechange != "function")return;
  if(!r.onbeforechange(vv))return;
  if(domapi.trace)dump(this.toString() + '.combobox.dodropdownchange()<--');
  r.setValue(    vv);
  r.edit.value = v;
  if(r.autoClose && this.visible){
    this.hide();
    r.opened        = false;
    r.dropBtn.title = domapi.getString("DROPDOWN_OPEN");
  }
  if(r.doAllowEdit){
    r._ignoreChange = true;
    r.edit.select();
    r.edit.focus();
    r._ignoreChange = false;
  }
//  r._onchange(vv);
  if(domapi.trace)dump(this.toString() + '.combobox.dodropdownchange()-->');
};
//------------------------------------------------------------------------------
domapi._private.combobox.doeditchange = function(E){ // scope is edit
  var e = domapi.findTarget(E,"INPUT");
  domapi.preventBubble(E);
  if(!e)return;
  var p = e.parentNode;
  if(p._ignoreChange)return;
  if(!p.onbeforechange(e.value)){
    e.value = p.value;
    return;
  }
  p.setValue(e.value);
//  p._onchange(e.value);
};
//------------------------------------------------------------------------------
domapi._private.combobox.doclick = function(E){
  var r = domapi.findTarget(E,"COMBOBOX");
  if(!r || !r.enabled)return;
  var e = domapi.findTarget(E,"INPUT");
  if(e && !r.doAllowEdit)r.open();
  if(r.focus)r.focus();
};
//------------------------------------------------------------------------------
domapi._private.combobox.dokeydown = function(E){
  var k = domapi.isIE?event.keyCode:E.which;
  var r = domapi.findTarget(E,"COMBOBOX");
  if(!r || !r.enabled)return;
  var d = r.dropDown;
  if(k == 38 && d.itemIndex>0){  // UP
    r.selectItem(d.itemIndex-1, true);
  }
  if(k == 40 && d.itemIndex<d.items.length-1){// DOWN
    r.selectItem(d.itemIndex+1, true);
  }
  if(k == 38 || k == 40){
    if(E && E.preventDefault)E.preventDefault();
    return false;
  }
};
//------------------------------------------------------------------------------
