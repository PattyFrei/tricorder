var express = require('express');
var router = express.Router();
let mysql = require('mysql');
let Json2csvParser = require('json2csv').Parser;
let fs = require('fs');

// db connection
let con = mysql.createConnection({
  host: "localhost",
  user: "user1",
  password: "password1",
  database: "tricorder",
});

// web routing
router.get('/', function(req, res, next) {
  res.render('main-menu', { title: 'Tricorder - Hauptmenü' });
});

router.get('/main-menu', function(req, res, next) {
  res.render('main-menu', { title: 'Tricorder - Hauptmenü' });
});

module.exports = router;
