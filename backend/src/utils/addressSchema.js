const { default: mongoose } = require("mongoose");

const addressSchema = new mongoose.Schema({
    house:{type : String},
    street : {type : String},
    city : {type : String},
    state : {type : String , required:true},
    pincode:{type : Number , required : true},
    country:{type : String,default :"india"},
},{_id : false});

module.exports = addressSchema;