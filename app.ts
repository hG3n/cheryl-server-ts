import express, {Application} from 'express';
import config from 'config';
import socketio from "socket.io";
import {Server} from 'http';
import * as bodyParser from "body-parser";

import * as SocketController from "./socket/SocketController";
import * as InfoController from "./info/InfoController";
import * as VolumeController from './volume/VolumeController';
import * as EqualizerController from './equalizer/EqualizerController';
import morgan = require("morgan");


// create app
const app: Application = express();
let port = process.env.PORT || config.get('server.port');
app.set("port", port);

// create server and socket
export const http_server = new Server(app);
const io = socketio(http_server);
//     , {
//     path: '/socket',
//     serveClient: false,
//     pingInterval: 10000,
//     pingTimeout: 5000,
//     cookie: false
// });

// const express_ws = expressWs(express());
// export const app = express_ws.app;
// const io = socketio();

// app settings
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//info
app.use('/info', InfoController.info);

// volume
app.get('/volume', VolumeController.volume);
app.post('/volume/discrete/:volume', VolumeController.discrete);
app.post('/volume/raise', VolumeController.raise);
app.post('/volume/lower', VolumeController.lower);
app.post('/volume/mute', VolumeController.mute);

// equalizer
app.get('/equalizer', EqualizerController.equalizers);
app.post('/equalizer/:position/:value', EqualizerController.value);

// sockets
// app.ws("/shit", SocketController.volume);

// whenever a user connects on port 3000 via
// a websocket, log that a user has connected
io.on("connection", function (socket: any) {
    console.log("a user connected");
    // whenever we receive a 'message' we log it out
    socket.on("message", function (message: any) {
        console.log(message);
    });
});
