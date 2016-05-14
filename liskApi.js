var request = require('request');

function liskApi(){
    this._baseUrl = 'https://testnet.lisk.io';
    //this._baseUrl = 'http://lisk.jp:7000';
};


liskApi.prototype._makeGetRequest = function(url,callback){
    request(url,function(err,data){
        if(err)
            return callback(err,null);

        var result = JSON.parse(data.body);
        return callback(null,result);
    });
}


liskApi.prototype.sendTransaction = function(senderSecret,recipientId,senderPublicKey,amount,callback){

    //console.log('send secret:',senderSecret);
    //console.log('recipientId:',recipientId);

    amount = parseFloat(amount);
    var sendTransactionUrl = this._baseUrl+'/api/transactions';
    var json = {secret:senderSecret,amount:amount,recipientId:recipientId,publicKey:senderPublicKey};

    request({url:sendTransactionUrl,method:'PUT',json:json},function(err,data){
        if(err)
            return callback(err,null);

        //console.log(data.body);


        //var result = JSON.parse(data.body);
        return callback(null,data.body);
    });
}

liskApi.prototype.getAccountInfo = function(secret,callback){

    var url = this._baseUrl+'/api/accounts/open'

    request({ url: url, method: 'POST', form: {secret:secret}}, function(err,data){
        
        if(err)
            return callback(err,null);

        //console.log(data);

        var result = JSON.parse(data.body);

        return callback(null,result);
    });
}

liskApi.prototype.getTransactionsBySenderAndRecipient = function(senderId,recipientId,callback){
    var url = this._baseUrl+'/api/transactions?senderId='+senderId+'&recipientId='+recipientId;
    return this._makeGetRequest(url,callback);
}

liskApi.prototype.getTransactionsBySenderId = function(senderId,callback){

    var url = this._baseUrl +'/api/transactions?senderId='+senderId;
    return this._makeGetRequest(url,callback);
}

liskApi.prototype.getTransactionsByRecipientId = function(recipientId,callback){
    
    var url = this._baseUrl +'/api/transactions?recipientId='+recipientId;
    return this._makeGetRequest(url,callback);
}

module.exports = new liskApi();