// Importing required modules
const store = require('store2');              // For storing data in local storage
const moment = require('moment');              // For date and time handling
const ctrl = require('./controller');          // Controller module for database insertions
const stn_setting = require('../configuration/stn1_settings.json'); // JSON configuration for station settings

// Function to process and store PLC data values
exports.plcvalues = async function (data, Con, stn) {
    // Initialize variables for machine status, batch code, alarm state, and loss state
    var machineStatus = "";
    var batchCode = "";
    var alarmState = "";
    var lossState = "";
    var shiftId = "S" + data?.shift;
    var varientCode = "V" + "1";               // Default variant code (or data?.variantNumber if needed)
    var MachineCode = "M" + stn_setting.machine_code[stn];  // Get machine code from settings

    // Check for active loss tags
    var lossTags = [];
    for (var i = 1; i <= 12; i++) {
        lossTags.push(data["loss_L" + i]);
    }
    var lossActive = lossTags.includes(true);

    // Determine machine status based on input conditions
    if (Con == false) {
        machineStatus = 5;
    } else if (data?.break === true) {
        machineStatus = 4;
    } else if (data?.error_active === true) {
        machineStatus = 0;
    } else if (data?.manualmode_selected === true || lossActive === true) {
        machineStatus = 3;
    } else if (data?.automode_running === true) {
        machineStatus = 1;
    } else if (data?.automode_selected === true && !data?.automode_running && !data?.error_active) {
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

    // Get previously stored shift and variant codes
    var getShift = store.get("shift_" + MachineCode);
    var getVarientCode = store.get("varientCode_" + MachineCode);
    timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');

    // Generate a new batch code if shift or variant code has changed
    if (getShift !== shiftId || getVarientCode !== varientCode) {
        batchCode = "B" + timeStamp;
        store.set("batchcode_" + MachineCode, batchCode);
    } else if (getShift == shiftId || getVarientCode == varientCode) {
        batchCode = store.get("batchcode_" + MachineCode);
    }

    // Update stored shift and variant codes
    store.set("shift_" + MachineCode, shiftId);
    store.set("varientCode_" + MachineCode, varientCode);

    // Set alarm and loss states based on error and loss conditions
    alarmState = data?.error_active === true ? "ALM" : " ";
    lossState = lossActive === true ? "LOS" : " ";

    // Insert the processed data into the database
    ctrl.insert(Con, data, timeStamp, Cdate, shiftId, MachineCode, machineStatus, alarmState, lossState, batchCode);
};
