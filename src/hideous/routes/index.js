
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

    var renderLibrary = function (err, cards) {
        if (err) 
            console.log ("Encountered error");
        else 
            res.render('index', {title : 'Hideous - Library', cards : cards});
    }

    new Library ().getCards (sort, renderLibrary);
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
    else if (q.format == "sealed" && !q.packs) {
        res.send ("Packs for sealed draft are not specified");
        return;
    }


    var default_booster_contents = { C : 10, U : 3, R : 1, M : 0, LND : 1 };

    var build_packs = function (err) {

        var packs = new Array;
        var test_mode = false;

        if (q.format == "test") {
            test_mode = true;
            for (var i=0; i<5000; i++) {
                packs[i] = "RTR";                
            }
        }
        else {
            packs = q.packs.split(",");
        }

        var output = new Array;

        for (var i=0; i<packs.length; i++) {
            packs[i] = generate_booster(packs[i]);
        }

        var tester = new Object;
        tester.packs = packs.length;

        for (var pack in packs) {
            var expansion = pack.expansion;
            for (var card_name in pack.cards) {
                var card = library[expansion]['BY_NAME'][card_name];

                if (test_mode ) {
                    var id = card.card_no;
                    if (!tester[expansion])
                        tester[expansion] = new Object;

                    var key = card.rarity;

                    if (!tester[expansion][key])
                        tester[expansion][key] = new Object;

                    if (!tester[expansion][key][id])
                        tester[expansion][key][id] = 1;
                    else
                        tester[expansion][key][id] = tester[expansion][key][id] + 1;
                }
            }
            for (var card_name in pack.foils) {
                var card = library[expansion]['BY_NAME'][card_name];

                if (test_mode === 1) {
                    var id = card.card_no;
                    var key = "foil";

                    if (!tester[expansion][key])
                        tester[expansion][key] = new Object;

                    if (!tester[expansion][key][id])
                        tester[expansion][key][id] = 1;
                    else
                        tester[expansion][key][id] = tester[expansion][key][id] + 1;
                }
            }
        }

        if (test_mode) {
            res.send (packs);
        }
        else {
            res.render('drafting', {title : 'Hideous - Drafting' , packs : packs});
        }
    }

    var generate_booster = function (expansion) {
        var contents = new Object;
        _.extend(contents, default_booster_contents);

        var has_foil = false;

        if (Math.floor(Math.random()*8) === 0) {
            //has mythic, replaces rare card
            contents.M = 1;
            contents.R -= 1;
        }

        if (Math.floor(Math.random()*70) === 0) {
            // has foil, replaces one common card
            contents.C -= 1;
            has_foil = true;
        }

        var booster = new Object;
        booster.expansion = expansion;
        booster.cards = new Array;

        for (var key in contents) {
            var used = new Object;

            for (var j=0; j<contents[key]; j++) {
                do {                     // guard against the same card being added 2x
                    var index = Math.floor(Math.random()*library[expansion][key].length);
                }  while (used[index]);

                // console.log(key + " -- " + library[expansion][key][num].name);
                booster.cards.push(library[expansion][key][index].name);
                used[index] = true;
            }
        }

        if (has_foil) {
            var keys = Object.keys(library[expansion]['BY_CARD_NO']);
            var total_cards = keys.length;
            var index = Math.floor(Math.random()*total_cards);
            var card = library[expansion]['BY_CARD_NO'][keys[index]];

            console.log ('foil -- ' + card.name);

            booster.foils = new Array;
            booster.foils.push(card.name);
        }
        return booster;
    }


    var format_library = function (err, cards) {
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
                library[cards[i].set]['LND'] = new Array;
                library[cards[i].set]['BY_NAME'] = new Object;
                library[cards[i].set]['BY_CARD_NO'] = new Object;
            }

            if (cards[i].type.indexOf("Basic Land") > -1) {
                library[cards[i].set]["LND"].push(cards[i]);
            }
            else {
                library[cards[i].set][cards[i].rarity].push(cards[i]);
            }

            // TODO: basic lands have the same name, and sometimes, in a set, there are other cards with the same name.
            library[cards[i].set]['BY_NAME'][cards[i].name] = cards[i];
            library[cards[i].set]['BY_CARD_NO'][cards[i].card_no] = cards[i];
        }

        build_packs();
    }

    new Library ().getCards (sort, format_library);
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