var async = require('async');
var model = require('./ssc.js');
var ssc =  require('../ssc.js');

var isRunning = false;

var CronJob = require('cron').CronJob
new CronJob('*/5 * * * * *', function(){
    if(isRunning)
        return;

    console.log('开始处理时时彩官方数据');
    isRunning = true;

    ssc.getKL8Data(function(err,array){


        async.eachSeries(array, function (item, callback) {

            model.findOne({playNo:item.sn},function(err,m) {

                if (!err & m == null) {
                    var play = new model();
                    play.desc = item.num_h + '+' + item.num_t + '=' + item.num_sum;
                    item.num_o + '=' + item.num_sum;
                    play.result = item.num_sum;
                    play.playNo = item.sn;
                    play.openTime = item.time;

                    play.save(function (err) {
                        console.log(err);
                        console.log('save succes');
                        callback();
                    });
                }else{
                    callback()
                    console.log('has found');
                }
            });

        }, function done() {
            isRunning = false;
        });


    });






}, null, true)

