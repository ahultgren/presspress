"use strict";

var presspress = module.exports = require('../.'),
    http = require('http'),
    port = process.env.PORT || 3001,
    app = presspress({
      cookieSecret: 'k15SC7785782FfX367i12bV4qH6nbDI84bB6Ay2KiB8r7HMCLKus~ImSX1DLFj4E'
    }),
    express = presspress.express;


app.registerTheme('./themes/default');
app.registerAdminTheme('./themes/default-admin');

app.defaultTheme('./themes/default');
// app.registerPlugin();


/**
 * Any express settings, after the built-in ones..
 * Guess it's smart to override db-uri for example
 */

app.set('db-uri', 'mongodb://localhost/presspress-dev');
app.set('site-url', 'http://localhost:3001');

app.configure('development', function () {
  app.use(express.errorHandler()).as('errorHandler');
});


app.start(http, port, function(){
  console.log('Presspress listening on port ' + port + ' with db ' + app.get('db-uri'));
});
