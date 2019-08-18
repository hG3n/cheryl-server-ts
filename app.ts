import express, {Application} from 'express';
import config from 'config';
import * as http from "http";
import * as bodyParser from "body-parser";
import * as WebSocket from "ws";
import morgan = require("morgan");

import * as SocketController from "./socket/SocketController";
import * as InfoController from "./info/InfoController";
import * as VolumeController from './volume/VolumeController';
import * as EqualizerController from './equalizer/EqualizerController';


// create app
const app: Application = express();
let port = process.env.PORT || config.get('server.port');

// create server and socket
export const server = http.createServer(app);
const wss = new WebSocket.Server({server, path: '/socket'});

// app setting
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


wss.on('connection', ws => {
    ws.on('message', message => {
        console.log(`Received message => ${message}`)
    });

    ws.on('open', () => {
        console.log('opened');
    });

    ws.on('close', (code, reason: string) => {
        console.log(`Closed with code: ${code}: \n ${reason}`);
    });

    ws.on('error', (error: Error) => {
        console.log(`Error: ${error.message}`);
    });
});

