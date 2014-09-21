var DB      = require("../utils/dbMysql.js");
var cipher  = require("../utils/cipher.js");
var MAIL    = require("../utils/sendMail.js");
var cfg     = require("../configs/global_configs.json");
exports.checkUser = function(){
	return function(req,res){
        var myQuery = "SELECT count(*) AS num, user_id, first_name, last_name, invited_for AS type FROM users WHERE email_id  = '"+req.params.email+"'";
        DB.executeQuery(myQuery,function(result){
            var response = {};
            response.data = result;
            res.json(response);
        });
	};
};
exports.getAllUsers = function(){
	return function(req,res){
        var myQuery = "SELECT * FROM users";
        DB.executeQuery(myQuery,function(result){
            var response = {};
            response.data = result;
            res.json(response);
        });
	}
};

exports.getAllUsersForEvent = function(){
	return function(req,res){
        var myQuery = "SELECT u.user_id, u.first_name,u.last_name, r.contact_number, r.has_attended,r.company, r.skillset, r.experience_in_years FROM user_event_reg r, users u WHERE u.user_id = r.user_id AND r.event_id = '"+req.params.eventid+"'";
         DB.executeQuery(myQuery,function(result){
            var response = {};
            response.data = result;
            res.json(response);
        });
	}
};

exports.getPresentUsersForEvent = function(){
	return function(req,res){
        var myQuery = "SELECT u.first_name,u.last_name, r.contact_number, r.company, r.has_attended,r.skillset, r.experience_in_years FROM user_event_reg r, users u WHERE u.user_id = r.user_id AND r.event_id = '"+req.params.eventid+"' AND r.has_attended = 'yes'";
        DB.executeQuery(myQuery,function(result){
            var response = {};
            response.data = result;
            res.json(response);
        });
	}
};

exports.getSuggestedPeopleForEvent = function(){
	return function(req,res){
        var myQuery = "SELECT s.fname, s.lname, s.contact_number, s.email, u.first_name as suggestor_name, u.email_id as suggestor_email FROM suggest_people s, users u WHERE s.referred_by = u.user_id AND s.event_id = '"+req.params.eventid+"'";
        DB.executeQuery(myQuery,function(result){
            var response = {};
            response.data = result;
            res.json(response);
        });
	}
};

exports.checkRegistration = function(){
	return function(req,res){
        var myQuery = "SELECT EXISTS (SELECT 1 FROM user_event_reg WHERE event_id = '"+req.params.eventid+"' AND user_id = '"+req.params.userid+"' ) as matches";
        DB.executeQuery(myQuery,function(result){
            var response = {};
            response.data = result;
            res.json(response);
        });
	}
};
//handling POST routes 
var addNewUser = function(insertObj){
    var data = insertObj;
    var tempPass = Math.random().toString(36).slice(-8);    //random number generation
    var tempSalt = cipher.createSalt();
    var tempHash = cipher.hashPwd(tempSalt,tempPass);
    data.pass_salt = tempSalt;
    data.pass_hash = tempHash;
    data.first_sign_in='y';
    var mailContent = "Hi, your account has been created. Use the same email and given password for signing in.";
    mailContent += "<br/>Your password is : "+tempPass+"<br/>";
    
    var insQuery = "CALL insert_user('"+data.email_id+"','"+data.first_name+"','"+data.last_name+"','"+data.contact_number+"','"+data.invited_for+"','"+data.pass_salt+"','"+data.pass_hash+"','y')";
    DB.executeQuery(insQuery,function(result){
        if(result.error == null){       //means that data was inserted successfully
            MAIL.sendMail(data.email_id,mailContent,function(error,response){
                if(error){
                    var mailNotSent = "CALL track_email('"+data.email_id+"','n')";
                    DB.executeQuery(mailNotSent,function(result){});
                    console.log("Error in sending the mail : "+error.message);  
                }else{
                    var mailSent = "CALL track_email('"+data.email_id+"','y')";
                    DB.executeQuery(mailSent,function(result){});
                    console.log("Mail sent to "+data.email_id+" , now inserting the data in the database");   
                }
            });   
        }
    }); 
};

