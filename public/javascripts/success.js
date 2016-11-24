/**
 * Created by admin on 20/11/16.
 */
/*var roomId;

 function generateRoomId() {
 var roomId = "";
 var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
 for (var i = 0; i < 10; i++) {
 roomId += possible.charAt(Math.floor(Math.random() * possible.length));
 }

 return roomId;
 }

 $(document).ready(function () {


 $.post('/user/getUsername', function(result) {
 username = result;
 })

 /!*--------------Generate Link button Handler-------------*!/
 $('.generateLink').click(function () {
 roomId = generateRoomId();
 console.log('RoomId', roomId);
 $('.link').val('http://dev.selectpop.com/' + roomId);
 });

 /!*--------------MessageBox KeyDown Handler-------------*!/
 $('.msgBox').keyup(function (event) {

 if (event.which == 13) {

 event.preventDefault();

 }
 });

 });*/

(function($, windowObject, navigatorObject) {

    var socket = io(),
        chatMessage,
        chatBox,
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
            chatBox = $('.chatBox');
            
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
            console.log('Connected');
        },

        disconnected : function(message) {
            console.log('Disconnected');
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
        toast : function(notification) {
            console.log(notification);
        },
        init : function() {
            console.log('init');
        }
    };

    $(document).ready(function() {
        Functions.init();
        Functions.pageReady();

        //Handers---------------------------------------------
        $('.generateLink').click(function () {
            console.log('RoomId', room);
            $('.link').val('https://selectpop.herokuapp.com/?room=' + room);
        });

        $('.chatBox').keyup(function (event) {

            if (event.which == 13) {

                newMessage = chatBox.val();
                chatMessage = newMessage.substr(lastMessage.length, newMessage.length);

                Functions.sendChat(chatMessage);

                lastMessage = chatBox.val();

                event.preventDefault();

            }
        });
    });

}(jQuery, window, navigator));




