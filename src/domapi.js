//------------------------------------------------------------------------------
// DomAPI domapi routines
// Darin Kadrioski 3/1/2001
//
// Licensed under the GNU General Public License
// See LICENSE file for details.
//------------------------------------------------------------------------------
// additional contributors:
// O. Conradi <conradi@cs.utwente.nl>
// S. Edwards <simon@gx.nl>
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// NOTE:
// Throughout the library you'll see members prefixed with an underscore.
// these are items that would normally be protected and not published if javascript
// supported such a concept.  Your code should never access these areas.
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// REFERENCE:
// Supported JS error types.
// EvalError      - raised when the eval() functions is used in an incorrect manner;
// RangeError     - raised when a numeric variable exceeds its allowed range;
// ReferenceError - raised when an invalid reference is used;
// SyntaxError    - raised when a syntax error occurs while parsing JavaScript code;
// TypeError      - raised when the type of a variable is not as expected;
// URIError       - raised when the encodeURI() or decodeURI() functions are used in an incorrect manner;
//------------------------------------------------------------------------------


//------------------------------------------------------------------------------
// we need to make sure there is at least one stylesheet on the page
// this will constitute a container for src/css.js
// safari needs this sheet to not be empty in order to register as a valid sheet,
// so we'll insert a dummy rule
//------------------------------------------------------------------------------
if(!document.styleSheets.length)document.write('<style type="text/css">.DA_FIRSTRULE{display:none}<\/style>');
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// array extensions (additional ones in domapiutils.js)
// these are here because this unit needs them
//------------------------------------------------------------------------------
Array.prototype.indexOf = function(v){for(var i=this.length;i>-1;i--)if((typeof this[i]!='undefined') && (this[i] == v))return i; return -1};
//------------------------------------------------------------------------------
Array.prototype.deleteItem  = function(i){
    if(i<0||i>(this.length-1))return; // out of range
    if(i==(this.length-1)){ // drop last item
        this.length--;
        return;
    }
    for(var a=(i+1);a<this.length;a++)
        this[a-1]=this[a];
    this.length--;
};
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// root containers for all domapi related objects.  This effectively reduces
// global namespace usage to only the keyword "domapi"
//------------------------------------------------------------------------------
var domapi                   = {};
domapi.bags                  = {};
domapi.comps                 = {};
domapi._private              = {};
domapi.bags.elms             = [];
domapi._defLang              = "eng";
domapi.bags.elms.isComponent = false;
domapi.urlParams             = {}; // parameters that were included on the script tag or page URL
domapi.unloadHooks           = []; // push functions on this array that you want called on unload
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// global constants
//------------------------------------------------------------------------------
domapi.loaded          = false;    // becomes true when library is fuly loaded
domapi.copyright       = 'Licensed under the GNU General Public License.<br />' +
    'See <a target="_blank" href="LICENSE">LICENSE</a> for terms and conditions.';
domapi.version         = "4.00";
domapi.doSplash        = true;     // NOTE!! Only the architect license allows you to set this to false!
domapi.doUnload        = true;     // turning it off can improve shutdown speeds, at risk of memory leaks (IE)
domapi.doStyleBody     = false;    // turning on allows theme to style whole page (like the examples do)
domapi.doPreloadImages = true;     // turning off can improve startup times, at risk of image flickering (while skinned)
domapi.doSkin          = false;    // some components support skinning - turned off by default
domapi.defaultTheme    = "system"; // default
/*
 NOTE: doSkin, doStyleBody and defaultTheme can be changed externally in the url for the page or in
 the url for domapi[_c].js

 domapi.js:
 <script type="text/javascript" src="domapi/src/domapi.js?skin=true&theme=aqua&styleBody=true"></script>

 url for page:
 some_file.htm?skin=true&theme=aqua&styleBody=true

 domapi.js is processed first, so the url params always can overwrite it
 */
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// manage splash
//------------------------------------------------------------------------------
// ONLY ARCHITECT LICENSES HOLDERS CAN MODIFY THIS SPLASH CODE
if(domapi.doSplash)domapi.doSplash = Math.random()*100 < 26; // splash only appears 25% of the time
if(domapi.doSplash){
    document.write( '<div id="domapi_splash" style="' +
        'background-color:#FFFFE7;' +
        'color:black;' +
        'position:absolute;' +
        (navigator.userAgent.indexOf("MSIE" )>0?'right:18px;':'right:2px;') +
        'top:3px;' +
        'white-space:nowrap;' +
        'border:1px solid black;' +
        'font:8pt arial,helvetica,sans-serif;' +
        'padding:0px 3px;' +
        'margin:0px;' +
        'z-index:1000;' +
        '">DomAPI '+domapi.version+'</div>');
};
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// unit locations - for domapi.loadUnit()
//------------------------------------------------------------------------------
domapi.libs         = ["domapi"];  // units that have been loaded
domapi.libs.coreDir = ["component",
    "corecolor",
    "coreutil",
    "css",
    "elm",
    "lang",
    "loaded",
    "mozillaext"];
