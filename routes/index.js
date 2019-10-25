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

// routing
router.get('/', function(req, res, next) {
  res.render('main-menu', { title: 'Tricorder - Hauptmenü' });
});

router.get('/main-menu', function(req, res, next) {
  res.render('main-menu', { title: 'Tricorder - Hauptmenü' });
});

router.get('/record', function(req, res, next) {
  res.render('record', { title: 'Tricorder - Aufnahmemenü', message: 'Keine.. ' });
});

router.get('/get-orders', function(req, res, next) {
  let orderList = [];
  let getOrdersQuery = "SELECT * FROM order_list WHERE start_date > CURRENT_TIMESTAMP() ORDER BY id DESC";

  let promiseOrderList = new Promise(function(resolve, reject) {
    con.query(getOrdersQuery, function (err, result) {
      if (err) throw err;
      for (let i = 0; i < result.length; i++) {
        // remove time zone - remove on raspi
        let stDate = result[i].start_date.toString();
        let enDate = result[i].end_date.toString();
        let newStDate = stDate.substring(0, stDate.length - 31);
        let newEnDate = enDate.substring(0, enDate.length - 31);
        // Create an object to save current row's data
        let order = {
          'id': result[i].id,
          'temperature': result[i].temperature,
          'humidity': result[i].humidity,
          'air_pressure': result[i].air_pressure,
          'device_tilt': result[i].device_tilt,
          'start_date': newStDate,
          'end_date': newEnDate
        };
        // Add object into array
        orderList.push(order);

      };
      resolve({ orderList });
      console.log(orderList); // test point
      //console.log(JSON.stringify(orderList));
    });
  });

  promiseOrderList.then(function(orderList) {
    return res.render('record', { 
      title: 'Tricorder - Aufnahmemenü', 
      orderList,
      message: 'Alle Aufträge erfolgreich geladen!'
    });
  });
});

router.post('/insert-order', function(req, res, next) {
  const order = {
    temperature: req.body.temperature ? true : false,
    humidity: req.body.humidity ? true : false,
    air_pressure: req.body.air_pressure ? true : false,
    device_tilt: req.body.device_tilt ? true : false,
    start_date: req.body.start_date,
    end_date: req.body.end_date 
  };
  console.log(order.start_date)
  //console.log('Order to be inserted: ' + JSON.stringify(order)); // test point

  // insert new order
  let promiseOrderID = new Promise(function(resolve, reject) {
    let insertOrderQuery = "INSERT INTO order_list VALUES (NULL, ?, ?, ?, ?, ?, ?)";
    con.query(insertOrderQuery, [order.temperature, order.humidity, order.air_pressure, order.device_tilt, order.start_date, order.end_date], function (err, result) {
      if (err) throw err;
      let orderID;
      //console.log('Order inserted: ' + JSON.stringify(result)); // test point
      console.log('Order ID: ' + result.insertId); // test point
      orderID = result.insertId; 
      resolve({ orderID });
    });
  });

  // create table for order with id
  promiseOrderID.then(function(orderID) {
    console.log(orderID); // test point
    let createOrderTableQuery = "CREATE TABLE ?? (order_id smallint unsigned, foreign key (order_id) REFERENCES order_list(id), primary key (order_id, time_stamp), temperature tinyint, humidity tinyint unsigned, air_pressure smallint, altitude smallint, device_tilt_x decimal(5,3), device_tilt_y decimal(5,3), device_tilt_z decimal(5,3), device_acc_x decimal(5,3), device_acc_y decimal(5,3), device_acc_z decimal(5,3), time_stamp TIMESTAMP)";
    con.query(createOrderTableQuery, orderID.orderID, function (err, result) {
      if (err) throw err;
      //console.log('Table created ' + JSON.stringify(result));
    });
  });

  promiseOrderID.then(function(orderID) {
    res.render('record', { 
      title: 'Tricorder - Aufnahmemenü', 
      message: 'Neuer Auftrag mit ID: ' + orderID.orderID + ' angelegt!' 
    });
  });

  // catch - needed?
  promiseOrderID.catch(function(err) {
    console.log(err);
  });
});

