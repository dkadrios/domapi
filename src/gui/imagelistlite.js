//------------------------------------------------------------------------------
// Imagelist lite - a non-elm version of Imagelist
// D. Kadrioski 8/19/2004
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// ImageList allows you to flip through images of the same size arranged in a stack
// excellent for rollovers or storing many image states at once
//------------------------------------------------------------------------------

domapi._private.imagelistlite = {};
domapi.Imagelistlite = function(arg){
  var e         = document.createElement("IMG");
  if(arg["parent"])arg["parent"].appendChild(e);
  else document.body.appendChild(e);
  var s         = e.style;
//  s.position    = "relative";
  s.width       = arg.w + "px";
  s.height      = arg.h + "px";
//  s.display     = "inline";
  e.align       = "top";
  e.border      = "0";
  e.orientation = domapi.rVal(arg["orientation"], "horizontal");
  e.src         = domapi.theme.skin.shim.src;
  s.background  = 'url("' + arg["src"] + '") 0px 0px no-repeat';
  e.DA_TYPE     = "IMAGELISTLITE";
  e.className   = "DA_IMAGELISTLITE";
  e.setIndex    = domapi._private.imagelistlite._setIndex;
  e.setSrc      = domapi._private.imagelistlite._setSrc;
  e.w = arg.w; e.h = arg.h;
  e.setIndex();
  return e;
};
//------------------------------------------------------------------------------
domapi._private.imagelistlite._setSrc = function(src){
  this.style.background  = 'url("' + src + '") 0px 0px no-repeat';
};
//------------------------------------------------------------------------------
domapi._private.imagelistlite._setIndex = function(i){
  i = domapi.rInt(i);
  if(i == this.index)return;
  if(this.orientation == "horizontal")
    this.style.backgroundPosition = (-(i) * this.w) + "px 0px";
  else
    this.style.backgroundPosition = "0px " + (-(i) * this.w) + "px";
  this.index = i;
};
//------------------------------------------------------------------------------
