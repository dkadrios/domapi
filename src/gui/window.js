//==============================================
// DomAPI Window Component
// D. Kadrioski 7/10/2001 (reborn 8/23/2002)
//==============================================
// additional contributors:
// S. Gilligan <simon.gilligan@level11.com.au>
//==============================================

domapi.loadUnit(          "drag");      // for move and resize
domapi.loadUnit(          "label");     // caption is a label
domapi.loadUnit(          "rollover");  // buttons
domapi.loadUnit(          "button");    // dialogs
domapi.registerComponent( "window");

// constants
wbMinimize = 1;
wbMaximize = 2;
wbHelp     = 4;
wbClose    = 8;

mbYes      = 0;
mbNo       = 1;
mbOK       = 2;
mbCancel   = 3;
mbAbort    = 4;
mbRetry    = 5;
mbIgnore   = 6;
mbAll      = 7;
mbNoToAll  = 8;
mbYesToAll = 9;
mbHelp     = 10;

mrYes      = 0;
mrNo       = 1;
mrOK       = 2;
mrCancel   = 3;
mrAbort    = 4;
mrRetry    = 5;
mrIgnore   = 6;
mrAll      = 7;
mrNoToAll  = 8;
mrYesToAll = 9;
mrHelp     = 10;

mtWarning      = 0;
mtError        = 1;
mtInformation  = 2;
mtConfirmation = 3;

