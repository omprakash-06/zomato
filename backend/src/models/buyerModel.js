const mongoose = require ("mongoose");
const addressSchema = require("../utils/addressSchema");

const buyerSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true,
        unique :true,
    },
    permanentAddress :{
        type:addressSchema,
    },

});

module.exports = mongoose.model("Buyer",buyerSchema)