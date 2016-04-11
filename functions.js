(function() {
    var Utils = {
        
        debounce : function(fn, timeout, invokeAsap, ctx) {
            if(arguments.length == 3 && typeof invokeAsap != 'boolean') {
                ctx = invokeAsap;
                invokeAsap = false;
            }
            var timer;

            return function() {
                var args = arguments;
                ctx = ctx || this;

                invokeAsap && !timer && fn.apply(ctx, args);

                clearTimeout(timer);

                timer = setTimeout(function() {
                    !invokeAsap && fn.apply(ctx, args);
                    timer = null;
                }, timeout);

            };
        },

        merge: function(obj, options) {
            if (typeof options === 'undefined') return false;

            var obj = obj || {};

            for (var el in options) {
                if (el in obj ) {
                    continue;
                } else {
                    obj[el] = options[el];
                }
            }

            return obj;
        }
    };


    var App = {     

        defaults :{
            language         : 'eng',
            customReplacer   : '',
            localWords       : null,
            userWords        : [],
            safeWords        : [],
            active           : true
        },  

        settings:null, // chrome storage copy 

        replaceProfanity: Utils.debounce(function() {
            var settings = this.settings;           
            var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);               
            var regExp = this.createRegExp();                       
            var node, replacer;
            var regExp_foreign = this.createRegExp_Foreign();
            
           replacer = '*****'

            
            while (node = walker.nextNode()) {  
                /*Changing Foreign Unwanted Chars*/
                var n1 = node.nodeValue.split(' ');
                for(var nx1 in n1){
                    var nv1 = replace_foreign_chars(n1[nx1]).toLowerCase();
                    var ns1 = nv1.search(regExp_foreign);
                    if(ns1 > -1){
                        n1[nx1] = nv1.replace(regExp_foreign, replacer);
                    }
                }
                var n2 = n1.join(' ');
                node.nodeValue = n2;
                /*Changing Foreign Unwanted Chars Ends*/
                
                node.nodeValue = node.nodeValue.replace(regExp, replacer);            
                
            }

        }, 300),
        
        createRegExp: function() {
            var settings = this.settings;
            var stopWords = Array.prototype.concat(settings.localWords[settings.language]);
            var safeWords = settings.safeWords.join('|');
            if (safeWords.length) {
                var regExp = new RegExp('\\b('+safeWords+')\\b', 'gi');  

                for (var i = stopWords.length - 1; i >= 0; i--) {
                    if (stopWords[i].search(regExp) != -1) {
                        stopWords.splice(i, 1);
                    }
                };
            }
            
            return new RegExp('\\b('+stopWords.join('|')+')\\b', 'gi');
        }, 
        createRegExp_Foreign: function() {
            var settings = this.settings;
            var stopWords = Array.prototype.concat(settings.userWords, settings.localWords[settings.language]);
            var safeWords = settings.safeWords.join('|');
            if (safeWords.length) {
                var regExp = new RegExp('\\b('+safeWords+')\\b', 'gi');  

                for (var i = stopWords.length - 1; i >= 0; i--) {
                    if (stopWords[i].search(regExp) != -1) {
                        stopWords.splice(i, 1);
                    }
                };
            }
            
            var ne1 = replace_foreign_chars(stopWords.join('|'));
            return new RegExp('\\b('+ne1+')\\b', 'gi');
        },
        
        
        
        _getLocalWordsList: function(lang) {        
            var xmlhttp = new XMLHttpRequest();         
            xmlhttp.open('GET', chrome.extension.getURL('words.json'), true);

            xmlhttp.send(null);

            return xmlhttp;
        },

        getDefaultSettings: function (lang) {
            var me = this;          

            chrome.storage.local.get('settings', function(response) {
                var settings = response.hasOwnProperty('settings') ? response.settings : {}
                var settings = Utils.merge(settings, me.defaults)
                var language = lang || settings.language; 
                if (settings.localWords) { 
                    me.init();
                } else {
                    var request = me._getLocalWordsList();

                    request.onreadystatechange = function() {
                        if (request.readyState == 4 && request.status == 200) {
                            var response        = JSON.parse(request.responseText);     
                            settings.localWords = response;
                            settings.language   = language;                     

                            me.settings = settings;

                            chrome.storage.local.set({'settings': settings}, function() {
                                me.init();
                            });                                                                                                                         
                        }
                    }
                }               
            });     
        },  

        init: function() {          
            var me = this;

            chrome.storage.local.get('settings', function(response) {
                me.settings = response.settings;

                if (me.settings['active'] != true) return;              
                document.addEventListener("DOMSubtreeModified", me.replaceProfanity.bind(me), false);
            });                                 
        }
    };
    
    App.getDefaultSettings();
    App.attachListeners();
})();

