//GET REQUESTS
var DB  = require("../utils/dbMysql.js");
var PQ  = require("../utils/queryParser.js");
var q   = require("../queries/queries.json");
exports.getAgendaDetails = function(poolobj){
	return function(req,res){
        var myQuery = "SELECT * FROM event_agenda WHERE agenda_id = '"+req.params.agendaid+"'";
        var q2 = "SELECT s.speaker_id,s.fname, s.lname, s.overview FROM agenda_speaker a, speakers s WHERE a.speaker_id = s.speaker_id AND a.agenda_id = '"+req.params.agendaid+"'";
        var response = {
            data:{}
        };
        DB.executeQuery(myQuery,function(result){
            response.data.eventdetails = result;
            DB.executeQuery(q2,function(result1){
                response.data.speakers = result1;
                res.json(response);
            });
        });            
	};
};

exports.checkfeedback = function(){
	return function(req,res){
        var myQuery = "SELECT rating, is_liked, is_loved, feedback FROM user_feedback WHERE agenda_id = '"+req.params.agendaid+"' AND user_id = '"+req.params.userid+"'";
        var response={};
        DB.executeQuery(myQuery,function(result){      
            response.data = result;
            res.json(response);    
        });
	};


};
exports.getFeedbackForEvent = function(){
	return function(req,res){
        var myQuery = "SELECT a.agenda_title, f.rating, f.feedback, f.is_liked, f.is_loved, u.first_name, u.last_name, u.email_id FROM user_feedback f, users u, event_agenda a WHERE f.user_id = u.user_id AND f.agenda_id = a.agenda_id AND f.event_id = '"+req.params.eventid+"' ORDER BY agenda_title";
        var response={};
        DB.executeQuery(myQuery,function(result){
            response.data = result;
            res.json(response);
        });  
	};
};

//POST REQUESTS
function validateAgenda(data){
    if(!data.hasOwnProperty('event_id') || 
        !data.hasOwnProperty('from_time') ||
        !data.hasOwnProperty('to_time') ||
        !data.hasOwnProperty('agenda_title') ||
        !data.hasOwnProperty('overview') || 
        !data.hasOwnProperty('is_break')){
        return false;
    }
    else{
        return true;
    }
}
exports.addNewAgenda = function(){
	return function(req,res){
        var data = req.body;
        if(!validateAgenda(data)){
                res.writeHead(500);
                res.end('ERROR - POST SYNTAX INCORRECT : ADDING AGENDA');
        }
        else{
            var agendaObj = {
                event_id : data.event_id,
                from_time : data.from_time,
                to_time : data.to_time,
                agenda_title : data.agenda_title,
                short_desc : data.short_desc,
                overview : data.overview
            };
            var response = {};
            var inserted_agenda_id = null;
            var myQuery = "INSERT INTO event_agenda SET ?";
            DB.executeQueryWithObj(myQuery,agendaObj,function(result){
                if(result.error == null){
                    inserted_agenda_id = result.insertId;
                    var insQuery = "INSERT INTO agenda_speaker (`agenda_id`,`speaker_id`) VALUES ";
                    for(var i=0; i<data.speakers.length;i++){
                        insQuery += "('"+inserted_agenda_id+"','"+data.speakers[i]+"')";
                        if(i != (data.speakers.length-1)){
                            insQuery += ",";
                        }
                    }
                    DB.executeQuery(insQuery,function(result){
                        result.message = "success";
                        res.send(result); 

                    });    
                }
                else{
                    res.send(result);
                }
                
            });
	   };
    }
};


exports.updateAgenda = function(){
	return function(req,res){
        var data = req.body;
        if(!validateAgenda(data)){
                res.writeHead(500);
                res.end('ERROR - POST SYNTAX INCORRECT : UPDATING AGENDA');
        }
        else{
            var agendaObj = {
                event_id : data.event_id,
                from_time : data.from_time,
                to_time : data.to_time,
                agenda_title : data.agenda_title,
                short_desc : data.short_desc,
                overview : data.overview
            };
            var myQuery = "UPDATE event_agenda SET ? WHERE agenda_id = '"+req.params.agendaid+"'";
            DB.executeQueryWithObj(myQuery,agendaObj,function(result){
                var delQuery ="DELETE FROM agenda_speaker where agenda_id = '"+req.params.agendaid+"'";
                DB.executeQuery(delQuery,function(){});
                inserted_agenda_id = req.params.agendaid;
                var insQuery = "INSERT INTO agenda_speaker (`agenda_id`,`speaker_id`) VALUES ";
                for(var i=0; i<data.speakers.length;i++){
                    insQuery += "('"+inserted_agenda_id+"','"+data.speakers[i]+"')";
                    if(i != (data.speakers.length-1)){
                        insQuery += ",";
                    }
                }
                DB.executeQuery(insQuery,function(result){
                    result.message = "success";
                    res.send(result); 
                });
            });   
        }
	}
};
exports.removeAgenda = function(){
	return function(req,res){
        var myQuery = "DELETE from event_agenda WHERE agenda_id = '"+req.params.agendaid+"'";
        DB.executeQuery(myQuery,function(result){
            result.message="success";
            res.send(result);
        });
	}
};
exports.insertFeedback = function(){
	return function(req,res){
        var data = req.body;
        //validate the data
        if(!data.hasOwnProperty('event_id') ||
            !data.hasOwnProperty('agenda_id') ||
            !data.hasOwnProperty('user_id') ||
            !data.hasOwnProperty('is_liked') ||
            !data.hasOwnProperty('is_loved')){
            res.writeHead(500);
            res.end('ERROR - POST SYNTAX INCORRECT');
        }
        else{
            var myQuery = null;
 
            myQuery = "CALL insert_feedback("+data.event_id+","+data.agenda_id+","+data.user_id+",\'"+data.is_liked+"\',\'"+data.is_loved+"\')";
            DB.executeQuery(myQuery,function(result){
                result.message = "success";
                res.send(result);
            });
        }
    }
};
