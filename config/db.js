const mongoose = require('mongoose')


const connectWithDb = () => {
    mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(console.log(`DB Got Connected`))
        .catch(error => {
            console.log(`DB CONNECTION ISSUES`)
            console.log(error)
            process.exit(1)
        })
}

module.exports = connectWithDb