const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserScehma = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    mobileNumber: {
        type: Number,
        length: 10,
        required: true
    },
    userId: {
        type: String,
        unique: true
    }
});

UserScehma.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserScehma);