var Q = require('q');
var htmlparser = require('htmlparser2');

module.exports = function(grunt) {

  grunt.registerMultiTask('yaat', 'Yet Another Angular Templates grunt plugin',
    function() {

    var finish = this.async();
    var files = this.files;
    var options = this.options();
    var target = this.target;

    var keyNameCallback = options.keyNameCallback;
    if (typeof keyNameCallback !== 'function') {
      keyNameCallback = function(name){ return name; };
    }

    files.reduce(function(prevFile, curFile) {
      var Templates = {};

      function addTemplate(keyName, content, srcFile) {
        if (typeof keyName !== 'string' || !keyName) return;
        keyName = keyNameCallback(keyName);
        if (typeof keyName !== 'string' || !keyName) return;
        if (Templates.hasOwnProperty(keyName)) {
          grunt.log.warn('Templates with ID ' + keyName.cyan +
            ' in ' + srcFile.cyan + ' already exists. Skipped.');
          return;
        }
        Templates[keyName] = content;
      }

      return prevFile.then(function() {
        return curFile.src.reduce(function(prevSrc, curSrc) {
          return prevSrc.then(function() {
            var content = grunt.file.read(curSrc);
            var currentText;
            var scriptTagMode = false;
            var deferred = Q.defer();
            var parser = new htmlparser.Parser({
              onopentag: function(name, attribs) {
                currentAttribs = attribs || {};
                currentText = '';
              },
              ontext: function(text) {
                currentText += text;
              },
              onclosetag: function(name) {
                var type = currentAttribs.type;
                if (name === 'script' && type === 'text/ng-template') {
                  addTemplate(currentAttribs.id, currentText, curSrc);
                  scriptTagMode = true;
                }
              },
              onend: function() {
                if (scriptTagMode === false) {
                  addTemplate(curSrc, content, curSrc);
                }
                deferred.resolve();
              }
            });
            parser.write(content);
            parser.end();
            return deferred.promise;
          });
        }, Q());
      }).
      then(function() {
        var file = curFile.dest;
        grunt.log.write('Putting Angular templates to ' + file.cyan + '... ');
        var moduleName = target;
        if (typeof options.module === 'string') moduleName = options.module;
        var tpl = ';angular.module(' + JSON.stringify(moduleName) + ')';
        tpl += '.run(["$templateCache",function(a){';
        for (var name in Templates) {
          tpl += 'a.put(' + JSON.stringify(name) + ',';
          var text = Templates[name].replace(/^\s{2,}/mg, '');
          tpl += JSON.stringify(text.trim()) + ');';
        }
        tpl += '}]);';
        grunt.file.write(file, tpl);
        grunt.log.ok();
      });
    }, Q()).
    catch(function(e) {
      grunt.log.error();
      grunt.fail.fatal(e);
    }).
    finally(finish);

  });

};
