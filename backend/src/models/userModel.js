const mongoose = require ("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required: true,
        trim : true,
    },
    email:{
        type:String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password:{
        type:String,
        required: true,
    },

    isActive:{
        type:Boolean,
        default: true,
    },

    roles:[{type:String}]

});

userSchema.pre("save",async function () {
    if(!this.isModified("password"))
        return;

    this.password = await bcrypt.hash(this.password,10); 
});

userSchema.methods.isPasswordCorrect = function(password) {
    return bcrypt.compare(password,this.password);
};

module.exports = mongoose.model("User",userSchema);
