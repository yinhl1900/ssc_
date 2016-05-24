var bet = require('./../model/bet.js');

var isRunning = false;

function isWin(betType,result){
    if(betType == 'lo' && result<14)
        return true;
    if(betType == 'hi' && result>13)
        return true;
    if(betType == 'side' && (result<10 && result>17))
        return true;
    if(betType == 'single' && result%2 != 0)
        return true;
    if(betType == 'double' && result %2==0)
        return true;
    if(betType == 'center' && (result>=10&& result<=17))
        return true;

    return false;
}

var CronJob = require('cron').CronJob
new CronJob('*/5 * * * * *', function(){

    console.log('will start')

    if(isRunning)
        return;

    console.log('process user data');

    bet.findOne({status:0},function(err,betInfo){
        if(betInfo){
            console.log(betInfo.sn);
            ssc.findOne({sn:betInfo.sn},function(err,sscInfo) {
                if (sscInfo) {
                    if (isWin(betInfo.betType,sscInfo.result)){

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
                //else{
                //    bet.update({_id:betInfo._id},{status:3},function(err,result){
                //        isRunning = false;
                //
                //    });
                //}
            })
        }

    })



}, null, true)


