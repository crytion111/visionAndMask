// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class PlayerSrc extends cc.Component {

    @property(cc.Node)
    nodeKillerPlayer:cc.Node = null;

    @property(cc.Node)
    nodeNormalPlayer:cc.Node = null;

    posLastStay:cc.Vec3 = null;

    start () {

    }

    resetPlayerInfo()
    {
        this.nodeNormalPlayer.active = true;
        this.nodeKillerPlayer.active = false;
    }

    setPlayerKiller()
    {
        this.nodeNormalPlayer.active = false;
        this.nodeKillerPlayer.active = true;
    }

    update (dt) {

        let posCur = this.node.position;
        if(this.posLastStay)
        {
            if(this.posLastStay.x !== posCur.x || this.posLastStay.y !== posCur.y)
            {
                let deX = posCur.x - this.posLastStay.x
                let deY = posCur.y - this.posLastStay.y

                let result = Math.atan2(deY, deX) * (180 / Math.PI);
                this.node.angle = result;
            }
        }
        this.posLastStay = posCur;
    }
}
