import {Client, Room} from "./coly/colyseus";
import {EventName} from "./EventName";

class NetworkManager {
    private static _instance: NetworkManager

    nMaxPlayerNum:number = 2;
    bIsOnline: boolean = false;
    netClient: Client = null;
    netRoom: Room = null;

    nMyPlayerID: string = null;
    PlayersInfo: Map<string, any> = new Map;


    static getInstance(): NetworkManager
    {
        if (!NetworkManager._instance)
        {
            NetworkManager._instance = new NetworkManager()
        }
        else
        {
        }

        return NetworkManager._instance
    }


    async startConnect()
    {
        // @ts-ignore
        this.netClient = new Colyseus.Client('ws://localhost:2567');
        try
        {
            this.netRoom = await this.netClient.joinOrCreate("room_name");
            this.bIsOnline = true;
            console.log(this.netRoom.sessionId, "joined", this.netRoom.name);

            this.nMyPlayerID = this.netRoom.sessionId;
            this.listenRoomMas();
        } catch (e)
        {
            console.error("JOIN ERROR", e);
        }
    }

    listenRoomMas()
    {
        this.netRoom.onMessage(EventName.GameStart, (message) =>
        {
            let msgObj = JSON.parse(message);
            let nID = msgObj.mainID;

            cc.log("人数齐了!!!!!!!!!!!主玩家===>", nID)

            cc.game.emit(EventName.CLIENT_GAME_START, nID);
        })

        this.netRoom.onMessage(EventName.move, (message) =>
        {
            let msgObj = JSON.parse(message);
            let id = msgObj.playerID;
            let msg2 = msgObj.msg;
            let msg2Obj = JSON.parse(msg2);

            if(id != this.nMyPlayerID)
            {
                cc.game.emit(EventName.OTHER_PLAYER_MOVE, id, msg2Obj);
            }
        })

        this.netRoom.onLeave(() =>
        {
            // @ts-ignore
            console.log("LEFT ROOM", arguments);
        });

        this.netRoom.onStateChange((state) =>
        {
            this.PlayersInfo.clear();
            state.players.forEach((value, Key) =>
            {
                this.PlayersInfo.set(Key, value);
            })

            console.log("state change: ", this.PlayersInfo.keys(),  state.players.size);
        });
    }

    sendRoomMsg(msg: string)
    {
        if(this.nMaxPlayerNum == this.PlayersInfo.size)
        {
            this.netRoom.send("*", msg);
        }
    }

    sendPlayerMoveMsg(msg: string)
    {
        if(this.nMaxPlayerNum == this.PlayersInfo.size)
        {
            this.netRoom.send(EventName.move, msg);
        }
        else
        {
            cc.log("玩家不齐")
        }
    }

}

export let netManager:NetworkManager = NetworkManager.getInstance();