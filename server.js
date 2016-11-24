/**
 * Created by admin on 19/11/16.
 */

var http = require("http"),
    express = require("express"),
    path = require("path"),
    app = express(),
    bodyParser = require("body-parser");

var routes = require("./routes");

/*---------------------set------------------------*/
app.set("views"), path.join(__dirname, "views");
app.set("view engine", "ejs");

/*---------------------use------------------------*/
app.use(bodyParser.json())
app.use(bodyParser.urlencoded( {
    extended: true
}));
app.use("/", routes);

/*---------------------post------------------------*/
app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    if (username == 'a' && password == 'a') {
        res.render('testUser1');
    }
});

http.createServer(app).listen(5000, "localhost");
