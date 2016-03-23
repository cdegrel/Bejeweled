<?php

if(isset($_POST['action'])){

	include '../config/database.php';

	$base = new Connexion();
	$co = $base->connect();

	
	extract($_POST);

	switch ($action) {
		case 'getAllScores':
			getAllScores($co);
			break;

		case 'updateScores':
			if(isset($score) && is_numeric($score) && isset($pseudo) && is_string($pseudo)){
				try{
					$req = $co->query("SELECT * FROM scores");
					foreach($req->fetchAll() as $data){
						if($score > $data['score']){
							$req1 = $co->prepare("UPDATE scores SET pseudo = ?, score = ? WHERE score = ?");
							$req1->execute(array($pseudo, intval($score), intval($data['score'])));
							$score = $data['score'];
							$pseudo = $data['pseudo'];
						}
					}
					getAllScores($co);
				}catch(PDOException $e){
					echo "Erreur methode updateScores: ",$e->getMessage();
				}
			}
			break;	
		
		default:
			header('Location : index.html');
	}
}else header('Location : index.html');

function getAllScores($co){
	try{
		$req = $co->query("SELECT * FROM scores");
		$result = $req->fetchAll();
		print(createXMLscores($result));
	}catch(PDOException $e){
		echo "Erreur methode getAllScores: ",$e->getMessage();
	}
}

function createXMLscores($datas){
	$xml = new DOMDocument('1.0');
	$root = $xml->createElement('players');
	$xml->appendChild($root);

	foreach($datas as $data){
		$child = $xml->createElement('player');
		$root->appendChild($child);

		$child1 = $xml->createElement('rank');
		$child->appendChild($child1);
		$child1->appendChild($xml->createTextNode($data['id']));

		$child2 = $xml->createElement('pseudo');
		$child->appendChild($child2);
		$child2->appendChild($xml->createTextNode($data['pseudo']));

		$child3 = $xml->createElement('score');
		$child->appendChild($child3);
		$child3->appendChild($xml->createTextNode($data['score']));
	}

	header('Content-type: text/xml');
	return $xml->saveXML();
}