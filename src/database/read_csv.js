const fs = require('fs');
const csv = require('csv-parser');
const { User } = require('../database/index');
require('dotenv').config();
const logger = require("../logging/applog")
const results = [];
const csv_file_path = process.env.CSV_FILE

async function insert_rows_into_table() {
  try {
    fs.createReadStream(csv_file_path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        results.forEach(async (row) => {
          try {
            const userExists = await User.findOne({ where: { email: row.email } });
            if(!userExists){
              await User.create({
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email,
                password: row.password
              });
              logger.info(`${row.first_name} User created successfully`);
            }
            else {
              logger.info(`${row.first_name} already exists`);
            }
          } catch (error) {
            logger.error(`Error occurred ${error}`);
          }
        });
      });
    }
  catch (error) {
    logger.error(`Error occurred ${error}`);
  }
}
module.exports = insert_rows_into_table