domapi.libs.extDir  = ["align",
    "animate",
    "collision",
    "color",
    "cookie",
    "csv",
    "customdrag",
    "drag",
    "flyover",
    "form",
    "form_attach",
    "groups",
    "json",
    "keyboard",
    "more_css",
    "more_themes",
    "nodesort",
    "nodesort2",
    "packer",
    "quicksort",
    "rpccore",
    "reflow",
    "resize",
    "selection",
    "shadow",
    "snap",
    "sysutils",
    "validate",
    "xmlcore",
    "xmldiff"];
domapi.libs.objsDir = ["dataset",
    "list",
    "rpcpacket", // loaded automatically by rpccore
    "theme"];
domapi.libs.debugDir= ["datasetdebug",
    "debugger",
    "domapix",
    "profile"];
// all others are assumed to be in /gui
// you can pass relative paths to loadUnit() to move up or down dirs from /gui
domapi.dropdowns    = ["datepicker",
    "dropdown",
    "combobox"];
//------------------------------------------------------------------------------
domapi.closeAllDropdowns = function(){
    var i,j,bag;
    for(i=0;i<domapi.dropdowns.length;i++){
        bag = domapi.bags[domapi.dropdowns[i]];
        if(bag)
            for(j=0;j<bag.length;j++)
                if(bag[j].opened)bag[j].close();
    }
};
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// unit loading routines
//------------------------------------------------------------------------------
domapi.unitLoaded = function(name){return domapi.libs.indexOf(name)>-1};
//------------------------------------------------------------------------------
domapi.loadUnit   = function(name,_a){
    if(!this.loaded && !_a){
        setTimeout("domapi.loadUnit('" + name + "')", 10);
        return;
    }
    if(domapi.unitLoaded(name))return false; // unit was already loaded, nothing to do
    domapi.libs[domapi.libs.length] = name;
    // load the script
    if(domapi.pageLoaded)
        eval(domapi.getContent(domapi._findUnit(name)));
    else
        document.writeln('<script type="text\/javascript" src="' + domapi._findUnit(name) + '"><\/script>');
};
//------------------------------------------------------------------------------
domapi._findUnit = function(name) {
    var subdir='';
    if(name.indexOf("/") != 0){ // PG - we only want to work out where it is if the path isn't fully specified in name
        // find subdir
        if(domapi.libs.coreDir .indexOf(name)>-1)subdir = "core/"; else
        if(domapi.libs.extDir  .indexOf(name)>-1)subdir = "ext/";  else
        if(domapi.libs.objsDir .indexOf(name)>-1)subdir = "objs/"; else
        if(domapi.libs.debugDir.indexOf(name)>-1)subdir = "debug/";else
            subdir = "gui/";
        name = domapi.libPath + subdir + name;
    }
    // if we are using compression, add the "_c"
    name += (domapi.compressed?"_c":"")+".js";
    return name;
};
//------------------------------------------------------------------------------
domapi._getUnitPath = function(name){ // returns false or the path to the unit
    var i;
    var r    = false;
    //var re   = new RegExp("\/?"+name+"[\._]");
    var re   = new RegExp("\/?"+name+"(_c)?\.js");
    var tags = document.getElementsByTagName("SCRIPT");
    for(var i=0;i<tags.length;i++){
        if (tags[i].src){
            j = tags[i].src.search(re);
            if(j>-1){
                r = j==0?"":tags[i].src.substr(0, j+1);
                if(r && name=="domapi"){
                    domapi.compressed = tags[i].src.search("_c.js") != -1;
                    // parse url (this can be overruled by _processURL)
                    var a = tags[i].src.split("?");
                    var b;
                    if(a.length > 1){
                        a = a[1].split("&");
                        for(var k=0;k<a.length;k++){
                            b = a[k].split("=");
                            if(b.length  > 1)domapi.urlParams[b[0]] = b[1];
                            if(b.length == 1)domapi.urlParams[b[0]] = true;
                        }
                        if(typeof domapi.urlParams["theme"     ] != "undefined")domapi.defaultTheme =  domapi.urlParams["theme"];
                        if(typeof domapi.urlParams["skin"      ] != "undefined")domapi.doSkin       = (domapi.urlParams["skin"]       == "true");
                        if(typeof domapi.urlParams["styleBody" ] != "undefined")domapi.doStyleBody  = (domapi.urlParams["styleBody"]  == "true");
                        if(typeof domapi.urlParams["trace"     ] != "undefined")domapi.trace        = (domapi.urlParams["trace"]      == "true");
                        if(typeof domapi.urlParams["lang"      ] != "undefined")domapi._defLang     = (domapi.urlParams["lang"]       == "eng" );
                        if(typeof domapi.urlParams["lockParams"] != "undefined")domapi.lockParams   = (domapi.urlParams["lockParams"] == "true");
                    }
                }
            }
        }
    }
    return r;
};
//------------------------------------------------------------------------------
domapi.loadTheme = function(nm, path){
    if(arguments.length == 2){
        var p1 = path + nm;
        var p2 = p1;
    }else{
        var p1 = "../../themes/" + nm + "/" + nm;
        var p2 = domapi.libPath + "gui/" + p1;
    }
    domapi.loadUnit(p1, 1);
    document.writeln('<link rel="stylesheet" type="text/css" href="' + p2 + '.css' + '">');
};
//------------------------------------------------------------------------------
domapi.libPath   = domapi._getUnitPath("domapi");   // obviously this unit is loaded if this code executes ;)
domapi.imagePath = domapi.libPath + "images/";
domapi.themePath = domapi.libPath + "../themes/";
document.writeln('<link rel="stylesheet" type="text\/css" href="' + domapi.libPath + 'objs/theme.css">');
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// browser sniffing stuff
//------------------------------------------------------------------------------
// browser types
domapi._bt    = ["Unknown","IExplore","Netscape","Mozilla","Chimera","Opera","Safari","Konqueror","Firefox"];
btUnknown   = 0;
btIExplore  = 1;
btNetscape  = 2;
btMozilla   = 3;
btChimera   = 4;
btOpera     = 5;
btSafari    = 6;
btKonqueror = 7;
btFirefox   = 8;

