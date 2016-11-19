/**
 * Created by admin on 19/11/16.
 */
var http = require("http"),
    express = require("express"),
    path = require("path"),
    app = express();

var routes = require("./routes");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use("/", routes);

http.createServer(app).listen(5000, "localhost");
console.log("starting .... 5000");