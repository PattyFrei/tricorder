function getChart(setValues, dataSetID) {
    //console.log(setValues);
    //const parsedSetValues = JSON.stringify(setValues);
    //initChart(parsedSetValues, dataSetID);
    initChart(dataSetID);
  }
  
  function initChart(dataSetID) {
    const fileName = 'dataset_' + dataSetID + '.csv';
    const pathName = '/chart/' + fileName;
    console.log(pathName);
  
    // with csv file
    chart = new Dygraph(document.getElementById('graphdiv2'), pathName,
      {
        title: 'Temperatur und Relative Luftfeuchte',
        delimiter: ",",
        labels: ["time_stamp", "temperature", "humidity", "air_pressure", "altitude" ],
        visibility: [true, true, false, false],
        series: {
          'temperature': { axis: 'y' },
          'humidity': { axis: 'y2' }, 
        },
        axes: {
          y2: { axisLabelWidth: 60 },
        },
        legend: "always",
        showRangeSelector: true,
        xlabel: "Zeitstempel",
        ylabel: "Temp (°C)",
        y2label: "Luftfeuchte (%)",
        //valueRange: [0.0, 50.0]
      }
    );
  
    // with csv file
    chart = new Dygraph(document.getElementById('graphdiv3'), pathName,
      {
        title: 'Luftdruck',
        delimiter: ",",
        labels: ["time_stamp", "temperature", "humidity", "air_pressure", "altitude" ],
        visibility: [false, false, true, false],
        series: {
          'air_pressure': { axis: 'y' },
          'altitude': { axis: 'y2' }, 
        },
        axes: {
          y: { axisLabelWidth: 70 },
          y2: { axisLabelWidth: 70 },
          // y2: { labelsKMB: true, valueRange: [90, 109] }
        },
        legend: "always",
        showRangeSelector: true,
        xlabel: "Zeitstempel",
        ylabel: "Luftdruck (hPa)",
        y2label: "Höhe (m)"
        //valueRange: [0, 1050]
      }
    );

    /*
    // with parsed data
    new Dygraph(document.getElementById('graphdiv3'), parsedSetValues, {
        customBars: true,
        title: 'Temperatur, Luftfeuchtigkeit, Luftdruck',
        ylabel: 'Test',
        legend: 'always',
        }
    ); */
  
    function update(el) {
      chart.updateOptions( { fillGraph: el.checked } );
    }  
  };
