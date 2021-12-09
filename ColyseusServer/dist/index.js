"use strict";
/**
 * 官方文档
 * https://docs.colyseus.io/zh_cn/colyseus/server/api/
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GameRoom_1 = require("./room/GameRoom");
const colyseus_1 = require("colyseus");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const port = Number(process.env.port) || 2567;
const app = (0, express_1.default)();
app.use(express_1.default.json());
// init game server
const gameServer = new colyseus_1.Server({
    server: http_1.default.createServer(app)
});
// Define 'game' room
gameServer.define('room_name', GameRoom_1.GameRoom);
// listen server port
gameServer.listen(port);
console.log('server is on port===>' + port);