// platform types
domapi._pt    = ["Unknown","Windows","Macintosh","Linux","Unix"];
ptUnknown   = 0;
ptWindows   = 1;
ptMacintosh = 2;
ptLinux     = 3;
ptUnix      = 4;

domapi._sniff = function(){
    var i,n,hasX;
    var c      = domapi;
    var u      = navigator.userAgent.toUpperCase();
    var v      = navigator.vendor;
    c.platform = ptUnknown;
    c.browser  = btUnknown;
    c.major    = 0;
    c.minor    = 0;

    // find platform
    var t = navigator.platform.toUpperCase().substr(0,3);
    if(t=="WIN")c.platform = ptWindows;  else
    if(t=="MAC")c.platform = ptMacintosh;else
    if(t=="LIN")c.platform = ptLinux;    else
    if(t=="UNI")c.platform = ptUnix;
    // find browser
    if(typeof window.opera != "undefined")c.browser = btOpera;else // only opera has window.opera object
    if(u.indexOf("KONQUEROR")>0)c.browser = btKonqueror;      else
    if(document.all)            c.browser = btIExplore;       else // most likely IE
    if(v == "Firefox")          c.browser = btFirefox;        else
    if(u.indexOf("SAFARI"   )>0)c.browser = btSafari;         else
    if(typeof document.implementation != 'undefined' &&
        typeof document.implementation.createDocument != 'undefined')c.browser = btMozilla; else
    if(u.indexOf("CHIMERA"  )>0)c.browser = btChimera;        else
    if(u.indexOf("NETSCAPE" )>0)c.browser = btNetscape;       else
    if(u.indexOf("GECKO"    )>0)c.browser = btMozilla;

    // find version
    // we'll extract every number out of the userAgent and look for the highest or
    // lowest value based on the browser
    // these are guesses, but it's the closest we can get to having the actual values
    var r = new RegExp("[\(\)\/\;\,\:]", "g");
    var uu = u.replace(r," ").split(" ");
    for(i=uu.length;i>-1;i--){
        uu[i] = String(uu[i]);
        n    = parseFloat(uu[i]);
        hasX = new RegExp("[xX]+");
        if(uu[i].search(new RegExp("[xX]+")) > -1)uu.deleteItem(i);
        else if(isNaN(n))uu.deleteItem(i);
        else if(n > 19)uu.deleteItem(i);
        else uu[i] = n; // for sorting
    }
    uu.sort();
    if(uu.length > 0){
        i = uu.length-1; // use largest number
        if(c.browser == btMozilla || c.browser == btFirefox)i = 0; // use smallest number
        uu      = String(uu[i]).split(".");
        c.major = parseInt(uu[0]);
        if(uu.length>1)
            c.minor = uu[1];
    }

    // create commonly needed shorthand
    c.isGecko =
        (c.browser == btMozilla  ||
        c.browser == btChimera  ||
        c.browser == btNetscape ||
        c.browser == btSafari   || // for the most part we can treat Safari as though it were gecko-based
        c.browser == btFirefox);
    c.isKHTML =
        (c.browser == btSafari   ||
        c.browser == btKonqueror);
    c.isIE     = (c.browser == btIExplore);
    c.isNS     = (c.browser == btNetscape); // deprecated, use isGecko instead
    c.isIEMac  = (c.platform == ptMacintosh && c.isIE);
    c.isIE5    = (c.isIE    && c.major == 5);
    c.isIE5Mac = (c.isIEMac && c.major == 5);
};
//-------
domapi._sniff();
delete domapi._sniff;
//-------
domapi._checkStrict = function(){
    // taken from http://www.your-site.com/~rinfo/case_studies/doctypes.html
    // mozilla also has a non standard quirks mode http://mozilla.org/docs/web-developer/quirks/
    // ie6 in backcompat mode acts as ie5
    if(domapi.isIE5Mac)return true; // temporary fix!! we need something better
    var r = false;
    var d = document.doctype;
    r     = (document.compatMode=="CSS1Compat");
    if(d){
        if(d.systemId)
            r = d.systemId.indexOf("strict")>-1;
        else if(d.publicId)
            r = d.publicId.indexOf("transitional")>-1;
    }
    r = (d&&d.name.indexOf(".dtd")>-1)?true:r;
    return r;
};
domapi.isStrict    = domapi._checkStrict();
domapi.needsBoxFix =
    (domapi.isIE && domapi.major==5) ||
    (domapi.isIE && domapi.major>5 && !domapi.isStrict);
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// load dependancies
//------------------------------------------------------------------------------
if(domapi.trace)domapi.loadUnit("debugger", 1);
domapi.loadUnit("theme"      ,1);
domapi.loadUnit("coreutil"   ,1);
domapi.loadUnit("css"        ,1);
domapi.loadUnit("elm"        ,1);
domapi.loadUnit("component"  ,1); // always load *after* elm and theme, just to be safe
domapi.loadUnit("corecolor"  ,1);
domapi.loadUnit("json"       ,1);
if(domapi.isGecko||domapi.isKHTML)domapi.loadUnit("mozillaext",1);  // for the most part, the khtml dom is gecko like
domapi.loadUnit("lang"       ,1); // always load last
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
domapi._freeBag = function(b){
    var i,e;
    if(b.isComponent){
        for(i=b.length-1;i >=0;i--){ // Walk it backwards
            e = b[i];
            if(e && !e.freed)domapi._freeComponent(e);
            b[i] = null;
        }
    }else{
        // Walk it backwards
        for(i=b.length-1;i >=0;i--){
            e = b[i];
            if(e && !e.freed)domapi._freeElm(e);
            b[i] = null;
        }
    }
    b = [];
    b = null;
    delete b;
};
//------------------------------------------------------------------------------
domapi._freeAll = function(){    // Modified by Krister ...
    var c = domapi.bags;
    for(var b in c)
        if(typeof c[b] == "object")
            domapi._freeBag(c[b]);
    c      = null; delete c;
    domapi = null; delete domapi;
    if(typeof CollectGarbage != "undefined")CollectGarbage();
};
//------------------------------------------------------------------------------
// R. Hanssen's XMLHTTP fix
if(domapi.isIE){
    domapi.msXmlValidProgId = "";
    var _msXmlProgIdCollection = ["MSXML2.XMLHTTP", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP.4.0", "MSXML2.XMLHTTP.5.0",
        "MICROSOFT.XMLHTTP", "MICROSOFT.XMLHTTP.1.0", "MICROSOFT.XMLHTTP.1"];
    // Iterate xml prog ids in search for the correct one to use
    for (var i=0; i < _msXmlProgIdCollection.length; i++) {
        // Try the iterated engine
        try {
            // Create the object. An error is automatically thrown if it doesn't exist or in any other way isn't allowed to be created
            var _msXmlProgObj = new ActiveXObject(_msXmlProgIdCollection[i]);
            // Still here? Well, then it seems like the activex object was created successfully. Store the current engine and exit the loop.
            domapi.msXmlValidProgId = _msXmlProgIdCollection[i];
            break;
        } catch (ex) {
            // Doh! The currently tested engine didn't work. We might still be in the loop though so no despair yet...
        }
    }
    if (domapi.msXmlValidProgId == "") {
        throw new Error(domapi.getString("ERR_NO_MS_XMLHTTP"));
    }
    _msXmlProgIdCollection = null; delete _msXmlProgIdCollection;
    _msXmlProgObj          = null; delete _msXmlProgObj;
}
//------------------------------------------------------------------------------
domapi._unload = function(){
    if(typeof domapi != "undefined"){
        if(typeof domapi.debug != "undefined"){
            domapi.debug.closeConsole();
            var w = domapi.debug._winDump;
            if(w && !w.closed)w.close();
        }
        for(var i=0;i<domapi.unloadHooks.length;i++)
            domapi.unloadHooks[i]();
        domapi._freeAll();
    }
};
//------------------------------------------------------------------------------
domapi._processURL = function(){
    urlParams = location.search.split("?");
    if(urlParams.length > 1)
        urlParams   = urlParams[1].split("&");
    for(var i=0;i<urlParams.length;i++){
        urlParams[i] = urlParams[i].split("=");
        if(urlParams[i][0] == "skin"      && !domapi.lockParams)domapi.doSkin       = (urlParams[i][1] == "yes" || urlParams[i][1] == "true");
        if(urlParams[i][0] == "theme"     && !domapi.lockParams)domapi.defaultTheme =  urlParams[i][1];
        if(urlParams[i][0] == "trace"     && !domapi.lockParams)domapi.trace        = (urlParams[i][1] == "yes" || urlParams[i][1] == "true");
        if(urlParams[i][0] == "styleBody" && !domapi.lockParams)domapi.styleBody    = (urlParams[i][1] == "yes" || urlParams[i][1] == "true");
        if(urlParams[i][0] == "lang"      && !domapi.lockParams)domapi._defLang     =  urlParams[i][1];
    }
    for(var i=0;i<urlParams.length;i++)
        domapi.urlParams[urlParams[i][0]] = urlParams[i][1]; // copy to collection
    domapi.loadTheme(domapi.defaultTheme);
};
domapi._processURL();
domapi._processURL = null;
//------------------------------------------------------------------------------
domapi.loaded = true;
domapi.loadUnit("loaded"); // all done, cleanup before page onload fires
//------------------------------------------------------------------------------
