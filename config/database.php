<?php

define('hostname', 'localhost');
define('username', 'root');
define('password', '');
define('database', 'bejeweled');

class Connexion{
    public function connect(){
        $dsn = 'mysql:host='.hostname.';dbname='.database;
        $user = username;
        $password = password;
        try {
            $co = new PDO($dsn, $user, $password);
            $co->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $co->setAttribute(PDO::MYSQL_ATTR_INIT_COMMAND,'SET NAMES utf8');
            $co->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE,PDO::FETCH_ASSOC);
            return $co;

        } catch (PDOException $e) {
            echo "Connexion Ã  MySQL impossible : ", $e->getMessage();
            die();
        }
    }
}
