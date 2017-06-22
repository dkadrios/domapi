//------------------------------------------------------------------------------
// DomAPI node sort routines
// D. Kadrioski 3/8/2002 - reconceived 7/2/2003
//------------------------------------------------------------------------------

/*
*  usage:   domapi.nodeSort( ...inline object... );
*
*  Inline object parameters:
*  NAME            DEFAULT         TYPE        REQ. DESCRIPTION
*  nodelist        n/a             HTMLElement yes  The list you want sorted. For example pass a <ul> to have items sorted.
*  direction       sdAscending     Integer     no   Direction to sort in, valid entries are sdAscending and sdDescending.
*  type            stAlpha         Integer     no   Type of date being sorted. Use stAlpha for strings, stNumeric for numbers.
*  collection      null            String      no   A sub object to sort on. For example, if nodeList was a colletion of
*                                                   <tr>s, collection can be "cells" to sort a particular column.
*  collectionIndex 0               Integer     no   If a collection was specified, this is the index within it.  For example,
*                                                   if nodeList is "rows" and collection is "cells", collectionIndex would be
*                                                   the column index.
*  low             0               Integer     no   Index to start sorting from. For example, to skip the first item in the
*                                                   list, pass 1.
*  high            nodelist.length Integer     no   Index to sort up to.
*  compare         defaultCompare  Function    no   Compare function to use. Standard Array.sort() compare method.
*
*/

//------------------------------------------------------------------------------
sdAscending  = 0;
sdDescending = 1;
stAlpha      = 0;
stNumeric    = 1;
stDateTime   = 2;
stBoolean    = 3;
//------------------------------------------------------------------------------
domapi.nodeSort = function(arg){//c,dir,type,obj,objx,cmp_fn,lo,hi){
  var n      = domapi._private.nodesort;
  var c      = arg["nodelist"];
  if(c == null || c.length<2)return;
  if(n.busy)return 0;
  n.busy     = true;
  var i;
  var n      = domapi._private.nodesort;
  var p      = c[0].parentNode;
  var a      = new Array(c.length-1);
  var lo     = domapi.rInt(arg["low"],0);
  var hi     = domapi.rInt(arg["high"],c.length);
  n.dir      = domapi.rInt(arg["direction"],sdAscending);
  n.obj      = arg["collection"];
  n.objx     = domapi.rInt(arg["collectionIndex"]);
  n.type     = arg["type",stAlpha];
  var cmp_fn = arg["compare"];
  if(cmp_fn == null)cmp_fn = n.defaultCompare;
  // place pointers to all elements in the collection into our array.
  for(i=lo;i<hi;i++)a[i-lo] = c[i];
  // sort it
  a.sort(cmp_fn);
  // put em back
  for(i=lo;i<hi;i++)//if(c[i] != a[i])
    c[i].swapNode(a[i-lo]);
  n.busy = false;
  return 1;
};
//------------------------------------------------------------------------------
// private members
//------------------------------------------------------------------------------
domapi._private.nodesort = {};
//------------------------------------------------------------------------------
domapi._private.nodesort.defaultCompare = function(A,B){
  var a,b;
  var n = domapi._private.nodesort;
  if(!domapi.isNil(n.obj)){
    a = A[n.obj][n.objx].innerText;
    b = B[n.obj][n.objx].innerText;
  }else{
    a = A.innerText;
    b = B.innerText;
  }

  switch(n.type){

    case stAlpha :
      a = a.toLowerCase();
      b = b.toLowerCase();
      break;
    case stBoolean :
      a = a.toLowerCase();
      b = b.toLowerCase();
      a = (a == "true" || a == "yes" || a == true )?true:false;
      b = (b == "true" || b == "yes" || b == true )?true:false;
      break;
    case stNumeric :
      a = parseFloat(a);
      b = parseFloat(b);
      break;
    case stDateTime :
      a = sysutils.isDate(a);
      b = sysutils.isDate(b);
      break;
  }
  if(n.dir == sdAscending)return(a == b)?0:(a > b)?1:-1;
  else                    return(a == b)?0:(a < b)?1:-1;
};
//------------------------------------------------------------------------------
