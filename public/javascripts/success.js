/**
 * Created by admin on 20/11/16.
 */
var signaling_server = "";
var DEFAULT_CHANNEL = 'selectpop demo project channel';
var roomId = 'selectpop demo project channel';
var ICE_SERVERS = [
    {url:"stun:stun.l.google.com:19302"}
];
var signaling_socket = null;
var peers = {};
var peer_media_elements = {};
var dataChannel;
var username;


$(document).ready(function () {
    signaling_socket = io.connect(signaling_server);

    signaling_socket.on('connect', function () {
        console.log("Connected to signaling server");

    });

    signaling_socket.on('disconnect', function () {
        console.log("Disconnected from signaling server");

        for (peer_id in peer_media_elements) {
            peer_media_elements[peer_id].remove();
        }
        for (peer_id in peers) {
            peers[peer_id].close();
        }
        peers = {};
        peer_media_elements = {};
    });

    signaling_socket.on('addPeer', function (config) {
        console.log('onAddPeer Config here' , config);
        console.log('Signaling server said to add peer:', config);
        var peer_id = config.peer_id;
        if (peer_id in peers) {
            console.log("Already connected to peer ", peer_id);
            return;
        }
        var peer_connection = new RTCPeerConnection(
            {"iceServers": ICE_SERVERS},
            {"optional": [{RtpDataChannels: true}]}
        );

        peers[peer_id] = peer_connection;

        dataChannel = peer_connection.createDataChannel("textMessages", {reliable:false});
        /*dataChannel.onopen = dataChannelStateChanged;*/
        dataChannel.send("Hello");

        peer_connection.onicecandidate = function(event) {
            if (event.candidate) {
                signaling_socket.emit('relayICECandidate', {
                    'peer_id': peer_id,
                    'ice_candidate': {
                        'sdpMLineIndex': event.candidate.sdpMLineIndex,
                        'candidate': event.candidate.candidate
                    }
                });
            }
        }



        if (config.should_create_offer) {
            console.log("Creating RTC offer to ", peer_id);
            peer_connection.createOffer(
                function (local_description) {
                    console.log("Local offer description is: ", local_description);
                    peer_connection.setLocalDescription(local_description,
                        function() {
                            signaling_socket.emit('relaySessionDescription',
                                {'peer_id': peer_id, 'session_description': local_description});
                            console.log("Offer setLocalDescription succeeded");
                        },
                        function() { Alert("Offer setLocalDescription failed!"); }
                    );
                },
                function (error) {
                    console.log("Error sending offer: ", error);
                });
        }
    });

    signaling_socket.on('removePeer', function () {
        console.log('Signaling server said to remove peer:', config);
        var peer_id = config.peer_id;
        if (peer_id in peer_media_elements) {
            peer_media_elements[peer_id].remove();
        }
        if (peer_id in peers) {
            peers[peer_id].close();
        }
        delete peers[peer_id];
        delete peer_media_elements[config.peer_id];
    });

    function join_chat_channel(channel, userdata) {
        signaling_socket.emit('join', {"channel": channel, "userdata": userdata});
    }

    function part_chat_channel(channel) {
        signaling_socket.emit('part', channel);
    }


    $.post('/user/getUsername', function(result) {
        username = result;
    })

    /*--------------Generate Link button Handler-------------*/
    $('.generateLink').click(function () {
        roomId = generateRoomId();
        console.log('RoomId', roomId);
        $('.link').val('http://dev.selectpop.com/' + roomId);
        join_chat_channel(DEFAULT_CHANNEL, {'whatever-you-want-here': 'stuff'});
    });

    /*--------------MessageBox KeyDown Handler-------------*/
    $('.msgBox').keyup(function (event) {
        var timeString = new Date().toLocaleTimeString();

        if (event.which == 13) {
            $('.chatBox').append(
                '<div class = "msgln">' +
                '(' + timeString  + ') <b>' + username + '<b>:' + $('.msgBox').val() +
                '</div>');
            console.log($('.chatBox').html());
            $('.msgBox').val('');
            event.preventDefault();

            sendMessage($('.msgBox').val());
        }
    });

});

function generateRoomId() {
    var roomId = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 10; i++) {
        roomId += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return roomId;
}

function sendMessage(msg) {
    dataChannel.send(msg);
}


