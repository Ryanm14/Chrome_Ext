var bkg = chrome.extension.getBackgroundPage();
var bad = ["Taco","Have","seen","you"]; 

//Fix
for (var i = 0; i < bad.length; i++) {
    replaceText(bad[i]);
}

function replaceText(t){
replaceTextOnPage(t, getStars(t));
}

function getStars(str){
text = "";
for (i = 0; i < str.length; i++) { 
    text += "*";
} 
return text;
}

function replaceTextOnPage(from, to){
  getAllTextNodes().forEach(function(node){
    node.nodeValue = node.nodeValue.replace(new RegExp(quote(from), 'g'), to);
  });

  function getAllTextNodes(){
    var result = [];

    (function scanSubTree(node){
      if(node.childNodes.length) 
        for(var i = 0; i < node.childNodes.length; i++) 
          scanSubTree(node.childNodes[i]);
      else if(node.nodeType == Node.TEXT_NODE) 
        result.push(node);
    })(document);

    return result;
  }

  function quote(str){
    return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
  }
}