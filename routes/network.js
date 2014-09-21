var cfg = require("../configs/global_configs.json");
//the download handlers are here
exports.provideDownload = function(){
	return function(req,res){
		var path = require('path');
		var mime = require('mime');
		var fs = require('fs');
		var type=req.params.type;
		var filen = null;
		switch(type){
			case 'nitro':
				filen = cfg.NITRO_USERS_FILE;
				break;
            case 'gm':
				filen = cfg.GM_USERS_FILE;
				break;
			default :
				filen = cfg.NITRO_USERS_FILE;
				break;
		}
	  	var file = './content/downloads/'+filen;
	  	var filename = path.basename(file);
		var mimetype = mime.lookup(file);
		res.setHeader('Content-disposition', 'attachment; filename=' + filename);
		res.setHeader('Content-type', mimetype);
		var filestream = fs.createReadStream(file);
		filestream.pipe(res);
	}
};
exports.pingMe = function(){
	return function(req,res){
        res.send({message:"connected"});
	}
};

//the upload handlers are here
exports.uploadUsers = function(){
	return function(req,res){
		var fs = require('fs');
        fs.readFile(req.files[0].path, function (err, data) {
            var origFname = req.files[0].originalname;
            var fname = null;
            if(origFname.search(/nitro/i) != -1 ){
                fname = cfg.NITRO_USERS_FILE;    
            }
            else if(origFname.search(/gm/i) != -1){
                fname = cfg.GM_USERS_FILE
            }
            else{
                fname = cfg.NITRO_USERS_FILE;  
            }
            var newPath = './content/uploads/'+fname;
            fs.writeFile(newPath, data, function (err) {
                if(err){
                    res.writeHead(500);
                    res.end(err.message);
                }
                else{
                    res.send({message:"File Uploaded"});
                }
            });
        });
	}
};