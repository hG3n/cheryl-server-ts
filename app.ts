import express, {Application} from 'express';
import config from 'config';
import * as http from "http";
import * as bodyParser from "body-parser";
import * as WebSocket from "ws";
import morgan = require("morgan");

import * as InfoController from "./info/InfoController";
import * as VolumeController from './volume/VolumeController';
import * as EqualizerController from './equalizer/EqualizerController';
import * as SocketController from './socket/SocketController';
import * as SystemController from './system/SystemController';
import * as SpotiyController from './spotify/SpotifyController';
import {Message} from "./socket/Message";


// create app
const app: Application = express();
let port = process.env.PORT || config.get('server.port');

// create server and socket
const server: http.Server = http.createServer(app);
const wss: WebSocket.Server = new WebSocket.Server({server, path: '/socket'});

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
app.put('/volume/mute', VolumeController.mute);

// equalizer
app.get('/equalizer', EqualizerController.equalizers);
app.post('/equalizer/:position/:value', EqualizerController.value);

// system
app.put('/system/restart', SystemController.restart);
app.get('/system/status', SystemController.status);

// spotify
app.get('/spotify/uri_info', SpotiyController.uri_info);

// sockets
wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message_str: string) => {
        const message: Message = JSON.parse(message_str) as Message;

        if (message.context === 'volume') {
            if (message.method === 'set') {
                SocketController.discreteVolume(message).then((success) => {
                    const result = JSON.stringify(success);
                    const msg: Message = {
                        method: 'res',
                        context: 'volume',
                        data: result
                    };
                    ws.send(msg);
                });
            }
        } else if (message.context === 'equalizer') {
            if (message.method === 'set') {
                SocketController.equalizerLevel(message).then((success) => {
                    const result = JSON.stringify(success);
                    const msg: Message = {
                        method: 'res',
                        context: 'equalizer',
                        data: result
                    };
                    ws.send(msg);
                })
            }
        }
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

export {server};
