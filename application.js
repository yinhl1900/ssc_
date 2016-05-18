var mongoose = require('mongoose')

function Application(){

    mongoose.connect('mongodb://localhost:27017/ssc');
    this.db = mongoose;

}

Application.prototype.start = function(callback){


    callback();
}

Application.prototype.exit = function(){
    process.exit();
}



module.exports = new Application()






