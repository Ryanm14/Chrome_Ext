(function() {
    var Ext = {

       

        setActiveByDefault: function() {
            var activate = this.elements.isactive;

            activate.checked = (this.settings.active == true) ? true : false;
        },

       
        

        validateTextArea: function(text) {
            var text = text.replace(/\s*[\r\n]+\s*/g, '\n').replace(/^\s+|\s+$/g, '');

            return text.length ? text.split('\n') : [];
        },

        updateLocalData: function() {
            var elements = this.elements;
            var settings = this.settings;
            var checkedReplacer = this._getCheckedReplacer();

            var exports = {
                userWords: this.validateTextArea(elements.stopWordsArea.value),
                safeWords: this.validateTextArea(elements.safeWordsArea.value),
                language: elements.langs.options[elements.langs.selectedIndex].value,
                active: document.getElementsByName('isactive')[0].checked,
                replacer: checkedReplacer.value,
                customReplacer: document.getElementsByName('custom')[0].value
            };

            for (var prop in exports) {
                if (settings.hasOwnProperty(prop)) {
                    settings[prop] = exports[prop];
                }
            }

            this.sendData(settings);
        },

        sendData: function(settings) {
            var settings = settings || this.settings;

            chrome.storage.local.set({
                'settings': settings
            }, function(response) {
                window.close()
            });

            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'update'
                });
            });
        },

        init: function() {
            var settings = this.settings;
            var elements = this.elements;

            this.setReplacerByDefault();
            this.setActiveByDefault();

            elements.saveBtn.addEventListener('click', this.updateLocalData.bind(this), false);

            elements.stopWordsArea.value = settings.userWords.join('\n');
            elements.safeWordsArea.value = settings.safeWords.join('\n');

            for (var i = 0, len = elements.langs.options.length; i < len; i++) {
                if (elements.langs.options[i].value == settings.language) {
                    elements.langs.options[i].setAttribute('selected', 'selected');
                }
            }
			chrome.extension.getBackgroundPage().console.log('foo');
        },

       
    };


})();