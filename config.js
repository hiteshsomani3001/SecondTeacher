var logger          = require("./utils/logger.js").logger;
var connect         = require('connect');
var expressJwt      = require('express-jwt');
var path            = require('path');
var multer          = require('multer');
var global_config   = require("./configs/global_configs.json");

//enable Cross Origin Resource Sharing by setting the appropriate headers
var enableCORS = function(req,res,next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
        //logger.info(req.ip+" has requested "+req.method+" for the url : "+req.url);
        var domain = require('domain').create();
        domain.on('error',function(err){
            res.writeHead(500);
            res.end(err.message);
            logger.error(err.message);
        });
        domain.add(req);
        domain.add(res);
        domain.run(function(){
            next();
        });
    }
};
module.exports = function (app, express) {
    var config = this;        
    app.configure(function () {
        app.use(express.logger('dev'));
        app.use(express.json());
        app.use(express.urlencoded());
        var ts =global_config.TOKEN_SECRET; 
        //app.use('/api/', expressJwt({secret: global_config.TOKEN_SECRET}));
        app.use(multer());
        app.use(express.methodOverride());
        app.use(enableCORS);
        app.use(app.router);
        app.use(express.static(path.join(__dirname, 'public')));
    });

    return config;
};