function replace_foreign_chars(str) {

  // str = String to be converted to normal english
  
var obj = { 	
    'ä|æ|ǽ' : 'ae',
	'ö|œ' : 'oe',
	'ü' : 'ue',
	'Ä' : 'Ae',
	'Ü' : 'Ue',
	'Ö' : 'Oe',
	'À|Á|Â|Ã|Ä|Å|Ǻ|Ā|Ă|Ą|Ǎ|А' : 'A',
	'à|á|â|ã|å|ǻ|ā|ă|ą|ǎ|ª' : 'a',
    'Б|б' : 'b',
	'Ç|Ć|Ĉ|Ċ|Č' : 'C',
	'ç|ć|ĉ|ċ|č' : 'c',
	'Ð|Ď|Đ' : 'D',
	'ð|ď|đ|Д|д|Ђ|ђ' : 'd',
	'È|É|Ê|Ë|Ē|Ĕ|Ė|Ę|Ě' : 'E',
	'è|é|ê|ë|ē|ĕ|ė|ę|ě|Е|е|Ѐ|ѐ|Ё|ё|Ӗ|ӗ|Ҽ|ҽ|Ҿ|ҿ|Э|э' : 'e',
	'Ĝ|Ğ|Ġ|Ģ' : 'G',
	'ĝ|ğ|ġ|ģ|Г|г|Ґ|ґ|Ѓ|ѓ|Ғ|ғ|Ӷ|ӷ|Ҕ|ҕ' : 'g',
	'Ĥ|Ħ' : 'H',
	'ĥ|ħ|Х|х|Ҳ|ҳ|Һ|һ' : 'h',
	'Ì|Í|Î|Ï|Ĩ|Ī|Ĭ|Ǐ|Į|İ' : 'I',
	'ì|í|î|ï|ĩ|ī|ĭ|ǐ|į|ı|Ӏ|ӏ|І|і|Ы|ы|Ӹ|ӹ' : 'i',
	'Ĵ' : 'J',
	'ĵ|Й|й|Ҋ|ҋ|Ј|ј|Ь|ь|Ҍ|ҍ' : 'j',
	'Ķ' : 'K',
	'ķ|К|к|Қ|қ|Ҟ|ҟ|Ҡ|ҡ|Ӄ|ӄ|Ҝ|ҝ' : 'k',
	'Ĺ|Ļ|Ľ|Ŀ|Ł' : 'L',
	'ĺ|ļ|ľ|ŀ|ł|Л|л|Ӆ|ӆ|Љ|љ' : 'l',
    'М|м|Ӎ|ӎ' : 'm',
	'Ñ|Ń|Ņ|Ň' : 'N',
	'ñ|ń|ņ|ň|ŉ|Н|н|Ӊ|ӊ|Ң|ң|Ӈ|ӈ|Ҥ|ҥ|Њ|њ' : 'n',
	'Ò|Ó|Ô|Õ|Ō|Ŏ|Ǒ|Ő|Ơ|Ø|Ǿ' : 'O',
	'ò|ó|ô|õ|ō|ŏ|ǒ|ő|ơ|ø|ǿ|º|О|о|Ӧ|ӧ|Ө|ө|Ӫ|ӫ|Ҩ|ҩ' : 'o',
    'П|п|Ҧ|ҧ' : 'p',
	'Ŕ|Ŗ|Ř' : 'R',
	'ŕ|ŗ|ř|Р|р|Ҏ|ҏ' : 'r',
	'Ś|Ŝ|Ş|Š' : 'S',
	'ś|ŝ|ş|š|ſ|С|с|Ҫ|ҫ' : 's',
	'Ţ|Ť|Ŧ' : 'T',
	'ţ|ť|ŧ|Т|т|Ҭ|ҭ|Ћ|ћ|Ќ|ќ' : 't',
	'Ù|Ú|Û|Ũ|Ū|Ŭ|Ů|Ű|Ų|Ư|Ǔ|Ǖ|Ǘ|Ǚ|Ǜ' : 'U',
	'ù|ú|û|ũ|ū|ŭ|ů|ű|ų|ư|ǔ|ǖ|ǘ|ǚ|ǜ|У|у|Ў|ў|Ӳ|ӳ|Ӱ|ӱ|Ӯ|ӯ|Ү|ү|Ұ|ұ' : 'u',
    'В|в' : 'v',
	'Ý|Ÿ|Ŷ' : 'Y',
	'ý|ÿ|ŷ|И|и|Ѝ|ѝ|Ӥ|ӥ|Ӣ|ӣ' : 'y',
	'Ŵ' : 'W',
	'ŵ' : 'w',
	'Ź|Ż|Ž' : 'Z',
	'ź|ż|ž|З|з|Ҙ|ҙ|Ӟ|ӟ|Ӡ|ӡ|Ѕ|ѕ' : 'z',
	'Æ|Ǽ' : 'AE',
	'ß': 'ss',
	'Ĳ' : 'IJ',
	'ĳ' : 'ij',
	'Œ' : 'OE',
	'ƒ|Ф|ф' : 'f',
    'Є|є' : 'je',
    'Ї|ї' : 'yi',
    'Ц|ц|Ҵ|ҵ' : 'ts',
    'Ч|ч|Ӵ|ӵ|Ҷ|ҷ|Ӌ|ӌ|Ҹ|ҹ|Џ|џ' : 'ch',
    'Ш|ш' : 'sh',
    'Щ|щ' : 'shch',
    'Ӭ|ӭ' : 'jo',
    'Ю|ю' : 'ju',
    'Я|я' : 'ja',
    'Ъ|ъ' : '-',
    'Ж|ж|Ӂ|ӂ|Җ|җ|Ӝ|ӝ' : 'zh'
}  
  for (var x in obj) {
    str = str.replace(new RegExp(x, 'gi'), obj[x]);
  }
  return str;
}

	



