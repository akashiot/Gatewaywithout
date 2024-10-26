const store = require('store2');
var dbhero = require('../model_db')
var moment = require('moment')
const datalogger = require('../datalogger')
var lossCtrl = require('./controller')
const stn_setting = require('../configuration/stn1_settings.json')

exports.changedLoss = async function (getVal, stn) {
    var lossTags = [];
    var Machinecode = stn_setting.machine_code[stn]
    var autoModeSelected = getVal?.automode_selected;
    var autoModeRunning = getVal?.automode_running;
    var manualModeSelected = getVal?.manualmode_selected;
    var errorActive = getVal?.error_active;

    for (var i = 1; i <= 12; i++) {
        lossTags.push(getVal["loss_L" + i]);
    }
    var lossArray = JSON.stringify(lossTags);
    var tempAutomodeSelected = store.get("AutoModeSelect" + stn);
    var tempAutoModeRunning = store.get("AutoModeRun" + stn);
    var tempManualmodeSelected = store.get("ManualMode" + stn);
    var tempErrorActive = store.get("errorActive" + stn);
    var templossTags = store.get("lossTag" + stn);

    if (tempAutomodeSelected !== autoModeSelected || tempAutoModeRunning !== autoModeRunning || tempManualmodeSelected !== manualModeSelected || tempErrorActive !== errorActive || templossTags !== lossArray) {
        Loss(getVal, Machinecode)
    }
    store.set("AutoModeSelect" + stn, autoModeSelected);
    store.set("AutoModeRun" + stn, autoModeRunning);
    store.set("ManualMode" + stn, manualModeSelected);
    store.set("errorActive" + stn, errorActive);
    store.set("lossTag" + stn, lossArray);
}

function Loss(val, Machinecode) {
    var lossText;
    var startTime = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');

    var loss = [];
    for (var i = 1; i <= 12; i++) {
        loss.push(+val["loss_L" + i]);
    }
    var tempLoss = store.get("loss" + Machinecode);

    if (JSON.stringify(loss) !== JSON.stringify(tempLoss)) {
        loss.forEach((element, index) => {
            if (element == 1) {
                lossText = "Stn" + Machinecode + "_Los_L" + (index + 3);
                startTime = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
                putData(lossText, startTime);
            }
            else if (element == 0) {
                var downLoss = "Stn" + Machinecode + "_Los_L" + (index + 3);

                apiCall(val, downLoss, Machinecode)
            }
        })
    }
    store.set("loss" + Machinecode, loss);
}

function putData(loss, start) {
    lossCtrl.lossStarttime(loss, start)
}

async function apiCall(plcval, lossVal, Machinecode) {

    let sqlhero = `select * from hero.dbo.loss_time`;
    const result = await dbhero.query(sqlhero)
    // , (err, result) => {

    // if (err) {
    //     datalogger.dataLog("Loss", "apiCall", "M" + stn, "update query", err);
    //     // datalogger.dataLog("Loss", err);
    // }
    if (result) {
        result[0]?.forEach(element => {
            if (element.LossText == lossVal) {
                TokenGeneration(plcval, element?.LossText, element?.StartTime, Machinecode);
                deleteLoss(element?.LossText);
            }
        })
    }
    // });
}

function deleteLoss(eliminate) {
    lossCtrl.deleteloss(eliminate)
}

async function TokenGeneration(plcval, loss, startTime, Machinecode) {
    exportData(plcval, loss, startTime, Machinecode)
}

async function exportData(plcVal, loss, startTime, Machinecode) {
    //var date = moment().format('YYYY-MM-DD');;
    endTime = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
    timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
    var shiftNo = "S" + plcVal?.shift;

    var hours = new Date().getHours();
    var ampm = (hours >= 12) ? "PM" : "AM";
    if ((shiftNo === "S1" || shiftNo === "S2") || (shiftNo === "S3" && ampm === "PM")) {
        date = moment().format('YYYY-MM-DD')
    }
    else if (shiftNo === "S3" && ampm === "AM") {
        date = moment().subtract(1, 'days').format('YYYY-MM-DD')
    }


    // var hours = new Date().getHours();
    // var ampm = (hours >= 12) ? "PM" : "AM";

    // if ((shiftNo == "S1" || "S2") || (shiftId == "S3" && ampm == "PM")) {
    //     date = moment().format('YYYY-MM-DD');
    // }
    // else if (shiftId == "S3" && ampm == "AM") {
    //     date = moment().format('YYYY-MM-DD').subtract(1, 'd');
    // }
    try {
        let sqlhero = `insert into hero.dbo.machineloss(Line_Code,Machine_Code,Shift_ID,Loss_ID,Start_Time,End_Time,Time_Stamp,CompanyCode,PlantCode,Date,Reason,Remarks,Actual_Data)values('${stn_setting.line_code}','M${Machinecode}','${shiftNo}','${loss}','${startTime}','${endTime}','${timeStamp}','${stn_setting.company_code}','${stn_setting.plant_code}','${date}','','','')`;
        dbhero.query(sqlhero, (err, result) => {
            if (err) {
                datalogger.dataLog("Loss", "Inserting", MachineCode, "offline data stored", err);
            }
        });
        console.log('>>>>machineloss  Inserted>>>>')
    } catch (error) {
        datalogger.dataLog("Loss", "Inserting", MachineCode, "data stored", error);
    }
}
