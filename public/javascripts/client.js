(function($, windowObject, navigatorObject) {
    var socket = io(),
        chatMessage,
        chatBox,
        room,
        status,
        localStream,
        localVideo,
        mediaRecorder,
        recordedBlobs,
        recording = false,
        peerConnection,
        peerConnectionConfig = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};
        
    var voice_rss_key = '3255bee5bc4c44b58e5dfd0639226486';


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
                console.log('received chatMessage', msg);
                Functions.appendChat(msg);
                Functions.playMessage(msg);
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

            var constraints = {
                video: true,
                audio: true,
            };

            if(navigatorObject.getUserMedia) {
                navigatorObject.getUserMedia(constraints,
                    Functions.getUserMediaSuccess,
                    Functions.getUserMediaError
                );
            } else {
                alert('Your browser does not support getUserMedia API');
            }
        },

        createObjectURL : function(file) {
            if ( windowObject.URL) {
                console.log('WindowObject.URL - 0');
                return windowObject.URL.createObjectURL( file );
            } else if ( windowObject.URL && windowObject.URL.createObjectURL ) {
                console.log('WindowObject.URL - 1');
                return windowObject.URL.createObjectURL( file );
            } else {
                console.log('WindowObject.URL - 2');
                return null;
            }
        },

        getUserMediaSuccess : function(stream) {
            console.log('getUserMediaSuccess');
            localStream = stream;

            localVideo.controls = false;
            localVideo.muted = 'muted';
            localVideo.src = Functions.createObjectURL(stream);
        },

        getUserMediaError : function(error) {
            console.log('getUserMediaError', error);
            Functions.toast("getUserMedia Error");
        },

        start : function(isCaller) {
            console.log("start called");

            Functions.toast("calling... Please Wait!!");
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

        gotRemoteStream : function(event) {

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

        createAnswerError : function() {
            console.log("createAnswerError");
            Functions.toast("Error occured: createAnswerError");
        },

        appendChat : function(chat) {
            var prevMessage = chatBox.val();
            chatBox.val(prevMessage + chat);
        },

        playMessage : function(msg) {
            VoiceRSS.speech({
                key: voice_rss_key,
                src: msg,
                hl: 'en-us',
                r: 0,
                c: 'mp3',
                f: '44khz_16bit_stereo',
                ssml:false
            });
            /*responsiveVoice.speak(msg, "UK English Male");*/
        },

        startRecording : function(stream) {
            console.log('Recording started');
            console.log(stream);

            var options = {mimeType: 'video/webm;codecs=vp9'};

            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.log(options.mimeType + ' is not Supported');
                options = {mimeType: 'video/webm;codecs=vp8'};
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    console.log(options.mimeType + ' is not Supported');
                    options = {mimeType: 'video/webm'};
                    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                        console.log(options.mimeType + ' is not Supported');
                        options = {mimeType: ''};
                    }
                }
            }

            try {
                mediaRecorder = new MediaRecorder(stream, options);
            } catch (e) {
                console.log('Exception while creating MediaRecorder: ' + e);
                return
            }

            recording = true;
            recordedBlobs = [];

            mediaRecorder.onstop = function(event) {
                console.log('OnStop');

            };

            mediaRecorder.ondataavailable = function(event) {
                console.log('OnDataAvailable');

                if (event.data && event.data.size > 0) {
                    recordedBlobs.push(event.data);
                }
            };

            mediaRecorder.start(10);

        },

        upload : function() {
            var blob = new Blob(recordedBlobs, {type: 'video/webm'});
            var url = windowObject.URL.createObjectURL(blob);

            var file = new File([blob], "video.webm");
            var formData = new FormData();
            formData.append('uploads[]', file, file.name);
            
            $.ajax({
                url: '/upload_video',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(data) {
                    console.log("uploaded successfully");
                }
            });

        },

        stopRecording : function () {
            recording = false;

            Functions.upload();
            localVideo.pause();
            /*mediaRecorder.save();*/
            console.log('stopRecording');
        },

        welcome : function(message) {
            console.log("Ask someone to join you. Your id is: " + message);
            Functions.makeConnection();
        },

        connected : function(message) {
            status.val('Connected');

            Functions.startRecording(localStream);

            setTimeout(function() {
                if (recording)
                    Functions.stopRecording();
            }, 15000);
        },

        disconnected : function(message) {
            status.val('Disconnected');
        },

        makeConnection : function () {
            socket.emit('makeConnection', room);
        },

        toast : function (notification) {
            console.log(notification);
        },

        init : function () {
            console.log('init');
        }
    };

    $(document).ready(function() {
        localVideo = document.getElementsByTagName('video')[0];
        chatBox = $('.chatBox');
        room = $('.room').val();
        status = $('.status');

        Functions.init();
        Functions.pageReady();

        //Handers---------------------------------------------

        $('.stop_btn').click(function() {
            console.log('stop button clicked');
            Functions.stopRecording();
        });
    });

}(jQuery, window, navigator));