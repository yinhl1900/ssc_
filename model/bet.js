var app = require('../application.js');

bet = app.db.model('bet',{

    account:{
        type:String,
        required:false
    },
    betType:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    createTime:{
        type:Number,
        required:true
    },
    playNo:{
        type:String,
        required:true
    },
    status:{
        type:Number,
        required:true
    }

})


module.exports = bet;
