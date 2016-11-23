/**
 * Created by admin on 20/11/16.
 */
var SIGNALING_SERVER = "";
var DEFAULT_CHANNEL = 'selectpop demo project channel';
var ICE_SERVERS = [
    {url:"stun:stun.l.google.com:19302"}
];
var signaling_socket = null;
var peers = {};
var peer_media_elements = {};


$(document).ready(function () {
    signaling_socket = io.connect(SIGNALING_SERVER);

    signaling_socket.on('connect', function () {
        console.log("Connected to signaling server");
        join_chat_channel(DEFAULT_CHANNEL, {'whatever-you-want-here': 'stuff'});
    });

    function join_chat_channel(channel, userdata) {
        signaling_socket.emit('join', {"channel": channel, "userdata": userdata});
    }

    function part_chat_channel(channel) {
        signaling_socket.emit('part', channel);
    }

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
            {"optional": [{"DtlsSrtpKeyAgreement": true}]}
        );
        peers[peer_id] = peer_connection;
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
        peer_connection.onaddstream = function(event) {
            console.log("onAddStream", event);
            var remote_media = USE_VIDEO ? $("<video>") : $("<audio>");
            remote_media.attr("autoplay", "autoplay");
            if (MUTE_AUDIO_BY_DEFAULT) {
                remote_media.attr("muted", "true");
            }
            remote_media.attr("controls", "");
            peer_media_elements[peer_id] = remote_media;
            $('body').append(remote_media);
            attachMediaStream(remote_media[0], event.stream);
        }

        peer_connection.addStream(local_media_stream);

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

    var username;

    $.post('/user/getUsername', function(result) {
        username = result;
    })

    /*--------------Generate Link button Handler-------------*/
    $('.generateLink').click(function () {
        $('.link').val('http://dev.selectpop.com/');
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
        }
    });

});

function sendMessage() {

}

