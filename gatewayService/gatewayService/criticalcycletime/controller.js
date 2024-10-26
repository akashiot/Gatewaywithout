var db = require('../model_db')
var dbhero = require('../model_db')
const datalogger = require('../datalogger')
const stn_setting = require('../configuration/stn1_settings.json');

exports.dataInserting = async (date, machineCode, variantCode, operations, operationTime, actualCycleTime, okParts, nokParts, totalParts, shiftId, timeStamp) => {
  try {
    // let sql = `insert into critical_cycletime(Date,MachineCode,VariantCode,Operations,Operation_time,Actual_cycletime,OKParts,NOKParts,TotalParts,Type,Shift,CompanyCode,PlantCode,LineCode,Time_Stamp,status)values('${date}','M${machineCode}','V${variantCode}','${operations}','${operationTime}','${actualCycleTime}','${okParts}','${nokParts}','${totalParts}','${stn_setting.type}','S${shiftId}','${stn_setting.company_code}','${stn_setting.plant_code}','${stn_setting.line_code}','${timeStamp}','true')`;
    // db.query(sql, (err, result) => {
    //   if (err) {
    //     datalogger.dataLog("Critical CT", "dataInserting", "M" + machineCode, "insert query", err);
    //   }
    // });

    let sqlhero = `insert into hero.dbo.RAw_Cycletime(Date,MachineCode,VariantCode,Operations,Operation_time,Actual_cycletime,OKParts,NOKParts,TotalParts,Type,Shift,CompanyCode,PlantCode,LineCode,Time_Stamp)values('${date}','M${machineCode}','V1','${operations}','${operationTime/100}','${actualCycleTime/100}','${okParts}','${nokParts}','${totalParts}','${stn_setting.type}','S${shiftId}','${stn_setting.company_code}','${stn_setting.plant_code}','${stn_setting.line_code}','${timeStamp}')`;
      dbhero.query(sqlhero, (err, result) => {
      if (err) {
        datalogger.dataLog("Critical CT", "dataInserting Hero", "M" + machineCode, "insert query", err);
      }
    });

  } catch (error) {
    datalogger.dataLog("Critical CT", "not dataInserting", "M" + machineCode, "insert query", ernodoror);
  }
}
