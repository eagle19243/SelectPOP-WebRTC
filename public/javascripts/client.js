/**
 * Created by admin on 20/11/16.
 */

$(document).ready(function () {
    if (hasUserMedia()) {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
            || navigator.mozGetUserMedia;

        //enabling video and audio channels
        navigator.getUserMedia({ video: true, audio: true }, function (stream) {
            var video = document.querySelector('video');

            //inserting our stream to the video tag
            video.src = window.URL.createObjectURL(stream);
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


