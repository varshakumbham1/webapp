const fs = require('fs');
const csv = require('csv-parser');
const { User } = require('../database/index');

const results = [];
const csv_file_path = '/opt/users.csv'

async function insert_rows_into_table() {
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
            console.log('User created:', row.first_name);
          }
          else {
            console.log('User already exists');
          }
        } catch (error) {
          console.error('Error creating user:',error);
        }
      });
    });
  }
module.exports = insert_rows_into_table