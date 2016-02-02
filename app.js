var express = require('express');
var engine = require('ejs-locals');
var expressLayouts = require('express-ejs-layouts');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var fs = require('fs');
// Database
var mongo = require('mongoskin');
var defaultMongoServer = (process.env.NODE_ENV == 'development') ? "mongodb://localhost:27017/GalaxyServer" : "mongodb://droneadmin:droneadmin1234@proximus.modulusmongo.net:27017/qI7taqes";
var db = mongo.db(process.env.MONGO_URL || defaultMongoServer, { native_parser: true });


function printTitle() {
    console.log("     ________________________________         ");
    console.log("    /                                \"-_        "); 
    console.log("   /      .  |  .                       \\          ");
    console.log("  /      : \\ | / :                       \\         ");
    console.log(" /        '-___-'                         \\      ");
    console.log("/_________________________________________ \\      ");
    console.log("     _______| |________________________--\"\"-L ");
    console.log("    /       F J                              \\ ");
    console.log("   /       F   J                              L");
    console.log("  /      :'     ':                            F");
    console.log(" /        '-___-'                            / ");
    console.log("/_________________________________________--\"  ");

    console.log("  ________       .__                          ");
    console.log(" /  _____/_____  |  | _____  ___  ______.__.  ");
    console.log("/   \\  ___\\__  \\ |  | \\__  \\ \\  \\/  <   |  |  ");
    console.log("\\    \\_\\  \\/ __ \\|  |__/ __ \\_>    < \\___  |  ");
    console.log(" \\______  (____  /____(____  /__/\\_ \\/ ____|  ");
    console.log("        \\/     \\/          \\/      \\/\\/       ");

    console.log("              _________                                ");
    console.log("            /   _____/ ______________  __ ___________   ");
    console.log("            \\_____  \\_/ __ \\_  __ \\  \\/ // __ \\_  __ \\  ");
    console.log("            /        \\  ___/|  | \\/\\   /\\  ___/|  | \\/  ");
    console.log("           /_______  /\\___  >__|    \\_/  \\___  >__|    ");
    console.log("                   \\/     \\/                 \\/        ");
}

var options = {};

var forEachFile = function( dir, fullpath, cb ) {
    if( cb == null ){
        cb = fullpath;
        fullpath = false;
    }
    var files = [];
    try {
        fs.readdirSync(dir).filter(function (filename) {
               return fs.statSync(path.join(dir, filename)).isFile();
        }).sort().map(function (filename) {
            files.push( fullpath ? path.join(dir, filename) : filename);
        });
    }
    catch (e) {
    }
    files.forEach(cb);
};

options.config = {};

forEachFile("./config/", false, function(filename){
    console.log("Loading " + filename);
    var configFile = require('./config/' + filename);
    for (var k in configFile) {
        options.config[k] = configFile[k];
    }
});

exports.init = function (port) {

    printTitle();

    var app = express();

    app.engine('ejs', engine);

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.set('layout', 'layout');

    app.use(expressLayouts);
    app.use(favicon());
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());
    app.use(cookieParser());
    app.use(flash());

    app.use(express.static(path.join(__dirname, 'static')));
    //app.use(express.methodOverride());
    //app.enable("jsonp callback");

    app.locals.title = 'GalaxyServer';
    app.locals.description = 'GalaxyServer';
    app.locals.author = 'dstovell';
    //app.locals._layoutFile = true;

    // Make our db accessible to our router
    app.use(function (req, res, next) {
        req.db = db;
        next();
    });

    options.db = db;

    app.use('/', require('./routes/admin/index'));
    app.use('/admin', require('./routes/admin/index'));
    app.use('/admin/users', require('./routes/admin/users')(options) );
    app.use('/admin/galaxy', require('./routes/admin/galaxy')(options) );
    app.use('/admin/assets', require('./routes/admin/assets')(options) );

    app.use('/api/users', require('./routes/api/users')(options));

    //var art = require('framework/art');

    /// catch 404 and forwarding to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        res.render('404.ejs', { locals: { error: err }, status: 404 });
    });

    /// error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

    return app;
}


//module.exports = app;
