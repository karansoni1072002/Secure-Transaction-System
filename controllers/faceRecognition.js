const User = require('../models/user');
const multer = require('multer');
const { cloudinary, storage } = require('../cloudinary/index');
const upload = multer({ storage });
const axios = require('axios');
const { string } = require('joi');
const nodeWebCam = require('node-webcam');
const fs = require('fs');


const api_key = `${process.env.FACE_API_KEY}`;
const api_secret = `${process.env.FACE_API_SECRET}`;



var options = {
    width: 1280,
    height: 720,
    quality: 100,
    delay: 1,
    saveShots: true,
    output: "jpeg",
    device: false,
    callbackReturn: "location"
};
var webcam = nodeWebCam.create(options);

module.exports.faceDetect = async (req, res) => {
    const urls = req.file.path;
    var tid = "";
    await axios.post(`http://api.skybiometry.com/fc/faces/detect.json?api_key=${api_key}&api_secret=${api_secret}&urls=${urls}&attributes=all`)
        .then(function (response) {
            if (response.data.status == "success") {
                if (response.data.photos[0].tags[0].recognizable == true) {
                    tid = response.data.photos[0].tags[0].tid;
                }
            }
            console.log(response.data);
        })
        .catch(function (error) {
            req.flash("error", error.message);
            res.redirect("/addface");
        });
    console.log(tid);
    res.redirect(`/addface/savingface?tid=${tid}`)


    console.log(tid);

}

module.exports.savingFaceTag = async (req, res) => {
    const tid = req.query.tid;
    const currentUser = req.user;
    console.log(currentUser)
    await axios.post(`http://api.skybiometry.com/fc/tags/save.json?api_key=${api_key}&api_secret=${api_secret}&uid=${currentUser.userId}&tids=${tid}`)
        .then(function (response) {
            res.redirect(`/addface/trainingmodel?status=${response.data.status}`)
        })
        .catch(function (error) {
            req.flash("error", error.message);
            res.redirect("/addface");
        });
}

module.exports.trainingFaceModel = async (req, res) => {
    const status = req.query.status;
    const currentUser = req.user;
    if (status === "success") {
        await axios.post(`http://api.skybiometry.com/fc/faces/train.json?api_key=${api_key}&api_secret=${api_secret}&uids=${currentUser.userId}`)
            .then(function (response) {
                if (response.data.status == "success") {
                    if (response.data.created && response.data.created[0].training_set_size >= 1) {
                        req.flash("success", "Successfully created your face model!");
                        res.redirect("/");
                    }
                    else if (response.data.unchanged) {
                        req.flash("error", "Please provide a new image to model, this one is already registered");
                        res.redirect("/addface")
                    }
                    else if (response.data.updated && response.data.updated[0].training_set_size >= 1) {
                        req.flash('success', 'Your Face Model has been updated!');
                        res.redirect('/');
                    }
                }
                console.log(response.data);
            })
            .catch(function (error) {
                req.flash("error", error.message);
                res.redirect("/addface");
            });
    }
    else {
        req.flash("error", "Face is not saved, please try again")
        res.redirect('/addface')
    }
}

module.exports.showUrl = (req, res) => {
    const urls = req.query.urls;
    res.send(urls)
    console.log("done")
}

module.exports.faceRecognize = async (req, res) => {
    const urls = req.file.path;
    console.log(urls)
    const currentUser = req.user;
    await axios.post(`http://api.skybiometry.com/fc/faces/recognize.json?api_key=${api_key}&api_secret=${api_secret}&urls=${urls}&uids=${currentUser.userId}`)
        .then(function (response) {
            if (response.data.photos[0].tags[0].recognizable == true) {
                if (response.data.photos[0].tags[0].uids[0].confidence >= 75) {
                    res.redirect("/paymentsuccessful");
                } else {
                    res.redirect("/paymentfailed")
                }
            } else {
                req.flash("error", "Face is not recognizable in image");
                res.redirect("/verifyface");
            }
            console.log(response.data);
        })
        .catch(function (error) {
            req.flash("error", error.message);
            res.redirect("/verifyface");
        })
}

module.exports.renderVerifyFace = (req, res) => {
    res.render('faceRecognition/verifyface');
}

function captureShot(amount, i, name) {
    // Make sure this returns a real url to an image.
    return new Promise(resolve => {
        var path = `./images/${name}`;

        // create folder if and only if it does not exist
        if (!fs.existsSync(path)) {
            fs.mkdir(path, { recursive: true }, err => { })
        }

        // capture the image
        webcam.capture(`./images/${name}/${name}${i}.${options.output}`, (err, data) => {
            if (!err) {
                console.log('Image created')
                console.log(data)
            } else {
                console.log(err);
            }
            i++;
            if (i <= amount) {
                captureShot(amount, i, name);
            }
            resolve(data)
        });
    })

};

module.exports.testWebcam = (req, res) => {
    const currentUser = req.user;
    captureShot(3, 1, `${currentUser.username}`)
        .then((response) => {
            console.log(response)
            // Whatever we resolve in captureShot, that's what response will contain
            res.send(`<img src="${response}"/>`)
        })
}

module.exports.startWebCam = (req, res) => {
    var video = document.getElementById('video'),
        vendorUrl = window.URL || window.webkitURL;
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
            }).catch(function (error) {
                console.log("Something went wrong!");
            });
    }
}