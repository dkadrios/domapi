//==============================================
// DomAPI Icon Component
// F. Frivera 9/5/2004
// adapted by D. Kadrioski
//==============================================

domapi.loadUnit("imagelistlite");
domapi.loadUnit("drag");

domapi.registerComponent("icon");
//------------------------------------------------------------------------------
domapi.Icon = function(arg){return domapi.comps.icon.constructor(arg)};
//------------------------------------------------------------------------------
domapi.comps.icon.constructor = function(arg){
  var e = domapi.Component(arg,"icon");
  var p = domapi._private.icon;
  p._createSimpleIcon(e,arg);
  e.anchor = domapi.Elm(arg);
  p._createSimpleIcon(e.anchor,arg);

  domapi.addEvent( e, "mouseover", p.doMouseover);
  domapi.addEvent( e, "mouseout",  p.doMouseout);
  domapi.addEvent( e, "mousedown", p.doMousedown);
  domapi.addEvent( e, "mouseup",   p.doMouseup);

  domapi._finalizeComp( e);

  e.turnOnDrag(e,null,0, this._dragStart, this._dragMove, this._dragEnd);
  e.setAllowMove(e.doAllowMove);
  e.setSelected( e.selected);
  e.anchor.hide();

  return e;
};
//------------------------------------------------------------------------------
domapi.comps.icon._dragStart = function(e){
  var e = this.elm;
  if(!e)return;
  if (e.doAllowMove){
    e.setAlpha(70);
    e.anchor.moveTo(e.getX(), e.getY());
    e.anchor.show();
  }
};
//------------------------------------------------------------------------------
domapi.comps.icon._dragMove = function(x,y,dX,dY){
  var e = this.elm;
  if(!e)return;
  if (e.doAllowMove){
    e.moveTo(x,y);
  }
};
//------------------------------------------------------------------------------
domapi.comps.icon._dragEnd = function(e){
  var e = this.elm;
  if(!e)return;
  if (e.doAllowMove){
    e.setAlpha(100);
    e.anchor.hide();
    e.anchor.moveTo(e.getX(), e.getY());
  }
};
//------------------------------------------------------------------------------
domapi.comps.icon.setAllowMove = function(b){this.doAllowMove = b};
//------------------------------------------------------------------------------
domapi.comps.icon.setSelected = function(b){
  var B = domapi.bags.icon;
  var i;
  if(b){  // deselect all other icons in this container
    for(i=0;i<B.length;i++)
      if(B[i].parentNode == this.parentNode)
        B[i].setSelected(false);
  }
  this.selected = b;
  domapi.css.addClass(this, "DA_ICON_FOCUS", b);
  if(b  && this.onselected  )this.onselected();
  if(!b && this.ondeselected)this.ondeselected();
};
//------------------------------------------------------------------------------
domapi.comps.icon.setText          = function(s){
  this.getMainTextObj()  .innerHTML = s;
  this.getAnchorTextObj().innerHTML = s;
};
//------------------------------------------------------------------------------
domapi.comps.icon.getMainImg       = function(){return this.firstChild};
//------------------------------------------------------------------------------
domapi.comps.icon.getAnchorImg     = function(){return this.anchor.firstChild};
//------------------------------------------------------------------------------
domapi.comps.icon.getMainTextObj   = function(){return this.childNodes[2]};
//------------------------------------------------------------------------------
domapi.comps.icon.getAnchorTextObj = function(){return this.anchor.childNodes[2]};
//------------------------------------------------------------------------------
domapi.comps.icon.setImageIndex = function(i){
  this.getMainImg().setIndex(i);
  this.getAnchorImg().setIndex(i);
};
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
// private members
//------------------------------------------------------------------------------
domapi._private.icon._createSimpleIcon = function(p, arg){
  domapi.Imagelistlite({parent:p,src:arg["src"],w:domapi.rInt(arg.imgW, 32), h:domapi.rInt(arg.imgH, 32)});
  p.firstChild.setAttribute("vspace","3");
  p.appendChild(document.createElement("BR"));
  var oTxt = document.createElement("DIV");
  oTxt.innerHTML = arg["text"];
  oTxt.style.cursor = "default";
  p.appendChild(oTxt);
  p.style.textAlign="center";
  p.title = arg["text"];
};
//------------------------------------------------------------------------------
domapi._private.icon.doMouseover = function(E){
  var e = domapi.findTarget(E, "ICON"); if(!e || e.selected || !e.doRollover)return;
  domapi.css.addClass(e, "DA_ICON_OVER");
};
//------------------------------------------------------------------------------
domapi._private.icon.doMouseout  = function(E){
  var e = domapi.findTarget(E, "ICON"); if(!e)return;
  domapi.css.removeClass(e, "DA_ICON_OVER");
};
//------------------------------------------------------------------------------
domapi._private.icon.doMousedown = function(E){
  var e = domapi.findTarget(E, "ICON"); if(!e || e.selected)return;
  domapi.css.removeClass(e, "DA_ICON_OVER");
  if(e.doDepress)domapi.css.addClass(e, "DA_ICON_DOWN");
  if(e.doAllowMove)e.setSelected(true);
};
//------------------------------------------------------------------------------
domapi._private.icon.doMouseup   = function(E){
  var e = domapi.findTarget(E, "ICON"); if(!e)return;
  domapi.css.removeClass(e, "DA_ICON_DOWN");
  if(!e.doAllowMove)e.setSelected(true);
};
//------------------------------------------------------------------------------
