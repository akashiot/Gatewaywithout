const store = require('store2');
const moment = require('moment');
const ctrl = require('./controller')
const stn_setting = require('../configuration/stn1_settings.json')

exports.plcvalues = async function (data, Con, stn) {
    var machineStatus = "";
    var batchCode = "";
    var alarmState = "";
    var lossState = "";
    var shiftId = "S" + data?.shift;
    //var varientCode = "V" + data?.variantNumber;
    var varientCode = "V" + "1";
    var MachineCode = "M" + stn_setting.machine_code[stn];

    var lossTags = [];
    for (var i = 1; i <= 12; i++) {
        lossTags.push(data["loss_L" + i]);
    }
    var lossActive = lossTags.includes(true);

    if (Con == false) {
        machineStatus = 5;
    }
    else if (data?.break == true) {
        machineStatus = 4;

    }
    else if (data?.error_active == true) {
        machineStatus = 0;

    }
    else if (data?.manualmode_selected == true || lossActive == true) {
        machineStatus = 3;
    }
    else if (data?.automode_running == true) {
        machineStatus = 1;
    }
    else if ((data?.automode_selected == true && data?.automode_running !== true) && data?.error_active !== true) {
        machineStatus = 3;
    }
    else {
        machineStatus = 3;
    }

    var hours = moment().format('HH');
    var ampm = (hours >= 12) ? "PM" : "AM";

    if ((shiftId === "S1" || shiftId === "S2") || (shiftId === "S3" && ampm === "PM")) {
        Cdate = moment().format('YYYY-MM-DD')
    }
    else if (shiftId === "S3" && ampm === "AM") {
        Cdate = moment().subtract(1, 'days').format('YYYY-MM-DD')
    }

    var getShift = store.get("shift_" + MachineCode);
    var getVarientCode = store.get("varientCode_" + MachineCode);
    timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss.SSS')

    if (getShift !== shiftId || getVarientCode !== varientCode) {
        batchCode = "B" + timeStamp;
        store.set("batchcode_" + MachineCode, batchCode)
    }
    else if (getShift == shiftId || getVarientCode == varientCode) {
        var batchCode = store.get("batchcode_" + MachineCode)
    }
    
    store.set("shift_" + MachineCode, shiftId);
    store.set("varientCode_" + MachineCode, varientCode);

    if (data?.error_active == true) {
        alarmState = "ALM";
    } else {
        alarmState = " ";
    }

    if (lossActive == true) {
        lossState = "LOS";
    }
    else if (lossActive == false) {
        lossState = " ";
    }

    ctrl.insert(Con, data, timeStamp, Cdate, shiftId, MachineCode, machineStatus, alarmState, lossState, batchCode)
}


