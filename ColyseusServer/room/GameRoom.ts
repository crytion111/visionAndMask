import { Room, Client } from 'colyseus';
import { State } from '../entity/State';
import {Player} from "../entity/Player";

export class GameRoom extends Room<State> {
    // max clients
    maxClients: number = 2;

    AllClients: Map<string, Client> = new Map;

    // Colyseus will invoke when creating the room instance
    onCreate(options: any)
    {
        // initialize empty room state
        this.setState(new State());
        // set patch rate
        this.setPatchRate(50);

    }

    // Called every time a client joins
    onJoin(client: Client, options?: any, auth?: any)
    {
        this.state.addPlayer(client);

        this.AllClients.set(client.sessionId, client);


        this.onMessage("*", (client, message) =>
        {

            let msg = {msg: message, playerID: client.sessionId}

            this.AllClients.forEach((client) =>
            {
                client.send("*", JSON.stringify(msg))
            })
        });

        // 人满了才开局
        if (this.state.players.size == this.maxClients)
        {
            this.listenPlayerMsg();


            let msg = {mainID: client.sessionId}
            this.AllClients.forEach((client) =>
            {
                client.send("GameStart", JSON.stringify(msg))
            })
        }
    }

    // Called every time a client leaves
    onLeave(client: Client, consented?: boolean)
    {
        this.state.removePlayer(client);

        this.AllClients.delete(client.sessionId);
    }

    listenPlayerMsg()
    {

        this.onMessage("move", (client, message) =>
        {
            // console.log(client.sessionId, "sent", message);
            let msg = {msg: message, playerID: client.sessionId}

            // let player = this.getPlayerByID(client.sessionId);

            this.AllClients.forEach((client) =>
            {
                client.send("move", JSON.stringify(msg))
            })
        });

    }


    getPlayerByID(sessionId: string): Player | null
    {
        return <Player>this.state.players.get(sessionId);
    }

}