const moment = require('moment');
const store = require("store2");
const Crictrl = require('./controller');
const stn_setting = require('../configuration/stn1_settings.json');
var totalIndex = stn_setting.total_index;

exports.checkOperation = async function (values, stn) {
    var tempOperationBitTag = store.get("operationBitTag" + stn) || [false, false, false];
    var tempoperationbit = store.get("tempoperationbit" + stn);
    var operationBitTag = [];
    for (var i = 1; i <= totalIndex; i++) {
        operationBitTag.push(values["element_" + i]);
    }
    var totaloperationbit = values?.operation_time;

    if (
        (tempOperationBitTag !== null &&
            (tempOperationBitTag.map((state, idx) => state != operationBitTag[idx] && operationBitTag[idx]).indexOf(true) !== -1) &&
            plcCommunication == true) ||
        (tempoperationbit !== null &&
            tempoperationbit !== totaloperationbit && totaloperationbit == true)
    ) {
        criticalCycletime(values, stn)
    }
    store.set("operationBitTag" + stn, operationBitTag)
    store.set("tempoperationbit" + stn, totaloperationbit)
}

function criticalCycletime(Val, stn) {
    var m_code = stn_setting.machine_code[stn]
    var shiftId = "S" + Val?.shift;
    var hours = moment().format('HH');
    var ampm = (hours >= 12) ? "PM" : "AM";

    if ((shiftId === "S1" || shiftId === "S2") || (shiftId === "S3" && ampm === "PM")) {
        date = moment().format('YYYY-MM-DD')
    }
    else if (shiftId === "S3" && ampm === "AM") {
        date = moment().subtract(1, 'days').format('YYYY-MM-DD');
    }
    var timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
    var totalParts = Val?.Total_parts;
    var totaloperationbit = Val?.operation_time;
    var operations1;
    var operations = "Stn" + m_code;
    var tempOperationindexTag = store.get("operationindexTags" + stn) || [false, false, false];
    var indexTags = [];
    for (var i = 1; i <= totalIndex; i++) {
        indexTags.push(Val["element_" + i]);
    }
    indexTags.forEach((data, index) => {
        if (data == true) {
            operations1 = "Stn" + m_code + "_Index_" + (index + 1);
        }
    })

    var tempoperationbit = store.get('total-operationbit' + stn)
    if ((tempOperationindexTag.map((state, idx) => state != indexTags[idx] && indexTags[idx]).indexOf(true) == -1) && (totaloperationbit !== tempoperationbit && totaloperationbit == true)) {
        operations = "Stn" + m_code;
    }
    else if ((tempOperationindexTag.map((state, idx) => state != indexTags[idx] && indexTags[idx]).indexOf(true) !== -1)) {
        operations = "Stn" + m_code;
    }
    Crictrl.dataInserting(
        date,
        m_code,
        Val?.variantNumber,
        operations,
        Val?.actualCycletime,
        Val?.actualCycletime,
        Val?.OK_parts,
        Val?.NOT_parts,
        totalParts,
        Val?.shift,
        timeStamp)

    store.set("operationTags" + stn, operations1)
    store.set("operationindexTags" + stn, indexTags)
    store.set("total-operationbit" + stn, totaloperationbit)
}