/**
 * 官方文档
 * https://docs.colyseus.io/zh_cn/colyseus/server/api/
 */

import { GameRoom } from './room/GameRoom';
import { Server } from 'colyseus';
import http from 'http';
import express from 'express';
const port = Number(process.env.port) || 2567;

const app = express();
app.use(express.json());

// init game server
const gameServer = new Server({
    server: http.createServer(app)
});

// Define 'game' room
gameServer.define('room_name', GameRoom);

// listen server port
gameServer.listen(port);
console.log('server is on port===>' + port);