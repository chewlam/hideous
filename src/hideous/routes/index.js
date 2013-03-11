
var url = require("url");
var _ = require('underscore');

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
            res.render('index', {title : 'Hideous - Library', cards : cards});
    }

    new Library ().getCards (sort, f);
};


exports.drafting = function(req, res){
//    res.render('index', { title: 'Express' });

    var q = url.parse(req.url, true).query;
    console.log (JSON.stringify(q));


    var count = new Object();
    var library = new Object ();

    var sort = {name : 1};

    if (!q.format) {
        res.send ("Draft format not specified");
        return;
    }

    var build_packs = function (err) {
        if (q.format == "sealed") {
            if (!q.packs) {
                res.send ("Packs for sealed draft are not specified");
                return;
            }

            var packs = q.packs.split(",");
            var default_set = {C : 10, U : 3, R : 1, M : 0, land : 1};
            var output = new Array;

            for (var i=0; i<packs.length; i++) {

                var set = new Object;
                _.extend(set, default_set);

                var has_foil = false;
                var expansion = packs[i];

                if (Math.floor((Math.random()*8)+1) == 1) {
                    //has mythic, replaces rare card
                    set.M = 1;
                    set.R = 0;
                }

                if (Math.floor((Math.random()*70)+1) == 1) {
                    // has foil, replaces one common card
                    set.C = 9;
                    has_foil = true;
                }

                packs[i] = new Array;
                var total_cards = 0;
                for (var key in set) {
                    total_cards += library[expansion][key].length;

                    for (var j=0; j<set[key]; j++) {
                        // TODO, need to guard against the same card being added 2x
                        var num = Math.floor((Math.random()*library[expansion][key].length));
                        console.log(key + " -- " + library[expansion][key][num].name);
                        packs[i].push(library[expansion][key][num]);
                    }
                }

                if (has_foil) {
                    var num = Math.floor((Math.random()*total_cards));
                    var foil_card = new Object;
                    for (var key in set) {
                        if (num < library[expansion][key].length) {
                            _.extend(foil_card, library[expansion][key][num]);
                            foil_card.foil = true;
                        }
                        else {
                            num -= library[expansion][key].length;
                        }
                    }


                    packs[i].push(foil_card);
                    console.log("FOIL -- " + foil_card.name);
                }
            }
            output.push(packs)
            res.send(output);
        }
    }


    var format_library_by_set_rarity = function (err, cards) {
        if (err)  {
            console.log ("Encountered error");
        }

        for (var i=0; i<cards.length; i++) {
            if (!library[cards[i].set]) {
                library[cards[i].set] = new Object;
                library[cards[i].set]['C'] = new Array;
                library[cards[i].set]['U'] = new Array;
                library[cards[i].set]['R'] = new Array;
                library[cards[i].set]['M'] = new Array;
                library[cards[i].set]['land'] = new Array;
            }

            if (cards[i].type.indexOf("Basic Land") > -1) {
                library[cards[i].set]["land"].push(cards[i]);
            }
            else {
                library[cards[i].set][cards[i].rarity].push(cards[i]);
            }
        }

        console.log (library.RTR.C.length);
        console.log (library.RTR.U.length);
        console.log (library.RTR.R.length);
        console.log (library.RTR.M.length);
        console.log (library.RTR.land.length);
        console.log (library.GTC.C.length);
        console.log (library.GTC.U.length);
        console.log (library.GTC.R.length);
        console.log (library.GTC.M.length);
        console.log (library.GTC.land.length);
        build_packs();
    }

    new Library ().getCards (sort, format_library_by_set_rarity);
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
                    result[i].mana = _this.parseMana (result[i]);
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