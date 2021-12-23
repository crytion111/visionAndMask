import {netManager} from "./NetworkManager";
import {EventName} from "./EventName";


const {ccclass, property} = cc._decorator;

@ccclass
export default class LobbyLogic extends cc.Component
{
    @property(cc.Button)
    btnConnect:cc.Button = null;

    @property(cc.Label)
    labelStatus:cc.Label = null;

    nCountTime:number = 3;
    bClickConnect:boolean = false;

    start ()
    {
        this.labelStatus.string = "还未登录";
        this.btnConnect.node.on("click", this.onClickConnect, this)

        cc.game.on(EventName.CLIENT_GAME_LOGIN_SUCC, this.loginSuccess, this);
        cc.game.on(EventName.CLIENT_GAME_LOGIN_FAILED, this.loginFailed, this);
        cc.game.on(EventName.CLIENT_GAME_START, this.clientGameStart, this);
    }

    // update (dt) {}
    onClickConnect()
    {
        if(!this.bClickConnect)
        {
            this.bClickConnect = true;
            netManager.startConnect();
        }
    }

    loginSuccess(nPlayerID)
    {
        this.btnConnect.node.active = false;

        this.labelStatus.string = "登录成功,你的ID:" + nPlayerID+"\n等待其他玩家加入中...";
    }

    loginFailed(err)
    {
        this.btnConnect.node.active = true;
        this.labelStatus.string = "err= " + JSON.stringify(err);
    }

    clientGameStart()
    {
        cc.game.emit(EventName.CLIENT_SHOW_TIPS, "玩家到齐,游戏即将开始!");
        this.schedule(this.countTime, 1);
    }

    countTime()
    {
        cc.game.emit(EventName.CLIENT_SHOW_TIPS, this.nCountTime + "", 50);
        this.nCountTime--;
        if(this.nCountTime < 0)
        {
            cc.game.emit(EventName.CLIENT_HIDE_TIPS);
            this.unschedule(this.countTime);
            this.node.active = false;
            cc.game.emit(EventName.CLIENT_GAME_SHOW_START);
        }
    }
}
