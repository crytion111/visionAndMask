"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoom = void 0;
const colyseus_1 = require("colyseus");
const State_1 = require("../entity/State");
class GameRoom extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        // max clients
        this.maxClients = 2;
        this.AllClients = new Map;
    }
    // Colyseus will invoke when creating the room instance
    onCreate(options) {
        // initialize empty room state
        this.setState(new State_1.State());
        // set patch rate
        this.setPatchRate(50);
    }
    // Called every time a client joins
    onJoin(client, options, auth) {
        this.state.addPlayer(client);
        this.AllClients.set(client.sessionId, client);
        this.onMessage("*", (client, message) => {
            let msg = { msg: message, playerID: client.sessionId };
            this.AllClients.forEach((client) => {
                client.send("*", JSON.stringify(msg));
            });
        });
        // 人满了才开局
        if (this.state.players.size == this.maxClients) {
            this.listenPlayerMsg();
            let msg = { mainID: client.sessionId };
            this.AllClients.forEach((client) => {
                client.send("GameStart", JSON.stringify(msg));
            });
        }
    }
    // Called every time a client leaves
    onLeave(client, consented) {
        this.state.removePlayer(client);
        this.AllClients.delete(client.sessionId);
    }
    listenPlayerMsg() {
        this.onMessage("move", (client, message) => {
            // console.log(client.sessionId, "sent", message);
            let msg = { msg: message, playerID: client.sessionId };
            // let player = this.getPlayerByID(client.sessionId);
            this.AllClients.forEach((client) => {
                client.send("move", JSON.stringify(msg));
            });
        });
    }
    getPlayerByID(sessionId) {
        return this.state.players.get(sessionId);
    }
}
exports.GameRoom = GameRoom;
