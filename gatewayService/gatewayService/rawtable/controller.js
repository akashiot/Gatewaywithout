var dbhero = require('../model_db')
const stn_setting = require('../configuration/stn1_settings.json')
const datalogger = require('../datalogger')
exports.insert = async function (Con, data, timeStamp, Cdate, shiftId, MachineCode, machineStatus, alarmState, lossState, batchCode) {
  try {
    if (Con == true) {
      let sqlhero = `insert into hero.dbo.RAWTable(time_stamp,date,Shift_Id,Line_code,Machine_code,Variant_code,machine_status,OK_parts,NOK_parts,Rework_parts, Rejection_Reasons,Auto__Mode_Selected,Manual_Mode_Slected,Auto_Mode_Running,CompanyCode,PlantCode,OperatorID,Live_Alarm,Live_Loss,Batch_code)values('${timeStamp}','${Cdate}','${shiftId}','${stn_setting.line_code}','${MachineCode}','V1','${machineStatus}','${data.OK_parts}','${data.NOT_parts}','0','${stn_setting.rejection_reason}','${+data.automode_selected}','${+data.manualmode_selected}','${+data.automode_running}','${stn_setting.company_code}','${stn_setting.plant_code}','${stn_setting.operator_ID}','${alarmState}','${lossState}','${batchCode}')`;
      dbhero.query(sqlhero, (err, result) => {
        if (err) {
          datalogger.dataLog("RawTable", "insert", MachineCode, "insert query", err);
        }
      });
    }
  } catch (error) {
    datalogger.dataLog("RawTable", "insert", MachineCode, "insert query", error);
  }
}