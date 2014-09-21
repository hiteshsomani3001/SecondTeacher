var authObj     = require('./routes/auth');
var eventObj    = require('./routes/events');
var agendaObj   = require('./routes/agenda');
var speakerObj  = require('./routes/speaker');
var userObj     = require('./routes/user');
var pollObj		= require('./routes/polls');
var nwObj       = require('./routes/network');
var notif       = require('./routes/notifications');
var cfg         = require('./configs/global_configs.json');
module.exports = function(app){
    var url_base        = "/api/"+cfg.APP_ENV;
    var open_url_base   = "/"+cfg.APP_ENV;
    
    app.post(open_url_base+'/authenticate',        authObj.authenticate());
    app.post(open_url_base+'/adminauthenticate',   authObj.adauthenticate());
    app.post(open_url_base+'/forgotpassword',		authObj.forgotPassword());
    
    app.get(url_base+'/events',                             eventObj.getAllEvents());
    app.get(url_base+'/getevents',                          eventObj.getAllEventsAdmin());
    app.get(url_base+'/eventdetails/:eventid',              eventObj.getEventDetails());
    app.get(url_base+'/eventvenue/:eventid',                eventObj.getEventVenue());
    app.get(url_base+'/eventagenda/:eventid',               eventObj.getEventAgenda());
    app.get(url_base+'/agendadetails/:agendaid',            agendaObj.getAgendaDetails());
    app.get(url_base+'/getspeakers',                        speakerObj.getAllSpeakers());
    app.get(url_base+'/speakerdetails/:speakerid',          speakerObj.getSpeakerDetails());
    app.get(url_base+'/checkuser/:email',                   userObj.checkUser());
    app.get(url_base+'/checkregistration/:eventid/:userid', userObj.checkRegistration());
    app.get(url_base+'/checkeventfeedback/:eventid/:userid',eventObj.checkEventFeedback());
    app.get(url_base+'/getallusers',                        userObj.getAllUsers());
    app.get(url_base+'/getallusersforevent/:eventid',       userObj.getAllUsersForEvent());
    app.get(url_base+'/getpresentusersforevent/:eventid',   userObj.getPresentUsersForEvent());
    app.get(url_base+'/getsuggestedpeopleforevent/:eventid',userObj.getSuggestedPeopleForEvent());
    app.get(url_base+'/getspeakers/:eventid',               speakerObj.getSpeakersByEvent());
    app.get(url_base+'/getfeedback/:eventid',               agendaObj.getFeedbackForEvent());
    app.get(url_base+'/getspeakerfeedback/:eventid',        speakerObj.getSpeakerRatingByEvent());
    app.get(url_base+'/getresponseforevent/:eventid',       pollObj.getResponseByEvent());
    app.get(url_base+'/checkfeedback/:agendaid/:userid',    agendaObj.checkfeedback());
    app.get(url_base+'/newregistrants/:eventid',            eventObj.checkNewRegistrants());
    app.get(url_base+'/populatefeedback/:eventid',          eventObj.populateFeedback());
    app.get(url_base+'/ping',                               nwObj.pingMe());
    app.get(url_base+'/checkresponseforuser/:userid/:qid',  pollObj.checkUserResponse());
    app.get(url_base+'/getcurrentpoll/:eventid',            pollObj.getCurrentPollForEvent());
    app.get(url_base+'/getquestiontypes',            		pollObj.getQuestionTypes());
    app.post(url_base+'/updatepassword/:userid',            authObj.updatePassword());
    app.post(url_base+'/addevent',                          eventObj.addNewEvent());
    app.post(url_base+'/updateevent/:eventid',              eventObj.updateEvent());
    app.post(url_base+'/removeevent/:eventid',              eventObj.removeEvent());
    app.post(url_base+'/addspeaker/:pic_name',              speakerObj.addNewSpeaker());
    app.post(url_base+'/updatespeaker/:speakerid/:pic_name',speakerObj.updateSpeaker());
    app.post(url_base+'/removespeaker/:speakerid',          speakerObj.removeSpeaker());
    app.post(url_base+'/addagenda',                         agendaObj.addNewAgenda());
    app.post(url_base+'/updateagenda/:agendaid',            agendaObj.updateAgenda());
    app.post(url_base+'/deleteagenda/:agendaid',            agendaObj.removeAgenda());
    app.post(url_base+'/takefeedback',                      agendaObj.insertFeedback());
    app.post(url_base+'/addallusers',                       userObj.addAllUsers());
    app.post(url_base+'/updateuser/:userid',                userObj.updateUser());
    app.post(url_base+'/deleteuser/:userid',                userObj.deleteUser());
    app.post(url_base+'/registerforevent',                  userObj.registerUserForEvent());
    app.post(url_base+'/addsuggestions',                    userObj.insertSuggestions());
    app.post(url_base+'/logout',                            userObj.logout());
    app.post(url_base+'/takeattendance',                    userObj.markAttendance());
    app.post(url_base+'/addeventfeedback',                  eventObj.addFeedback());
    app.post(url_base+'/addoverallfeedback',                eventObj.addOverallFeedback());
    app.post(url_base+'/adduseroffline',                    userObj.addOfflineUser());
    app.post(url_base+'/getpollresponse',                   pollObj.getPollResponse());
    app.post(url_base+'/addquestion',                   	pollObj.addQuestion());
    app.post(url_base+'/updatequestion/:qid',               pollObj.updateQuestion());
    app.post(url_base+'/deletequestion/:qid',               pollObj.deleteQuestion());
    app.post(url_base+'/activatequestion/:qid',             pollObj.activateQuestion());
    app.post('/addpassword',                       authObj.addPassword());
    //file download routes
    app.get('/download/:type',             nwObj.provideDownload());
    //file upload routes
    app.post(url_base+'/uploadUsers',               nwObj.uploadUsers());
    app.post(url_base+'/uploadSpeakerImage/:sname', speakerObj.uploadSpeakerImage());
    //push notifications services
    app.post(url_base+'/savedevicetoken',           notif.saveDeviceToken());
    app.post(url_base+'/notifyusers',               notif.notifyUsers());
}
