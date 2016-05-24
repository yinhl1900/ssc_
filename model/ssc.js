var app = require('../application.js');

ssc = app.db.model('ssc',{

    sn:{
        type:String,
        required:false
    },
    time:{
        type:String,
        required:true
    },
    result:{
        type:Number,
        required:true
    },
    desc:{
        type:String,
        required:true
    }

})


module.exports = ssc;
