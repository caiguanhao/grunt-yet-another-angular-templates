grunt-yet-another-angular-templates
===================================

Yet Another Angular Templates grunt plugin.

Turn your single page Angular templates HTML file:

```html
<script type="text/ng-template" id="index">
  <div id="wrap"></div>
</script>
```

to a JavaScript file:

```js
;YAAT.run(["$templateCache",function(a){a.put("index","<div id=\"wrap\"></div>");}]);
```

If your HTML file does not contain any `<script type="text/ng-template"></script>`
tag, all content in it will be added to template cache while the cache key name
is the file path.

## Getting Started

This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out
the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains
how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as
install and use Grunt plugins. Once you're familiar with that process, you may
install this plugin with this command:

```shell
npm install grunt-yet-another-angular-templates --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile
with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-yet-another-angular-templates');
```

## Options

### module

Type: `String`

Force use this module name. Default is the target name.

### keyNameCallback

Type: `Function (keyName)`

A callback function to process the key name.

## Examples

```js
grunt.initConfig({
  yaat: {
    MyApp: {
      files: {
        'public/js/templates.js': 'src/index.html'
      }
    }
  }
});
```

Different module name:

```js
grunt.initConfig({
  yaat: {
    MyApp: {
      options: {
        module: 'YAAT'
      },
      files: {
        'public/js/templates.js': 'src/index.html'
      }
    }
  }
});
```
