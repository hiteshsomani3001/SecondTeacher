var DB 			= require("../utils/dbMysql.js");
var global_config   	= require("../configs/global_configs.json");
function validateSpeaker(data){
    if(!data.hasOwnProperty('fname') ||
        !data.hasOwnProperty('lname') ||
        !data.hasOwnProperty('skills') ||
        !data.hasOwnProperty('parent_company') ||
        !data.hasOwnProperty('designation') ||
        !data.hasOwnProperty('profile_pic_url') ||
        !data.hasOwnProperty('overview') ||
        !data.hasOwnProperty('work_experience') ||
        !data.hasOwnProperty('educational_background') ||
        !data.hasOwnProperty('linkedin_profile')){
            return false;
    }
    else{
        return true;
    }
}
exports.getSpeakerDetails = function(){
	return function(req,res){
        var myQuery = "SELECT * FROM speakers WHERE speaker_id = '"+req.params.speakerid+"'";
        DB.executeQuery(myQuery,function(result){
            var response = {};
            response.data = result;
            res.json(response);
        });
	}
};

exports.getAllSpeakers = function(){
	return function(req,res){
        var myQuery = "SELECT * FROM speakers";
        DB.executeQuery(myQuery,function(result){
            var response = {};
            response.data = result;
            res.json(response);
        });
	}
};
exports.getSpeakersByEvent = function(){
	return function(req,res){
        var myQuery = "SELECT s.speaker_id, e.agenda_title, s.fname, s.lname, s.designation, s.overview FROM event_agenda e, agenda_speaker a , speakers s WHERE e.agenda_id = a.agenda_id AND a.speaker_id = s.speaker_id AND e.event_id = '"+req.params.eventid+"' ORDER BY e.from_time";
        DB.executeQuery(myQuery,function(result){
            var response = {};
            response.data = result;
            res.json(response);
        });
	}
};

exports.getSpeakerRatingByEvent = function(){
	return function(req,res){
		var eventId = req.params.eventid;
        var myQuery = "SELECT s.fname, s.lname, a.agenda_title, u.first_name, u.last_name, f.rating FROM agenda_speaker_feedback f, speakers s, event_agenda a, users u WHERE f.speaker_id = s.speaker_id AND f.agenda_id = a.agenda_id AND f.user_id = u.user_id and f.event_id = '"+eventId+"' ORDER BY s.fname";
        DB.executeQuery(myQuery,function(result){
            var response = {};
            response.data = result;
            res.json(response);
        });
	}
};
//handling the POST routes 
exports.addNewSpeaker = function(){
	return function(req,res){
        var data = req.body;
        //append the server url to the profile pic url
        var tt = global_config.SERVER_URL;
        tt += req.params.pic_name+'.'+data.profile_pic_url;
        data.profile_pic_url = tt;
        /*if(!validateSpeaker(data)){
            res.writeHead(500);
            res.end('ERROR - POST SYNTAX INCORRECT - ADD SPEAKER');
        }
        else{*/
            var myQuery = "INSERT INTO speakers SET ?";
            DB.executeQueryWithObj(myQuery,data,function(result){
                result.message="success";
                result.speakerId = result.insertId;
                res.send(result);
            });
        //}
	}
};

exports.updateSpeaker = function(){
	return function(req,res){
        var data = req.body;
        var speakerId = req.params.speakerid;
        //append the server url to the profile pic url
        var tt = global_config.SERVER_URL;
        tt += req.params.pic_name+'.'+data.profile_pic_url;
        data.profile_pic_url = tt;
        if(!validateSpeaker(data)){
            res.writeHead(500);
            res.end('ERROR - POST SYNTAX INCORRECT - UPDATE SPEAKER');
        }
        else{
            var myQuery = "UPDATE speakers SET ? WHERE speaker_id = '"+speakerId+"'";
            DB.executeQueryWithObj(myQuery,data,function(result){
                result.message="success";
                res.send(result);
            });
        }
	};
};

exports.removeSpeaker = function(){
	return function(req,res){
        var speakerId = req.params.speakerid;
        var myQuery = "DELETE FROM speakers WHERE speaker_id = '"+speakerId+"'";
        DB.executeQuery(myQuery,function(result){
            result.message="success";
            res.send(result);
        });
	};
};

exports.uploadSpeakerImage = function(){
	return function(req,res){
		var fs = require('fs');
		fs.readFile(req.files[0].path, function (err, data) {
			var ext = req.files[0].name.substr(req.files[0].name.lastIndexOf('.') + 1);
	  		var newPath = './public/images/speakers/'+req.params.sname+'.'+ext.toLowerCase();
	  		fs.writeFile(newPath, data, function (err) {
	    		if(err){
	    			res.writeHead(500);
					res.end(err.message);
	    		}
	    		else{
	    			res.send({message:"Image Uploaded"});
	    		}
	  		});
		});
	}
};
