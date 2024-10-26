var dbhero = require('../model_db')
const datalogger = require('../datalogger')

exports.lossStarttime = async function (loss, start) {
  try {
    var lossDB;
    const data = await dbhero.query(`select LossText from hero.dbo.loss_time where LossText='${loss}'`)
    if (data) {
      data[0]?.forEach(data => {
        lossDB = data?.LossText;
      })
      if (!lossDB) {
        let sql = `insert into hero.dbo.loss_time(lossText,StartTime,status)values('${loss}','${start}','true')`;
        dbhero.query(sql, (err, result) => {
          if (err) {
            datalogger.dataLog("Loss", "lossStarttime", "stn", "loss starttime stored", err);
          }
        });
      }
    }
  } catch (error) {
    datalogger.dataLog("Loss", "lossStarttime", "stn", "loss starttime stored", error);
  }
}

exports.deleteloss = async function (eliminate) {
  try {
    let eliminateElement = `delete from hero.dbo.loss_time where LossText='${eliminate}'`;
    dbhero.query(eliminateElement, (err, result) => {
      if (err) {
        datalogger.dataLog("Loss", "deleteloss", "stn", "loss starttime stored", err);
      }
    })
  } catch (error) {
    datalogger.dataLog("Loss", "deleteloss", "stn", "loss starttime stored", error);
  }
}
//Line_Code,Machine_Code,Shift_ID,Loss_ID,Start_Time,End_Time,Time_Stamp,CompanyCode,PlantCode,Date,Reason,Remarks,Actual_Data