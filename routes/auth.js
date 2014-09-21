//some cryptographic functions
var DB      = require("../utils/dbMysql.js");
var cipher  = require("../utils/cipher.js");
var MAIL    = require("../utils/sendMail.js");
var cfg     = require("../configs/global_configs.json");
exports.authenticate = function(){
    return function(req,res){
        var jwt = require('jsonwebtoken');
        //take the emailid and password from the client
        var curr_email = req.body.email;
        var curr_pass = req.body.pass;
        var myQuery = "SELECT pass_salt, pass_hash, first_sign_in,user_id,first_name,last_name,invited_for FROM users where email_id = '"+curr_email+"'";
        DB.executeQuery(myQuery,function(result){
            if(result.length == 0){
                //means the email id doesnot exist
                res.send(200,{message:'User does not exist'});
                return;
            }
            else{
                var retrieved_salt = result[0].pass_salt;
                var retrieved_hash = result[0].pass_hash;
                var clientHash = cipher.hashPwd(retrieved_salt,curr_pass);
                if (retrieved_hash != clientHash) {
                    res.send(200, {message:'Wrong Password'});
                    return;
                }
                else{
                    var signing_entity = {
                        email:curr_email,
                        created_at:new Date()
                    };
                    var data={
                        first_name:result[0].first_name,
                        last_name:result[0].last_name,
                        type:result[0].invited_for,
                        user_id:result[0].user_id
                    }
                    var token = jwt.sign(signing_entity, cfg.TOKEN_SECRET);
                    res.send({ token: token,data:data,first_sign_in:result[0].first_sign_in });
                }
            }
        });
    }
};
exports.adauthenticate = function(){
    return function(req,res){
        var jwt = require('jsonwebtoken');
        //take the emailid and password from the client
        var uname = req.body.username;
        var curr_pass = req.body.pass;
        var myQuery = "SELECT pass_salt, pass_hash FROM admin where username = '"+uname+"'";
        DB.executeQuery(myQuery,function(result){
            if(result.length == 0){
                //means the email id doesnot exist
                res.send(200,{message:'User does not exist'});
                return;
            }
            else{
                var retrieved_salt = result[0].pass_salt;
                var retrieved_hash = result[0].pass_hash;
                var clientHash = cipher.hashPwd(retrieved_salt,curr_pass);
                if (retrieved_hash != clientHash) {
                    res.send(200, {message:'Wrong Password'});
                    return;
                }
                else{
                    var signing_entity = {
                        username:uname,
                        created_at:new Date()
                    };
                    var token = jwt.sign(signing_entity, cfg.TOKEN_SECRET);
                    res.send({ token: token});
                }
            }    
        });
    }
};
exports.addPassword = function(){
    return function(req,res){
        var email = req.body.email;
        var pass = req.body.pass;
        var salt = cipher.createSalt();
        var hash = cipher.hashPwd(salt,pass);
        var logger = req.app.get('logObj');
        var myQuery = "UPDATE admin SET pass_hash = '"+hash+"',pass_salt = '"+salt+"' WHERE username = '"+email+"'";
        DB.executeQuery(myQuery,function(result){
            result.message = "success";
            res.send(result);
        });
    }
};
exports.forgotPassword = function () {
    return function (req, res) {
        //get the new password from req body
        var to_email = req.body.email;
        var mailObj = require('./user.js');
        //generate a random password and encrypt it
        var tempPass = Math.random().toString(36).slice(-8);
        var salt = cipher.createSalt();
        var hash = cipher.hashPwd(salt, tempPass);
        var content = "Your password has been reset<br/>Please use the following password to sign in the app.<br/><br/>";
        content += tempPass;
        content += "<br/><br/>Thanks";
        var salt = cipher.createSalt();
        var hash = cipher.hashPwd(salt, tempPass);
        var myQuery = "UPDATE users SET `pass_salt` = '" + salt + "' , `pass_hash` = '" + hash + "' , `first_sign_in` = 'y' WHERE `email_id` = '" + to_email+"'";
        DB.executeQuery(myQuery,function(result){
            if(result.error == null){
                MAIL.sendMail(to_email,content,function(error,response){
                    if(error){
                    	console.log(error);
                        var mailNotSent = "CALL track_email('"+to_email+"','n')";
                        DB.executeQuery(mailNotSent,function(result){}); 
                    }else{
                        var mailSent = "CALL track_email('"+to_email+"','y')";
                        DB.executeQuery(mailSent,function(result){});   
                    }
                });
            }
            result.message = "success";
            res.send(result);
        });
    };
};

exports.updatePassword = function () {
    return function (req, res) {
        var npass = req.body.pass;
        //hash it
        var salt = cipher.createSalt();
        var hash = cipher.hashPwd(salt, npass);
        //hash the password and store salt with hash in db
        var salt = cipher.createSalt();
        var hash = cipher.hashPwd(salt, npass);
        var myQuery = "UPDATE users SET pass_salt = '" +salt + "' , pass_hash = '" + hash + "' , first_sign_in = 'n' WHERE user_id = '" +req.params.userid+"'";
        DB.executeQuery(myQuery,function(result){
            result.message = "success";
            res.send(result);    
        });        
    };
};
