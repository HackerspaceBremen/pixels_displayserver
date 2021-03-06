var net = require('net')
var SerialPort = require("serialport").SerialPort

var args = process.argv.splice(2);
var _tty = args[0];

var serialPort = new SerialPort(_tty, {
  baudrate: 115200
});

var NEWLINE = '\n';
var COLON = ':';

var session_id = 0;

serialPort.on('open', function() {
  console.log('opened serial port ' + _tty);

  serialPort.on('data', function(data) {
    console.log('S> data: ' + data);
  });

  serialPort.write('?');
  serialPort.drain();

  var server = net.createServer(function(c) {

    var message = {}
    var remaining = '';

    function handle_line(line) {
      // console.log(my_session_id + '> l ' + line);
      index = line.indexOf(COLON);

      if (index > -1) {
        property = line.substring(0, index);
        value = line.substring(index + 1).trim();
        message[property] = value;
      } else {
        // invalid line
        // FIXME should be handled somehow
      }
    }

    function handle_message(message) {
      // console.log(my_session_id + '> m', message);
      if (message['info']) {
        handle_message_info(message);
      } else if (message['blit']) {
        handle_message_blit(message);
      }
    }

    function handle_message_info(message) {
      c.write('info-geometry: 90,20' + NEWLINE);
      c.write(NEWLINE);
    }

    function handle_message_blit(message) {
      // unpack data
      var data = Buffer.concat([new Buffer('*'), new Buffer(message['data'], 'base64')]);

      // console.log('DATA: ', data.toString('hex'));

      serialPort.write(data);
      serialPort.drain(function() {
        c.write('blit: ok' + NEWLINE);
        c.write(NEWLINE);
      });
    }

    c.on('data', function(data) {
      // console.log(my_session_id + '> b ' + data.length);

      // parse the received data
      remaining += data;
      var index = remaining.indexOf(NEWLINE);
      while (index > -1) {
        line = remaining.substring(0, index).trim();
        remaining = remaining.substring(index + 1);
        if (line != '') {
          handle_line(line);
        } else {
          // end of message
          handle_message(message);
          message = {};
        }


        index = remaining.indexOf(NEWLINE);
      }
    });

    c.on('close', function() {
      console.log(my_session_id + '> disconnected');
    });

    c.on('error', function(error) {
      console.log(my_session_id + '> socket error:' + error);
    })

    session_id++;
    var my_session_id = session_id;

    c.write('connect: ok' + NEWLINE + 'session-id: ' + my_session_id + NEWLINE + NEWLINE);

    console.log(my_session_id + '> connected');
  });


  server.listen(8123, function() {
    console.log('display_server listening...');
  })
});
