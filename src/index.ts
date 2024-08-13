import dotenv from 'dotenv';
import * as express from "express";
import * as http from "http";
import * as socketio from "socket.io";
import * as crypto from 'crypto';

dotenv.config();
const port = process.env.PORT ? process.env.PORT : 8001;
const app: express.Express = express.default();

/***********************
 *     Static Files
 ***********************/

const sharedFiles = [
  'css/bootstrap.min.css',
  'js/bootstrap.min.js',
  'js/app.js',
  'js/socket.io.min.js'
]

sharedFiles.forEach((item:string) => {
  app.get('/' + item, (req:express.Request, res:express.Response) => {
    res.sendFile(__dirname + '/frontend/' + item);
  });
});

app.get('/', (req:express.Request, res:express.Response) => {
  res.sendFile(__dirname + '/frontend/index.html');
});


/***********************
 *     Initialize
 ***********************/


let users = new Map();
const server = http.createServer(app);
const io = new socketio.Server(server,{
  maxHttpBufferSize: 2*1e9 // 2GB
});


/***********************
 *     Socket Events
 ***********************/

io.on('connection', (socket) => {

  
  if(!socket.handshake.query.roomID) {
    socket.disconnect();
  }

  const roomID:string = "room-" + (socket.handshake.query.roomID ? socket.handshake.query.roomID as string : 'no one');
  
  socket.join(roomID);
  
  io.to(roomID).except(socket.id).emit('alert',{message: 'Client connected'});
  io.to(socket.id).emit('my-id',{id: socket.id});
  io.to(roomID).emit('update-clients',{clients: [...io.sockets.adapter.rooms.get(roomID)!]});

  socket.on('update', (data) => {
    io.to(roomID).emit('update',{content: data.content});
  })

  socket.on("upload", (file, callback) => {
      io.to(roomID).except(socket.id).emit('download',file);
  });

});

server.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});