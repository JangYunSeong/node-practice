const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const followerSchema = new Schema({
    name : {
        type : String,
        required : true
    }
}, {
    timestamps : true,
    usePushEach : true
});

const personSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    address : {
        type : String,
        required : true
    },
    phoneNumber : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    age : {
        type : Number,
        required : true,
        default : 0
    },
    follower : [followerSchema]
}, {
    timestamps : true,
    usePushEach : true
});

const Person = mongoose.model('Person', personSchema);
module.exports = Person;