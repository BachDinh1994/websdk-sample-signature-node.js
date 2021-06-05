require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const cors = require('cors')
const fetch = require('node-fetch')
const mysql = require('mysql')

const app = express()
const port = process.env.PORT || 4000
var test = 0;

app.use(bodyParser.json(), cors())
app.options('*', cors());

var fbGraph = "https://graph.facebook.com/my_id?fields=email&access_token=my_token";

// How bandwidths work. Add counter here to track if app is actually live. 30 minutes or 1 hour check if app restarts? Log var
// Add facebook+zoom signature and requestfacebook
// How do dynos work
// javascript check if uncaught in promise

app.post('/', (req, res) =>
{
    if (req.body.type === "zoom")
    {
        const timestamp = new Date().getTime() - 30000
        const msg = Buffer.from(process.env.ZOOM_JWT_API_KEY + req.body.meetingNumber + timestamp + req.body.role).toString('base64')
        const hash = crypto.createHmac('sha256', process.env.ZOOM_JWT_API_SECRET).update(msg).digest('base64')
        const signature = Buffer.from(`${process.env.ZOOM_JWT_API_KEY}.${req.body.meetingNumber}.${timestamp}.${req.body.role}.${hash}`).toString('base64')
        res.json({
            signature: signature
        })
    }
    else if (req.body.type === "facebook")
    {
        let request = fbGraph.replace("my_id", req.body.userId).replace("my_token", req.body.accessToken);
        //let request = "https://graph.facebook.com/" + req.body.userId + "?fields=email&access_token=" + req.body.accessToken;
        fetch(request)
            .then(res => res.json())
            .then((out) => {
                res.json(out);
            })
            .catch(err => console.error(err));
    }
    else if (req.body.type === "combo")
    {
        test++;
        res.json({
            signature: test
        })
    }
    else if (req.body.type === "mysql")
    {
        var connection = mysql.createConnection
        ({
            host: req.body.host,
            user: req.body.user,
            password: req.body.password,
            database: req.body.database,
        });
        let connectionResult = "Nothing";
        connection.connect(function (err)
        {
            if (err)
                connectionResult = 'error: ' + err.message;
            connectionResult = 'Connected to the MySQL server.';
        });
        /*connection.query('select * from entries;', function (error, results, fields) {
            console.log("we're in");
            if (error) throw error;
            console.log(results);
        });*/
        res.json({
            signature: connectionResult
        })
    }
})

app.listen(port, () => console.log(`Zoom Web Client SDK Sample Signature Node.js on port ${port}!`))
