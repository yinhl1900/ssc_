var bet = require('../model/bet.js');

var isRunning = false;

var CronJob = require('cron').CronJob
new CronJob('*/5 * * * * *', function(){

    console.log('start')

    if(isRunning)
        return;

    return;
    console.log('process user data');

    bet.findOne({status:0},function(err,betInfo){
        if(betInfo){
            console.log(betInfo.playNo);
            ssc.findOne({playNo:betInfo.playNo},function(err,sscInfo) {
                if (sscInfo) {
                    if ((betInfo.betInfo == 'hi' && sscInfo.result > 13) || (betInfo.betInfo == 'lo' && sscInfo.result < 14)) {

                        bet.update({_id: betInfo._id}, {status: 1}, function (err, result) {
                            isRunning = false;
                        });
                    }
                    else {

                        bet.update({_id: betInfo._id}, {status: 2}, function (err, result) {
                            isRunning = false;
                        });
                    }
                }
                else{
                    bet.update({_id:betInfo._id},{status:00},function(err,result){
                        isRunning = false;

                    });
                }
            })
        }

    })



}, null, true)


