const express = require("express");
const router = express.Router();
const passport = require('passport');
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const users = require("../controllers/users");
const payments = require("../controllers/payments");
const { route } = require("./users");
const faceRecognition = require('../controllers/faceRecognition');
const multer = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const { isLoggedIn } = require("../middleware");

router.route('/addface')
    // .get(isLoggedIn, payments.renderAddFace)
    .get(isLoggedIn, payments.renderAddFace)
    .post(isLoggedIn, upload.single('image'), catchAsync(faceRecognition.faceDetect))

router.route('/addface/savingface')
    .get(isLoggedIn, catchAsync(faceRecognition.savingFaceTag))

router.route('/addface/trainingmodel')
    .get(isLoggedIn, catchAsync(faceRecognition.trainingFaceModel))

// router.route('/pretestwebcam')
//     .get(isLoggedIn, function (req, res) {
//         res.render("faceRecognition/pretestwebcam")
//     })

router.route('/testwebcam')
    .get(isLoggedIn, function (req, res) {
        res.render("faceRecognition/testwebcam");
    })
    .post(isLoggedIn, faceRecognition.testWebcam)

router.route('/netbanking')
    .get(isLoggedIn, payments.renderNetbanking)

router.route('/card')
    .get(isLoggedIn, payments.renderCard)

router.route('/upi')
    .get(isLoggedIn, payments.renderUpi)

router.route('/paymentmethod')
    .get(isLoggedIn, payments.renderPaymentMethod)

router.route('/verifyface')
    .get(isLoggedIn, faceRecognition.renderVerifyFace)
    .post(isLoggedIn, upload.single('verifyingimage'), catchAsync(faceRecognition.faceRecognize))

router.route('/paymentsuccessful')
    .get(isLoggedIn, payments.renderPaymentSuccessful);

router.route('/paymentfailed')
    .get(isLoggedIn, payments.renderPaymentFailed);

module.exports = router;