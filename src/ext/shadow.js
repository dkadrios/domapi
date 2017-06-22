//------------------------------------------------------------------------------
// DomAPI visual shadow routines
// D. Kadrioski 3/7/2002
//------------------------------------------------------------------------------

domapi.shadow      = {};
domapi.useElmHooks = true;

//------------------------------------------------------------------------------
domapi.shadow.dropShadow = function(e,n){
  var i,r;
  n = domapi.rInt(n,3);
  //-------
  if(typeof e.getZ != "function"){
    // apparently the element passed is not an Elm, let's add just the bare minimum of functionality we need
    e.getZ      = domapi.elmProto.getZ;
    e.getW      = domapi.elmProto.getW;
    e.getH      = domapi.elmProto.getH;
    e.getX      = domapi.elmProto.getX;
    e.getY      = domapi.elmProto.getY;
    e._dispHook = domapi.elmProto._dispHook;
    e.setZ = function(z){this.shadowElm.setZ(z-1)};
  }
  //-------
  e.doShadow = true;
  if(!e.shadowElm){
    e.shadowElm = domapi.Elm({type:(domapi.isIE?"DIV":"IMG"), parent:e.parentNode,x:0,y:0,w:10,h:10});
    if(domapi.isIE)
      e.shadowElm.runtimeStyle.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" +
        domapi.theme.skin.shadow.src +
        "',sizingMethod='scale')";
    else
      e.shadowElm.src = domapi.theme.skin.shadow.src;
  }
  e.shadowElm.size = n; // used in moveShadow to determine placement
  e.regHook("setX", domapi.shadow._moveShadow);
  e.regHook("setY", domapi.shadow._moveShadow);
  e.regHook("setW", domapi.shadow._moveShadow);
  e.regHook("setH", domapi.shadow._moveShadow);
  e.regHook("hide", domapi.shadow._hideShadow);
  e.regHook("show", domapi.shadow._showShadow);
  e.regHook("setZ", domapi.shadow._setZShadow);
  domapi.shadow._moveShadow(e);
};
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
// The rest of this unit is all private members
//------------------------------------------------------------------------------
domapi.shadow._moveShadow = function(e){
  if(!domapi.rBool(e.doShadow, true) || !e.shadowElm)return;
  e.shadowElm.setZ(e.getZ()-1);
  e.shadowElm.sizeToElm(e);
  e.shadowElm.moveTo(e.getX() + e.shadowElm.size, e.getY() + e.shadowElm.size);
};
//------------------------------------------------------------------------------
domapi.shadow._hideShadow = function(e){e.shadowElm.style.display = "none"};
//------------------------------------------------------------------------------
domapi.shadow._showShadow = function(e){e.shadowElm.style.display = "inline"};
//------------------------------------------------------------------------------
domapi.shadow._setZShadow = function(e,arg){e.shadowElm.setZ(arg[0]-1)};
//------------------------------------------------------------------------------
