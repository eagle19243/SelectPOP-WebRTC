/**
 * Created by admin on 20/11/16.
 */
$(document).ready(function () {
    if (hasUserMedia()) {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
            || navigator.mozGetUserMedia;

        navigator.getUserMedia({ video: true, audio: true }, function (stream) {
            var video = document.querySelector('video');

            video.src = window.URL.createObjectURL(stream);

            console.log(stream);
        }, function (err) {});
    } else {
        alert("WebRTC is not supported");
    }
});

function hasUserMedia() {
    //check if the browser supports the WebRTC
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia);
}