domapi.Window = function(arg){return domapi.comps.window.constructor(arg)};
//------------------------------------------------------------------------------
domapi.comps.window.constructor = function(arg){
  var p = domapi._private.window;
  if(!p.globalsCreated)p.createGlobals();

  var e      = domapi.Component(arg, "window");
  e.buttons  = [];
  e.titleBar = domapi.Label({parent:e,x:0,y:0,w:10,h:e.titleBarHeight});
  e.controls = domapi.Elm({parent:e,x:0,y:0,w:10,h:10});
  e.controls.notDraggable = true;
  e.titleBar.style.cursor = "default";
  if(e.doCreateButtons){
    if ( arg.visibleButtons & wbMinimize )		// Scientist: added button checks
      e.addButton({btnType:"MINIMIZE", hint:domapi.getString("WINDOW_MINIMIZE")});
    if ( arg.visibleButtons & wbMaximize )
      e.addButton({btnType:"MAXIMIZE", hint:domapi.getString("WINDOW_MAXIMIZE")});
    if ( arg.visibleButtons & wbClose ){
      if(domapi.theme.name != "aqua")e.addButton({btnType:"SEPARATOR"});
      e.addButton({btnType:"CLOSE",    hint:domapi.getString("WINDOW_CLOSE"   )});
    }
  }

  e.workspace = domapi.Elm({parent:e,type:arg["windowType"]});
  if(arg["windowType"] == "IFRAME"){
    e.workspace.src         = "about:blank";
    e.workspace.border      = 0;
    e.workspace.frameBorder = 0;
  }
  //---------
  e.isOpen      = true;
  e.isMinimized = false;
  e.isMaximized = false;
  e.setText(         arg["text"]);
  e.setCaptionAlign( arg["captionAlign"]);
  e.onresize    = function(){};
  e.onmove      = function(){};
  //-----
  e.restorePoint = {
    x : 0, y : 0,
    w : 0, h : 0,
    doAllowMove   : true,
    doAllowResize : true
  };
  //-----
  e.allowMove(   e.doAllowMove  );
  e.allowResize( e.doAllowResize);
  domapi.addEvent( e,         "mousedown", p.dowindowclicked);
  domapi.addEvent( e.titleBar,"mousedown", p.dowindowclicked);
  domapi.addEvent( e,         "dblclick",  p.dotitledblclick);
  //do not use addEvent event for these next two, doesn't work quite right
  e.onmouseover = e.mouseOverFrame;
  e.onmouseout  = e.mouseOutFrame;
  domapi.addEvent( e.workspace,"dblclick",domapi.preventBubble);
  domapi.addEvent( e.workspace,"mousedown", p.dowindowclicked);


  // sg - gecko on osx lets osx scrolls bars bleed through the window
  // title bar and background, when a window is placed over a scroll bar.
  // setting the overflow to auto fixes this, but then needs a second
  // fix to prevent scroll bars appearing on window resize (see _layout)
  if (domapi.isGecko && domapi.platform==ptMacintosh) e.style.overflow="auto";

  e.setActive();
  domapi._finalizeComp( e);
  if(e.doCreateButtons)e.drawAndLayout(); // @@@@@@@@@@@@@@@@@@@@@@ TODO
      ////   @@@@@@@@@@@@@@@@ find more efficient way to get initial layout
  e.setModal(e.doModal);

  return e;
};
//------------------------------------------------------------------------------
domapi.comps.window._draw = function(arg){
  this.windowDraw();
};
//------------------------------------------------------------------------------
domapi.comps.window.windowDraw = function(){
  var t             = domapi.theme;
  var s             = this.style;
  var f             = t.fonts;
  s.borderStyle     = t.border.solid;
  this.setB(          parseInt(t.border.width));
  s.borderColor     = t.border.getOutset();
  s.backgroundColor = f.buttonface.bgcolor;

  s                 = this.titleBar.cell.style;
  s.font            = f.activecaption.asString();
  s.backgroundColor = f.buttonface.bgcolor;
  s.color           = f.buttonface.color;
  s.fontWeight      = "bold";
  s.padding         = "0px "+this.titlePadding*2+"px";

  this.titleBar.setVerticalAlign( "middle");

  s                 = this.workspace.style;
  s.font            = f.window.asString();
  s.backgroundColor = f.window.bgcolor;
  s.color           = f.window.color;
  s.scrolling       = "auto";
  if(this.workspace.tagName!="IFRAME")s.overflow = "auto";
  s.borderStyle     = t.border.solid;
  this.workspace.setB(t.border.width);
  s.borderColor     = t.border.getInset();

  this.setActive();
};
//------------------------------------------------------------------------------
domapi.comps.window._layout = function(w,h){
  var controlW = this.layoutButtons();
  this.controls.setSize(controlW,this.btnH);

  var t  = this.titleBar;
  var p  = this.titlePadding;
  this.titleBar.moveTo(domapi.isIE?0:p,domapi.isIE?0:p);
  this.titleBar.setSize(w-p*(domapi.isIE?1:3),this.titleBarHeight);
  this.titleBar.cell.style.height = this.titleBarHeight + "px";
  var ch = (t.style.display=="none")?0:this.titleBarHeight;
  var b  = domapi.theme.border.width*2;
  if(!this.isMinimized){
    var ww = w-b-p*2-1;
    var wh = h-b-ch-p*3-1;
    if(domapi.isIE && this.workspace.tagName=="IFRAME"){
      ww -= 2;
      wh -= 2;
    }
    this.workspace.setSize(ww, wh);
  }
  this.workspace.moveTo(p,ch+p+p);
  //-----
  if(t.style.display!="none"){
    var y   = parseInt(this.titleBarHeight/2 - this.btnH/2) + 2;
    var caw = w - controlW-p*3;

    //-----
    if(this.controlsAlign=="left"){
      this.controls.moveTo(     p*2+1,y);
    }else if(this.controlsAlign=="right"){
      this.controls.moveTo(     caw,y);
    }
  }
  // sg - part 2 of gecko/osx scrollbar fix
  if (domapi.isGecko && domapi.platform==ptMacintosh) {
     this.style.overflow="scroll";
     this.style.overflow="auto";
  }
};
//------------------------------------------------------------------------------
//Autosize the window to fit workspace
domapi.comps.window.adjustSize = function(){ // P. Fricard
  var w  = this.workspace;
  var t  = this.titleBar;
  var p  = this.titlePadding;
  var ch = (t.style.display=="none")?0:this.titleBarHeight;
  var b  = domapi.theme.border.width * 2;
  var ww = w.scrollWidth + (b + p) * 2;
  var wh = w.scrollHeight + b * 2 + ch + p * 3;
  this.setSize(ww, wh);
  this.workspace.style.overflow = "scroll";
  this.workspace.style.overflow = "auto";
};
//------------------------------------------------------------------------------
domapi.comps.window.layoutButtons = function(){
  if(!this.doCreateButtons || this.buttons.length < 1)return 0;
  var b = this.buttons;
  var x = 0;
  var w;
  for(var i=0;i<b.length;i++)
    if(b[i].separator){
      x += this.separatorW;
    }else
      if(b[i].style.display!="none"){
        w = b[i].getW();
        b[i].moveTo(x,0);
        x += w+1;
      }
  return x;
};
//------------------------------------------------------------------------------
domapi.comps.window.addButton = function(arg){
  if(!arg["src"]){
    //fill it in based on arg.btnType
    arg["src"] = domapi.theme.skin["window_" + arg.btnType.toLowerCase()];
  }
  //domapi.debug.dump_props(domapi.theme.skin)
  arg.parent = this.controls;
  arg.count  = 4;
  arg.x      = 0;
  arg.y      = 0;
  domapi._assert(arg, "w", this.btnW);
  domapi._assert(arg, "h", this.btnH);
  if(arg.btnType != "SEPARATOR"){
    /*var e = domapi.Rollover(arg);*/
    arg["type"] = "IMG";
    var e = domapi.Elm(arg);
    e.btnType  = arg.btnType;
    e.src   = arg.src;
    e.title = arg.hint;
    domapi.addEvent(e,"click",domapi._private.window.dobuttonclick);
    e.notDraggable = true;
    e.ondragstart = domapi._nullFunction;
    this.buttons.push(e);
  }else this.buttons.push({separator:true});
};
//------------------------------------------------------------------------------
domapi.comps.window.setActive = function(){
  var t = domapi.theme;
  var f = t.fonts;
  var b = domapi.bags.window;
  for(var a=0;a<b.length;a++)
    if(b[a]==this){
      this.active = false;
      this.titleBar.cell.style.backgroundColor = f.activecaption.bgcolor;
      this.titleBar.cell.style.color           = f.activecaption.color;
      if(this.onactivate)this.onactivate();
      if(this.parentNode && !this.indrag)
        this.bringToFront();
    }else{
      b[a].active = false;
      b[a].titleBar.cell.style.backgroundColor = f.inactivecaption.bgcolor;
      b[a].titleBar.cell.style.color           = f.inactivecaption.color;
      if(b[a].ondeactivate)b[a].ondeactivate();
    }
  this.active = true;
};
//------------------------------------------------------------------------------
domapi.comps.window.setModal = function(b){
  var S = domapi._private.window._shield;
  if(b){
    S.setZ(this.getZ());
    S.showing = true;
    S.show();
  }else if(this.doManageShield){
    S.hide();
    S.showing =  false;
  }
  this.doModal = b;
};
//------------------------------------------------------------------------------
domapi.comps.window.allowMove = function(b){
  var p = domapi._private.window;
  if(b)this.titleBar.turnOnDrag(
    this,
    domapi.drag.dtCustom,
    null,
    p.moveDragStart,p.moveDragMove,p.moveDragEnd);
  else this.titleBar.turnOffDrag();
  this.doAllowMove = b;
};
//------------------------------------------------------------------------------
domapi.comps.window.allowResize = function(b){
  var p = domapi._private.window;
  if(b)this.turnOnDrag(null,domapi.drag.dtCustom,5,p.resizeDragStart,p.resizeDragMove,p.resizeDragEnd);
  else this.turnOffDrag(this);
  this.doAllowResize = b;
};
//------------------------------------------------------------------------------
domapi.comps.window.resized = function(){
  if(this.onresized)this.onresized();
};
//------------------------------------------------------------------------------
domapi.comps.window.mouseOverFrame = function(E){
  // this algorithm inspired by a work on brainjar.com
  //if(!this.active)return false;
  //domapi.preventBubble(E);
  var b = this.resizeBdr;
  if(this.isMinimized||this.isMaximized||this.indrag||!this.doAllowResize)return;
  if(domapi.getTarget(E)!=this)return;
  var xOff = domapi.isIE?window.event.offsetX:E.layerX;
  var yOff = domapi.isIE?window.event.offsetY:E.layerY;

  this.resizeDir = "";
  if(yOff<=b)this.resizeDir += "n";
  else if(yOff>=this.offsetHeight-b)this.resizeDir += "s";

  if(xOff<=b)this.resizeDir += "w";
  else if(xOff>=this.offsetWidth -b)this.resizeDir += "e";

  if(this.resizeDir==""){this.onmouseout(E);return}

  var s = this.resizeDir + "-resize";
  if(domapi.isIE && document.body.style.cursor != s)document.body.style.cursor = s;
  if(domapi.isGecko && this.style.cursor != s)this.style.cursor       = s;
};
//------------------------------------------------------------------------------
domapi.comps.window.mouseOutFrame = function(E){
  if(this.indrag)return;
 // domapi.preventBubble(E);
  if(domapi.isIE && document.body.style.cursor != "")document.body.style.cursor = "";
  if(domapi.isGecko && this.style.cursor != "")this.style.cursor       = "";
  return;
};
//------------------------------------------------------------------------------
domapi.comps.window.setText = function(text){
  this.titleBar.setText(text);
};
//------------------------------------------------------------------------------
domapi.comps.window.setCaptionAlign = function(a){
  this.titleBar.setTextAlign(a);
};
//------------------------------------------------------------------------------
domapi.comps.window.showTitleBar = function(b){
//  this.titleBar.style.display = b?"block":"none";
  this.resized();
};
//------------------------------------------------------------------------------
domapi.comps.window.transferElm = function(e){
  var t = this.workspace;
  if(t.tagName!="IFRAME") domapi.transferElm(e, t);
};
//------------------------------------------------------------------------------
domapi.comps.window.loadURL = function(url){
  var e = this.workspace;
  if(e.tagName=="IFRAME"){
    e.src = domapi.rVal(url,"about:blank");
    this.resized();
    if(this.onloadurl)this.onloadurl();
  }else throw new Error(domapi.getString("WINDOW_NOT_IFRAME"));
};
//------------------------------------------------------------------------------
domapi.comps.window.close = function(){
  //this.style.display = "none"; // causes Firefox to puke
  this.style.visibility = "hidden";
  this.isOpen        = false;
  if(this.doManageShield){
    domapi._private.window._shield.hide();
    domapi._private.window._shield.showing = false;
  }
  if(this.doShadow && this.shadowElm)domapi.shadow._hideShadow(this);
  if(this.onclose)this.onclose();
  if(this.destroyOnClose && !domapi.browser == btFirefox){
    if(this.ondestroy)this.ondestroy();
    this.remove(); // causes Firefox to puke
  }
};
//------------------------------------------------------------------------------
domapi.comps.window.open = function(){
  //this.style.display = "";
  this.style.visibility = "visible";
  this.isOpen        = true;
  if(this.doShadow && this.shadowElm)domapi.shadow._showShadow(this);
  if(this.onopen)this.onopen();
};
//------------------------------------------------------------------------------
domapi.comps.window.minimize = function(){
  if(!this.isOpen || this.isMinimized)return;
  var s = this.style;
  var b = domapi.theme.border.width;
  if(!this.isMaximized){
    this.restorePoint.w = this.getW();
    this.restorePoint.h = this.getH();
    this.restorePoint.x = this.getX();
    this.restorePoint.y = this.getY();
  }
  this.setSize(this.minimizedW, this.titleBarHeight+(this.titlePadding+b*4));
  this.workspace.style.display  = "none";
  this.isMinimized              = true;
  this.isMaximized              = false;
  b = this.buttons;
  for(var i=0;i<b.length;i++)
    if(b[i].btnType == "MAXIMIZE"){
      b[i].btnType  = "RESTORE";
      b[i].title = domapi.getString("WINDOW_RESTORE");
      b[i].hint  = b[i].title;
    }
  this.drawAndLayout();
  if(this.onminimize)this.onminimize();
};
//------------------------------------------------------------------------------
domapi.comps.window.maximize = function(){
  if(!this.isOpen || this.isMaximized)return;

  var p = this.titlePadding * 2;
  if(!this.isMinimized){
    var r = this.restorePoint;
    r.w = this.getW();
    r.h = this.getH();
    r.x = this.getX();
    r.y = this.getY();
    r.doAllowMove   = this.doAllowMove;
    r.doAllowResize = this.doAllowResize;
  }
  this.allowMove(  false);
  this.allowResize(false);

  this.workspace.style.display  = "block";

  this.moveTo(0,0);

  var s = this.parentNode.style;
  if(domapi.browser != btFirefox && s.overflow != "hidden" && s.overflow != "clip")
    s.overflow="auto"; // causes Firefox to puke
  if (this.parent)
    this.setSize(this.parentNode.offsetWidth-p,this.parentNode.offsetHeight-p);
  else
    this.setSize(domapi.bodyWidth(),domapi.bodyHeight());

  this.isMinimized = false;
  this.isMaximized = true;
  b = this.buttons;
  for(var i=0;i<b.length;i++)
    if(b[i].btnType == "MAXIMIZE"){
      b[i].btnType  = "RESTORE";
      b[i].title    = domapi.getString("WINDOW_RESTORE");
      b[i].hint     = b[i].title;
      b[i].src      = domapi.theme.skin["window_restore"];
    }
  this.drawAndLayout();
  if(this.onendresize)this.onendresize();
  if(this.onmaximize)this.onmaximize();
};
//------------------------------------------------------------------------------
domapi.comps.window.restore = function(){
  if (!this.isOpen || !(this.isMinimized || this.isMaximized))return;
  //this.makeActive();
  var r = this.restorePoint;
  this.setSize(     r.w,r.h);
  this.moveTo(      r.x,r.y);
  this.allowResize( r.doAllowResize);
  this.allowMove(   r.doAllowMove  );
  this.workspace.style.display = "block";
  this.resized();
  this.isMinimized = false;
  this.isMaximized = false;
  b = this.buttons;
  for(var i=0;i<b.length;i++)
    if(b[i].btnType == "RESTORE"){
      b[i].btnType  = "MAXIMIZE";
      b[i].title    = domapi.getString("WINDOW_MAXIMIZE");
      b[i].hint     = b[i].title;
      b[i].src      = domapi.theme.skin["window_maximize"];
    }
  this.drawAndLayout();
  if(this.onendresize)this.onendresize();
  if(this.onrestore)this.onrestore();
};
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
// private members
//------------------------------------------------------------------------------
domapi._private.window.dobuttonclick = function(E){
  var e = domapi.findTarget(E,"IMG");
  var p = domapi.findTarget(E,"WINDOW");
  if(!e || !p)return;
  switch(e.btnType){
    case "MINIMIZE" :
      p.minimize();
      for(var i=0;i<p.buttons.length;i++)
        if(p.buttons[i].btnType == "RESTORE")
          p.buttons[i].src = domapi.theme.skin["window_restore"];
      break;
    case "MAXIMIZE" :
      p.maximize();
      for(var i=0;i<p.buttons.length;i++)
        if(p.buttons[i].btnType == "RESTORE")
          p.buttons[i].src = domapi.theme.skin["window_restore"];
      break;
    case "RESTORE" :
      p.restore();
      for(var i=0;i<p.buttons.length;i++)
        if(p.buttons[i].btnType == "MAXIMIZE")
          p.buttons[i].src = domapi.theme.skin["window_maximize"];
      break;
    case "CLOSE" :
      p.close();
      break;
    default :
      if(e.fn)e.fn();
  }
};
//------------------------------------------------------------------------------
domapi._private.window.dotitledblclick = function(E){
  var e = domapi.findTarget(E,"WINDOW");if(!e)return;
  var ok = false;
  // if maximize or restore buttons are not shown, do nothing
  for(var i=0;i<e.buttons.length;i++)
    if(e.buttons[i].btnType == "RESTORE" || e.buttons[i].btnType == "MAXIMIZE")ok = true;
  if(!ok)return false;
  if(e.isMinimized)return;
  if(e.isMaximized)e.restore();
  else if(e.doAllowResize)e.maximize();
};
//------------------------------------------------------------------------------
domapi._private.window.dowindowclicked = function(E){
  var e = domapi.findTarget(E,"WINDOW"); if(!e)return;
  if(e.doManageFocus)e.setActive();
  if(domapi.isGecko){ // correct for the Mozilla's 'not focusing a text edit' bug
    e = domapi.findTarget(E,"INPUT");
    if(e){
      if(e.select)e.select();
      if(e.focus)e.focus();
    }
  }
  domapi.preventBubble(E);
  return false;
};
//------------------------------------------------------------------------------
domapi._private.window.resizeDragStart = function(){
  var e = this.elm;    if(!e)return; if(e.indrag)return;
  var w = e.workspace; if(!w)return;
  e.indrag = true;
  e.sX = e.getX(); e.sY = e.getY(); e.sW = e.getW(); e.sH = e.getH();
  e.wX = w.getX(); e.wY = w.getY(); e.wW = w.getW(); e.wH = w.getH();
  if(e.doManageShield){
    var S = domapi._private.window._shield;
    S.setZ(e.getZ() + (e.showContentsWhileDragging?0:1)+1);
    S.show();
    S.showing = true;
  }
  if(!e.showContentsWhileDragging){
    var B = domapi._private.window._resizebox;
    domapi.transferElm(B, e.parentNode);
    //e.hide();
    B.moveTo(e.sX, e.sY);
    B.setSize(e.sW, e.sH);
    B.showing = true;
    B.style.zIndex = e.getZ()+1; // NOT setZ, competes for frontal position in onclick
    B.show();
  }
};
//------------------------------------------------------------------------------
domapi._private.window.resizeDragMove = function(eX,eY,dX,dY){
  var E = this.elm;
  var W = E.workspace;
  var d = E.resizeDir;
  var B = E.showContentsWhileDragging?E:domapi._private.window._resizebox;
  if(!d)return; // not sure how this happens, but it does
  var n = (d.charAt(0) == "n");
  var s = (d.charAt(0) == "s");
  var e = (d.charAt(0) == "e"||d.charAt(1) == "e");
  var w = (d.charAt(0) == "w"||d.charAt(1) == "w");
  if(w){
    dX = -dX; // invert
    B.setX(E.sX-dX);
  }
  if(n){
    dY = -dY; // invert
    B.setY(E.sY-dY);
  }
  if(s||n){
    var h = E.sH+dY;
    if(h>E.minH){B.setH(h);/*W.setH(E.wH+dY)*/}
  }
  if(e||w){
    var w = E.sW+dX;
    if(w>E.minW){B.setW(w);/*W.setW(E.wW+dX)*/}
  }
  E.resized();
  E.onresize();
};
//------------------------------------------------------------------------------
domapi._private.window.resizeDragEnd = function(){
  var E  = this.elm;
  var W  = domapi.findParent(E,"WINDOW");
  var S = domapi._private.window._shield;
  if(W)W = W.workspace;
  E.indrag = false;
  if(!E.showContentsWhileDragging){
    var B = domapi._private.window._resizebox;
    E.moveTo(B.getX(), B.getY());
    E.setSize(B.getW(), B.getH());
    E.show();
    B.showing = false;
    B.hide();
  }
  if(E.doManageShield && !E.doModal){
    S.hide();
    S.showing = false;
  }
  if(E.doModal)E.setZ(S.getZ()+1);
  if(E.onendresize)E.onendresize();
};
//------------------------------------------------------------------------------
domapi._private.window.moveDragStart = function(){
  var e = this.elm;    if(!e)return; if(e.indrag)return;
  var w = e.workspace; if(!w)return;
  e.indrag = true;
  e.sX = e.getX(); e.sY = e.getY(); e.sW = e.getW(); e.sH = e.getH();
  e.wX = w.getX(); e.wY = w.getY(); e.wW = w.getW(); e.wH = w.getH();
  if(e.doManageShield){
    var S = domapi._private.window._shield;
    S.setZ(e.getZ() + (e.showContentsWhileDragging?0:1));
    S.show();
    S.showing = true;
  }
  if(!e.showContentsWhileDragging){
    var B = domapi._private.window._resizebox;
    domapi.transferElm(B, e.parentNode);
    B.moveTo(e.sX, e.sY);
    B.setSize(e.sW, e.sH);
    B.style.zIndex = e.getZ()+1;
  }
};
//------------------------------------------------------------------------------
domapi._private.window.moveDragMove = function(eX,eY,dX,dY){
  var e = this.elm;
  if(!e.showContentsWhileDragging){
    //e.hide();
    var B = domapi._private.window._resizebox;
    B.moveTo(eX, eY);
    B.showing = true;
    B.show();
  }else{
    e.moveTo(eX,eY);
  }
};
//------------------------------------------------------------------------------
domapi._private.window.moveDragEnd = function(){
  var E  = this.elm;
  var W  = domapi.findParent(E,"WINDOW");
  var S = domapi._private.window._shield;
  if(W)W = W.workspace;
  E.indrag = false;
  if(E.onendresize)E.onendresize();
  if(!E.showContentsWhileDragging){
    var B = domapi._private.window._resizebox;
    E.moveTo(B.getX(), B.getY());
    E.setSize(B.getW(), B.getH());
    E.show();
    B.showing = false;
    B.hide();
  }
  if(E.doManageShield && !E.doModal){
    S.hide();
    S.showing = false;
  }
  if(E.doModal)E.setZ(S.getZ()+1);
};
//------------------------------------------------------------------------------
domapi._private.window.createGlobals = function(){
  var p = domapi._private.window;
  // global resize box - shared by all instances
  p._resizebox = domapi.Elm({x:200,y:10,w:100,h:100});
  p._resizebox.setZ(2000);
  p._resizebox.showing   = false;
  p._resizebox.className = "DA_WINDOW_RESIZEBOX";
  p._resizebox.setB(2);
  p._resizebox.hide();
  // global shield - shared by all instances
  p._shield = domapi.Elm({x:0,y:0,w:10,h:10});
  p._shield.setAlpha(0);
  p._shield.style.width  = "100%";
  p._shield.style.height = "100%";
  p._shield.className    = "DA_WINDOW_SHIELD";
  p._shield.showing      = false;
  p._shield.hide();
  p.globalsCreated = true;
  domapi.addEvent(window,"resize",p._onresize,true);
  p._onresize();
};
//------------------------------------------------------------------------------
domapi._private.window._onresize = function(E){
  var p = domapi._private.window;
  if(domapi.isIE && p._shield){
    p._shield.setSize(domapi.bodyWidth(), domapi.bodyHeight());
  }
};
//------------------------------------------------------------------------------
domapi._private.window._dialogClick = function(E){
  var p = domapi._private.window;
  p._modalWindow.modalResult = this.modalResult;
  p._modalWindow.hide();
  p._shield.hide();
  p._shield.showing = false;
  if(p._modalWindow.onclose)p._modalWindow.onclose(this.modalResult);
};
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
domapi.messageDlg = function(arg){
  var p = domapi._private.window;
  var W, i, b, d, w, ww, h, title, kind, path;
  if(!p.globalsCreated)p.createGlobals();
  if(!p._modalWindow){
    // create global instance - only created once, then reused
    p._modalWindow = domapi.Window({x:0,y:0,w:300,h:200,doCreateButtons:false,doAllowResize:false,doManageShield:false});
    var _W = p._modalWindow;
    _W.buttons = [];
    _W.hide();
    _W.workspace.style.borderStyle     = "none";
    _W.workspace.style.backgroundColor = "transparent";
    _W.label = domapi.Elm({parent:_W, x:70, y:30});
    _W.image = document.createElement("IMG");
    _W.appendChild(_W.image);
    _W.image.style.position = "absolute";
    _W.image.style.left     = "15px";
    _W.image.style.top      = "35px";
    _W.image.style.width    = "32px";
    _W.image.style.height   = "32px";
    _W.buttonsDiv = document.createElement("DIV");
    _W.appendChild(_W.buttonsDiv);
    _W.buttonsDiv.style.position  = "absolute";
    _W.buttonsDiv.style.left      = "0px";
    _W.buttonsDiv.style.top       = "100px";
    _W.buttonsDiv.style.textAlign = "center";
  }
  W = p._modalWindow;
  W.onclose = arg.onclose;
  title = domapi.rVal(arg.title, "_not_supplied_");
  kind  = domapi.rInt(arg.kind, mtInformation);
  path = domapi.theme.skin.path + "window/";
  arg.message = String(arg.message).replace(new RegExp("\\n", "g"),"<br />");
  if(title == "_not_supplied_")switch(kind){
    case mtWarning      : title = domapi.getString("DIALOG_WARNING"     ); break;
    case mtError        : title = domapi.getString("DIALOG_ERROR"       ); break;
    case mtInformation  : title = domapi.getString("DIALOG_INFORMATION" ); break;
    case mtConfirmation : title = domapi.getString("DIALOG_CONFIRMATION"); break;
  }
  if(arg.src)W.image.src = arg.src;
  else switch(kind){
      case mtWarning      : W.image.src = path + "mtWarning.gif";      break;
      case mtError        : W.image.src = path + "mtError.gif";        break;
      case mtInformation  : W.image.src = path + "mtInformation.gif";  break;
      case mtConfirmation : W.image.src = path + "mtConfirmation.gif"; break;
    }
  W.setText(title);
  W.label.setText(arg.message);

  while(W.buttons.length > arg.buttons.length){
    W.buttons[W.buttons.length-1].remove();
    W.buttons.length--;
  }
  while(W.buttons.length != arg.buttons.length)
    W.buttons.push(domapi.Button({parent:W.buttonsDiv,w:80}));
  ww = 0;
  for(i=0;i<W.buttons.length;i++){
    b = W.buttons[i];
    switch(parseInt(arg.buttons[i])){
      case mbYes      : b.setText(domapi.getString("DIALOG_YES"));        b.modalResult = mrYes;      break;
      case mbNo       : b.setText(domapi.getString("DIALOG_NO"));         b.modalResult = mrNo;       break;
      case mbOK       : b.setText(domapi.getString("DIALOG_OK"));         b.modalResult = mrOK;       break;
      case mbCancel   : b.setText(domapi.getString("DIALOG_CANCEL"));     b.modalResult = mrCancel;   break;
      case mbAbort    : b.setText(domapi.getString("DIALOG_ABORT"));      b.modalResult = mrAbort;    break;
      case mbRetry    : b.setText(domapi.getString("DIALOG_RETRY"));      b.modalResult = mrRetry;    break;
      case mbIgnore   : b.setText(domapi.getString("DIALOG_IGNORE"));     b.modalResult = mrIgnore;   break;
      case mbAll      : b.setText(domapi.getString("DIALOG_ALL"));        b.modalResult = mrAll;      break;
      case mbNoToAll  : b.setText(domapi.getString("DIALOG_NO_TO_ALL"));  b.modalResult = mrNoToAll;  break;
      case mbYesToAll : b.setText(domapi.getString("DIALOG_YES_TO_ALL")); b.modalResult = mrYesToAll; break;
      case mbHelp     : b.setText(domapi.getString("DIALOG_HELP"));       b.modalResult = mrHelp;     break;
    }
    ww += b.getW() + 5;
  }
  ww-=5;
  d = domapi._textDimension(arg.message);
  d[0] += 140; d[1] += 110;
  w = domapi.rangeInt(d[0], 200, 600);
  h = domapi.rangeInt(d[1], 100, 600);
  if(w < ww)w = ww + 20;
  x = w/2 - ww/2;
  for(i=0;i<W.buttons.length;i++){
    b = W.buttons[i];
    b.moveTo(x, 0);
    b.onclick = p._dialogClick;
    x += b.getW() + 5;
  }
  W.buttonsDiv.style.top = h - 35 + "px";

  W.setSize(w,h);
  W.moveTo(domapi.bodyWidth() / 2 - w / 2, domapi.bodyHeight() / 2 - h / 2);
  p._shield.bringToFront();
  p._shield.show();
  p._shield.showing = true;
  W.bringToFront();
  W.show();
};
//------------------------------------------------------------------------------
