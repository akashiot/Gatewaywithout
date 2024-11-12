// Import required modules
var db = require('../model_db');                   // Database connection module
const stn_setting = require('../configuration/stn1_settings.json'); // Station settings from JSON config file
const datalogger = require('../datalogger');           // Data logging module

// Insert function to add a record into the RAWTable
exports.insert = async function (Con, data, timeStamp, Cdate, shiftId, MachineCode, machineStatus, alarmState, lossState, batchCode) {
  try {
    // Proceed with insert only if the connection parameter Con is true
    if (Con == true) {
      // Construct the SQL insert query for RAWTable with provided parameters
      let sqlhero = `INSERT INTO hero_kpi.dbo.RAWTable (time_stamp, date, Shift_Id, Line_code, Machine_code, Variant_code, machine_status, OK_parts, NOK_parts, Rework_parts, Rejection_Reasons, Auto__Mode_Selected, Manual_Mode_Slected, Auto_Mode_Running, CompanyCode, PlantCode, OperatorID, Live_Alarm, Live_Loss, Batch_code) 
      VALUES ('${timeStamp}', '${Cdate}', '${shiftId}', '${stn_setting.line_code}', '${MachineCode}', 'V${data.variantNumber}', '${machineStatus}', '${data.OK_parts}', '${data.NOT_parts}', '0', '${stn_setting.rejection_reason}', '${+data.automode_selected}', '${+data.manualmode_selected}', '${+data.automode_running}', '${stn_setting.company_code}', '${stn_setting.plant_code}', '${stn_setting.operator_ID}', '${alarmState}', '${lossState}', '${batchCode}')`;

      // Execute the SQL query
      db.query(sqlhero, (err, result) => {
        if (err) {
          // Log error if query execution fails
          datalogger.dataLog("RawTable", "insert", MachineCode, "insert query", err);
        }
      });
      console.log(`Data inserted successfully into RAWTable for MachineCode : ${MachineCode}`);
    }
  } catch (error) {
    // Log error if any exception is caught during function execution
    datalogger.dataLog("RawTable", "not insert", MachineCode, "insert query", error);
  }
};
