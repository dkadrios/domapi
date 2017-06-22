//==============================================
// DomAPI Listgrid Component
// D. Kadrioski 11/03/2001, 10/09/2002, 5/16/2004
//==============================================

domapi.loadUnit("dataset"   );
domapi.loadUnit("customdrag");
domapi.registerComponent("listgrid");

//domapi.trace = true;
if(domapi.trace)dump("Trace is on.");

domapi.Listgrid = function(arg){return domapi.comps.listgrid.constructor(arg)};
//------------------------------------------------------------------------------
domapi.comps.listgrid.constructor = function(arg){
  var e                = domapi.Component(arg,"listgrid");
  e.data               = new domapi.Dataset({owner:e});
  e._divData           = document.createElement("DIV");
  e._divHeader         = document.createElement("DIV");
  e._divRowbar         = document.createElement("DIV");
  e._divUpperLeftSpace = document.createElement("DIV");
  e._goboContainer     = document.createElement("DIV");
  e._gobo              = document.createElement("DIV");
  e._state = { // cached properties
    sbw                  : domapi.scrollBarWidth(),
    inresize             : false,
    inmove               : false,
    inedit               : false,
    toprow               : 0,
    rowbarwidth          : 0,
    visiblerows          : 0,
    viewablerows         : 0,
    visiblecols          : [],
    headerheight         : 0,
    visiblerowsheight    : 0,
    visiblecolswidth     : 0,
    scrolltop            : 0,
    scrollleft           : 0,
    lastheaderclip       : [],
    lastdataclip         : [],
    vertscrollbarvisible : false,
    horzscrollbarvisible : false,
    viewportw            : arg["w"],
    viewporth            : arg["h"]
  };
  e._divRowbar._datastack        = "";
  e._divRowbar._datastack.count  = 0;
  e._divData.className           = "DA_LISTGRID_DATA";
  e._divHeader.className         = "DA_LISTGRID_HEADER";
  e._divRowbar.className         = "DA_LISTGRID_ROWBAR";
  e._divUpperLeftSpace.className = "DA_LISTGRID_UPPERLEFT_SPACE";
  e._goboContainer.className     = "DA_LISTGRID_GOBO_CONTAINER";
  e._divHeader.DA_TYPE           = "LISTGRID_HEADER";
  e.setGridlines(e.gridlines);
  e.cols              = e._divHeader.childNodes;
  e.selected          = []; // indexes
  e.currentRow        = -1;
  e.currentCol        = -1;
  e.doAllowDrag       = true;
  e.dragIcon          = "none";
  e.turnOnCustomDrag({});

  e._goboContainer.appendChild(e._gobo);
  e.appendChild(e._divHeader);
  e.appendChild(e._divData);
  e.appendChild(e._divRowbar);
  e.appendChild(e._divUpperLeftSpace);
  e.appendChild(e._goboContainer);
/*  e._divData.style.background="red"
  e._goboContainer.style.background="blue"
  e._gobo.style.background="yellow"*/

  e._ghost = domapi.Elm({parent:e,x:0,y:0,w:50,h:domapi.theme.skin.metrics.headerbar.h});
  e._ghost.setAlpha(80);
  e._ghost.setZ(1000);
  e._ghost.className = "DA_LISTGRID_GHOST";
  e._ghost.hide();
  e._ghost.showing = false;

  e._resizebar = domapi.Elm({parent:e,x:0,y:0,w:1,h:100});
  e._resizebar.setZ(20);
  e._resizebar.style.border          = "0px dashed black";
  e._resizebar.style.borderLeftWidth = "1px";
  e._resizebar.showing               = false;
  e._resizebar.hide();

  var p = domapi._private.listgrid;
  //  domapi.addEvent(e._goboContainer, "scroll", p.doscroll); moz ignores this(!)
  e._doscroll               = p._doscroll;
  e._goboContainer.onscroll = p.doscroll;
  e._divHeader.onmouseover  = p.doheadermouseover;
  e._divHeader.onmouseout   = p.doheadermouseout;
  e._divHeader.onmousemove  = p.doheadermousemove;
  e._divHeader.onmousedown  = p.doheadermousedown;
  e._divHeader.onmouseup    = p.doheadermouseup;
  domapi.addEvent(e, "mouseup", p.dodataclick);

  domapi._finalizeComp( e);
  domapi.addEvent(domapi.isIE?e:e._daTabEdit, "keydown", p.dokeydown);
  return e;
};