router.post('/update', function(req, res, next) {
  let promiseGetOrderUpdate = new Promise(function(resolve, reject) {
    let orderID = req.body.id;
    const order = {
      temperature: req.body.temperature ? true : false,
      humidity: req.body.humidity ? true : false,
      air_pressure: req.body.air_pressure ? true : false,
      device_tilt: req.body.device_tilt ? true : false,
      start_date: req.body.start_date,
      end_date: req.body.end_date
    };
    console.log('Order ID to be changed: ' + JSON.stringify(orderID)); // test point
    console.log('Order settings to be inserted: ' + JSON.stringify(order)); // test point
    resolve({ orderID, order });
  });

  promiseGetOrderUpdate.then(function(orderUpdate) {
    console.log(orderUpdate); // test point
    let updateOrderQuery = "UPDATE order_list SET temperature = ?, humidity = ?, air_pressure = ?, device_tilt = ?, start_date = ?, end_date = ? WHERE id = ?";
    con.query(updateOrderQuery, 
      [orderUpdate.order.temperature, orderUpdate.order.humidity, orderUpdate.order.air_pressure, 
        orderUpdate.order.device_tilt, orderUpdate.order.start_date, orderUpdate.order.end_date, orderUpdate.orderID], 
      function (err, result) {
      if (err) throw err;
      console.log('Order updated: ' + JSON.stringify(result));
    });
  });

  promiseGetOrderUpdate.then(function(orderUpdate) {
    res.render('record', { 
      title: 'Tricorder - Aufnahmemenü', 
      message: 'Der Auftrag mit ID: ' + orderUpdate.orderID + ' wurde aktualisiert!'
    });
  });
});

router.post('/delete', function(req, res, next) {
  let orderID = req.body.id;
  let deleteTableQuery = "DROP TABLE IF EXISTS ??";
  let deleteIDQuery = "DELETE FROM order_list WHERE id = ?";

  con.query(deleteTableQuery, orderID, function (err, result) {
    if (err) throw err;
    console.log('Table deleted: ' + JSON.stringify(result));
  });

  con.query(deleteIDQuery, orderID, function (err, result) {
    if (err) throw err;
    console.log('Order deleted: ' + JSON.stringify(result));
  });

  res.render('record', { 
    title: 'Tricorder - Aufnahmemenü', 
    message: 'Der Auftrag mit ID: ' + orderID + ' wurde gelöscht!' 
  });
});

router.get('/data-set', function(req, res, next) {
  res.render('data-set', { title: 'Tricorder - Datensätze' });
});

router.get('/get-data-sets', function(req, res, next) {
  let dataSetList = [];
  let getDataSetsQuery = "SELECT * FROM order_list WHERE start_date < CURRENT_TIMESTAMP() ORDER BY id DESC";

  let promiseDataSetList = new Promise(function(resolve, reject) {
    con.query(getDataSetsQuery, function (err, result) {
      if (err) throw err;
      for (let i = 0; i < result.length; i++) {
        // remove time zone
        let stDate = result[i].start_date.toString();
        let enDate = result[i].end_date.toString();
        let newStDate = stDate.substring(0, stDate.length - 31);
        let newEnDate = enDate.substring(0, enDate.length - 31);
        // Create an object to save current row's data
        let dataSet = {
          'id': result[i].id,
          'temperature': result[i].temperature,
          'humidity': result[i].humidity,
          'air_pressure': result[i].air_pressure,
          'device_tilt': result[i].device_tilt,
          'start_date': newStDate,
          'end_date': newEnDate
        };
        // Add object into array
        dataSetList.push(dataSet);
      };
      resolve({ dataSetList });
      //console.log(dataSetList); // test point
    });
  });

  promiseDataSetList.then(function(dataSetList) {
    res.render('data-set', { 
      title: 'Tricorder - Datensätze', 
      dataSetList
    });
  });
});

