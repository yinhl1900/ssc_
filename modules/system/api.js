var private = {}, self = null,
	library = null, modules = null;
private.apies = {};
private.loaded = false;

var ssc = require('../../ssc.js');

function Api(cb, _library) {
	self = this;
	library = _library;

	cb(null, self);
}

private.ns = function (src, path) {
	var o, d;
	d = path.split(".");
	o = src[d[0]];
	for (var i = 0; i < d.length; i++) {
		d = d.slice(1);
		o = o[d[0]];
		if (!o) break;
	}
	return o;
};

Api.prototype.onBind = function (_modules) {
	modules = _modules;
}

Api.prototype.onBlockchainLoaded = function () {
	private.loaded = true;
	try {
		var router = require('../../routes.json');
	} catch (e) {
		library.logger("failed router file");
	}

	router.forEach(function (route) {
		private.apies[route.method + " " + route.path] = private.ns(modules, route.handler);
	});

	library.sandbox.onMessage(function (message, cb, callback_id) {
		var handler = private.apies[message.method + " " + message.path];
		if (handler) {
			handler(function (err, response) {
				if (err) {
					err = err.toString();
				}

				cb(err, {response: response}, callback_id);
			}, message.query);
		} else {
			cb("api not found", {}, callback_id);
		}
	});

	modules.api.dapps.setReady(function () {

	});
}

Api.prototype.next = function (cb) {

	ssc.getKL8Data(function(err,data){
		cb(null,data[0].next);
	})

	//cb(null, {
	//	test: "Hello, world!"
	//});
}

Api.prototype.list = function (cb) {

	ssc.getKL8Data(function(err,array){
		cb(null,array);
	});

}

Api.prototype.my = function(cb,query){
	var bet = require('./../../model/bet.js');
	bet.find({account:query.account},function(err,col){
		cb(null,col);
	});
}

Api.prototype.bet = function(cb,query){

	var bet = new require('./../../model/bet.js')();
	console.log('bet:',bet);
	bet.account = query.account;
	bet.amount = 1;
	bet.betType = query.which;
	bet.createTime = new Date().getTime();
	bet.playNo = query.sn;
	bet.status = 0;

	bet.save(function(err){
		console.log('save result:',err);
		cb(null,{code:200});
	})

	//modules.api.sql.insert({
	//	table:"ssc_bet",
	//	values: {
	//		account: query.account,
	//		amount: 1,
	//		sn: query.sn,
	//		status: 0
	//	}},function(err,data){
	//	console.log(err);
	//	console.log(data);
	//});


	//modules.api.sql.insert({
	//	table: "asset_comments",
	//	values: {
	//		transactionId: trs.id,
	//		postId: trs.asset.comment.postId,
	//		text: trs.asset.comment.text
	//	}
	//}, cb);
}


Api.prototype.message = function (cb, query) {
	library.bus.message("message", query);
	cb(null, {});
}

module.exports = Api;