import { Client } from 'colyseus';
import { Schema, MapSchema, type } from '@colyseus/schema'
import { Player } from './Player';

export class State extends Schema {
    // MapSchema是colyseus的对象实体模板
    @type({map: Player})
    players = new MapSchema<Player>();

    /**
     * 添加新用户的方法
     *
     * @param {Client} client
     * @memberof PlayerState
     */
    addPlayer(client: Client)
    {
        let player = new Player(0, 0);
        this.players.set(client.sessionId, player);
    }

    /**
     * 删除一个用户的方法
     *
     * @param {Client} client
     * @memberof PlayerState
     */
    removePlayer(client: Client)
    {
        this.players.delete(client.sessionId);
    }
}