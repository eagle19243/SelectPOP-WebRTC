/**
 * Created by admin on 22/11/16.
 */

var socketIO = require('socket.io');
var users = {};

module.exports = function(server) {
    var io = socketIO.listen(server);

    io.sockets.on('connection', function(socket) {
        console.log("user connected");

        socket.on('message', function(message) {
            var data;

            console.log('on_message');

            try {
                data = JSON.parse(message);
            } catch (e) {
                console.log("Invalid JSON");
                data = {};
            }

            switch (data.type) {
                case 'login':
                    console.log("User logged", data.name);

                    if (users[data.name]) {
                        sendTo(connection, {
                           type: 'login',
                            success: false
                        });
                    } else {
                        users[data.name] = connection;
                        connection.name = data.name;

                        sendTo(connection, {
                            type: 'login',
                            success: true
                        });
                    }

                    break;
                case 'offer':
                    break;
                case 'answer':
                    break;
                case 'candidate':
                    break;
                case 'leave':
                    break;
                default:
                    sendTo(connection, {
                        type: 'error',
                        message: 'Command not found: ' + data.type
                    });

                    break;
            }
        })

        socket.on('close', function() {
            console.log('on_close');

            if (connection.name) {
                delete users[connection.name];

                if (connection.otherName) {

                }
            }
        });
    });
}

function sendTo(connection, message) {
    connection.send(JSON.stringify(message));
}