exports.addAllUsers = function(poolobj){
	return function(req,res){
        var csv = require("fast-csv");
        var fs=require("fs");
        var globalUsersNitro = [];
        var globalUsersGM = [];
        var nitro_file = './content/uploads/'+cfg.NITRO_USERS_FILE;
        var gm_file = './content/uploads/'+cfg.GM_USERS_FILE;
        var nitro_stream = fs.createReadStream(nitro_file);
        nitro_stream.on('error', function(err) {
            console.log("Nitro Users file not there....skipping it");
            res.send("Status OK");
        });
        var gm_stream = fs.createReadStream(gm_file);
        gm_stream.on('error', function(err) {
            console.log("GM Users file not there....skipping it");
            res.send("Status OK");
        });
        var checkExistingUsers = "SELECT email_id FROM users";
        DB.executeQuery(checkExistingUsers,function(result){
            var emails = [];
            for(var item in result){
                emails.push(result[item].email_id);
            }
            nitro_stream.on('readable',function(){
                csv
                .fromStream(nitro_stream, {headers : true})
                .on("record",function(data){
                    if(emails.indexOf(data.EmailId) == -1){ //means the email is not already there in the database
                        var myObj = {
                            email_id:data.EmailId,
                            first_name:data.FirstName,
                            last_name:data.LastName,
                            contact_number:data.ContactNumber,
                            invited_for:'nitro'
                        };
                        globalUsersNitro.push(myObj);
                    }
                })
                .on("end",function(){
                    for(var item in globalUsersNitro){
                        addNewUser(globalUsersNitro[item]);
                    }
                    //delete the nitro users file
                    nitro_stream.destroy();
                    fs.unlink(nitro_file, function (err) {
                        if (err) throw err;
                        console.log('Successfully deleted nitro file after adding the users');
                    });
                    res.send("Status OK");
                });
            });
            
            gm_stream.on('readable',function(){
                csv
                .fromStream(gm_stream, {headers : true})
                .on("record",function(data){
                    if(emails.indexOf(data.EmailId) == -1){ //means the email is not already there in the database
                        var myObj = {
                            email_id:data.EmailId,
                            first_name:data.FirstName,
                            last_name:data.LastName,
                            contact_number:data.ContactNumber,
                            invited_for:'gm'
                        };
                        globalUsersGM.push(myObj);
                    }
                })
                .on("end",function(){
                    for(var item in globalUsersGM){
                        addNewUser(globalUsersGM[item]);
                    }
                    //delete the gm users file
                    gm_stream.destroy();
                    fs.unlink(gm_file, function (err) {
                        if (err) throw err;
                        console.log('Successfully deleted gm file after adding the users');
                    });
                    res.send("Status OK");
                });     
            });
            
        });   
    }
};

exports.updateUser = function(){
	return function(req,res){
        var data = req.body;
        var userId = req.params.userid;
        var myQuery = "UPDATE users SET ? WHERE user_id = '"+userId+"'";
        DB.executeQueryWithObj(myQuery,data,function(result){
            result.message = "success";
            res.send(result);
        });
	};
};

exports.deleteUser = function(){
	return function(req,res){
        var userId = req.params.userid;
        var myQuery = "DELETE FROM users WHERE user_id = '"+userId+"'";
        DB.executeQuery(myQuery,function(result){
            result.message = "success";
            res.send(result);     
        });
	};
};

exports.registerUserForEvent = function(){
	return function(req,res){
        var data = req.body;
        if(!data.hasOwnProperty('user_id') ||
            !data.hasOwnProperty('event_id') ||
            !data.hasOwnProperty('designation') ||
            !data.hasOwnProperty('contact_number') ||
            !data.hasOwnProperty('company') ||
            !data.hasOwnProperty('skillset') ||
            !data.hasOwnProperty('experience_in_years') ||
            !data.hasOwnProperty('has_denied')){
            res.writeHead(500);
            res.end('ERROR - POST SYNTAX INCORRECT - REGISTER USER FOR EVENT');
        }
        else{
            var myQuery = "INSERT INTO user_event_reg SET ?";
            DB.executeQueryWithObj(myQuery,data,function(result){
                result.message = "success";
                res.send(result);       
            });
        }
	}
};

exports.insertSuggestions = function(){
	return function(req,res){
        var d = req.body;
        var data = d.contacts;
        var insQuery = "INSERT INTO suggest_people (`event_id`,`referred_by`,`fname`,`lname`,`contact_number`,`email`) VALUES ";
        for(var i=0;i<data.length;i++){
            insQuery += "('"+data[i].event_id+"','"+data[i].referred_by+"','"+data[i].fname+"','"+data[i].lname+"','"+data[i].contact_number+"','"+data[i].email+"')";
                if(i != (data.length-1)){
                    insQuery += ",";
                }
        }
        DB.executeQuery(insQuery,function(result){
            result.message="success"; 
            res.send(result);
        });
	}
};

exports.logout = function(){
	return function(req,res){
        var userId = req.body.userid;
        var deviceToken = req.body.device_token;
        var myQuery = "DELETE FROM notifications WHERE user_id = '"+userId+"' AND device_token = '"+deviceToken+"'";
        DB.executeQuery(myQuery,function(result){
            result.message="success"; 
            res.send(result);
        });
	}
};

exports.markAttendance = function(){
	return function(req,res){
        var eventId = req.body.event_id;
        var userId = req.body.user_id;
        var myQuery = "UPDATE user_event_reg SET has_attended = 'yes' WHERE event_id = '"+eventId+"' AND user_id = '"+userId+"'";
        DB.executeQuery(myQuery,function(result){
            result.message="success"; 
            res.send(result);
        });
	}
};
exports.addOfflineUser = function(){
    return function(req,res){
        var data = req.body;
        //prepare the object to be inserted
        var tempUser = {
            email_id:data.email,
            first_name:data.fname,
            last_name:data.lname,
            contact_number:data.contact_number,
            invited_for:data.event_type   
        };
        addNewUser(tempUser);
        
        //get the userid for the entered user
        uid ="";
        var getQuery = "SELECT user_id FROM users where email_id = '"+data.email+"'";
        DB.executeQuery(getQuery,function(result){
        	uid = result[0].user_id;
        	var tempReg = {
        		user_id:uid,
		    event_id:data.event_id,
		    contact_number:data.contact_number,
		    company:data.company,
		    skillset:data.skillset,
		    experience_in_years:data.experience,
		    designation:data.designation,
		    has_attended:'yes'
		};
		var query = "INSERT INTO user_event_reg SET ?";
		DB.executeQueryWithObj(query,tempReg, function(result){
		    result.message="success";
		    res.send(result);    
		});	
        });
        
        
    }  
};
