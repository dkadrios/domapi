function dataInit(sDataSrc) {
  XmlDocMain = domapi.xml.getDomDocument();
  XmlDocMain.async =false;
  XmlDocMain.load(sDataSrc);
  
  XmlDocJson = domapi.xml.getDomDocument();
  XmlDocJson.async =false;
  
  XslDoc = domapi.xml.getDomDocument();
  
  var imgDim = 16;

  sImgTpl = "<img style='padding:0px' align='absmiddle' height='" + imgDim + "' width='" + imgDim + "' src='##'/>&nbsp;";
  sImgFile = sImgTpl.replace("##", "images/file16.gif");
  sImgDrive = sImgTpl.replace("##", "images/drive16.gif");
  sImgFolder = sImgTpl.replace("##", "images/folder_closed16.gif");
};

function getXMLPath(sPath) {
  var sPathOut = "";
  if (sPath.length) {
    var a = sPath.split('\\');
    for(var i=0;i<a.length;i++) {
      sPathOut += "/item[@text=\"" + a[i] + "\"]";
    }
  }
  sPathOut += "/item";
  return sPathOut;
};

function getJsonData(sTarget, strPath){
  var strMatch = getXMLPath(strPath);
  var strXsl = "";
  
  if (sTarget == "tree") {  
    strMatch += "[@type!=\"file\"]";
    strXsl =  "<xsl:stylesheet version='1.0' xmlns:xsl='http://www.w3.org/1999/XSL/Transform'>" +
              "<xsl:output method='text'/>" +
              "<xsl:template match='/'>" +
              "{nodes : [" +
              "<xsl:for-each select='" + strMatch + "'>" +
              "{text:\"<xsl:value-of select='@text'/>\"" + 
              "<xsl:if test='./item[@type!=\"file\"]'>,hasChildren:true</xsl:if>" + 
              "<xsl:if test='@type=\"disk\"'>,img:\"images/drive16.gif\"</xsl:if>" + 
              "}<xsl:if test=\"position()!=last()\">,</xsl:if>" +
              "</xsl:for-each>" +
              "]}" +
              "</xsl:template>" +
              "</xsl:stylesheet>";
  }
  else {//(sTarget == "grid")
    strXsl =  "<xsl:stylesheet version='1.0' xmlns:xsl='http://www.w3.org/1999/XSL/Transform'>" +
              "<xsl:output method='text'/>" +
              "<xsl:template match='/'>" +
              "{ cols : [{ sortable : true,  editable : false, fieldType : ftString, fieldName : \"Name\", text:\"Name\", w:300 },{ sortable : true,  editable : false, fieldType : ftInteger, fieldName : \"Size\", text:\"Size\", w:130 },{ sortable : true,  editable : false, fieldType : ftString, fieldName : \"Type\", text:\"Type\", w:200 },{ sortable : true,  editable : false, fieldType : ftDate, fieldName : \"Modified\", text:\"Date Modified\", w:250 }],rows : [" +
              "<xsl:for-each select='" + strMatch + "'>" +
              "{cells:[" +
              "<xsl:choose>" + 
              "<xsl:when test='@type=\"drive\"'>{value:<![CDATA[\"" + sImgDrive + "]]></xsl:when>" + 
              "<xsl:when test='@type=\"folder\"'>{value:<![CDATA[\"" + sImgFolder + "]]></xsl:when>" + 
              "<xsl:otherwise>{value:<![CDATA[\"" + sImgFile + "]]></xsl:otherwise>" + 
              "</xsl:choose>" +
              "<xsl:value-of select='@text'/>\"}," +
              "{value:\"<xsl:value-of select='@FileSize'/>\"}," +
              "{value:\"<xsl:value-of select='@FileType'/>\"}," +
              "{value:\"<xsl:value-of select='@LastModified'/>\"}]}" +
              "<xsl:if test=\"position()!=last()\">,</xsl:if>" +
              "</xsl:for-each>" +
              "] }" +
              "</xsl:template>" +
              "</xsl:stylesheet>";
  }

  XslDoc.loadXML(strXsl);
  
  var sJson = XmlDocMain.transformNode(XslDoc);

  if (!domapi.isIE) {
    XmlDocJson.loadXML(sJson);
    sJson = XmlDocJson.documentElement.childNodes.item(1).childNodes.item(0).innerText;
  }
      
  //alert("sTarget="+sTarget + ", strPath=" + strPath + "\nsJson=" + sJson);
  
  return domapi.stringToJson(sJson);
};
