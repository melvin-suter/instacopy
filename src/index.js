"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express = __importStar(require("express"));
const http = __importStar(require("http"));
const socketio = __importStar(require("socket.io"));
dotenv_1.default.config();
const port = process.env.PORT ? process.env.PORT : 8001;
const app = express.default();
/***********************
 *     Static Files
 ***********************/
const sharedFiles = [
    'css/bootstrap.min.css',
    'js/bootstrap.min.js',
    'js/app.js',
    'js/socket.io.min.js'
];
sharedFiles.forEach((item) => {
    app.get('/' + item, (req, res) => {
        res.sendFile(__dirname + '/frontend/' + item);
    });
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/frontend/index.html');
});
/***********************
 *     Initialize
 ***********************/
let users = new Map();
const server = http.createServer(app);
const io = new socketio.Server(server, {
    maxHttpBufferSize: 2 * 1e9 // 2GB
});
/***********************
 *     Socket Events
 ***********************/
io.on('connection', (socket) => {
    if (!socket.handshake.query.roomID) {
        socket.disconnect();
    }
    const roomID = "room-" + (socket.handshake.query.roomID ? socket.handshake.query.roomID : 'no one');
    socket.join(roomID);
    io.to(roomID).except(socket.id).emit('alert', { message: 'Client connected' });
    socket.on('update', (data) => {
        io.to(roomID).emit('update', { content: data.content });
    });
    socket.on("upload", (file, callback) => {
        io.to(roomID).except(socket.id).emit('download', file);
    });
});
server.listen(port, () => {
    console.log(`Running at localhost:${port}`);
});
