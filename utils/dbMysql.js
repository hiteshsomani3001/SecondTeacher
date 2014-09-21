//create a pool of connections
var db_config   = require("../configs/db_config.json");
var cfg         = require("../configs/global_configs.json");
var logger      = require("../utils/logger.js").logger;
var mysql       = require("mysql");
var schema = null;
if(cfg.APP_ENV === 'dev'){
    schema = db_config.dev_schema;
}
else if(cfg.APP_ENV === 'qa'){
    schema = db_config.qa_schema;   
}
else if(cfg.APP_ENV === 'live'){
    schema = db_config.prod_schema;   
}
var pool =  mysql.createPool({
    host : db_config.host,
    user : db_config.username,
    port : db_config.port,
    password: db_config.password,
    connectionLimit:db_config.connection_limit,
    database:schema,
    connectTimeout:db_config.timeout
});
logger.info("Connected to "+schema+" database");
var executeQuery = function(inQuery, callback){
    var returnObj = {
        error:null
    };
    //get a connection from the pool
    pool.getConnection(function(con_error,conn){
        if(con_error){
            var msg = "Error in getting connection";
            logger.error(msg);
            returnObj.error = msg;
            callback(returnObj);
        }
        else{
            var q = conn.query(inQuery,function(error,result){
                if(error){
                    var message = "Error in Executing Simple Query1 : "+error;
                    logger.error(message);
                    returnObj.error = message;
                    callback(returnObj);
                }
                else{
                    returnObj = result;
                    callback(returnObj);
                }
                console.log(q.sql);
            });
        }
        conn.release();
    });
};
var executeQueryWithObj = function(inQuery,obj, callback){
    var returnObj = {
        data:null,
        error:null
    };
    //get a connection from the pool
    pool.getConnection(function(con_error,conn){
        if(con_error){
            var msg = "Error in getting connection";
            logger.error(msg);
            returnObj.error = msg;
            callback(returnObj);
        }
        else{
            var q = conn.query(inQuery,obj,function(error,result){
            console.log(q.sql);
                if(error){
                    var message = "Error in Executing Query : "+error.message;
                    logger.error(message);
                    returnObj.error = message;
                    callback(returnObj);
                }
                else{
                    returnObj = result;
                    callback(returnObj);
                }
            });
        }
        conn.release();
    });
};
module.exports.executeQuery = executeQuery;
module.exports.executeQueryWithObj = executeQueryWithObj;
