var cfg = require("../configs/global_configs.json");
var bunyan = require('bunyan');
var log = bunyan.createLogger({
    name:cfg.LOGGER_NAME,
    streams:[
        {
            level:'info',
            path : './logs/'+cfg.INFO_LOG_FILE_NAME             //write the logs to the file
        },
        {
            level:'info',
            stream:process.stdout                   //send it to standard output stream
        },
        {
            level:'error',
            path:'./logs/'+cfg.ERROR_LOG_FILE_NAME            //record the error and fatal logs to error.log file
        },
        {
            level:'error',
            stream:process.stderr               //also send the errors to standard error stream
        }
    ]
});
module.exports.logger = log;