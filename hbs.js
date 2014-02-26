/**
* @author          Hargobind Khalsa
* @copyright       Copyright (c) 2014 Hargobind Khalsa
* @license         Licensed MIT
* @github          http://github.com/khalsah/requirejs-hbs
* @version         0.0.1
*/

define(function(require, exports, module) {
  var pluginName = module.id;
  var Handlebars = require("handlebars");
  var text = require("text");

  var buildMap = {};

  function process(template, config) {
    var deps = [], ast = Handlebars.parse(template);

    walk(deps, ast.statements, config);

    return {
      ast: ast,
      deps: deps
    };
  }

  function requireHelper(deps, node, config) {
    var helper = node.id.string;
    if(!Handlebars.helpers[helper]) {
      deps.push(config.helpersUrl + "/" + helper);
    }
  }

  function walk(deps, nodes, config) {
    for(var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      if(config.partials && node.type === "partial") {
        deps.push(pluginName + "!" + node.partialName.name + "!partial");
      }

      if(config.helpers && node.isHelper) {
        requireHelper(deps, node, config);
      }

      if(node.program) {
        walk(deps, node.program.statements, config);
      }
      if(node.inverse) {
        walk(deps, node.inverse.statements, config);
      }
    }
  }

  function configure(config) {
    var defaults = {
      helpers: true,
      helpersUrl: "templates/helpers",
      partials: true,
      partialsUrl: "templates",
      templateExtension: "hbs"
    };

    for(var key in defaults) {
      if(!config.hasOwnProperty(key)) {
        config[key] = defaults[key];
      }
    }

    return config;
  }

  return {
    load: function(name, req, onload, requireConfig) {
      config = configure(requireConfig.config.hbs);

      if(/!partial$/.test(name)) {
        var partial = name.substring(0, name.length - "!partial".length);
        var path = config.partialsUrl + "/" + partial;

        if(requireConfig.isBuild) {
          buildMap[name] = path;
        }

        req(["handlebars", pluginName + "!" + path], function(Handlebars, template) {
          Handlebars.registerPartial(partial, template);
          onload(template);
        });
      } else {
        var path = name + "." + config.templateExtension;
        text.get(req.toUrl(path), function(template) {
          var processed = process(template, config);

          if(requireConfig.isBuild) {
            buildMap[name] = processed;
          }

          req(processed.deps, function() {
            onload(Handlebars.compile(processed.ast));
          });
        }, function(error) {
          throw Error("Could not load handlebars template");
        });
      }
    },

    write: function(pluginName, name, write) {
      var text = "";
      if(/!partial$/.test(name)) {
        var partial = name.substring(0, name.length - "!partial".length);
        var path = buildMap[name];

        text += "define(\"" + pluginName + "!" + name + "\", ";
        text += JSON.stringify(["handlebars", pluginName + "!" + path]);
        text += ", function(Handlebars, template) { Handlebars.registerPartial(" + JSON.stringify(partial) + ", template); })";
      } else if(name in buildMap) {
        var processed = buildMap[name];
        text += "define(\"" + pluginName + "!" + name + "\", ";
        text += JSON.stringify(["handlebars"].concat(processed.deps));
        text += ", function(Handlebars) { return Handlebars.template(" + Handlebars.precompile(processed.ast) + "); })";
      }
      write(text);
    }
  };

});
