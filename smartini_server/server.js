const express = require('express');
const socketio = require('socket.io'); //added
const exphbs  = require('express-handlebars');
const mongoose = require('mongoose')

const app = express();

const basicAuth = require('express-basic-auth')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const path = require('path');
const http = require('http');    //added
const PORT = process.env.PORT || 3003;
const axios = require('axios');
const server = http.createServer(app); //added
const io = socketio(server); //added

const users = [];
let hostUsername;

//run when client connects //added
io.on('connection', socket => {
    
    socket.on('joinRoom', ({ username, room }) => {

        if (users.length === 0) {
            hostUsername = username;
        }

        const user = userJoin(socket.id, username, room);
    
       socket.join(user.room);

        // Welcome current user
        socket.emit('message', { username : 'Trivia Bot', text: 'Welcome to Trivia!' });

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
      });

    // socket.emit('message', "Welcome to Trivia!");
        //user connects
    socket.broadcast.emit('message', { username : 'Trivia Bot', text : 'A user has joined the game'});

        //Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });

    //listen for chatmessage
    socket.on('chatMessage', msg => {

        const user = getCurrentUser(socket.id);
        const isHostMessage = user.username === hostUsername;
        console.log(msg);
        io.to(user.room).emit('message', { username : user.username, text : msg, hostUsername : hostUsername, isHostMessage : isHostMessage });
    });
});



const smartiniController = require('./controllers/smartini.js');
const userController = require('./controllers/users.js');
const { Socket } = require('dgram');


// Error / Disconnection
mongoose.connection.on('error', err => console.log(err.message + ' is Mongod not running?'))
mongoose.connection.on('disconnected', () => console.log('mongo disconnected'))
mongoose.connect('mongodb://localhost:27017/smartini', { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connection.once('open', ()=>{
    console.log('connected to mongoose...')
})

 
app.engine('handlebars', exphbs({
    helpers: require('./public/config/helpers')
}));
app.set('view engine', 'handlebars');
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
//Set static folder
app.use(express.static(path.join(__dirname, '/public')));

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

// Join user to chat
function userJoin(id, username, room) {
  const user = { id, username, room };

  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

server.listen(PORT, () =>{  //change from app to server
    console.log("Listening on port: ", PORT)
})