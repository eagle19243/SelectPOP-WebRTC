var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {

    var param = req.query;

    if (param.room == null) {
        res.render('success');
    } else {
        res.render('client', {'room': param.room});
    }

});

module.exports = router;
