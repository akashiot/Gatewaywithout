// Importing required modules
const store = require('store2');              // For storing data in local storage
const moment = require('moment');              // For date and time handling
const ctrl = require('./controller');          // Controller module for database insertions
const stn_setting = require('../configuration/stn1_settings.json'); // JSON configuration for station settings

exports.plcvalues = async function (data, connection, station) {
    // Initialize variables for machine status, batch code, alarm state, and loss state
    var machineStatus = "";
    var batchCode = "";
    var alarmState = "";
    var lossState = "";
    var shiftId = "S" + data?.shift;
    var variantCode = data?.variantNumber;
    var machineCode = "M" + stn_setting.machine_code[station];  // Get machine code from settings

    // Check for active loss tags
    var lossTags = [];
    for (var i = 1; i <= 3; i++) {
        lossTags.push(Boolean(data["loss_L" + i]));
    }
    var isLossActive = lossTags.includes(true);

    // Determine machine status based on input conditions
    if (!connection) {
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
    const hours = moment().format('HH');
    const isPM = hours >= 12;
    let currentDate;

    if (shiftId === "S1" || shiftId === "S2" || (shiftId === "S3" && isPM)) {
        currentDate = moment().format('YYYY-MM-DD');
    } else if (shiftId === "S3" && !isPM) {
        currentDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    }

    // Create timestamp for batch code
    const timestamp = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');

    // Retrieve stored shift and variant code
    const storedShift = store.get(`shift${station}`);
    const storedVariantCode = store.get(`variantCode${station}`);

    // Determine batch code based on shift and variant code
    if (storedShift !== shiftId || storedVariantCode !== variantCode) {
        batchCode = "B" + timestamp; // Generate new batch code if shift or variant has changed
        store.set("batchCode", batchCode); // Store new batch code
    } else {
        batchCode = store.get("batchCode"); // Retrieve existing batch code if no change
    }
    store.set(`shift${station}`, shiftId);
    store.set(`variantCode${station}`, variantCode);

    // Set alarm and loss states based on error and loss conditions
    alarmState = data?.error_active ? "ALM" : "";
    lossState = isLossActive ? "LOS" : "";

    // Retrieve previous states for comparison before insertion
    const prevMachineStatus = store.get(`temp_machineStatus${station}`);
    const prevTotalParts = store.get(`temp_Total_parts${station}`);
    const prevBatchCode = store.get(`setBatchCode${station}`);

    if (prevMachineStatus !== machineStatus || prevTotalParts !== data.Total_parts || prevBatchCode !== batchCode) {
        // Insert data if there's a change in machine status, parts count, or batch code
        ctrl.insert(connection, data, timestamp, currentDate, shiftId, machineCode, machineStatus, alarmState, lossState, batchCode);
    }
    // Update the stored states
    store.set(`temp_machineStatus${station}`, machineStatus);
    store.set(`temp_Total_parts${station}`, data.Total_parts);
    store.set(`setBatchCode${station}`, batchCode);
};