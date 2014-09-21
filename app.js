var cluster = require('cluster');

if (cluster.isMaster){
    var cpuCount = require('os').cpus().length;
    for (var i = 0; i < cpuCount; i++) {
        cluster.fork();
    }
    cluster.on('exit', function (worker) {
        cluster.fork();
    });
}
else{
    var express = require('express');
    var app = express();
    var http = require('http');
    require('./config.js')(app,express);
    require('./routes')(app);
    var logger = require("./utils/logger.js").logger;

    //start the server
    var cfg = require("./configs/global_configs.json");
    http.createServer(app).listen(cfg.APP_PORT, function () {
        logger.info('Server started on port : ' + cfg.APP_PORT+' and running in '+cfg.APP_ENV+' environment');
    });   
}