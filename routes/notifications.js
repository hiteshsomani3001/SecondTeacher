var DB      = require("../utils/dbMysql.js");
var logger  = require("../utils/logger.js").logger;
exports.saveDeviceToken = function(){
	return function(req,res){
        var data = req.body;
        var myQuery = 'INSERT INTO notifications SET ?';
        DB.executeQueryWithObj(myQuery,data,function(result){
            result.message="success";
            res.send(result);
        });
	};
};
exports.notifyUsers = function(){
	return function(req,res){
        var msg = req.body.message;
        var getAndroidUsersQuery = "SELECT device_token,device_type FROM notifications ";
        DB.executeQuery(getAndroidUsersQuery,function(resAndroid){
            res.send(resAndroid);
            var gcm = require('node-gcm');
            var message = new gcm.Message({
                delayWhileIdle: true,
                timeToLive: 100,
                data: {
                    message: JSON.stringify('Message '+new Date()),
                    msgcnt:'1',
                    soundnamvar:'beep.wav'
                }
            });
            var sender =(new gcm.Sender('AIzaSyAYx0nc7cdD5dUguyM4tuW6U--qk2gopBQ'));
            var androidRegistrationIds = [];		
            var iOSRegistrationIds = [];
            var apns = require("apns");
            var options = {
               certFile : "conf/dev/cert.pem",
               keyFile:"conf/dev/key.pem",
               passphrase:"1234",
               gateway:"gateway.sandbox.push.apple.com",
               port:"2195",
               errorCallback:function(e,f) {
                    log.info('Error Classback'+JSON.stringify(e)+"\n"+JSON.stringify(f));
               },
               debug : true
            };
            var connection = new apns.Connection(options);
            var notification = new apns.Notification();
            for (var i = resAndroid.length - 1; i >= 0; i--) {
                if(resAndroid[i].device_type == 'iOS') {
                    notification.alert = "Hello World !" + new Date();
                    notification.sound = "media/beep.wav";
                    notification.device = new apns.Device(resAndroid[i].device_token);
                    connection.sendNotification(notification);

                } else if(resAndroid[i].device_type == 'Android') {
                    androidRegistrationIds.push(resAndroid[i].device_token);
                }
            };
            sender.send(message, registrationIds, 4, function (err, result) {
                    logger.error('ERROR - Sending notification : '+result);
            });
        });
	}
};
