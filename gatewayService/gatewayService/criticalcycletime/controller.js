var maindb = require('../model_db')
const datalogger = require('../datalogger')
const stn_setting = require('../configuration/stn1_settings.json');

exports.dataInserting = async (date, machineCode, variantCode, operations, operationTime, actualCycleTime, okParts, nokParts, totalParts, shiftId, timeStamp) => {
  try {
    let sqlhero = `insert into hero.dbo.RAw_Cycletime(Date,MachineCode,VariantCode,Operations,Operation_time,Actual_cycletime,OKParts,NOKParts,TotalParts,Type,Shift,CompanyCode,PlantCode,LineCode,Time_Stamp)
      values('${date}','M${machineCode}','V${variantCode}','${operations}','${operationTime / 100}','${actualCycleTime / 100}','${okParts}','${nokParts}','${totalParts}','${stn_setting.type}','S${shiftId}','${stn_setting.company_code}','${stn_setting.plant_code}','${stn_setting.line_code}','${timeStamp}')`;

    // Execute query
    maindb.query(sqlhero, (err, result) => {
      if (err) {
        // Log error if the query fails
        datalogger.dataLog("Critical CT", "dataInserting", "M" + machineCode, "insert query", err);
      }
    });

  } catch (error) {
    // Log unexpected errors during query building or execution
    datalogger.dataLog("Critical CT", "not dataInserting", "M" + machineCode, "insert query", error);
  }
}