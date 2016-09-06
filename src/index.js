"use strict";

// Needed to turn Jibo into a web server
let http = require('http');

// Main Jibo library
let jibo = require ('jibo');
let Status = jibo.bt.Status;

// Port number for Jibo's web server
const port = 4242;

jibo.init('face', function(err) {
    if (err) {
        return console.error(err);
    }
    // Load and create the behavior trees
    let root = jibo.bt.create('../behaviors/main');
    root.start();

    // Listen for the jibo main update loop
    jibo.timer.on('update', function(elapsed) {
        // If the tree is in progress, keep updating
        if (root.status === Status.IN_PROGRESS) {
            root.update();
        }
    });

    // Start listening on a port for an HTTP request
    const server = http.createServer()
    server.on('request', (req, res) => {
      res.statusCode = 200;
      console.log(req);

      // Parse the JSON from the request's body
      var body = [];
      req.on('data', function(chunk) {
        body.push(chunk);
      }).on('end', function() {
        body = Buffer.concat(body).toString();
        if (JSON.parse(body).message === 'clothes done') {
          root.emitter.emit('laundry');
        }
      });
    });

    server.listen(port, () => {
      console.log('Server running at http://' + server.address().address + ':' +
        server.address().port);
    });
});
