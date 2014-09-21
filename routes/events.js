var DB = require("../utils/dbMysql.js");
function validateEvent(data){
    if(!data.hasOwnProperty('title') || 
        !data.hasOwnProperty('from_date') ||
        !data.hasOwnProperty('venue') ||
        !data.hasOwnProperty('latitude') ||
        !data.hasOwnProperty('longitude') ||
        !data.hasOwnProperty('twitter_tag') ||
        !data.hasOwnProperty('fb_page') ||
        !data.hasOwnProperty('youtube_playlist') ||
        !data.hasOwnProperty('event_type') ||
        !data.hasOwnProperty('short_description')){
        return false;
    }
    else{
        return true;
    }
}
exports.getAllEventsAdmin = function(){
    return function(req,res){
        var query = "SELECT * FROM events";   
        DB.executeQuery(query,function(result){
            var response = {};
            response.data = result;
            res.json(response);   
        });
    }
};
exports.getAllEvents = function(){
	return function(req,res){
        var myQuery = "SELECT event_id, title, event_type,from_date FROM events ORDER BY from_date DESC";
        DB.executeQuery(myQuery,function(result){
            result[0].from_date = new Date(result[0].from_date);
            var response = {};
            response.data = result;
            res.json(response);       
        });
	};
};
exports.getEventDetails = function(){
	return function(req,res){
        var myQuery = "SELECT * FROM events WHERE event_id = '"+req.params.eventid+"'";
        var myQuery1 = "SELECT takeaway FROM event_takeaways WHERE event_id = '"+req.params.eventid+"'";
        DB.executeQuery(myQuery,function(result_ev){
            DB.executeQuery(myQuery1,function(result_tk){
                var response = {};
                response['data'] = result_ev;
                response['takeaways'] = result_tk;  
                res.json(response);
            }); 
        });
	};
};
function pad(n){return n<10 ? '0'+n:n}
exports.getEventVenue = function(){
	return function(req,res){
        var myQuery = "SELECT latitude, longitude, venue FROM events WHERE event_id = '"+req.params.eventid+"'";
        DB.executeQuery(myQuery,function(result){
            var response = {};
            response.data = result;
            res.json(response);
        });
	};
};
exports.getEventAgenda = function(){
	return function(req,res){
        var myQuery = "SELECT * FROM event_agenda WHERE event_id = '"+req.params.eventid+"'";
        DB.executeQuery(myQuery,function(result){
            //convert the timestamps to date objects
            for(var item in result){
            	result[item].from_time = pad((new Date(result[item].from_time)).getHours())+':'+pad((new Date(result[item].from_time)).getMinutes());
            	result[item].to_time = pad((new Date(result[item].to_time)).getHours())+':'+pad((new Date(result[item].to_time)).getMinutes());
            }
            var response = {};
            response.data = result;
            res.json(response);
        });
	};
};
function getStartingTimestamp(){
    var d = new Date();
    var f = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+(d.getDate())+" 00:00:00";
    return f;  
}
function getEndingTimestamp(){
    var d = new Date();
    var f = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+(d.getDate())+" 23:59:59";
    return f;  
}
exports.checkNewRegistrants = function(){
	return function(req,res){
        var myQuery = "SELECT u.user_id, u.first_name,u.last_name, r.contact_number, r.company, r.skillset, r.experience_in_years FROM user_event_reg r, users u WHERE u.user_id = r.user_id AND r.event_id = '"+req.params.eventid+"' AND r.created_at > '"+getStartingTimestamp()+"' AND r.created_at < '"+getEndingTimestamp()+"'";
        DB.executeQuery(myQuery,function(result){
            var response = {};
            response.data = result;
            res.json(response);
        });
	};
};
//handling POST routes
exports.addNewEvent = function(){
	return function(req,res){
        var data = req.body;
        if(!validateEvent(data)){
            res.writeHead(500);
            res.end('ERROR - POST SYNTAX INCORRECT - ADD EVENT');
        }
        else{
            inserted_event_id = null;
            var evObj = {
                title : data.title,
                from_date : data.from_date,
                to_date : data.to_date,
                venue : data.venue,
                latitude : data.latitude,
                longitude : data.longitude,
                twitter_tag : data.twitter_tag,
                fb_page : data.fb_page,
                youtube_playlist : data.youtube_playlist,
                event_type : data.event_type,
                short_description : data.short_description,
                event_presentation : data.event_presentation,
                event_pics : data.event_pics
            };
            var inserted_event_id = null;
            var myQuery = "INSERT INTO events SET ?";
            DB.executeQueryWithObj(myQuery,evObj,function(result){
                if(result.error == null){
                    inserted_event_id = result.insertId;
                    var insQuery = "INSERT INTO event_takeaways (`event_id`,`takeaway`) VALUES ";
                    for(var i=0; i<data.takeaways.length;i++){
                        insQuery += "('"+inserted_event_id+"','"+data.takeaways[i]+"')";
                        if(i != (data.takeaways.length-1)){
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
        }
	};
};

exports.updateEvent = function(){
	return function(req,res){
        var data = req.body;
        var eventId = req.params.eventid;
        if(!validateEvent(data)){
            res.writeHead(500);
            res.end('ERROR - POST SYNTAX INCORRECT - UPDATE EVENT');
        }
        else{
            var evObj = {
                title : data.title,
                from_date : data.from_date,
                to_date : data.to_date,
                venue : data.venue,
                latitude : data.latitude,
                longitude : data.longitude,
                twitter_tag : data.twitter_tag,
                fb_page : data.fb_page,
                youtube_playlist : data.youtube_playlist,
                event_type : data.event_type,
                short_description : data.short_description,
                event_presentation : data.event_presentation,
                event_pics : data.event_pics
            };
            var myQuery = "UPDATE events SET ? WHERE event_id = '"+eventId+"'";
            DB.executeQueryWithObj(myQuery,evObj,function(result){
                var delQuery ="DELETE FROM event_takeaways where event_id = '"+eventId+"'";
                DB.executeQuery(delQuery,function(){});
                var insQuery = "INSERT INTO event_takeaways (`event_id`,`takeaway`) VALUES ";
                for(var i=0; i<data.takeaways.length;i++){
                    insQuery += "('"+eventId+"','"+data.takeaways[i]+"')";
                    if(i != (data.takeaways.length-1)){
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
exports.removeEvent = function(){
	return function(req,res){
        var eventId = req.params.eventid;
        var myQuery = "DELETE FROM events WHERE event_id = '"+eventId+"'";
        DB.executeQuery(myQuery,function(result){
            result.message="success";
            res.send(result);
        });
	};
};
exports.addFeedback = function(){
	return function(req,res){
        var data = req.body;
        var myQuery = "INSERT INTO event_feedback SET ?";
        DB.executeQueryWithObj(myQuery,data,function(result){
            result.message="success";
            res.send(result);
        });
	};
};

exports.addOverallFeedback = function(){
	return function(req,res){
        var data = req.body;
        //isolate the event and session data
        var event_data = data.event_rating;
        var session_data = data.session_ratings;
        var evId = session_data.event_id;
        var uId = session_data.user_id;
        //first put the data in the event_feedback table
        var evQuery = "CALL insert_event_feedback ('"+evId+"','"+uId+"','"+event_data.liked_about_event+"','"+event_data.not_liked_about_event+"','"+event_data.event_rating+"')";
        //console.log(session_data);
       	DB.executeQuery(evQuery,function(result){});
        //now iteratively put the session ratings
        var insQuery = "INSERT INTO user_feedback (`event_id`,`agenda_id`,`user_id`,`rating`,`feedback`) VALUES ";
        for(var i=0; i<session_data.agendas.length;i++){
            insQuery += "('"+evId+"','"+session_data.agendas[i].session_id+"','"+uId+"',"+session_data.agendas[i].session_rating+",'"+session_data.agendas[i].session_feedback+"')";
            if(i != (session_data.agendas.length-1)){
                insQuery += ",";
            }
        }
        insQuery += " ON DUPLICATE KEY UPDATE rating=values(rating), feedback=values(feedback)"
		DB.executeQuery(insQuery,function(result){
			result.message = "success";
            res.send(result);	
		});
        
        //now iterate for the speakers rating
        for(var se = 0;se<session_data.agendas.length;se++){
        	if(session_data.agendas[se].speakers){
		    	for(var sp = 0;sp<session_data.agendas[se].speakers.length;sp++){
		    		var spk_insert = "CALL insert_feedback_speaker('"+evId+"','"+session_data.agendas[se].session_id+"','"+uId+"','"+session_data.agendas[se].speakers[sp].speaker_id+"','"+session_data.agendas[se].speakers[sp].speaker_rating+"')";
		    		DB.executeQuery(spk_insert,function(result){});
		    	}
		    }
        }
	};
};
exports.checkEventFeedback = function(){
	return function(req,res){
        var myQuery = "SELECT EXISTS (SELECT 1 FROM event_feedback WHERE event_id = '"+req.params.eventid+"' AND user_id = '"+req.params.userid+"' ) as matches";
        DB.executeQuery(myQuery,function(result){
            var response = {};
            response.data = result;
            res.json(response);
        });
	};
};
exports.populateFeedback = function(){
	return function(req,res){
    	//we have the event id...get all the agendas for this event and then all the speakers for each agenda
    	var getAgendas = "SELECT agenda_id, agenda_title,is_break FROM event_agenda WHERE event_id = '"+req.params.eventid+"'";
    	DB.executeQuery(getAgendas, function(ev_agendas){
    		//console.log(ev_agendas);
    		//for each agenda get the speakers
    		var response = [];
    		for(var ag in ev_agendas){
    			var curr_agenda = ev_agendas[ag].agenda_id;
    			var getSpeakers = "SELECT e.agenda_id,e.agenda_title,s.speaker_id,s.fname, s.lname FROM agenda_speaker a, speakers s, event_agenda e WHERE a.speaker_id = s.speaker_id AND e.agenda_id = a.agenda_id AND a.agenda_id = '"+curr_agenda+"'";
    			DB.executeQuery(getSpeakers,function(ag_speakers){
    				//console.log(ag_speakers);
    				response.push(ag_speakers);
    				if(response.length == ev_agendas.length){
    					//now make a new object
    					var obj = [];
    					for(var gg in ev_agendas){
    						var temp = {};
    						temp.speakers = [];
    						for(var hh in response){
    							for(var jj in response[hh]){
									if(ev_agendas[gg].agenda_id == response[hh][jj].agenda_id){
										var ts ={};
										ts.speaker_id = response[hh][jj].speaker_id;
										ts.speaker_name = response[hh][jj].fname + " "+ response[hh][jj].lname;
										temp.speakers.push(ts);
									}
								}
	    					}
	    					temp.agenda_id = ev_agendas[gg].agenda_id;
    						temp.agenda_title = ev_agendas[gg].agenda_title;
    						temp.is_break = ev_agendas[gg].is_break;
	    					obj.push(temp);
    					}
    					var r = {};
    					r.data = obj;
    					res.json(r);
    				}
    			});	
    		}
    	});
	};
};
