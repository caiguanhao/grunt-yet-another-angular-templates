var Q = require('q');
var htmlparser = require('htmlparser2');

module.exports = function(grunt) {

  grunt.registerMultiTask('yaat', 'Yet Another Angular Templates grunt plugin',
    function() {

    var finish = this.async();
    var files = this.files;
    var options = this.options();
    var target = this.target;

    files.reduce(function(prevFile, curFile) {
      var Templates = {};
      return prevFile.then(function() {
        return curFile.src.reduce(function(prevSrc, curSrc) {
          return prevSrc.then(function() {
            var content = grunt.file.read(curSrc);
            var currentText;
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
                  var id = (currentAttribs.id || '').trim();
                  if (!id) return;
                  if (Templates.hasOwnProperty(id)) {
                    grunt.log.warn('Templates with ID ' + id.cyan +
                      ' in ' + curSrc.cyan + ' already exists. Skipped.');
                    return;
                  }
                  Templates[id] = currentText;
                }
              },
              onend: function() {
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
        var tpl = ';' + moduleName;
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
