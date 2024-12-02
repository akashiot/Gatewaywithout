// Importing required modules
const store = require('store2');              // For storing data in local storage
const moment = require('moment');              // For date and time handling
const ctrl = require('./controller');          // Controller module for database insertions
const stn_setting = require('../configuration/stn1_settings.json'); // JSON configuration for station settings

exports.plcvalues = async function (data, Con, stn) {
    // Initialize variables for machine status, batch code, alarm state, and loss state
    var machineStatus = "";
    var batchCode = "";
    var alarmState = "";
    var lossState = "";
    var shiftId = "S" + data?.shift;
    var varientCode = data?.variantNumber;
    var MachineCode = "M" + stn_setting.machine_code[stn];  // Get machine code from settings

    // Check for active loss tags
    var lossTags = [];
    for (var i = 1; i <= 3; i++) {
        lossTags.push(Boolean(data["loss_L" + i]));
    }
    var isLossActive = lossTags.includes(true);

    // Determine machine status based on input conditions
    if (!Con) {
        machineStatus = 5;
    } else if (data?.break) {
        machineStatus = 4;
    } else if (data?.error_active) {
        machineStatus = 0;
    } else if (data?.automode_running) {
        machineStatus = isLossActive ? 2 : 1;
    } else if (data?.manualmode_selected || data?.automode_selected) {
        machineStatus = 3;
    } else {
        machineStatus = 3;
    }

    // Determine current date based on shift ID and time
    var hours = moment().format('HH');
    var ampm = (hours >= 12) ? "PM" : "AM";

    if ((shiftId === "S1" || shiftId === "S2") || (shiftId === "S3" && ampm === "PM")) {
        Cdate = moment().format('YYYY-MM-DD');
    } else if (shiftId === "S3" && ampm === "AM") {
        Cdate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    }

    // Create timestamp for batch code
    timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss.SSS')

    // Retrieve stored shift and variant code
    var getShift = store.get("shift" + stn);
    var getVarientCode = store.get("varientCode" + stn);

    // Determine batch code based on shift and variant code
    if (getShift !== shiftId || getVarientCode !== varientCode) {
        batchCode = "B" + timeStamp; // Generate new batch code if shift or variant has changed
        store.set("batchcode" + stn, batchCode); // Store new batch code
    }
    else if (getShift == shiftId || getVarientCode == varientCode) {
        var batchCode = store.get("batchcode" + stn); // Retrieve existing batch code if no change
    }

    console.log(batchCode) // Log batch code for debugging

    store.set("shift" + stn, shiftId);
    store.set("varientCode" + stn, varientCode);

    // Set alarm and loss states based on error and loss conditions
    alarmState = data?.error_active === true ? "ALM" : " ";
    lossState = isLossActive === true ? "LOS" : " ";

    var getMachineStatus = store.get("temp_machineStatus" + stn);
    var getTotal_parts = store.get("temp_Total_parts" + stn);
    var getbatchCode = store.get("setbatchCode" + stn);

    if (getMachineStatus !== machineStatus || getTotal_parts !== data.Total_parts || getbatchCode !== batchCode) {
        ctrl.insert(Con, data, timeStamp, Cdate, shiftId, MachineCode, machineStatus, alarmState, lossState, batchCode);
    }
    store.set("temp_machineStatus" + stn, machineStatus);
    store.set("temp_Total_parts" + stn, data.Total_parts);
    store.set("setbatchCode" + stn, batchCode);
};