/**
 * Module dependencies.
 */

var express = require('express');
var router  = require('./router');
var config  = require('./config').values;

var app     = express.createServer();

// Configuration

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

/**
 * Configuration can come from the 'config.js' file
 * and from command line options. 
 * 
 * The --public option removes the 'localhost' reference
 * in the config file allowing remote hosts to connect.
 */

if (process.argv.indexOf('--public') > -1) {
    config.public = true;
}

if (config.public) {
        app.listen(config.port);
}
else {
        app.listen(config.port, config.host);
}

router.setup(app);

console.log("Express server listening on port %d in %s mode", 
	    config.port, app.settings.env);
