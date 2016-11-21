var express = require('express');
var router = express.Router();
var session;

/* GET home page. */
router.get('/', function(req, res, next) {
    session = req.session;
    if (session.username == 'a' && session.password == 'a') {
        res.render('success');
    } else {
        res.render('index');
    }
});

router.post('/', function(req, res) {
    session = req.session;

    var username = req.body.username;
    var password = req.body.password;

    if (username == 'a' && password == 'a') {
        session.username = username;
        session.password = password;
        res.render('success');
    } else if (username = 'b'&& password == 'b') {
        session.username = username;
        session.password = password;
        res.render('client');
    } else {
        res.render('fail');
    }
});

module.exports = router;