//------------------------------------------------------------------------------
domapi.comps.listgrid._draw = function(){this.listgridDraw();};
//------------------------------------------------------------------------------
domapi.comps.listgrid.listgridDraw = function(){
  if(domapi.trace)dump(this.toString()+'.listgridDraw()');
  var t         = domapi.theme;
  var s         = this.style;
  var b         = this.doBorder?t.border.width:0;
  this.setB(      b);  // set border width *before* border style!!
  s.borderStyle = this.doBorder?t.border.solid:"none";
  s.borderColor = t.border.getInset();
  if(this.doLedgerMode)
    domapi.css.addClass(this, "DA_LISTGRID_LEDGER");
  else
    domapi.css.removeClass(this, "DA_LISTGRID_LEDGER");
};
//------------------------------------------------------------------------------
domapi.comps.listgrid._layout = function(w,h){
  if(domapi.trace)dump(this.toString()+'._layout(' + w + ', ' + h + ')');
  this._dataChanged(); // causes metrics to be calculated
  var C, i, c, s;
  var _h = h; var _w = w;
  var S  = this._state;
  var H  = this._divHeader;
  var C  = this._goboContainer;
  var R  = this._divRowbar;
  var D  = this._divData;
  var U  = this._divUpperLeftSpace;
  var rw = S.rowbarwidth;
  var hh = S.headerheight;

  H.style.height  = hh - ((domapi.isIE && domapi.isStrict && hh > 2)?2:0) + "px";
  R.style.width   = rw - ((domapi.isIE && domapi.isStrict && rw > 2)?2:0) + "px";
  U.style.width   = rw + "px";
  U.style.height  = hh + "px";
  U.style.display = (this.doShowHeader && this.doShowRowbar)?"":"none";
  R.style.display = this.doShowRowbar?"":"none";
  H.style.display = this.doShowHeader?"":"none";

  // endupdate calls this method
  for(i =0;i<D.childNodes.length;i++){
    C = D.childNodes[i];
    domapi.disallowSelect(C);
    if(C._datastack != ""){
      C.innerHTML += C._datastack;
      C._datastack       = "";
      C._datastack_count = 0;
    }
  }
  if(R._datastack != ""){
    R.innerHTML += R._datastack;
    R._datastack = "";
  }

  if(!this._inUpdate){
    var C = D.childNodes;
    if(C.length){ // there is at least one col
      c = C[C.length-1]; // last col
      s = this._gobo.style;
      w = S.visiblecolswidth + (domapi.isIE?(domapi.isStrict?1:0):2);
      S.viewportw   = _w;
      s.width       = w + "px";
      D.style.width = w + "px";

      if(c.childNodes.length){ // there is at least one row
        h = S.visiblerowsheight + hh + "px";
        s.height       = h;
        D.style.height = h;
        if(this.doVirtualMode)
          S.viewporth = _h;
        else
          S.viewporth = _h; //parseInt(h);
      }
    }
    this._layoutScroll();
  }

  if(!this.doAllowNoSelect && this.currentRow == -1 && C.length){
    this.currentRow = 0;
    this.selectRow(0, true, true);
  }//else this._showRowPersistentEditors();
  domapi._private.listgrid.scanForSelections.apply(this);
};
//------------------------------------------------------------------------------
domapi.comps.listgrid._layoutScroll = function(){
  if(domapi.trace)dump(this.toString()+'._layoutScroll()');
  var S  = this._state;
  var V  = this.doVirtualMode;
  var H  = this._divHeader;
  var C  = this._goboContainer;
  var R  = this._divRowbar;
  var D  = this._divData;
  var rw = S.rowbarwidth;
  var hh = S.headerheight;
  D.style.left  = rw - C.scrollLeft       + "px";
  D.style.top   = hh - (V?0:C.scrollTop)  + "px";
  R.style.top   = hh - (V?0:C.scrollTop)  + "px";
  H.style.left  = rw - C.scrollLeft       + "px";
  H.style.width = this._gobo.offsetWidth - (domapi.isIE?0:2) + "px";
  var r = C.scrollLeft + this.offsetWidth  - rw;
  var b = (V?0:C.scrollTop)  + this.offsetHeight - hh;
  if(S.vertscrollbarvisible)r -= (S.sbw +2);
  if(S.horzscrollbarvisible)b -= (S.sbw +2);
  H.style.clip     = "rect(0px, " + r + "px, " + H.offsetHeight + "px, 0px)";
  D.style.clip     = "rect("+(V?0:C.scrollTop)+"px, " + r + "px, " + b + "px, "+C.scrollLeft+"px)";
  S.lastheaderclip = [0, r, H.offsetHeight, 0];
  S.lastdataclip   = [(V?0:C.scrollTop), r, b, C.scrollLeft];
  //if(domapi.trace)dump([(V?0:C.scrollTop), r , b , C.scrollLeft, S.vertscrollbarvisible, S.horzscrollbarvisible])
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.clear = function(){
  if(domapi.trace)dump(this.toString()+'.clear()');
  this.selectNone();
  this.currentRow = -1;
  this.currentCol = -1;
  this._goboContainer.scrollTop = 0;
  this._state.scrolltop = 0;
//  this._layoutScroll();
  this.data.clear();
  var C = this.cols;
  for(i=0;i<C.length;i++)
    C[i].innerHTML = "";
  this._divRowbar.innerHTML = "";
  this._divHeader.innerHTML = "";
  this._state.toprow = 0;
  //this.refresh();
  for(var i=0;i<this.data.cols.length;i++)
    this.data.cols[i].sorted = false;
  this.data.sortColIndex = -1;
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.beginUpdate = function(){
  if(this._inUpdate)return;
  if(domapi.trace)dump(this.toString()+'.beginUpdate()');
  this._inUpdate     = true;
  this.data.inUpdate = true;
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.endUpdate   = function(){
  if(!this._inUpdate)return;
  if(domapi.trace)dump(this.toString()+'.endUpdate()');
  this.data.inUpdate = false;
  this.data.assert();
  this.assert();
  this._inUpdate = false;

  this.drawAndLayout();
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.assert = function(){
  if(domapi.trace)dump(this.toString()+'.assert()');
  var s, i, j, e, e1, c, C;
  var d = this.data;
  var H = this._divHeader;
  var D = this._divData;
  var p = domapi._private.listgrid;
  var S = this._state;

  d.assert();
  var imgUp   = ' <img src="' + domapi.theme.skin.lg_sortup.src   + '">';
  var imgDown = ' <img src="' + domapi.theme.skin.lg_sortdown.src + '">';

  // make sure we have enough cols
  for(i=this.cols.length;i<S.visiblecols.length;i++){
    e = document.createElement("DIV");
    e._index    = i; // used in mouseevents
    e.innerHTML = d.cols[S.visiblecols[i]].text;
    if(d.visibleCol(i) == d.sortColIndex)
    e.innerHTML += (d.sortDir==0)?imgUp:imgDown;

    c           = "DA_LGH_" + this.id + "_COL" + i;
    e.DA_TYPE   = "LISTGRID_HEADER_COL";
    e.className = "DA_LISTGRID_HEADER_COL";
    H.appendChild(e);

    e1 = document.createElement("DIV");
    e1._index    = D.childNodes.length; // not used yet, maybe in future mouse events
    e1.DA_TYPE   = "LISTGRID_COL";
    e1.className = "DA_LISTGRID_COL";
    D.appendChild(e1);

    p.buildColClass(this, i);
  }
  // remove extra cols
  // TODO @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  this._assertCols();
  this._assertRows();
};
//------------------------------------------------------------------------------
domapi.comps.listgrid._assertCols = function(){
  var i, ii, C, c, e;
  var S = this._state;
  var d = this.data;
  var D = this._divData;
  for(i=0;i<D.childNodes.length;i++){ // loop all cols
    var ii = d.visibleCol(i);
    C = this.cols[i]; // the physical col
    c = d.cols[ii];      // the data col
    e = C.editControl;
    if(e && e.controlType != c.controlType){
      // current control is not of the correct type - use must have changed it
      e.parentNode.removeChild(e);
      e = null;
      C.editControl = null;
    }
    if(!C.editControl){ // need to create the control
      // create the control, loading units inline as needed
      switch(c.controlType){
        case ctCheckbox      : break; // these are handled as images actually, no edit control needed
        case ctCustom        : break;
        case ctSelect        : break;
        case ctCombobox      : break;
        case ctDatepicker    :
          domapi.loadUnit("datepicker");
          C.editControl = domapi.Datepicker({parent:this,x:0,y:0,w:50,h:20});
          break;
        case ctText          :
        case ctUnknown       :
          C.editControl = domapi.Elm({parent:this,type:"INPUT",x:0,y:0,w:50,h:20});
          e = C.editControl;
          e.setAttribute("TYPE","TEXT");
          break;
      }
      if(C.editControl){
        e = C.editControl;
        e.controlType = c.controlType;
        //e.style.font  = domapi.theme.fonts.window.asString();
        e.setB(0);
        e.setZ(this._divData.style.zIndex+11);
        e.hide();
      }
    }
    domapi._private.listgrid.buildColClass(this, i);
  }
};
//------------------------------------------------------------------------------
domapi.comps.listgrid._assertRows = function(){
  if(domapi.trace)dump(this.toString()+'._assertRows()');
  // only fill in missing cells
  var rv = this._state.viewablerows; // d.rows.length; // this can change later in virtual mode
  var have, needed, C, odd, c, s, i;
  var d = this.data;
  var D = this._divData;
  var R = this._divRowbar;
  var S = this._state;
  for(i=0;i<D.childNodes.length;i++){ // loop all cols
    var ii = d.visibleCol(i);
    C      = D.childNodes[i]; // the col
    have   = C.childNodes.length;
    needed = (this.doVirtualMode?rv:this._state.visiblerows) - have;//if(i==0)alert([this._state.visiblerows,rv,have,needed])
    C._datastack_count = 0;
    C._datastack       = "";
    for(j=C.childNodes.length;j<needed;j++){ // loop missing rows for this col
      if(!this._inUpdate){
        odd = (D.childNodes.length % 2 == 0);
        c   = "DA_LG_" + this.id + "_ROW" + D.childNodes.length + " DA_LG_" + this.id + "_CELL_" + i +"_" +  D.childNodes.length;
      }else{
        odd = (C._datastack_count % 2 == 0);
        c   = "DA_LG_" + this.id + "_ROW" + C._datastack_count + " DA_LG_" + this.id + "_CELL_" + i +"_" + C._datastack_count;
      }
      //if(domapi.trace)dump('data.displayText('+j+','+i+')');
      s = '<div class="DA_LISTGRID_CELL ' + c +' ' +
              (odd?"DA_LISTGRID_ROW_ODD":"DA_LISTGRID_ROW_EVEN") + '">' + this._getDisplayText(j, ii) + '&nbsp;</div>';
      if(!this._inUpdate)
        D.innerHTML += s;
      else{
        C._datastack += s;
        C._datastack_count++;
      }
    }
  }

  // fill in missing rowbars
  R._datastack_count = 0;
  R._datastack       = "";
  for(j=R.childNodes.length;j<needed;j++){
    s = '<div class="DA_LISTGRID_ROWBAR_CELL">&nbsp;</div>';
    if(!this._inUpdate)
      R.innerHTML += s;
    else R._datastack += s;
  }
};
//------------------------------------------------------------------------------
/*domapi.comps.listgrid._assertCellEditor = function(col){
  if(domapi.trace)dump(this.toString()+'._assertCellEditor('+col+') <--');
  var i,e;
  var d = this.data;
  for(i=0;i<d.cols.length;i++)
    if(this.cols[i]){
      e = this.cols[i].editControl;
      if(e){
        if(i != col)e.style.display = "none";
        else
          this.editCell();
      }
    }
  if(domapi.trace)dump(this.toString()+'._assertCellEditor('+col+') -->');
};*/
//------------------------------------------------------------------------------
domapi.comps.listgrid._showRowPersistentEditors = function(){
  if(domapi.trace)dump(this.toString()+'._showRowPersistentEditors() <--');
  var i,e;
  var d = this.data;
  for(i=0;i<d.cols.length;i++)
    if(this.cols[i]){
      e = this.cols[i].editControl;
      if(e && e.tagName != "INPUT")
        this._positionCellEditor(this.currentRow,i);
    }
  if(domapi.trace)dump(this.toString()+'._showRowPersistentEditors() -->');
};
//------------------------------------------------------------------------------
domapi.comps.listgrid._showRowPersistentEditor = function(col){
  if(domapi.trace)dump(this.toString()+'._showRowPersistentEditor('+col+')');
  if(this.cols[col]){
    var e = this.cols[col].editControl;
    if(e && e.tagName != "INPUT")
      this._positionCellEditor(this.currentRow,col);
  }
};
//------------------------------------------------------------------------------
domapi.comps.listgrid._getDisplayText = function(i, j){
  var d = this.data;
  var v = d.displayText(i, j);
  if(d.cols[j].controlType == ctCheckbox){
    var m = domapi.theme.skin.metrics.checkbox;
    var s = domapi.theme.skin.path + 'form/single_cb_';
    var vv = v.toUpperCase().trim();
    if(this.enabled)
      s += "enabled_";
    else
      s += "disabled_";
    if(vv == "TRUE" || vv == "YES" || vv == "CHECKED")
      s += "checked.gif";
    else
      s += "cleared.gif";
    v = '<img border="0" align="bottom" src="'+s+'" width="'+m.w+'" height="'+m.h+'" onclick="domapi._private.listgrid._docbclick(this)">';
  }
  return v;
};
//------------------------------------------------------------------------------
domapi.comps.listgrid._renderCells = function(){
  if(domapi.trace)dump(this.toString()+'._renderCells()');
  var i, j, C, y, v;
  var d       = this.data;
  var D       = this._divData;
  var S       = this._state;
  var topR    = S.toprow+(S.scrolltop > 0?0:0);
  var bottomR = topR + S.viewablerows;
//  if(domapi.isIE && this.doVirtualMode)bottomR = bottomR + 2;
  if(domapi.trace)
    dump(this.toString()+'._renderCells() '+topR+' - '+bottomR + ' - ' + S.viewablerows);
  for(i=0;i<S.visiblecols.length;i++){
    y = 0;
    var C = D.childNodes[i];
    var ii = d.visibleCol(i);
    domapi._private.listgrid.buildColClass(this, i);
    if(C)
      for(j=topR;j<bottomR;j++){
        if(C.childNodes[y])
          C.childNodes[y].innerHTML = this._getDisplayText(j,ii) + '&nbsp;';
        y++;
      }
  }
};
//------------------------------------------------------------------------------
domapi.comps.listgrid._viewChanged = function(){
  if(domapi.trace)dump(this.toString()+'._viewChanged()');
  this.getTopRow();
  this.getRowsViewable();
  domapi._private.listgrid.scanForSelections.apply(this);
};
//------------------------------------------------------------------------------
domapi.comps.listgrid._dataChanged = function(){
  if(domapi.trace)dump(this.toString()+'._dataChanged()');
  // when row/col number or sizes change, call this to layout the control
  // and re-calculate the metrics
  var S = this._state;
  var D = this.data;
  S.visiblerowsheight = D.visibleRowsHeight();
  S.visiblecolswidth  = D.visibleColsWidth();
  S.visiblecols       = D.visibleCols();
  this.getRowbarWidth();
  this.getHeaderHeight();
  this.getRowsVisible();
  this.getVertScrollBarVisible();
  this.getHorzScrollBarVisible();
  this._viewChanged();
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.refresh = function(){
  if(domapi.trace)dump(this.toString()+'.refresh()');
  // refill all cells
  this.beginUpdate();
  this._selected = this.selected.join().split();
  try{
    this.selectNone();
    this._dataChanged(); // causes metric to be re-calculated
    this.getRowsVisible();
    this._divData.innerHTML   = "";
    this._divHeader.innerHTML = "";
    this._divRowbar.innerHTML = "";
  }finally{
    setTimeout("document.getElementById('" + this.id + "')._refreshCleanup()", 10);
  }
};
//------------------------------------------------------------------------------
domapi.comps.listgrid._refreshCleanup = function(){
  this.endUpdate();
  domapi._private.listgrid.scanForSelections.apply(this);
  this.selected = [];
  for(var i=0;i<this._selected.length;i++)
    this.selectRow(this._selected[i],true,true);
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.selectAll = function(){
  if(domapi.trace)dump(this.toString()+'.selectAll()');
  if(!this.doShowSelection)return;
  var i, j;
  var D = this.data;
  var c = ".DA_LG_" + this.id;
  var f = domapi.theme.fonts.selection.cssColor(true);

  for(i=0;i<D.rows.length;i++){
    if(this.selectMode == "row"){
      if(this.selected.indexOf(i)<0){
        //D.rows[i].classIndex = domapi.css.addRule(c + "_ROW" + i, f, true);
        //this.selected.push(i);
        this.selectRow(i, true, false);
      }
    }else for(j=0;j<D.cols.length;j++){
      if(this.selectMode == "col"){
        if(i==0){
          //D.cols[j].classIndex = domapi.css.addRule(c + "_COL" + j, f, true);
          if(this.selected.indexOf(i)<0)this.selected.push(i);
        }
      }else{
        D.rows[i].cells[j].classIndex = domapi.css.addRule(c + "_CELL_" + j +"_" +  i, f, true);
        //if(this.selected.indexOf(i)<0)this.selected.push(i);  // TODO @@@@@@@@@@@@@@@@@@@@@@@@@
      }
    }
  }
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.selectNone = function(){
  if(domapi.trace)dump(this.toString()+'.selectNone()');
  var i, j;
  var D = this.data;
  var c = ".DA_LG_" + this.id;

  // remove all visible row indicator icons
  for(j=0;j<this.selected.length;j++){
    pi = this._physicalIndex(this.selected[j]);
    if(this._rowViewable(pi) && this._divRowbar.childNodes[pi])
      this._divRowbar.childNodes[pi].innerHTML = "";
  }
  for(var i=this.selected.length-1;i>-1;i--){
    switch(this.selectMode){
      case "row"  : this.selectRow(this.selected[i], false); break;
//      case "col"  : domapi.css.removeRule(c + "_COL" + i);   break;
      case "cell" : break; // TODO @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@22
    }
  }
};
//------------------------------------------------------------------------------
domapi.comps.listgrid._physicalIndex = function(i){
  var S = this._state;
  var r = i - (this.doVirtualMode?S.toprow:0);
  if(domapi.trace)dump(this.toString()+'._physicalIndex(' + i + ') = ' + r + '; toprow = ' + S.toprow);
  return r;
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.rowVisible = function(i){
  var S = this._state;
  if(this.doVirtualMode)return (i >= S.toprow && i < (S.toprow + S.viewablerows-1));
  else{
    var y = this.data.visibleRowTop(i);
    return (y > this._goboContainer.scrollTop && y < this._goboContainer.scrollTop + this.offsetHeight-30);
  }
};
//------------------------------------------------------------------------------
domapi.comps.listgrid._rowViewable = function(i){
  var S = this._state;
  var r = ((!this.doVirtualMode) || (i > -1 && i < (S.toprow + S.viewablerows)));
  if(domapi.trace)dump(this.toString()+'._rowViewable(' + i + ') = ' + r + '; toprow = ' + S.toprow+'; viewablerows = ' + S.viewablerows);
  return r;
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.selectRow = function(i, b, makeCurrent){
  if(domapi.trace)dump(this.toString()+'.selectRow(' + i + ', ' + (b==true) + ', ' + (makeCurrent==true) + ')');
  var k;
  var pi = this._physicalIndex(i); // shortcut
  var j = this.selected.indexOf(i);
  this.data.rows[pi].selected = b;
  if(b && j<0){
    if(this._rowViewable(pi))
     /* this["css_row" + pi] = domapi.css.addRule(
        ".DA_LG_" + this.id + "_ROW" + pi,
        domapi.theme.fonts.selection.cssColor(true),
        false);*/
    for(k=0;k<this.cols.length;k++)
      domapi.css.addClass(this._divData.childNodes[k].childNodes[pi], "DA_SELECTION");
    this.selected.push(i);
  }else if(!b /*&& j>-1*/){
    //domapi.css.removeRule(".DA_LG_" + this.id + "_ROW" + pi);
    if(this._rowViewable(pi))
      for(k=0;k<this.cols.length;k++)
        domapi.css.removeClass(this._divData.childNodes[k].childNodes[pi], "DA_SELECTION");
    this.selected.deleteItem(j);
    if(!b && this.ondeselectrow)this.ondeselectrow(i);
  }
  // remove all visible row indicator icons
  for(j=0;j<this.selected.length;j++){
    pi = this._physicalIndex(this.selected[j]);
    if(this._rowViewable(pi) && this._divRowbar.childNodes[pi])
      this._divRowbar.childNodes[pi].innerHTML = "";
  }

  if(makeCurrent && this.currentRow > -1){
    pi = this._physicalIndex(this.currentRow);
    if(this._rowViewable(pi) && this._divRowbar.childNodes[i]){
      this._divRowbar.childNodes[i].innerHTML =
        '<img src="' + domapi.theme.skin.lg_rowindicator.src + '">';
//      alert([pi,i])
    }

    pi += (this.doVirtualMode?this._state.toprow:0);
    if(b && !this.rowVisible(pi)){  // row is not visible, attempt to scroll it into view
      if(pi == this._state.toprow && this._state.toprow > 0)
        pi -= this._state.viewablerows;
      pi = domapi.rangeInt(pi, 0, this._state.visiblerows-1);
     // dump(['p', pi, this._state.toprow , this._state.viewablerows])
      this.setTopRow(pi);
    }

    if(b && this.onselectrow)this.onselectrow(this.currentRow);
  }
//  this._assertCellEditor(this.currentCol);
  this._showRowPersistentEditors();
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.getRow = function(i){
  var r = {cells:[]};
  var pi = this._physicalIndex(i);
  for(var k=0;k<this.cols.length;k++)
    r.cells.push(this._divData.childNodes[k].childNodes[pi]);
  return r;
};
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
domapi.comps.listgrid.getVertScrollBarVisible = function(){
  var S = this._state;
  if(!this.doVirtualMode)
    S.vertscrollbarvisible = S.visiblerowsheight > S.viewporth;
  else
    S.vertscrollbarvisible = S.visiblerows != S.viewablerows;
  if(domapi.trace)dump(this.toString()+'.getVerticalScrollBarVisible() = ' + S.vertscrollbarvisible + ' ' + [S.visiblerowsheight, S.viewporth]);
  return S.vertscrollbarvisible;
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.getHorzScrollBarVisible = function(){
  var S = this._state;
  S.horzscrollbarvisible = S.visiblecolswidth > (S.viewportw - (S.vertscrollbarvisible?(S.sbw+2):0));
//  S.horzscrollbarvisible = S.visiblecolswidth > S.viewportw;
  if(domapi.trace)dump(this.toString()+'.getHorzScrollBarVisible() = ' + S.horzscrollbarvisible + ' ' + [S.visiblecolswidth, S.viewportw]);
  return S.horzscrollbarvisible;
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.getHeaderHeight = function(){
  var S = this._state;
  S.headerheight = this.doShowHeader?(this.headerH-(domapi.isGecko?0:0)):0;
  if(domapi.trace)dump(this.toString()+'.getHeaderHeight() = ' + S.headerheight);
  return S.headerheight;
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.getRowbarWidth  = function(){
  var S = this._state;
  S.rowbarwidth = this.doShowRowbar?this.rowbarW:0;
  if(domapi.trace)dump(this.toString()+'.getRowbarWidth() = ' + S.rowbarwidth);
  return S.rowbarwidth;
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.getRowsViewable = function(){
  var S = this._state;
  var r   = 0;
  var rh  = 0;
  var D   = this.data;
  var top = S.toprow;
  var h   = S.viewporth;  // -35 so we never have a partial row at the bottom
  if(S.horzscrollbarvisible)h -= S.sbw;
  var rb = 0;
  if((this.gridlines == "horz") || (this.gridlines == "both"))rb = 1;
  for(var i=top;i<D.rows.length;i++)
    if(!D.rows[i].hidden){
      rh += D.rows[i].h + rb; // +2 for border, top and bottom
//      if(domapi.isIE)rh-=2; // -2 for box model
      if(rh >= h)break;//dump(this._state.viewporth)
      r++;
    }
    //dump([h,rh])
  if(top + r > D.rows.length)
    r = D.row.length - top; // not enough to fill the viewport
  //if(this.doVirtualMode && domapi.isIE && r > 1)r = r - 2;
  S.viewablerows = r;
//  if((domapi.isGecko) && ((this.gridlines == "vert") || (this.gridlines == "none")) && ((top+S.viewablerows+1) < S.visiblerows))
//    S.viewablerows++;
  if(domapi.trace)dump(this.toString()+'.getRowsViewable(V) = ' + S.viewablerows);
  return S.viewablerows;
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.getRowsVisible = function(){
  var S = this._state;
  S.visiblerows = this.data.visibleRowcount();
  if(domapi.trace)dump(this.toString()+'.getRowsVisible() = ' + S.visiblerows);
  return S.visiblerows;
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.setTopRow = function(index){
  this._goboContainer.scrollTop = this.data.visibleRowTop(index);
  this._doscroll();
  this._layoutScroll();
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.getTopRow = function(){
  // only virtualmode should call this
  var i;
  var t    = 0;
  var h    = 0;
  var S    = this._state;
  var trgt = (this.doVirtualMode?S.scrolltop:this._goboContainer.scrollTop) +
             (domapi.isGecko?S.headerheight:S.headerheight); // otherwise last row is not rendered in virtualmode
  var r    = this.data.rows;
  for(i=0;i<r.length;i++)
    if(!r[i].hidden){
      h += r[i].h;
      if(h >= (trgt)){
        S.toprow = t;
        if(domapi.trace)dump(this.toString()+'.getTopRow() = ' + t);
        return S.toprow;
      }
      t++;
    }
  S.toprow = t;
  if(domapi.trace)dump(this.toString()+'.getTopRow() = ' + t);
  return S.toprow;
};
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
domapi.comps.listgrid.setGridlines = function(v){
  if(domapi.trace)dump(this.toString()+'.setGridlines(' + v + ') _inUpdate='+this._inUpdate);
  this.gridlines = v;
  domapi.css.removeClass(this, "GRIDLINES_VERT");
  domapi.css.removeClass(this, "GRIDLINES_HORZ");
  if(v == "both" || v == "horz")domapi.css.addClass(this, "GRIDLINES_HORZ");
  if(v == "both" || v == "vert")domapi.css.addClass(this, "GRIDLINES_VERT");
  if(this.doVirtualMode && !this._inUpdate && this.data.rows.length)this.refresh();
  this._showRowPersistentEditors();
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.addCol = function(arg){
  if(domapi.trace)dump(this.toString()+'.addCol()');
  this.data.addCol(arg);
  if(!this._inUpdate)this.assert();
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.addRow = function(arg,del){
  if(domapi.trace)dump(this.toString()+'.addRow()');
  var isArray  = arg.constructor == Array;
  var isString = arg.constructor == String;
  if(isArray )arg = {cells:arg};
  if(isString)arg = {cells:arg.split(domapi.rVal(del,","))};

  if(isArray || isString)
    for(var i=0;i<arg.cells.length;i++)
      arg.cells[i] = {text:arg.cells[i]};

  this.data.addRow(arg);//domapi.debug.dumpProps(arg.cells[0])
  if(!this._inUpdate)this.assert();
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.deleteRow = function(i){
  if(domapi.trace)dump(this.toString()+'.deleteRow('+i+')');
  this.data.deleteRow(i);
};
//------------------------------------------------------------------------------
domapi.comps.listgrid._positionCellEditor = function(r,c){
  var D = this.data;
  if(r < 0 || c < 0)return false;
  var e,x,y,w,h,C, rh, hh, v;
  try{
    e  = this.cols[D.visibleCol(c)].editControl;
  }catch(E){return false}
  if(!e)return false;
  if(domapi.trace)dump(this.toString()+'._positionCellEditor('+r+','+c+')');
  rw = this.getRowbarWidth();
  hh = this.getHeaderHeight();
  g  = this._goboContainer;
  C  = this._divData.childNodes[c].childNodes[r];
  if(!C)return false;
  x  = this._divData.childNodes[c].offsetLeft + rw + 1 - g.scrollLeft;
  y  = C.offsetTop + hh - g.scrollTop;
  w  = C.offsetWidth  - 3;
  h  = C.offsetHeight - 3;
  // TODO @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@22
  // double check this accuracy
  if((x + w) + g.scrollLeft > (this.offsetWidth - rw)){
    var diffx = g.scrollLeft - this.offsetWidth - rw - w - 10;
    g.scrollLeft += diffx;
    x += diffx;
//    this._layoutScroll();
    this.scrollLeft = 0
  }
  if(e.isDatepicker){w += domapi.theme.border.width*2}
  e.setSize(w,h);
  e.moveTo( x,y);
  v = D.displayText(r, D.visibleCol(c));
  if(e._setValue)
    e._setValue(v);
  else
    e.value = v;
  e.show();
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.editCell = function(){
  if(domapi.trace)dump(this.toString()+'.editCell()');
  this._positionCellEditor(this.currentRow, this.currentRowCell);
  try{
    var e = this._editBox = this.cols[this.data.visibleCol(c)].editControl;
  }catch(E){return false}
  if(!e)return false;
  try{
    e.select();
    e.focus();
  }catch(E){}
  this._divRowbar.childNodes[this.currentRow].innerHTML = '<img src="' + domapi.theme.skin.lg_rowedit.src + '">';
  this._state.inedit = true;
  if(this.onbeginedit)this.onbeginedit();
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.cancelEdit = function(){
  if(domapi.trace)dump(this.toString()+'.cancelEdit()');
  if(!this._state.inedit)return;
  this._editBox.hide();
  this._state.inedit = false;
  this._divRowbar.childNodes[this.currentRow].innerHTML = '<img src="' + domapi.theme.skin.lg_rowindicator.src + '">';
  if(this.oncanceledit)this.oncanceledit();
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.commitEdit = function(){
  if(domapi.trace)dump(this.toString()+'.commitEdit()');
  if(!this._state.inedit)return;
  this._divRowbar.childNodes[this.currentRow].innerHTML = '<img src="' + domapi.theme.skin.lg_rowindicator.src + '">';
  var r = this.currentRow; var c = this.currentCol;
  if(r < 0 || c < 0)return false;
  var e = this._editBox;
  e.hide();
  this._state.inedit = false;
  this.data.rows[r].cells[this.data.visibleCol(c)].value = e.value;
  this._divData.childNodes[c].childNodes[r].innerHTML = e.value;
  if(this.onendedit)this.onendedit();
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.swapCols = function(i,j){
  var k;
  var D  = this.data;
  var c  = this.cols;
  var cc = this._divData.childNodes;
  var P  = domapi._private.listgrid;
  if(i==j)return;
  if(!c[i] || !c[j])return;
  // make sure i is less than j
  if(i>j){var t = i; i = j; j = t;}
  // swap underlying data
  D.swapCols(D.visibleCol(i), D.visibleCol(j));
  // swap col headers and fix indexes
  c[i]._index = j;
  c[j]._index = i;
  c[i].swapNode( c[j]);
  // swap data cols and fix indexes
  cc[i]._index = j;
  cc[j]._index = i;
  cc[i].swapNode(cc[j]);

  if(!this._inUpdate){
    // update css
    for(k=0;k<c.length;k++)
      P.buildColClass(this, k);
    // raise event
    if(this.oncolswap)this.oncolswap(i,j);
  }
};
//------------------------------------------------------------------------------
domapi.comps.listgrid._inResizeRange = function(e,E){
//  if(domapi.trace)dump(this.toString()+'._inResizeRange()');
  if(this.doColResize){
    var b = this.resizeBdr;
    var offX = domapi.isGecko?E.layerX:event.offsetX;
    return offX >= (e.offsetWidth - b);
  }else return false;
};
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
domapi._private.listgrid.buildColClass = function(g, i){
  if(domapi.trace)dump(g.toString()+'.buildColClass(' + g + ', ' + i + ')');
  var d  = g.data;
  var l  = 0;
  var ii = d.visibleCol(i);
  var w  = d.cols[ii].w;
  var a  = d.cols[ii].textAlign;
  for(var j=0;j<i;j++)l += d.cols[d.visibleCol(j)].w;

  with(g._divData.childNodes[i].style){
    width     = w + "px";
    left      = l + "px";
    textAlign = a;
  }

  if(domapi.isStrict && domapi.isIE)w -= 8;

  with(g._divHeader.childNodes[i].style){
    width     = w + "px";
    left      = l + "px";
    textAlign = d.cols[ii].headerAlign;;
  }
  g._showRowPersistentEditor(i);
};
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
domapi._private.listgrid.doscroll = function(E){
  if(domapi.isGecko && !E)return; // this can occur when not in virtual mode
  var e = domapi.findTarget(E,"LISTGRID");if(!e)return;
  if(e._inLayoutScroll)return;
  e._inLayoutScroll = true;
  if(domapi.trace)dump(this.toString()+'.doscroll()');
  if(!e.doVirtualMode){
    e._layoutScroll();
    if(this.onscroll)this.onscroll();
  }else{
    if(e._scrollTimer)clearTimeout(e.scrollTimer);
    e._scrollTimer = setTimeout('document.getElementById("'+e.id+'")._doscroll()', 100);
  }
  e._showRowPersistentEditors();
  e._inLayoutScroll = false;
};
//------------------------------------------------------------------------------
domapi._private.listgrid._doscroll = function(){
  if(domapi.trace)dump(this.toString()+'._doscroll()');
  // this is only used when in virtual mode
  var pi, k;
  var C = this._goboContainer;
  var S = this._state;
  var R = this._divRowbar;
  var f = domapi.theme.fonts.selection.cssColor();
  var s = this.selected;
  if(C.scrollTop != S.scrolltop){
    // remove all visible row indicator icons and selected statuses
    for(j=0;j<s.length;j++){
      pi = this._physicalIndex(s[j]);
      if(this._rowViewable(pi)){
        for(k=0;k<this.cols.length;k++)
          domapi.css.removeClass(this._divData.childNodes[k].childNodes[pi], "DA_SELECTION");
        //domapi.css.removeRule(".DA_LG_" + this.id + "_ROW" + pi);
        if(R.childNodes[pi]) R.childNodes[pi].innerHTML = "";
      }
    }

    S.scrolltop = C.scrollTop;
    this._viewChanged();
    if(S.viewablerows > 0)
      this._renderCells();
      //this._assertRows();

    // replace selected row statues
    for(j=0;j<s.length;j++){
      pi = this._physicalIndex(s[j]);
      if(this._rowViewable(pi)){
        //this["css_row" + pi] = domapi.css.addRule(".DA_LG_" + this.id + "_ROW" + pi, f, false);
        for(k=0;k<this.cols.length;k++)
          domapi.css.addClass(this._divData.childNodes[k].childNodes[pi], "DA_SELECTION");
        if(pi == this.currentRow && R.childNodes[pi])
          R.childNodes[pi].innerHTML =
            '<img src="' + domapi.theme.skin.lg_rowindicator.src + '">';
      }
    }

  }else{
    if(C.scrollLeft != S.scrollleft){
      this._layoutScroll();
      S.scrollleft = C.scrollLeft;
    }
  }
  if(this.onscroll)this.onscroll();
};
//------------------------------------------------------------------------------
domapi._private.listgrid.doheadermouseover = function(E){
  var e = domapi.findTarget(E,"LISTGRID_HEADER_COL"); if(!e)return;
  var r = domapi.findTarget(E,"LISTGRID");
  var p = domapi._private.listgrid;
  if(r._state.inresize|| !r.enabled)return;
  if(r.doRollover && !r._inResizeRange(e,E) && !r._state.inmove){
    domapi.css.addClass(e, "DA_LISTGRID_HEADER_COL_OVER");
  }else p.doheadermouseout(E);
};
//------------------------------------------------------------------------------
domapi._private.listgrid.doheadermousemove = function(E){
  var e = domapi.findTarget(E,"LISTGRID_HEADER_COL");if(!e)return;
  var r = domapi.findTarget(E,"LISTGRID");
  var p = domapi._private.listgrid;
  if(r._state.inresize||!r.enabled)return;
  var s  = e.style;//status = s.cursor
  if(r.doColResize){
    if(r._inResizeRange(e,E) && !r._state.inmove){
      if(s.cursor != domapi.cursors.vertBeam){
        p.doheadermouseout(E);
        s.cursor = domapi.cursors.vertBeam;
      }
    }else{
      if(s.cursor != "default"){
        p.doheadermouseover(E);
        s.cursor = "default";
      }
    }
  }else s.cursor = "default";
};
//------------------------------------------------------------------------------
domapi._private.listgrid.doheadermouseout = function(E){
  var e = domapi.findTarget(E,"LISTGRID_HEADER_COL"); if(!e)return;
  var r = domapi.findTarget(E,"LISTGRID");
  if(r._state.inresize || r._state.inmove)return;
  domapi.css.removeClass(e, "DA_LISTGRID_HEADER_COL_OVER");
};
//------------------------------------------------------------------------------
domapi._private.listgrid.doheadermousedown = function(E){
  var e = domapi.findTarget(E,"LISTGRID_HEADER_COL");
  if(e){
    var r = domapi.findTarget(E,"LISTGRID");
    if(r.enabled && r.doDepress && !r._inResizeRange(e,E))domapi.css.addClass(e, "DA_LISTGRID_HEADER_COL_DOWN");
  }
};
//------------------------------------------------------------------------------
domapi._private.listgrid.doheadermouseup = function(E){
  var e = domapi.findTarget(E,"LISTGRID_HEADER_COL");
  if(e){
    var r = domapi.findTarget(E,"LISTGRID");
    var D = r.data;
    domapi.css.removeClass(e, "DA_LISTGRID_HEADER_COL_DOWN");
    if(r.doColSort && !r._state.inresize && !r._state.inmove){
      var C = D.cols[D.visibleCol(domapi.getNodeIndex(e))];
      if(C && C.sortable){
        C.sortDir = domapi.rInt(C.sortDir, 1);
        C.sortDir = 1 - C.sortDir; // toggle
        if(D.cols[D.sortColIndex])D.cols[D.sortColIndex].sorted=false;

        D.sort(C.fieldName, C.sortDir);
        C.sorted=true;
        r.refresh();
      }
    }
    if(r.onheaderclick)r.onheaderclick(domapi.getNodeIndex(e));
  }
};
//------------------------------------------------------------------------------
domapi._private.listgrid.findCell = function(E){
  var c = domapi.findTarget(E,"DIV");
  while(c){
    if(c.parentNode && c.parentNode.DA_TYPE && c.parentNode.DA_TYPE == "LISTGRID_COL")
      return c;
    else c = c.parentNode;
  }
  return null;
};
//------------------------------------------------------------------------------
domapi._private.listgrid.scanForSelections = function(){
  this._selected = [];
  for(var i=0;i<this.data.rows.length;i++)
    if(this.data.rows[i].selected)this._selected.push(i);
};
//------------------------------------------------------------------------------
domapi._private.listgrid.dodataclick = function(E){
  var r        = domapi.findTarget(E,"LISTGRID");
  var shiftKey = domapi.isIE?event.shiftKey:E.shiftKey;
  var ctrlKey  = domapi.isIE?event.ctrlKey :E.ctrlKey;
  var c        = domapi._private.listgrid.findCell(E);
  if(!r || !c || !r.enabled)return;
  if(domapi.trace)dump(r.toString()+'.dodataclick()');
  var C = c.parentNode;
  var x = C._index;
  var y = domapi.getNodeIndex(c) + (r.doVirtualMode?r._state.toprow:0);
  var i = r._physicalIndex(r.currentRow);
  if(r._rowViewable(i) && r._divRowbar.childNodes[i])r._divRowbar.childNodes[i].innerHTML = '';
  var rowChanged = y != r.currentRow;
  var colChanged = x != r.currentCol;
  var oldRow     = r.currentRow;
  if(rowChanged || colChanged)r.cancelEdit();
  r.currentRow   = y;
  r.currentCol   = x;
  if((!(shiftKey || ctrlKey) && r.doMultiSelect) || !r.doMultiSelect)r.selectNone(); // clear current selection

  if((ctrlKey && r.selected.indexOf(y)>-1) && (r.doAllowNoSelect || r.selected.length>1)){
    r.selectRow(y,false);
    return;
  }

  if(shiftKey && r.doMultiSelect && r.currentRow > -1){
    var y1,y2;
    if(oldRow < y){
      y1 = oldRow;
      y2 = y;
    }else{
      y1 = y;
      y2 = oldRow;
    }
    for(var i=y1;i<=y2;i++)
      if(i != y)r.selectRow(i, true, true); // don't select current row, it's done on the next line
  }

  r.selectRow(y, true, true);
  if(!rowChanged && !colChanged){
    if(r.enabled && r.doAllowEdit && r.data.cols[r.data.visibleCol(x)].editable){
      if(r.onallowedit && !r.onallowedit(x))return;
      r.editCell();
    }
  }
//  r._assertCellEditor(r.currentCol);
};
//------------------------------------------------------------------------------
domapi._private.listgrid.dokeydown = function(E){
  var k   = domapi.isIE?event.keyCode:E.which;
  var e = domapi.getTarget(E);
  var r = e._daowner;
  if(!r)r = domapi.findTarget(E, "LISTGRID");
  var x   = r.currentCol;
  var D   = r.data;
  var eat = false;
  var i;
  var shiftKey = domapi.isIE?event.shiftKey:E.shiftKey;
  var ctrlKey  = domapi.isIE?event.ctrlKey :E.ctrlKey;
  if(!r.enabled)return;
  if(domapi.trace)dump(this.toString()+'.dokeydown('+k+')');
  if(k == 113 && r.enabled && r.doAllowEdit && D.cols[D.visibleCol(x)].editable){  // F2
    if(r.onallowedit && !r.onallowedit(x))return;
    r.editCell();
    eat = true;
  }
  if(k == 27 && r._state.inedit)r.cancelEdit(); // ESC
  if(k == 13 && r._state.inedit)r.commitEdit(); // RETURN
  if(!r._state.inedit){
    if(k == 33 || k == 34){ // PAGE UP/ DOWN
      if(k == 33)i = r.currentRow - r._state.viewablerows;
      if(k == 34)i = r.currentRow + r._state.viewablerows;
      r.selectNone();
      r.currentRow = domapi.rangeInt(i, 0, r._state.visiblerows-1);
      r.selectRow(r.currentRow, true, true);
      eat = true;
    }
    if(k == 35 && ctrlKey){ // CTRL+END
      r._goboContainer.scrollTop = D.visibleRowsHeight();
      r._layoutScroll();
      r.selectNone();
      r.currentRow = D.rows.length-1;
      r.selectRow(r.currentRow, true, true);
    }
    if(k == 35 && !ctrlKey)r.currentCol = r.cols.length-1; // END
    if(k == 36 && ctrlKey){ // CTRL+HOME
      r._goboContainer.scrollTop = 0;
      r._layoutScroll();
      r.selectNone();
      r.currentRow = 0;
      r.selectRow(r.currentRow, true, true);
    }
    if(k == 36 && !ctrlKey){r.currentCol = 0;eat = true;} // HOME
    if(k == 37 && r.currentCol > 0){r.currentCol--;eat = true;/*r._assertCellEditor(r.currentCol);*/} // LEFT
    if(k == 38 && r.currentRow>0){  // UP
      if((!(shiftKey || ctrlKey) && r.doMultiSelect) || !r.doMultiSelect)r.selectNone();
      r.currentRow--;
      r.selectRow(r.currentRow, true, true);
      eat = true;
    }
    if(k == 39 && r.currentCol < (r.cols.length-1)){r.currentCol++;eat = true;/*r._assertCellEditor(r.currentCol);*/} // RIGHT
    if(k == 40 && r.currentRow<D.rows.length-1){// DOWN
      if(r._state.inedit)r.cancelEdit();
      if((!(shiftKey || ctrlKey) && r.doMultiSelect) || !r.doMultiSelect)r.selectNone();
      r.currentRow++;
      r.selectRow(r.currentRow, true, true);
      eat = true;
    }
    if(k == 65 && ctrlKey && r.doMultiSelect){r.selectAll();eat = true;} // CTRL+A
    if(k == 27){r.selectNone();r.selectRow(r.currentRow, true, true);} // ESC
  }
  // if we are not editing, eat the keystrokes
  if(eat){
    if(E && E.preventDefault)E.preventDefault();
    return false;
  }
  //alert(k)
};
//------------------------------------------------------------------------------
domapi._private.listgrid._docbclick = function(e){
  // fires when a checkbox is clicked, 'e' is the checkbox
  var R = domapi.findParent(e,"LISTGRID");
  if(!R || !e || !R.enabled || R._state.inedit)return;
  var enabled = e.src.indexOf('enabled') > -1;
  var checked = e.src.indexOf('checked') > -1;
  var grayed  = e.src.indexOf('grayed' ) > -1;
  if(!enabled)return;

  var r = R.currentRow;
  var c = R.currentCol;
  if(r < 0 || c < 0)return;

  if(checked)e.src = e.src.replace(new RegExp("checked"), "cleared");
  else if(grayed )e.src = e.src.replace(new RegExp("grayed"), "checked");
  else e.src = e.src.replace(new RegExp("cleared"), "checked");

  var _cell = R.data.rows[r].cells[R.data.visibleCol(c)];
  switch(_cell.value){ // attempt to maintain case
    case true    : _cell.value = false;   break;
    case false   : _cell.value = true;    break;
    case 1       : _cell.value = 0;       break;
    case 0       : _cell.value = 1;       break;
    case "true"  : _cell.value = "false"; break;
    case "True"  : _cell.value = "False"; break;
    case "TRUE"  : _cell.value = "FALSE"; break;
    case "false" : _cell.value = "true";  break;
    case "False" : _cell.value = "True";  break;
    case "FALSE" : _cell.value = "TRUE";  break;
    case "yes"   : _cell.value = "no";    break;
    case "Yes"   : _cell.value = "No";    break;
    case "YES"   : _cell.value = "NO";    break;
    case "no"    : _cell.value = "yes";   break;
    case "No"    : _cell.value = "Yes";   break;
    case "NO"    : _cell.value = "YES";   break;
  }
  if(R.onendedit)R.onendedit();
};
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
// drag-n-drop support
//------------------------------------------------------------------------------
domapi.comps.listgrid.ondragallow = function(arg){
  var e = domapi.findParent(domapi.customDrag.elm, "LISTGRID_HEADER_COL");
  var C = domapi.customDrag;
  var p = C.container;
  C.dragThreshold = 4;
  C.col = e;
  if(!e || !p || !p.enabled || p._state.inresize || p._state.inmove)return false;
  if(p._inResizeRange(e, arg.E) && p.doColResize){
    p._state.inresize = true;
    p._WantinMove     = false;
    p._resizeIndex    = e._index;
    C.dragThreshold   = 0;
    C.startX          = e.offsetLeft + e.offsetWidth;//e.getX() + e.getW();
    return true;
  }
  if(!p._inResizeRange(e, arg.E) && p.doColMove && !p._state.inresize && !p._state.inmove){
    p._WantinMove = true;
    p._moveIndex  = e._index;
    C.startX      = e.offsetLeft + e.offsetWidth;//e.getX() + e.getW();
    for(var i=0;i<p.cols.length;i++)
      if(p.cols[i] != e)
        domapi.css.removeClass(p.cols[i], "DA_LISTGRID_HEADER_COL_OVER");
    return true;
  }

  p.style.cursor = "default";
  e.style.cursor = "default";
  return false;
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.ondragstart = function(arg){
  var C = domapi.customDrag;
  var p = C.container;
  if(p._WantinMove)p._state.inmove = true;
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.ondragmove = function(arg){
  var e = domapi.findParent(arg.source, "LISTGRID_HEADER_COL");if(!e)return;
  var C = domapi.customDrag;
  var p = C.container;
  if(p._state.inresize){
    var b = p._resizebar;
    if(!b.showing){
      b.show();
      b.showing = true;
      b.setH(p.getH());
      b.setY(0);
    }
    C.colX = arg.dX + C.startX + 2;
    if(C.colX - e.offsetLeft < p.minColWidth){
      C.colX = e.offsetLeft + p.minColWidth;
    }

    b.setX(C.colX - p._goboContainer.scrollLeft /*- p.getRowbarWidth()*/);
  }
  if(p._state.inmove){
    var g = p._ghost;
    if(!g.showing){
      g.innerHTML = C.col.innerHTML;
      g.show();
      g.showing = true;
      g.setSize(C.col.offsetWidth, C.col.offsetHeight);
      g.setY(0);
    }
    C.colX = arg.dX + C.startX - (C.col.offsetWidth / 1);
   // if(C.colX - e.offsetLeft < p.minColWidth){
   //   C.colX = e.offsetLeft + p.minColWidth;
   // }
    g.setX(C.colX - p._goboContainer.scrollLeft /*- p.getRowbarWidth()*/);
  }
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.ondragend = function(arg){
  if(domapi.trace)dump(this.toString()+'.ondragend()');
  var i;
  var C = domapi.customDrag;
  var p = C.container; // the root grid
  var c = p.cols;
  var D = p.data;
  if(p._state.inresize){
    var e = C.col; if(!e)return;
    p._state.inresize = false;
    p._resizebar.hide();
    p._resizebar.showing = false;
    p.style.cursor       = "default";
    e.style.cursor       = "default";

    D.cols[D.visibleCol(e._index)].w += (C.cursorX - C.cursorStartX);
    if(D.cols[D.visibleCol(e._index)].w < p.minColWidth)D.cols[D.visibleCol(e._index)].w = p.minColWidth;

    for(i=e._index;i<c.length;i++)
      domapi._private.listgrid.buildColClass(p, i);
    p.layout();
    return;
  }
  if(p._state.inmove){
    var x, curI, newI;
    var g     = p._ghost;
    p._state.inmove = false;
    p._showRowPersistentEditors();
    if(!g.showing)return;
    g.showing = false;
    g.hide();
    // cleanup css
    for(var i=0;i<c.length;i++)
      domapi.css.removeClass(c[i], "DA_LISTGRID_HEADER_COL_OVER");
    // Find out where the ghost is located in relation to cells.
    // If the ghost seems to be between two cells, and neither of them is the
    // target cell, then place the target between them.
    // If ghost is infront of first cell, move the target to the beginning.
    // If ghost is past the last one, move it to the end.
    x    = g.getX();
    curI = p._moveIndex;
    newI = curI;
    if(x<0)newI = 0; // before first
    if(x>c[c.length-1].offsetLeft)newI = c.length-1; // past last
    for(i=0;i<c.length-1;i++) //  <--- intentionally one less then length
      if((x>c[i].offsetLeft)&&(x<c[i].offsetLeft+c[i].offsetWidth)){
        newI = i+1;
        break;
      }
    if(newI != curI){
      p.beginUpdate();
      var dir = (curI < newI)?1:-1;
      while(newI != curI){
        p.swapCols(curI, curI + dir);
        curI += dir;
        if((newI - curI) == 1)break;
      }
      p.endUpdate();
      // update css
      var P = domapi._private.listgrid;
      for(k=0;k<c.length;k++)
        P.buildColClass(this, k);
      // raise event
      if(this.oncolswap)this.oncolswap(i,j);
    }
  }
};
//------------------------------------------------------------------------------

//******************************************************************************
// utility functions
//******************************************************************************
// JSON support
//------------------------------------------------------------------------------
domapi.comps.listgrid.loadFromJson = function(json){this._loadFromJson(json)};
//------------------------------------------------------------------------------
domapi.comps.listgrid._loadFromJson = function(json){
  var D = this.data;
  if(domapi.trace)dump(this.toString()+'._loadFromJson()');
  this.clear();
  //this._state.toprow = 0;//this.refresh();this.assert();
  D.loadFromJson(json, true); // true for silent
  if(D.rows.length > 0)this.currentRow = 0;
  if(D.cols.length > 0)this.currentCol = 0;
  //this._state.toprow = 0;
  this.refresh();
  if(!this.doAllowNoSelect && this.currentRow == 0)
    setTimeout('document.getElementById("'+this.id+'").selectRow(0,true,true)',250); // needs to processMessages
//  this._layoutScroll();
//  this.refresh();
  //this.assert();
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.loadFromJsonUrl = function(url){this._loadFromJsonUrl(url)};
//------------------------------------------------------------------------------
domapi.comps.listgrid._loadFromJsonUrl = function(url){
  if(domapi.trace)dump(this.toString()+'._loadFromJsonUrl("'+url+'")');
  var j = domapi.urlToJson(url);
  this.loadFromJson(j);
};
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// CSV support
//------------------------------------------------------------------------------
domapi.comps.listgrid.loadFromCsv = function(s){this._loadFromCsv(s)};
//------------------------------------------------------------------------------
domapi.comps.listgrid._loadFromCsv = function(s){
  var D = this.data;
  if(domapi.trace)dump(this.toString()+'._loadFromCsv()');
  this.clear();
  D.loadFromCsv(s, true); // true for silent
  if(D.rows.length > 0)this.currentRow = 0;
  if(D.cols.length > 0)this.currentCol = 0;
  this.refresh();
  if(!this.doAllowNoSelect && this.currentRow == 0)
    setTimeout('document.getElementById("'+this.id+'").selectRow(0,true,true)',10); // needs to processMessages
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.loadFromCsvUrl = function(url){this._loadFromCsvUrl(url)};
//------------------------------------------------------------------------------
domapi.comps.listgrid._loadFromCsvUrl = function(url){
  if(domapi.trace)dump(this.toString()+'._loadFromCsvUrl("'+url+'")');
  var j = domapi.urlToCsv(url);
  this.loadFromCsv(j);
};
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// XML support
//------------------------------------------------------------------------------
domapi.comps.listgrid.loadFromXml = function(xmlobj, nodeNm){this._loadFromXml(xmlobj)};
//------------------------------------------------------------------------------
domapi.comps.listgrid._loadFromXml = function(xmlobj, nodeNm){
  var D = this.data;
  if(domapi.trace)dump(this.toString()+'._loadFromXml()');
  this.clear();
  D.loadFromXml(xmlobj, nodeNm, true); // true for silent
  if(D.rows.length > 0)this.currentRow = 0;
  if(D.cols.length > 0)this.currentCol = 0;
  this.refresh();
  if(!this.doAllowNoSelect && this.currentRow == 0)
    setTimeout('document.getElementById("'+this.id+'").selectRow(0,true,true)',10); // needs to processMessages
};
//------------------------------------------------------------------------------
domapi.comps.listgrid.loadFromXmlUrl = function(url, nodeNm){this._loadFromXmlUrl(url, nodeNm)};
//------------------------------------------------------------------------------
domapi.comps.listgrid._loadFromXmlUrl = function(url, nodeNm){
  var D = this.data;
  if(domapi.trace)dump(this.toString()+'._loadFromXmlUrl("'+url+'")');
  this.clear();
  D.loadFromXmlUrl(url, nodeNm, true); // true for silent
  if(D.rows.length > 0)this.currentRow = 0;
  if(D.cols.length > 0)this.currentCol = 0;
  this.refresh();
  if(!this.doAllowNoSelect && this.currentRow == 0)
    setTimeout('document.getElementById("'+this.id+'").selectRow(0,true,true)',10); // needs to processMessages
};
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
domapi._private.listgrid.dumpState = function(G){
  var s = "";
  var b = "</td></tr><br />";
  var S = G._state;
  line = function(n, v){
    return "<tr><td>]" + n + "&nbsp;</td><td>" + v + "</td></tr>";
  };
  s += '<table cellpadding="0" cellspacing="0" border="0">' +
    line("selected",         '['+G.selected+']')         +
    line("currentRow",           G.currentRow)           +
    line("currentCol",           G.currentCol)           +
    line("sbw",                  S.sbw)                  +
    line("viewportw",            S.viewportw)            +
    line("viewporth",            S.viewporth)            +
    line("toprow",               S.toprow)               +
    line("rowbarwidth",          S.rowbarwidth)          +
    line("visiblerows",          S.visiblerows)          +
    line("viewablerows",         S.viewablerows)         +
    line("headerheight",         S.headerheight)         +
    line("scrolltop",            S.scrolltop)            +
    line("scrollleft",           S.scrollleft)           +
    line("visiblerowsheight",    S.visiblerowsheight)    +
    line("visiblecolswidth",     S.visiblecolswidth)     +
    line("vertscrollbarvisible", S.vertscrollbarvisible) +
    line("horzscrollbarvisible", S.horzscrollbarvisible) +
    line("inresize",             S.inresize)             +
    line("inedit",               S.inedit)               +
    line("inmove",               S.inmove)               +
    line("lastheaderclip",   '['+S.lastheaderclip+']')   +
    line("lastdataclip",     '['+S.lastdataclip  +']')   +
    '</table>';
  dump("");
  dump("================= GRID STATE ==================");
  dump(s);
  dump("===============================================");
};
//------------------------------------------------------------------------------
