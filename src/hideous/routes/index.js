
var url = require("url");

/*
 * GET home page.
 */

exports.index = function(req, res){
//    res.render('index', { title: 'Express' });

    var pathname = url.parse(req.url).pathname;
    var search = url.parse(req.url).search;


    console.log(pathname);

    console.log(search);

    var sort = {name : 1};

    var f = function (err, cards) {
        if (err) 
            console.log ("Encountered error");
        else 
            res.render('index', {title : 'Hideous', cards : cards});
    }

    new Library ().getCards (sort, f);

    
};


function Library () { }

Library.prototype.getCards = function (search, cb) {
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
                    result[i].mana = this.parseMana (result[i]);;
                }
                return cb (err, result);
            });
        });
    });
}


Library.prototype.parseMana = function (in_card) {
    if (!in_card || !in_card.mana)
        return new Array;

    var pre  = ' ';
    var post = '';
    var out = in_card.mana;
    out = out.replace(/W/g,  pre+'w'+post);
    out = out.replace(/U/g,  pre+'u'+post);
    out = out.replace(/B/g,  pre+'b'+post);
    out = out.replace(/R/g,  pre+'r'+post);
    out = out.replace(/G/g,  pre+'g'+post);
    out = out.replace(/%Q/g, pre+'bg'+post);
    out = out.replace(/%A/g, pre+'gw'+post);
    out = out.replace(/%P/g, pre+'rw'+post);
    out = out.replace(/%V/g, pre+'ub'+post);
    out = out.replace(/%L/g, pre+'rg'+post);
    out = out.replace(/%I/g, pre+'ur'+post);
    out = out.replace(/%O/g, pre+'wb'+post);
    out = out.replace(/%K/g, pre+'br'+post);
    out = out.replace(/%S/g, pre+'gu'+post);
    out = out.replace(/%D/g, pre+'wu'+post);
    out = out.replace(/X/g,  pre+'x'+post);
    out = out.trim();
    return out.split(' ');
}