router.get('/data-set-info/:id', function(req, res, next) {
  const dataSetID = req.params.id;
  console.log(dataSetID); 

  const fileName = 'dataset_' + dataSetID + '.csv';
  const pathName = './dataset_export/' + fileName;
  console.log(fileName); 
  console.log(pathName);

  let setValues = [];
  let setChartValues = [];
  let createChart = 0;
  let getDataSetValuesQuery = "SELECT * FROM ??";

  let promiseDataSetValues = new Promise(function(resolve, reject) {
    con.query(getDataSetValuesQuery, dataSetID, function (err, result) {
      if (err) throw err;
      let chartResult = result;

      // in sync function
      if ( !(fs.existsSync(pathName))) {
        console.log('file does not exist'); 
        createChart = 1;
        
        // convert JSON to CSV data
        const csvFields = ['temperature', 'humidity', 'air_pressure', 'altitude', 'device_tilt_x', 'device_tilt_y', 'time_stamp'];
        const csvParser = new Json2csvParser({ csvFields });
        const csvData = csvParser.parse(chartResult);
        console.log('parsed csv data');

        // saves csv to dataset_export folder
        fs.writeFile(pathName, csvData, function(err) {
          if (err) throw err;
          console.log(fileName + ' export file saved');
        });

      } else console.log('file does exist'); 
      console.log(createChart);

      for (let i = 0; i < result.length; i++) {
        // table data
        // remove time zone
        let TiStamp = result[i].time_stamp.toString();
        let newTiStamp = TiStamp.substring(0, TiStamp.length - 31);
        // Create an object to save current row's data
        let setRow = {
          'id': result[i].order_id,
          'temperature': result[i].temperature ? result[i].temperature : '-',
          'humidity': result[i].humidity ? result[i].humidity : '-',
          'air_pressure': result[i].air_pressure ? result[i].air_pressure : '-',
          'altitude': result[i].altitude ? result[i].altitude : '-',
          'device_tilt_x': result[i].device_tilt_x ? result[i].device_tilt_x : '-',
          'device_tilt_y': result[i].device_tilt_y ? result[i].device_tilt_y : '-',
          'time_stamp': newTiStamp
        };
        // Add object into array
        setValues.push(setRow);

        // chart data
        if (createChart) {
          let chartRow = {
            'time_stamp': result[i].time_stamp,
            'temperature': result[i].temperature,
            'humidity': result[i].humidity,
            'air_pressure': result[i].air_pressure,
            'altitude': result[i].altitude
          };
          setChartValues.push(chartRow);
        }
      };
      console.log('resolved data for table');
      resolve({ setValues });
      console.log(setChartValues);
      //console.log(setValues); // test point

      if (createChart) {
        const chartFields = ['time_stamp', 'temperature', 'humidity', 'air_pressure'];
        const chartParser = new Json2csvParser({ chartFields });
        const chartData = chartParser.parse(setChartValues);
        console.log('parsed chart data');

        // saves csv to dataset_export folder
        fs.writeFile('./public/chart/' + fileName, chartData, function(err) {
          if (err) throw err;
          console.log(fileName + ' chart file saved');
        });

        // remove "" from chart file
        fs.readFile('./public/chart/' + fileName, 'utf8', function(err, data) {
          if (err) {
            return console.log(err);
        }
          let result = data.replace(/"/g,'');
          fs.writeFile('./public/chart/' + fileName, result, 'utf8', function(err) {
            if (err) {
              return console.log(err);
            };
          });
        });
      };
    });
  }); 

  promiseDataSetValues.then(function(setValues) {
    console.log('sent data for table'); // test point
    res.render('data-set-info', { 
      title: 'Tricorder - Datensatz Info', 
      setValues, dataSetID
    });
  });
});

router.get('/data-set-info/download/:id', function(req, res, next) {
  const dataSetID = req.params.id;
  const fileName = 'dataset_' + dataSetID + '.csv';
  const pathName = './dataset_export/' + fileName;
  res.download(pathName);
});

module.exports = router;