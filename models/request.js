const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true
    },
    role : {
        type : String,
        required : true,
        default : "other"
    }
})


module.exports = mongoose.model('Request', requestSchema)