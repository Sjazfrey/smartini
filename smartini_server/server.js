const express = require('express')
const mongoose = require('mongoose')
const app = express();
const basicAuth = require('express-basic-auth')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const PORT = process.env.PORT || 3003;

const smartiniController = require('./controllers/smartini.js');
const userController = require('./controllers/users.js');


// Error / Disconnection
mongoose.connection.on('error', err => console.log(err.message + ' is Mongod not running?'))
mongoose.connection.on('disconnected', () => console.log('mongo disconnected'))
mongoose.connect('mongodb://localhost:27017/smartini', { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connection.once('open', ()=>{
    console.log('connected to mongoose...')
})


app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

const whitelist = ['*']
const corsOptions = {
    origin: function(origin, callback){
        if(whitelist.indexOf(origin) !== -1){
            callback(null, true)
        }else{
            callback(new Error('Not allowed by CORS'))
        }
    }
}

app.use(cors())


app.use('/smartini', smartiniController)
app.use('/users', userController);

app.listen(PORT, () =>{
    console.log("Listening on port: ", PORT)
})