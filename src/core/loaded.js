//------------------------------------------------------------------------------
// DomAPI domapi routines
// D. Kadrioski 3/1/2001
//------------------------------------------------------------------------------
// this unit runs after the entire domapi is loaded
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
domapi.css.init();
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
if(domapi.doSplash){  // remove it
  domapi.splashSlide = function(){
    var e = domapi.getElm("domapi_splash");
    var y = parseInt(e.offsetTop );
    var x = parseInt(e.offsetLeft);
    if(domapi.browser == btSafari)y = -30;
    if(y>-30){
      e.style.top = (y-1)+"px";
      if(domapi.isIE){
        e.style.left  = x + "px";
        e.style.right = "0px";
      }
      setTimeout("domapi.splashSlide()",10);
    }else e.style.visibility="hidden";
  };
  setTimeout("domapi.splashSlide()",2000);
}
//------------------------------------------------------------------------------
domapi._load = function(){
  var e = document.body;
  if(domapi.isStrict)domapi.css.addClass(e, "DA_STRICT" );
  if(domapi.doSkin  )domapi.css.addClass(e, "DA_SKINNED");
  if(domapi.isIE5   )domapi.css.addClass(e, "DA_IE5"    );

  switch(domapi.browser){
    case btIExplore  : domapi.css.addClass(e, "DA_IE"   ); break;
    case btNetscape  : domapi.css.addClass(e, "DA_GECKO"); break;
    case btMozilla   : domapi.css.addClass(e, "DA_GECKO"); break;
    case btChimera   : domapi.css.addClass(e, "DA_GECKO"); break;
    case btFirefox   : domapi.css.addClass(e, "DA_GECKO"); break;
    case btOpera     : domapi.css.addClass(e, "DA_OPERA"); break;
    case btSafari    : domapi.css.addClass(e, "DA_KONQ" ); break;
    case btKonqueror : domapi.css.addClass(e, "DA_KONQ" ); break;
  }

  switch(domapi.platform){
    case ptWindows   : domapi.css.addClass(e, "DA_WIN"  ); break;
    case ptMacintosh : domapi.css.addClass(e, "DA_MAC"  ); break;
    case ptLinux     : domapi.css.addClass(e, "DA_NIX"  ); break;
    case ptUnix      : domapi.css.addClass(e, "DA_NIX"  ); break;
  }
  domapi.pageLoaded = true;
};

domapi.addEvent(window, "unload", domapi._unload, true);

if(domapi.browser == btKonqueror)domapi._load(); // http://bugs.kde.org/show_bug.cgi?id=57913
else domapi.addEvent(window, "load", domapi._load, true);
//------------------------------------------------------------------------------
if(domapi._defLang != "eng")
  domapi.loadLang(domapi._defLang);
delete domapi._defLang;
//------------------------------------------------------------------------------
domapi.loaded = true;
//------------------------------------------------------------------------------
