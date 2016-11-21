var express = require('express');
var router = express.Router();
var title = 'SelectPOP Demo Project';

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: title });
});

module.exports = router;
