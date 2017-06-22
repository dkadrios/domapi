domapi.theme = new domapi.Theme("system");
// here you would modify your theme to deviate from system
//------------------------------------------------------------------------------
// Preloaders - this is called after all component preloaders, in response to
// theme.apply().  Use it to deviate from standard component preloaders
//------------------------------------------------------------------------------
domapi.theme.preload = function(){
  var s = domapi.theme.skin;
  if(s.popupmenuNorm)
    s.popupmenuNorm.src = s.path + "popupmenu/normal.jpg";
  if(s.menubarBG)
    s.menubarBG.src     = s.path + "menubar/background.jpg";
};
//------------------------------------------------------------------------------