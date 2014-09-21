var crypto = require('crypto')
function hashPwd(salt, pwd)
{

	var hmac = crypto.createHmac('sha1', salt);
	return hmac.update(pwd).digest('hex');

}


function createSalt()
{
	return crypto.randomBytes(120).toString('base64');

}

exports.addPassword = function(poolobj){
    return function(req,res){
        res.header("Access-Control-Allow-Origin", "*");
	   res.header("Access-Control-Allow-Headers", "X-Requested-With");
        var email = req.body.email;
        var pass = req.body.pass;
        var salt = createSalt();
        var hash = hashPwd(salt,pass);
        var logger = req.app.get('logObj');
        console.log("Salt is : "+salt);
        console.log("Hash is : "+hash);
        poolobj.getConnection(function(con_error,conn){
				if(con_error){
					logger.error('ERROR - Getting Connection : '+con_error.message);
					res.writeHead(500);
					res.end(con_error.message);
				}
				else{
					var myQuery = 'UPDATE users SET pass_hash = '+conn.escape(hash)+',pass_salt = '+conn.escape(salt)+'                         WHERE email_id = '+conn.escape(email);
					var w = conn.query(myQuery,function(error,result){
						if(error){
							logger.error('ERROR - ADDING PASWWORD : '+error.message);
							res.writeHead(500);
							res.end(error.message);
						}
						else{
							res.send({message:'success'});
						}
					});
                    console.log(w.sql);
					conn.release();
				}	
			});
    }
};
exports.authenticate=function(poolobj){
    return function(req,res){
        res.header("Access-Control-Allow-Origin", "*");
	     res.header("Access-Control-Allow-Headers", "X-Requested-With");
         var jwt = require('jsonwebtoken');
        var curr_email = req.body.email;
        var curr_pass = req.body.pass;
        var new_pass = req.body.newpass;
        //retrieve the pass salt and hash from db
         poolobj.getConnection(function(con_error,conn){
				if(con_error){
					logger.error('ERROR - Getting Connection : '+con_error.message);
					res.writeHead(500);
					res.end(con_error.message);
				}
				else{
					var myQuery = 'SELECT pass_salt, pass_hash FROM users where email_id = '+conn.escape(curr_email);
					var w = conn.query(myQuery,function(error,result){
						if(error){
							logger.error('ERROR - RETRIEVING PASSWORD FROM DB : '+error.message);
							res.writeHead(500);
							res.end(error.message);
						}
						else{
							var retrieved_salt = result[0].pass_salt;
                            var retrieved_hash = result[0].pass_hash;
                            var clientHash = hashPwd(retrieved_salt,curr_pass);
                            if (retrieved_hash != clientHash) {
                                res.send(401, 'Wrong email or password');
                                return;
                            }
                            else{
                               var profile={
                                            email:curr_email
                                        }
                                        var token = jwt.sign(profile, req.app.get('secret'), { expiresInMinutes: 60*5 });
                                        res.json({ token: token });
                            }
				        }
					});
					conn.release();
				}	
			});
       
          
    }
};

exports.authenticateWithPasswordReset=function(poolobj){
    return function(req,res){
        res.header("Access-Control-Allow-Origin", "*");
	     res.header("Access-Control-Allow-Headers", "X-Requested-With");
         var jwt = require('jsonwebtoken');
        var curr_email = req.body.email;
        var curr_pass = req.body.pass;
        var new_pass = req.body.newpass;
        //retrieve the pass salt and hash from db
         poolobj.getConnection(function(con_error,conn){
				if(con_error){
					logger.error('ERROR - Getting Connection : '+con_error.message);
					res.writeHead(500);
					res.end(con_error.message);
				}
				else{
                    //first verify the current password
					var myQuery = 'SELECT pass_salt, pass_hash FROM users where email_id = '+conn.escape(curr_email);
					var w = conn.query(myQuery,function(error,result){
						if(error){
							logger.error('ERROR - RETRIEVING PASSWORD FROM DB : '+error.message);
							res.writeHead(500);
							res.end(error.message);
						}
						else{
							var retrieved_salt = result[0].pass_salt;
                            var retrieved_hash = result[0].pass_hash;
                            var clientHash = hashPwd(retrieved_salt,curr_pass);
                            if (retrieved_hash != clientHash) {
                                res.send(401, 'Wrong email or password');
                                return;
                            }
                            else{
                                //the password matches....update the password
                                var update_password_query = 'UPDATE users SET pass_hash = '+conn.escape(hash)+',pass_salt = '+conn.escape(salt)+' WHERE email_id = '+conn.escape(curr_email);
                                conn.query()
                               var profile={
                                            email:curr_email
                                        }
                                        var token = jwt.sign(profile, req.app.get('secret'), { expiresInMinutes: 60*5 });
                                        res.json({ token: token });
                            }
				        }
					});
					conn.release();
				}	
			});
       
          
    }
};
exports.authorisedGet=function(){
    return function(req,res){
        console.log(req.headers.Authorization);
        res.header("Access-Control-Allow-Origin", "*");
	    res.header("Access-Control-Allow-Headers", "X-Requested-With, Authorization");
            res.json({
                name: 'foo'
            });
    }
};