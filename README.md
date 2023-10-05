webapp
Prerequisites softwares and libraries
MySQL DB
NodeJS (Version 20)
Sequelize (3rd party package for ORM in Node)
bcryptjs
express
mocha
sequelize
supertest
Steps to deploy it locally.
clone fork repo: git clone git@github.com:varshakumbham1/webapp.git

run npm install to install packages

Once node_modules is installed. create a .env file and add db details and port details.

DB_HOSTNAME = localhost
DB_PASSWORD = Geethareddy@1989
DB_USER = root
DB_NAME = Cloud_db
DB_DIALECT = mysql
APP_PORT = 3000

To run the application
run npm start

Application Testing
run npm test : this runs test on healthz.test.js