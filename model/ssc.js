var app = require('../application.js');

ssc = app.db.model('ssc',{

    playNo:{
        type:String,
        required:false
    },
    openTime:{
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
