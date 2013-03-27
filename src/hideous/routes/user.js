
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};



function UserManagement () { }

UserManagement.prototype.getCards = function (search, cb) {
    var Db = require('mongodb').Db,
        Connection = require('mongodb').Connection,
        Server = require('mongodb').Server;

    var _this = this;
    var all_cards = new Array;

    Db.connect("mongodb://localhost:27017/mtg", function (err, db) {
        var self = this;
        if (err) {
            return cb (err);
        }

        db.collection('cards', function (err, collection) {
            var cursor = collection.find().sort({name : 1 });
            all_cards = cursor.toArray(function (err, result) {
                for (var i=0; i<result.length; i++) {
                    result[i].mana = _this.parseMana (result[i]);
                }
                return cb (err, result);
            });
        });
    });
}

