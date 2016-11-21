var express = require('express');
var router = express.Router();
var session;

router.post('/getUsername', function(req, res, next) {
    session = req.session;
    res.send(session.username);
});

module.exports = router;
