/**************/
/*** CONFIG ***/
/**************/
var PORT = 4000;
var apiKey = 46260072;
var apiSecret = '4a034221cfad67a5c870dd5973efd836f0c0e1b1';

/*************/
/*** SETUP ***/
/*************/
var express = require('express');
var http = require('http');
var main = express();
var router = express.Router();
var server = http.createServer(main);
var OpenTok = require('opentok'),
    opentok = new OpenTok(apiKey, apiSecret);
server.listen(PORT, null, function() {
    console.log("Listening on port " + PORT);
});

main.get('/', function(req, res){ res.sendFile(__dirname + '/stream.html'); });
router.get('/startSession', function (req, res) {
    opentok.createSession({mediaMode:"routed"},function (err, session) {
        if(err){
            console.log(err);
            res.json({"error":"can't start server","response": null});
            return
        }
        var token = session.generateToken();
        console.log(token);
        console.debug('session started - '+ session.sessionId);
        res.json({"error":null,"response":{"id" : session.sessionId,"token":token,"api":apiKey}})
    });
});
router.get('/startArchive/:sessionId', function (req, res) {
    var archiveOptions = {
        name: 'Node Archiving Sample App',
        hasAudio: true,
        hasVideo: true,
        outputMode: 'composed',
    };
    opentok.startArchive(req.params.sessionId,archiveOptions, function (err, archive) {
        if (err) return res.json({"error":
                'Could not start archive for session '+req.params.sessionId+'. error='+err.message, "res":null }
        );
        res.json({"error":null,res: archive});
    })
});
router.get('/stop/:archiveId', function (req, res) {
    opentok.stopArchive(req.params.archiveId, function (err, archive) {
        if(err){
            res.json({"error":"can't stop archive", res:null});
            return
        }
        res.json({"error":null,res:archive});
    })
});

main.use('/api', router);