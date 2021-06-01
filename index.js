require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const cors = require('cors')
const fetch = require('node-fetch')

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
        res.json({
            signature: test
        })
    }
})

app.listen(port, () => console.log(`Zoom Web Client SDK Sample Signature Node.js on port ${port}!`))
