// Required modules
const store = require('store2'); // For client-side data storage
const cors = require('cors'); // For enabling CORS support
const axios = require('axios'); // For making HTTP requests
const express = require('express'); // For creating the Express server
const bodyparser = require('body-parser'); // For parsing incoming request bodies

// Configuration and module imports
const settings = require('./configuration/config.json'); // Configuration file
const db = require('./model_db'); // Database module
const rawCtrl = require('./rawtable/controller'); // Controller for raw table operations
const rawCalc = require('./rawtable/calculation'); // Calculation functions for raw data
const cycleCalc = require('./cycletime/calculation'); // Cycle time calculations
const criticalCalc = require('./criticalcycletime/calculation'); // Critical cycle time calculations
const lossCalc = require('./loss/calculation'); // Loss calculation module
const alarmCalc = require('./machinealarm/calculation'); // Alarm calculations for machines
const alertCalc = require('./alertrawtable/calculation'); // Alert raw table calculations
const diagnosticCalc = require('./diagnostic/calculation'); // Diagnostic calculations
const getShift = require("./comman_fun.js"); // Common function module for shifts
const toolCalc = require('./toollife/calculation'); // Tool life calculations

// Initialize Express app
const app = express();
app.use(cors()); // Enable CORS
app.use(bodyparser.json()); // Use JSON parser for incoming request bodies

// Error handling middleware for 'EBUSY' error
app.use((err, req, res, next) => {
  if (err.code === 'EBUSY') {
    console.log('EBUSY error occurred:', err); // Log 'EBUSY' error
  }
  // Uncomment to pass the error to the next middleware
  // next(err);
});

// Define the port and start listening
const port = 4001;
app.listen(`${port}`, () => {
  console.log(`Listening on port ${port}`);
});

// Variable to store station number
var stationNo;

// Endpoint to retrieve error data based on state
app.post('/getErrordata', function (req, res) {
  var state = req.body.state;
  if (state == '0') {
    db.query(
      `SELECT * FROM logging WHERE time_stamp > now() - interval 3 hour ORDER BY id DESC`,
      function (err, rows) {
        return res.json(rows); // Return data if state is '0'
      }
    );
  } else if (state == '1' || state == '2') {
    db.query(
      `SELECT * FROM logging WHERE state='${req.body.state}' AND time_stamp > now() - interval 3 hour ORDER BY id DESC`,
      function (err, rows) {
        return res.json(rows); // Return data for state '1' or '2'
      }
    );
  }
});

// Function to process and update PLC values
async function valuesReady() {
  const res = await axios.get(settings.plc_url + '/getPlcData'); // Fetch PLC data
  const plcs = Object.keys(res?.data); // Get list of PLCs

  plcs.forEach(plc => {
    var connection = res.data[plc].connection;
    stationNo = Object.keys(res?.data[plc]); // Get station numbers
    stationNo.slice(1).forEach(ele => { // Iterate over each station number
      let stn = res.data[plc][ele];
      let result = connection;

      // Set default values for various station parameters
      stn.automode_running = stn?.automode_running || false;
      stn.automode_selected = stn?.automode_selected || false;
      stn.manualmode_selected = stn?.manualmode_selected || false;
      stn.error_active = stn?.error_active || false;
      stn.break = stn?.break || false;
      stn.warning_active = stn?.warning_active || false;
      stn.variantNumber = stn?.variantNumber || 0;
      stn.OK_parts = stn?.OK_parts || 0;
      stn.shift = getShift.getShift();
      stn.NOT_parts = stn?.NOT_parts || 0;
      stn.Total_parts = stn?.Total_parts || 0;
      stn.Rej_Reason_1 = stn?.Rej_Reason_1 || 0;
      stn.AlmWord_1 = stn?.AlmWord_1 || 0;
      stn.AlmWord_2 = stn?.AlmWord_2 || 0;
      stn.AlmWord_3 = stn?.AlmWord_3 || 0;
      stn.theoretical_cycletime_LH = stn?.theoretical_cycletime_LH || 0;
      stn.theoretical_cycletime_RH = stn?.theoretical_cycletime_RH || 0;
      stn.actualCycletime_LH = stn?.actualCycletime_LH || 0;
      stn.actualCycletime_RH = stn?.actualCycletime_RH || 0;

      // Calculate cycle times
      stn.theoretical_cycletime = stn?.theoretical_cycletime || stn?.theoretical_cycletime_LH + stn?.theoretical_cycletime_RH || 0;
      stn.actualCycletime = stn?.actualCycletime || stn?.actualCycletime_LH + stn?.actualCycletime_RH || 0;
      stn.operation_time = stn?.operationbit || false;

      // Perform calculations if connection is true
      if (result == true) {
        rawCalc.plcvalues(stn, connection, ele);
        cycleCalc.rawCycletime(stn, ele);
        criticalCalc.checkOperation(stn, ele);
        alertCalc.AlertRawTable(stn, connection, ele);
        lossCalc.changedLoss(stn, ele);
        alarmCalc.machineAlarm(stn, ele);
        toolCalc.toolLife(stn, ele);
      } else if (!res.data || res.data == '') {
        console.log('Check PLC communication!!..');
      }
    });
  });
}

// Set interval for periodic data refresh
setInterval(valuesReady, settings.refresh_rate);
