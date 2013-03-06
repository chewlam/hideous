<?php

$mtg = new MtgCards;
$mtg->load_from_file('../dbdata/rtr.txt','RTR');
$mtg->load_from_file('../dbdata/gtc.txt','GTC');
$s = $mtg->getCards ();
MongoLoader::upload($s, true);



class MongoLoader {

    const DBNAME = 'mtg';
    const CONN_STR = 'localhost';

    public static function upload ($data_set, $clean) {
        try {
            $m = new Mongo(self::CONN_STR);
            $db = $m->selectDB(self::DBNAME);

            if ($clean)
                $db->cards->remove();

            $cnt = 0;
            foreach ($data_set as $card) {
                $db->cards->insert ($card);
                $cnt++;
                echo "Inserted card {$card['name']} with ID: {$card['_id']}".PHP_EOL;
            }
            echo "$cnt cards loaded".PHP_EOL;
            $m->close();
        }
        catch (MongoConnectionException $e) {
            echo 'Couldn\'t connect to mongodb, is the "mongo" process running?'.PHP_EOL;
            return false;
        } 
        catch (MongoException $e) {
            echo ('Error: ' . $e->getMessage() . PHP_EOL);
            return false;
        }
        return true;
    }
}


class MtgCards {

    public $dbfield_map = array (
        "Card Name"    => "name",
        "Card Color"   => "color",
        "Mana Cost"    => "mana",
        "Type & Class" => "type",
        "Pow"          => "power",
        "Tou"          => "toughness",
        "Card Text"    => "rule_text",
        "Flavor Text"  => "flavor",
        "Artist"       => "artist",
        "Rarity"       => "rarity",
        "Card #"       => "card_no"
    );

    protected $mtg_set = array();

    function load_from_file ($filename, $set_name) {
        $f = fopen ($filename, 'rt');
        $in = '';
        $card = array ();
        $data = array ();

        while (($in = fgets ($f, 4096)) !== false) {
            $data = explode (":", $in,  2);

            $card[$data[0]] = trim($data[1]);

            if($data[0] == "Card #") {
                $this->add_card ($card, $set_name);
                $card = array();
            }
        }
        fclose($f);
    }

    function add_card ($card, $set_name) {
        $data = array ();
        $new_card = array ();

        foreach ($card as $key => $value) {
            if (empty($value))
                continue;

            if ($key == "Pow/Tou") {
                $data = explode("/", $value);
                $new_card['power'] = $data[0];
                $new_card['toughness'] = $data[1];
            }
            else if ($key == "Card #") {
                $data = explode("/", $value);
                $new_card[$this->dbfield_map[$key]] = $data[1];
            }
            else if (!empty($this->dbfield_map[$key])) {
                $new_card[$this->dbfield_map[$key]] = $value;
            }
        }
        $new_card['set'] = $set_name;
        $this->mtg_set[] = $new_card;
    }

    function getCards () {
        return ($this->mtg_set);
    }
}



?>

