/**
 * Created by admin on 20/11/16.
 */

$(document).ready(function () {
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

function onUserConnected() {

}

function getOthersName() {

}
