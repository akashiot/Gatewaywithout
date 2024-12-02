var db = require('../model_db')
const datalogger = require('../datalogger')
const stn_setting = require('../configuration/stn1_settings.json')

exports.onchangeLogging = async function (machinecode, shiftId, variantCode, Ok_value, NOk_value, reason, datetime, date) {
  try {

    let sqlhero = `insert into hero_kpi.dbo.CycleTime(Line_Code,Machine_Code,Shift_Id,Variant_Code,Companycode,Plantcode,OperatorID,OK_Parts,NOK_Parts,Rework_Parts,Reject_Reason,Time_Stamp)values('${stn_setting.line_code}','${machinecode}','${shiftId}','V${variantCode}','${stn_setting.company_code}','${stn_setting.plant_code}','${stn_setting.operator_ID}','${Ok_value}','${NOk_value}','${stn_setting.rework_parts}','${reason}','${datetime}')`;
    db.query(sqlhero, (err, result) => {
      if (err) {
        datalogger.dataLog("CycleTime", "onchangeLogging HeroDB", machinecode, "insert query", err);
      }
    });
    console.log(`Data inserted successfully into CycleTime for MachineCode : ${machinecode}`);

  } catch (error) {
    datalogger.dataLog("CycleTime", "onchangeLogging", machinecode, "insert query", err);
  }
}