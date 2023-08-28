const User = require('../models/user');

module.exports.renderAddFace = (req, res) => {
    res.render('faceRecognition/addface');
}

module.exports.renderNetbanking = (req, res) => {
    res.render('payment/netbanking');
}

module.exports.renderCard = (req, res) => {
    res.render('payment/card');
}

module.exports.renderUpi = (req, res) => {
    res.render('payment/upi');
}

module.exports.renderPaymentMethod = (req, res) => {
    res.render('payment/paymentMethod');
}

module.exports.renderPaymentSuccessful = (req, res) => {
    res.render('payment/paymentsuccessful');
}

module.exports.renderPaymentFailed = (req, res) => {
    res.render('payment/paymentfailed');
}