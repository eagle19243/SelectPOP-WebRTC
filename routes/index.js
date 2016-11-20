var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res){
    var username = req.body.username;
    var password = req.body.password;

    if (username == 'a' && password == 'b') {
        res.render('success');
    } else {
        res.render('fail');
    }
});

module.exports = router;
