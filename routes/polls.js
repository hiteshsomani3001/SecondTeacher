var DB = require("../utils/dbMysql.js");

exports.getCurrentPollForEvent = function(){
	return function(req,res){
		var eventId = req.params.eventid;
		var myQuery = "SELECT q.*, m.mapping_id,m.option_text, m.is_correct FROM questions q, qans_mapping m WHERE q.q_id = m.q_id AND q.event_id = '"+eventId+"'";
		var response = {};
		var qarr = [];
		DB.executeQuery(myQuery,function(result){
			var response = [];
			for(var item in result){
				if(result[item-1]){
					if(result[item].q_id != result[item-1].q_id){
						var respObj = {};
						respObj = JSON.parse(JSON.stringify(result[item]));
						delete respObj.option_text;
						delete respObj.is_correct;
						delete respObj.mapping_id;
						response.push(respObj);
					}			
				}else if(item == 0){
					var respObj = {};
					respObj = JSON.parse(JSON.stringify(result[item]))
					delete respObj.option_text;
					delete respObj.is_correct;
					delete respObj.mapping_id;
					response.push(respObj);
				}
			}
			
			//again iterate the result to add the answers
			for(var ii in response){
				response[ii].answers = [];
				for(var jj in result){
					if(response[ii].q_id == result[jj].q_id){
						var tmpobj = {};
						tmpobj.mapping_id = result[jj].mapping_id;
						tmpobj.option_text = result[jj].option_text;
						tmpobj.is_correct = result[jj].is_correct;
						response[ii].answers.push(tmpobj);
					}
				}
			
			}
			var r = {};
			r.data = response;
			res.json(r);
		});
	}
};
exports.getQuestionTypes = function(){
	return function(req,res){
		var eventId = req.params.eventid;
		var myQuery = "SELECT * FROM question_type";
		DB.executeQuery(myQuery,function(result){
			var response = {};
			response.data = result;
			res.json(response);
		});
	}
};
exports.getResponseByEvent = function(){
	return function(req,res){
		var eventId = req.params.eventid;
		var myQuery = "SELECT q.q_text, u.first_name, u.last_name, m.option_text, m.is_correct, r.user_textual_response FROM questions q, users u, qans_mapping m , user_response r WHERE r.user_id = u.user_id AND r.q_id = q.q_id AND r.mapping_id = m.mapping_id AND q.event_id = '"+eventId+"' ORDER BY q.q_text";
		DB.executeQuery(myQuery,function(result){
			var response = {};
			response.data = result;
			res.json(response);
		});
	}
};
exports.checkUserResponse = function(){
	return function(req,res){
		var qid = req.params.qid;
		var uid = req.params.userid;
		var myQuery = "SELECT EXISTS (SELECT 1 FROM user_response WHERE user_id = '"+uid+"' AND q_id = '"+qid+") as matches";
		DB.executeQuery(myQuery,function(result){
			var response = {};
			response.data = result;
			res.json(response);
		});
	}
};

//add , update , delete functionalities
exports.addQuestion = function(){
	return function(req,res){
		var data = req.body;
		var qObj = {
			q_text:data.q_text,
			q_type:data.q_type,
			event_id:data.event_id,
			is_visible:'n'
		};
		var insQues = "INSERT INTO questions SET ?";
		DB.executeQueryWithObj(insQues,qObj,function(result){
			//now we have to insert in the ques ans mapping table
			QID = result.insertId;
			var insMappingQuery = "INSERT INTO qans_mapping (`q_id`,`option_text`,`is_correct`) VALUES ";
			for(var i=0; i<data.answers.length;i++){
		        insMappingQuery += "('"+QID+"','"+data.answers[i].option_text+"','"+data.answers[i].is_correct+"')";
		        if(i != (data.answers.length-1)){
		            insMappingQuery += ",";
		        }
		    }
		    DB.executeQuery(insMappingQuery,function(result1){
		    	result1.message = "success";
		    	res.send(result1);
		    });
		});	
	}
};

exports.updateQuestion = function(){
	return function(req,res){
		var data = req.body;
		qId = req.params.qid;
		var qObj = {
			q_text:data.q_text,
			q_type:data.q_type,
			event_id:data.event_id,
			is_visible:data.is_visible
		};
		var updQues = "UPDATE questions SET ? WHERE q_id = '"+qId+"'";
		DB.executeQueryWithObj(updQues,qObj,function(result){
			//now we have to update in the ques ans mapping table
			result.message = "success";
			res.send(result);
			for(var item in data.answers){
				var updObj = {};
				updObj.q_id = qId;
				updObj.option_text = data.answers[item].option_text;
				updObj.is_correct = data.answers[item].is_correct;
				var updMappingQuery = "UPDATE qans_mapping SET ? WHERE mapping_id = '"+data.answers[item].mapping_id+"'";	
				DB.executeQueryWithObj(updMappingQuery,updObj,function(result1){});
			}
		});	
	}
};
exports.deleteQuestion = function(){
	return function(req,res){
		var qId = req.params.qid;
		var delQues = "DELETE FROM questions WHERE q_id = '"+qId+"'";
		DB.executeQuery(delQues,function(result){
			result.message = "success";
			res.send(result);
		});	
	}
};

exports.getPollResponse = function(){
	return function(req,res){
		var data = req.body;
		var userId = data.user_id;
		var insQuery = "INSERT INTO user_response (`user_id`,`q_id`,`mapping_id`,`user_textual_response`) VALUES ";
		for(var i=0; i<data.answers.length;i++){
            insQuery += "('"+userId+"','"+data.answers[i].q_id+"','"+data.answers[i].mapping_id+"','"+data.answers[i].user_textual_response+"')";
            if(i != (data.answers.length-1)){
                insQuery += ",";
            }
        }
        DB.executeQuery(insQuery,function(result){
        	result.message = "success";
        	res.send(result);
        });
	}
};

exports.activateQuestion = function(){
	return function(req,res){
		var qId = req.params.qid;
		var actQuery = "UPDATE questions SET is_visible = IF(is_visible = 'y','n','y')";
        DB.executeQuery(actQuery,function(result){
        	result.message = "success";
        	res.send(result);
        });
	}
};

