const app = require('./app');
require('dotenv').config()
const connectWithDb = require('./config/db');


//connect with database
connectWithDb()


app.listen(process.env.PORT, () => {
    console.log(`Server is running at port: ${process.env.PORT}...`);
})