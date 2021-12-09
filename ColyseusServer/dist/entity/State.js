"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
const schema_1 = require("@colyseus/schema");
const Player_1 = require("./Player");
class State extends schema_1.Schema {
    constructor() {
        super(...arguments);
        // MapSchema是colyseus的对象实体模板
        this.players = new schema_1.MapSchema();
    }
    /**
     * 添加新用户的方法
     *
     * @param {Client} client
     * @memberof PlayerState
     */
    addPlayer(client) {
        let player = new Player_1.Player(0, 0);
        this.players.set(client.sessionId, player);
    }
    /**
     * 删除一个用户的方法
     *
     * @param {Client} client
     * @memberof PlayerState
     */
    removePlayer(client) {
        this.players.delete(client.sessionId);
    }
}
__decorate([
    (0, schema_1.type)({ map: Player_1.Player })
], State.prototype, "players", void 0);
exports.State = State;
