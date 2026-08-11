const mongoose = require ("mongoose");

const sessionSchema = mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true,
    },
    refreshToken : {
        type : String,
        required : true,

        expireAt : {
            type : Date,
            required : true,
        }
    },
    deviceType : {
        type : String,
    },
    os : {
        type : String,
    },
    browser : {
        type : String,
    },
    ipAddress : {
        type : String,
    },
    isActive : {
        type : Boolean,
        default : true,
    },

},{timestamps : true });

sessionSchema.index({
    expireAt : 1
},{expireAfterSeconds : 0 });

module.exports = mongoose.model("Session",sessionSchema);