const fs = require('fs');
const {URL} = require('url');
const http = require('http');
const ws = require('ws');
const zlib = require('zlib');
const archiver = require('archiver');

var httpServer = http.createServer();

const wss = new ws.Server({httpServer, port:8986})

httpServer.listen(function(){
    wss.on('connection', function(id){
      let fileStream = ''
      console.log(" connected: ");
      id.on('message', function(data){
            fs.writeFile('data/index.html', `<html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <link rel="stylesheet" href="./styled.css">
                <script src="./scripts/zepto.min.js"></script>
                <script src="./scripts/peer.min.js"></script>
                <script src="./scripts/dexie.js"></script>
                <title>App et teaser</title>
            </head>
            <body>
            <div class="is_main">
            ${data}
            </div>
            <button class="disconnect">disconnect</button>
            <script src="./scripts/peerConnecter.js"></script>
            <script src="fullbuild.js"></script>
            </body>
            </html>`);
            const out = fs.createWriteStream(__dirname+'/data.zip')
            var archive = archiver('zip', {zlib: {level: 9}});
            out.on('close', function(){
              console.log(archive.pointer()+" total bytes")
              fs.readFile(__dirname+"/data.zip", function(err, data){
                if(err){console.log(err)}
                
                console.log(data);
                id.send(data)
              })
            });
            archive.pipe(out);
            archive.directory('data/', false)
            archive.finalize();
            // ZIP CREE
  
      })//FIN ONMESSAGE
      
    })
  });