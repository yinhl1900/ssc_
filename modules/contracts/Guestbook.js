var private = {}, self = null,
	library = null, modules = null;

function Guestbook(cb, _library) {
	self = this;
	self.type = 6
	library = _library;
	cb(null, self);
}

var aliasedFields = [
	{ field: "t.id", alias: "id" },
	{ field: "t.blockId", alias: "blockId" },
	{ field: "t.senderId", alias: "senderId" },
	{ field: "t.recipientId", alias: "recipientId" },
	{ field: "t.amount", alias: "amount" },
	{ field: "t.fee", alias: "fee" },
	{ field: "t.timestamp", alias: "timestamp" },
	{ field: "entry", alias: "entry" }
];

var fieldMap = {
	"id": String,
	"blockId": String,
	"senderId": String,
	"recipientId": String,
	"amount": Number,
	"fee": Number,
	"timestamp": Date,
	"entry": String
};

Guestbook.prototype.create = function (data, trs) {
	trs.recipientId = data.recipientId;
	trs.asset = {
		entry: new Buffer(data.entry, 'utf8').toString('hex') // Save entry as hex string
	};

	return trs;
}

Guestbook.prototype.calculateFee = function (trs) {
    return 0; // Free!
}

Guestbook.prototype.verify = function (trs, sender, cb, scope) {
	if (trs.asset.entry.length > 2000) {
		return setImmediate(cb, "Max length of an entry is 1000 characters!");
	}

	setImmediate(cb, null, trs);
}

Guestbook.prototype.getBytes = function (trs) {
	return new Buffer(trs.asset.entry, 'hex');
}

Guestbook.prototype.apply = function (trs, sender, cb, scope) {
    modules.blockchain.accounts.mergeAccountAndGet({
        address: sender.address,
        balance: -trs.fee
    }, cb);
}

Guestbook.prototype.undo = function (trs, sender, cb, scope) {
    modules.blockchain.accounts.undoMerging({
        address: sender.address,
        balance: -trs.fee
    }, cb);
}

Guestbook.prototype.applyUnconfirmed = function (trs, sender, cb, scope) {
    if (sender.u_balance < trs.fee) {
        return setImmediate(cb, "Sender doesn't have enough coins");
    }

    modules.blockchain.accounts.mergeAccountAndGet({
        address: sender.address,
        u_balance: -trs.fee
    }, cb);
}

Guestbook.prototype.undoUnconfirmed = function (trs, sender, cb, scope) {
    modules.blockchain.accounts.undoMerging({
        address: sender.address,
        u_balance: -trs.fee
    }, cb);
}

Guestbook.prototype.ready = function (trs, sender, cb, scope) {
	setImmediate(cb);
}

Guestbook.prototype.save = function (trs, cb) {
	modules.api.sql.insert({
		table: "asset_entries",
		values: {
			transactionId: trs.id,
			entry: trs.asset.entry
		}
	}, cb);
}

Guestbook.prototype.dbRead = function (row) {
	if (!row.gb_transactionId) {
		return null;
	} else {
		return {
			entry: row.gb_entry
		};
	}
}

Guestbook.prototype.normalize = function (asset, cb) {
	library.validator.validate(asset, {
		type: "object", // It is an object
		properties: {
			entry: { // It contains a entry property
				type: "string", // It is a string
				format: "hex", // It is in a hexadecimal format
				minLength: 1 // Minimum length of string is 1 character
			}
		},
		required: ["entry"] // Entry property is required and must be defined
	}, cb);
}

Guestbook.prototype.onBind = function (_modules) {
	modules = _modules;
	modules.logic.transaction.attachAssetType(self.type, self);
}

Guestbook.prototype.add = function (cb, query) {
	library.validator.validate(query, {
		type: "object",
		properties: {
			recipientId: {
				type: "string",
				minLength: 1,
				maxLength: 21
			},
			secret: {
				type: "string",
				minLength: 1,
				maxLength: 100
			},
			entry: {
				type: "string",
				minLength: 1,
				maxLength: 1000
			}
		}
	}, function (err) {
		// If error exists, execute callback with error as first argument
		if (err) {
			return cb(err[0].message);
		}

		var keypair = modules.api.crypto.keypair(query.secret);

		modules.blockchain.accounts.setAccountAndGet({
			publicKey: keypair.publicKey.toString('hex')
		}, function (err, account) {
			// If error occurs, call cb with error argument
			if (err) {
				return cb(err);
			}

			console.log(account);
			try {
				var transaction = library.modules.logic.transaction.create({
					type: self.type,
					entry: query.entry,
					recipientId: query.recipientId,
					sender: account,
					keypair: keypair
				});
			} catch (e) {
				// Catch error if something goes wrong
				return setImmediate(cb, e.toString());
			}

			// Send transaction for processing
			modules.blockchain.transactions.processUnconfirmedTransaction(transaction, cb);
		});
	});
}

Guestbook.prototype.list = function (cb, query) {
    // Verify query parameters
    library.validator.validate(query, {
        type: "object",
        properties: {
            recipientId: {
                type: "string",
                minLength: 2,
                maxLength: 21
            }
        },
        required: ["recipientId"]
    }, function (err) {
        if (err) {
            return cb(err[0].message);
        }

        // Select from transactions table and join entries from the asset_entries table
        modules.api.sql.select({
            table: "transactions",
            fields: aliasedFields,
            alias: "t",
            condition: {
                recipientId: query.recipientId,
                type: self.type
            },
            join: [{
                type: 'left outer',
                table: 'asset_entries',
                alias: "gb",
                on: {"t.\"id\"": "gb.\"transactionId\""}
            }]
        }, fieldMap, function (err, transactions) {
            if (err) {
                return cb(err.toString());
            }

            // Map results to asset object
            var entries = transactions.map(function (tx) {
                tx.asset = {
                    entry: new Buffer(tx.entry, 'hex').toString('utf8')
                };

                delete tx.entry;
                return tx;
            });

            return cb(null, {
                entries: entries
            })
        });
    });
}

module.exports = Guestbook;
