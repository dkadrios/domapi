function printGridExampleForm(lg){
  var r = 
    '<table border="0" class="norm" cellpadding="0" cellspacing="0"><tr>'+
    '<td valign="top" style="padding-right:2px;border-right:2px inset silver;white-space:nowrap">'+
    '<input type="Checkbox" onclick="elm1.setEnabled(this.checked)" checked alt="#" name="none" value="" /> enabled<br />'+
    '<input type="Checkbox" onclick="elm1.doBorder=this.checked;elm1.draw()" checked alt="#" name="none" value="" /> doBorder<br />'+
    '<input type="Checkbox" onclick="elm1.doBGFill=this.checked;elm1.draw()" checked alt="#" name="none" value="" /> doBGFill<br />';
  if(lg)r+=
    '<input type="Checkbox" onclick="elm1.allowSort(this.checked)" checked alt="#" name="none" value="" /> allowSort<br />'+
    '<input type="Checkbox" onclick="elm1.allowMove(this.checked)" alt="#" name="none" checked value="" /> allowMove<br />'+
    '<input type="Checkbox" onclick="elm1.allowResize(this.checked)" alt="#" name="none" checked value="" /> allowResize<br />'+
    '<input type="Checkbox" onclick="elm1.doThumbTracking=this.checked" alt="#" name="doTT" value="" /> doThumbTracking<br />'+
    '<input type="Checkbox" onclick="elm1.showHeader(this.checked)" checked alt="#" name="none" value="" /> showHeader<br />';
  r+=
    '<input type="Checkbox" onclick="elm1.doRollover =this.checked" checked alt="#" name="none" value="" /> doRollover<br />'+
    '<input type="Checkbox" onclick="elm1.doVLines=this.checked;elm1.draw()" checked alt="#" name="none" value="" /> doVLines<br />'+
    '<input type="Checkbox" onclick="elm1.doHLines=this.checked;elm1.draw()" checked alt="#" name="none" value="" /> doHLines<br />'+
    '<input type="Checkbox" onclick="elm1.doMultiSelect=this.checked" alt="#" name="none" value="" /> multiSelect<br />'+
    '<input type="Checkbox" onclick="elm1.doAllowNoSelect=this.checked" alt="#" name="none" value="" /> allowNoSelect<br />'+
    '<input type="Checkbox" onclick="elm1.doShowSelection=this.checked;elm1.draw()" checked alt="#" name="none" value="" /> showSelection<br />'+
    '<hr />'+
    '<input type="Checkbox" onclick="elm1.ledgerMode=this.checked;elm1.draw()" alt="#" name="none" value="" /> Ledger Mode<br />'+
    'Color 1 <input type="Text" value="#E7FFE7" size="8" name="lc1" alt="#" /><br />'+
    'Color 2 <input type="Text" value="#E7EFEA" size="8" name="lc2" alt="#" /><br />'+
    '<input type="Button" onclick="elm1.ledgerBg1=f.lc1.value;elm1.ledgerBg2=f.lc2.value;elm1.draw()" value="Apply" alt="#" />'+
    '<hr />'+
    '</td>'+
    '<td valign="top" style="padding-left:4px;white-space:nowrap">'+
    '<b>New Col</b><br />'+
    '<table border="0" cellpadding="0" cellspacing="0">';
  if(lg)r+=
    '<tr><td>Caption</td><td><input type="Text" value="New Col" size="12" name="c1" alt="#" /></td></tr>'+
    '<tr><td>Hint</td><td><input type="Text" value="My new col..." size="12" name="c2" alt="#" /></td></tr>';
  r+=
    '<tr><td>w</td><td><input type="Text" value="100" size="5" name="c3" alt="#" /></td></tr>'+
    '<tr><td>Align</td><td>'+
    '<select name="c4">'+
    '  <option value="left">left</option>'+
    '  <option value="center">center</option>'+
    '  <option value="right">right</option>'+
    '</select>'+
    '</td></tr>'+
    '<tr><td>SortType&nbsp;</td><td>'+
    '<select name="c5">'+
    '  <option value="0">Alpha Numeric</option>'+
    '  <option value="1">Numeric</option>'+
    '</select>'+
    '</td></tr>'+
    '<tr><td>Default</td><td><input type="Text" value="domapi" size="12" name="c6" alt="#" /></td></tr>'+
    '</table>';
  if(lg)r+=
    '<input type="Button" onclick="elm1.addCol({caption:f.c1.value,w:f.c3.value,hint:f.c2.value,align:f.c4.value,sortType:f.c5.value,defaultValue:f.c6.value})" value="Add" alt="#" />';
  else r+=
    '<input type="Button" onclick="elm1.addCol({w:f.c3.value,align:f.c4.value,sortType:f.c5.value,defaultValue:f.c6.value})" value="Add" alt="#" />';
  r+=
    '<hr />'+
    'New Row<br /><input type="Text" value="Pipe|delimited|list" size="20" name="e3" alt="#" />'+
    '<input type="Button" onclick="elm1.addRow(f.e3.value,\'|\')" value="Add" alt="#" />'+
    '<hr />'+
    '<a href="x" onclick="elm1.deleteRows();return false">Clear Rows</a>&nbsp;&nbsp;&nbsp;'+
    '<a href="x" onclick="elm1.deleteCols();return false">Clear Cols</a>'+
    '<hr />'+
    '<input type="Text" value="1" size="3" name="e4" alt="#" />'+
    '<a href="x" onclick="elm1.hideCol(f.e4.value);return false">Hide Col</a>&nbsp;&nbsp;&nbsp;'+
    '<a href="x" onclick="elm1.showCol(f.e4.value);return false">Show Col</a>'+
    '<hr />'+
    '<input type="Text" value="1" size="3" name="e5" alt="#" /> <input type="Text" value="2" size="3" name="e6" alt="#" />'+
    '<a href="x" onclick="elm1.swapCols(f.e5.value,f.e6.value);return false">Swap Cols</a>&nbsp;&nbsp;&nbsp;'+
    '</td>'+
    '</tr></table>'+
    'This control has been attached to a form on this page.  Pressing the button below will POST the form.<br />'+
    '<input type="submit" value="Test attachToForm()" />';
  document.write(r);
};