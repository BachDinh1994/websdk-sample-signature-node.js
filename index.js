require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const cors = require('cors')
const fetch = require('node-fetch')

const app = express()
const port = process.env.PORT || 4000

app.use(bodyParser.json(), cors())
app.options('*', cors());

var fbGraph = "https://graph.facebook.com/my_id?fields=email&access_token=my_token";

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
})

app.listen(port, () => console.log(`Zoom Web Client SDK Sample Signature Node.js on port ${port}!`))
