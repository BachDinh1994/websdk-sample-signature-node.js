require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const cors = require('cors')
const fetch = require('node-fetch');

const app = express()
const port = process.env.PORT || 4000

app.use(bodyParser.json(), cors())
app.options('*', cors());

var fbGraph = "https://graph.facebook.com/my_id?fields=email&access_token=my_token";
var getJSON = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

app.post('/', (req, res) =>
{
    let userId = "10223533493112883";
    let accessToken = "EAAHRJy2tE4EBAAGZBvxzRaN9lC8JeeK0gv3IPp5VmvYWqBd2mDl7mqx7jsSpbiHEZAiREt6CN8fRoIe0IcVuMcdB2i1U7SMbcEcCZCi2rgUlAOxv5ZA6Q86AqDJNmnqSfkHCblJhPN4cgYPTPoDgAQLCzAiP438KZA3yQj9IFcMka1ZC7po87mlcvTvKDsss7pY60aVL7HuwZDZD";
    let request = fbGraph.replace("my_id", userId).replace("my_token", accessToken);
    const timestamp = new Date().getTime() - 30000
    const msg = Buffer.from(process.env.ZOOM_JWT_API_KEY + req.body.meetingNumber + timestamp + req.body.role).toString('base64')
    const hash = crypto.createHmac('sha256', process.env.ZOOM_JWT_API_SECRET).update(msg).digest('base64')
    const signature = Buffer.from(`${process.env.ZOOM_JWT_API_KEY}.${req.body.meetingNumber}.${timestamp}.${req.body.role}.${hash}`).toString('base64')

    /*let jsonValue = getJSON(request,
        function (err, data) {
            if (err !== null) {
                return err;
            } else {
                return data;
            }
        });*/

    /*fetch(request)
        .then(response => response.json())
        .then(data =>
        {

        });*/
    res.json({
        signature: data
    })
})

app.listen(port, () => console.log(`Zoom Web Client SDK Sample Signature Node.js on port ${port}!`))
