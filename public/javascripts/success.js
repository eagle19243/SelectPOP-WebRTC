/**
 * Created by admin on 20/11/16.
 */


(function($, windowObject, navigatorObject) {

    var socket = io(),
        chatMessage,
        newMessage,
        lastMessage,
        chatBox,
        status,
        room,
        peerConnection,
        peerConnectionConfig = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};

    navigatorObject.getUserMedia = navigatorObject.getUserMedia ||
        navigatorObject.mozGetUserMedia ||
        navigatorObject.webkitGetUserMedia;
    windowObject.RTCPeerConnection = windowObject.RTCPeerConnection ||
        windowObject.mozRTCPeerConnection ||
        windowObject.webkitRTCPeerConnection;
    windowObject.RTCIceCandidate = windowObject.RTCIceCandidate ||
        windowObject.mozRTCIceCandidate ||
        windowObject.webkitRTCIceCandidate;
    windowObject.RTCSessionDescription = windowObject.RTCSessionDescription ||
        windowObject.mozRTCSessionDescription ||
        windowObject.webkitRTCSessionDescription;

    var Functions = {
        pageReady : function() {
            
            socket.on('message', function(msg) {
                Functions.gotMessageFromServer(msg);
            });

            socket.on('chatMessage', function(msg){
                console.log('received chat Message', msg);
                Functions.appendChat('Friend: ' + msg);
            });

            socket.on('welcome', function(msg) {
                Functions.welcome(msg);
            });

            socket.on('disconnected', function(msg) {
                Functions.disconnected(msg);
            });

            socket.on('connected', function(msg) {
                Functions.connected(msg);
            });

            socket.on('toast', function(notification) {
                Functions.toast(notification);
            });
        },

        start : function(isCaller) {
            Functions.toast('start called');

            peerConnection = new RTCPeerConnection(peerConnectionConfig);
            peerConnection.onicecandidate = Functions.gotIceCandidate;
            peerConnection.onaddstream = Functions.gotRemoteStream;
            peerConnection.addStream(localStream);
            if(isCaller) {
                peerConnection.createOffer(Functions.gotDescription, Functions.createOfferError);
                console.log("offer created");
            }
        },

        gotDescription : function(description) {
            console.log('got description' + description);
            peerConnection.setLocalDescription(description, function () {
                    socket.emit('message',JSON.stringify({'sdp': description}));
                },
                function() {
                    console.log('set description error');
                    Functions.toast("gotDescription Error");
                });
        },
        gotIceCandidate : function(event) {
            if(event.candidate != null) {
                socket.emit('message', JSON.stringify({'ice': event.candidate}));
            }
        },

        createOfferError : function(error) {
            console.log(error);
            Functions.toast("Error occured: createOfferError");
        },

        gotMessageFromServer : function(message) {
            //console.log("From server" + message);
            if(!peerConnection) {
                Functions.start(false);
            }
            var signal = JSON.parse(message);
            if(signal.sdp) {
                peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp), function() {
                        peerConnection.createAnswer(Functions.gotDescription, Functions.createAnswerError);
                        console.log("answer created");
                    },

                    function() {
                        console.log("setRemoteDescription error");
                        Functions.toast("Error occured: setRemoteDescriptionError");
                    });
            } else if(signal.ice) {
                peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice));
                console.log("ice candidate added");
            }
        },

        sendChat : function(msg) {
            socket.emit('chatMessage', msg);
        },

        welcome : function(message) {
            room = message;
            console.log('Ask someone to join you. Your id is:', message);
        },

        connected : function(message) {
            status.val('Connected');
            Functions.sendChat(chatBox.val());
        },

        disconnected : function(message) {
            status.val('Disconnected');
        },

        makeConnection : function() {
            /*var id = $("#makeConnectionInputField").val();
            if(id.length == 22) {
                socket.emit('makeConnection', id);
            }
            else {
                console.log("enter valid id");
                Functions.toast("enter valid id");
            }*/

            console.log('MakeConnection');
        },

        getDomain: function() {
            return location.href;
        },

        toast : function(notification) {
            console.log(notification);
        },
        init : function() {
            console.log('init');
        }
    };

    $(document).ready(function() {
        chatBox = $('.chatBox');
        status = $('.status');

        Functions.init();
        Functions.pageReady();

        //Handers---------------------------------------------
        $('.generateLink').click(function () {
            console.log('RoomId', room);
            console.log(Functions.getDomain());
            $('.link').val(Functions.getDomain() + '?room=' + room);
        });

        /*$('.chatBox').keyup(function (event) {

            if (event.which == 13) {

                newMessage = chatBox.val();

                var from = (lastMessage == null)? 0: lastMessage.length;
                var to = newMessage.length;

                chatMessage = newMessage.substr(from, to);

                Functions.sendChat(chatMessage);

                lastMessage = chatBox.val();

                event.preventDefault();

            }
        });*/
    });

}(jQuery, window, navigator));




