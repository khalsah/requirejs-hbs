# require-hbs

Lightweight handlebars plugin for require.js that loads and pre-compiles handlebars templates.

## Requirements

Should work with ~>requirejs v2.1.11

## Installation
1. Clone this repo or use `bower` to add `requirejs-hbs`
```
bower install requirejs-hbs=http://github.com/khalsah/requirejs-hbs.git#v0.0.1 --save
```
2. Configure requirejs
```javascript

require.config({

  paths: {
    bower_components: 'bower_coponents', //or you can put your configured location here
    templates: 'app/templates', //optional
    hbs: 'bower_components/requirejs-hbs/hbs'

  },
  hbs: { // optional (provided: defaults)
      helpers: true, //add helper to require dependencies
      helpersUrl: "templates/helpers", //base uri for helpers
      partials: true, //Do register partials
      partialsUrl: "templates", //base url for partials
      templateExtension: "hbs" //default extension for requirejs-hbs templates
  }
});

```

## Usage

*using an alias for templates in your require config is recommended*

For a given template @ `templates/myTemplate.hbs`

```html
<div class="post">
  <div class="title">
    {{title}}
  </div>
  <div class="body">
    {{body}}
  </div>
  {{> commentsContainer }}
</div>
```

Partial @ `templates/commentsContainer.hbs`
```html
<div class="comments"></div>
```

Use require to include the template:
```javascript
var myTemplate = require('hbs!templates/myTemplate');
document.body.innerHTML = myTemplate({title: "This is My First Post", body: "This is the body of my first post"});
```

# Helpers
Place your helpers in the configured location (templates/helpers by default); It's adviseable that you proactively register your helper so that it will be available when included.

For Example:
```javascript
define(function(require) {
  var Handlebars = require('handlebars');

  function tense(columnLabel) {
      if (columnLabel === 'Complete') {
        return 'd';
      }
      return '';
    }

  //Register helper
  Handlebars.registerHelper('tense', tense);

  return tense;
});
```

Helpers can be used as usual.  For more information, see the Handlebars documentation.

# License

This code is licensed as MIT.


