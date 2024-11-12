const { type } = require("os");
const { Sequelize } = require("sequelize");

// Define the database connection with correct details
const db = new Sequelize("hero_kpi", "sa", "admin@123", {
  host: 'TCLHSRPEDLT0901',
  port: 1433,
  connectionTimeout: 15000,
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: false,
    },
  },
  timezone: "5:30",
  logging: false,
});

// Export the dbhero instance for use in other modules
module.exports = db;












// const db = new Sequelize("GATEWAYDB", "BPATEAL", "TEAL@2024!", {
//   host: '10.79.3.34',
//   port: 3534,
//   connectionTimeout: 15000,
//   dialect: 'mssql',
//   dialectOptions: {
//     options: {

//       //trustedConnection: true,
//       //trustServerCertificate: true,
//       encrypt: false,
//     },
//     //HE6EDEVSQL03P
//   },
//   timezone: "5:30",
//   logging: false,
// });


// exports.dbhero = new Sequelize("*", "BPATEAL", "TEAL@2024!", {
//   host: '10.79.3.34',
//   port: 3534,
//   connectionTimeout: 15000,

//   dialect: 'mssql',
//   dialectOptions: {
//     options: {
//       //trustedConnection: true,
//       //trustServerCertificate: true,
//       encrypt: false,
//     },
//   },
//   timezone: "5:30",
//   logging: false,
// });
// module.exports = db;