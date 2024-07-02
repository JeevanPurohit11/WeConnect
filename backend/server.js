require('dotenv').config();  // Use credentials from .env file
const express = require('express');
const app = express();
const DbConnect = require('./database');
const cors = require('cors');
const cookieParser=require('cookie-parser');
// Connect to the database
DbConnect();

const server= require('http').createServer(app);  //created node server and pass express 
const io=require('socket.io')(server,{
    cors : {
        origin : 'http;//localhost:3000',
        methods : ['GET','POST'],
    },
});

app.use(cookieParser());
// Define CORS options
const corsOptions = {
    credentials: true,                 // for getting cookie/tokens easily
    origin: 'http://localhost:3000',  // Allow requests from the frontend
};
// Use CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));  // Handle preflight requests(chatgpt)

app.use(express.json({limit : '8mb'}));  // Enable JSON middleware // limit for max size length of avatar/image

// Import and use router
const router = require('./routes');
const ACTIONS = require('../frontend/src/actions');
const { ADD_PEER } = require('./actions');
app.use(router);  // Prefix the routes with /api



// Basic route for testing
app.get('/', (req, res) => {
    res.send('Hello from express Js');
});

//mapping for which socket.id is connected with which user.id
const socketUserMapping={

} 
io.on('connection',(socket)=>{
    console.log('new Connection',socket.id);
    
    socket.on(ACTIONS.JOIN,({roomId,user})=>{
         socketUserMapping[socket.id]=user;

          //new MAP
        const clients=Array.from(io.sockets.adapter.rooms.get(roomId) || []); //[] array from first this there will be no user
        clients.forEach((clientId)=>{
             io.to(clientId).emit(ACTIONS.ADD_PEER,{
                peerId : socket.id,
                createOffer:false,
                user,
             });

        });

        socket.emit(ACTIONS.ADD_PEER,{
            peerId : clientId,
            createOffer:true,
            user : socketUserMapping[cliendId],


        });
        socket.join(roomId);

        console.log(clients);
    });
    //handle relay-ice
    socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
            peerId: socket.id,
            icecandidate,
        });
    });
    //handle relay-sdp(session description)
    socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
        io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerId: socket.id,
            sessionDescription,
        });
    });
   

})

const PORT = process.env.PORT || 5500;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
//app replace by server
