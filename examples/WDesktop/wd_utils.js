//
// Returns a reference to the specified stylesheet rule
//
function findStyleSheetRule(sStyleSheet, sRule) {
  var oRule = null;
  var oReg = new RegExp(sStyleSheet, "i");
  for (var i=1;i<document.styleSheets.length;i++) {
    if ( oReg.test(document.styleSheets[i].href)) {
      var oCSS = new TCSS();
      oCSS.init(i);
      var iRule = oCSS.findRule(sRule);
      if ( iRule >= 0)
        oRule = oCSS.rules[iRule];
      break;
    }
  }
  return oRule;
};

//
// Globally modify the default listgrid row height from 15px to 16px and set the
// specified grid's default row height to the same. Calls findStyleSheetRule().
//
function setGridRowHeight(oGrid, iDesiredRowHeight) {
  var oListgridCellRule = findStyleSheetRule("theme.css", ".DA_LISTGRID_CELL");
  oListgridCellRule.style.lineHeight = iDesiredRowHeight + "px";
  oGrid.data.defaultRowHeight = iDesiredRowHeight;
};

