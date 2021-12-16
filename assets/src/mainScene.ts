import {GameUtils} from "./GameUtils";
import {netManager} from "./NetworkManager";
import {EventName} from "./EventName";
import {MapData} from "./MapData";


const {ccclass, property} = cc._decorator;

@ccclass
export default class mainScene extends cc.Component {

    @property(cc.Camera)
    cameraMain:cc.Camera = null;
    @property(cc.Camera)
    cameraUI:cc.Camera = null;

    @property(cc.Node)
    nodeLobbyRootUI:cc.Node = null;

    @property(cc.Node)
    nodeGameBg:cc.Node = null;
    @property(cc.Node)
    nodeMainPlayer:cc.Node = null;

    @property(cc.Node)
    nodeOtherPlayer:cc.Node = null;

    @property(cc.Node)
    nodeArrow:cc.Node = null;

    @property(cc.Graphics)
    graphicsLine:cc.Graphics = null;

    @property(cc.Prefab)
    preWallRoot:cc.Prefab = null;

    @property(cc.Node)
    nodeUIRoot:cc.Node = null;

    @property(cc.Node)
    nodeJoystickBg:cc.Node = null;
    @property(cc.Node)
    nodeJoystickBall:cc.Node = null;

    @property(cc.Label)
    labelTipsNode:cc.Label = null;

    @property(cc.Label)
    labelTimeCount:cc.Label = null;

    nGameAllCount:number = 0;

    nAllMeatCount:number = 20;
    // 每20秒显示一次礼物位置
    nShowMeatCount:number = 0;

    bCanMove:boolean = false;
    posCurrentJoyStick:cc.Vec3 = null;

    fPerFrameSpeed :number = 0;

    nodeWallRootArr:cc.Node[] = [];

    nPlayerZIndex = 98;
    nMaskZIndex = 99;
    nWallZIndex = 100;
    nArrowZIndex = 101;

    bRoomMainPlayer:boolean = false;
    bGameStarted:boolean = false;

    onLoad()
    {
        //开启碰撞
        let manager = cc.director.getPhysicsManager();
        manager.enabled = true;
        // manager.debugDrawFlags = 1;
        manager.gravity = cc.v2(0, 0);

        this.nShowMeatCount = this.nAllMeatCount;

        this.nodeLobbyRootUI.active = true;
        this.labelTipsNode.node.active = false;
        this.nodeArrow.active = false;
        this.nodeArrow.zIndex = this.nArrowZIndex;
    }

    start ()
    {
        this.graphicsLine.node.zIndex = this.nMaskZIndex;
        let aaaaTemp = [];
        for (let i = 0; i < 500; i++)
        {
            let wallRootNode = cc.instantiate(this.preWallRoot);
            this.nodeWallRootArr.push(wallRootNode);
            let info = MapData[i];
            wallRootNode.setScale( info.sx, info.sy);
            wallRootNode.position = cc.v3(info.x, info.y);
            this.nodeGameBg.addChild(wallRootNode, this.nWallZIndex);

            // aaaaTemp.push({sx:wallRootNode.scaleX, sy:wallRootNode.scaleY, x:wallRootNode.x, y:wallRootNode.y})
        }

        cc.game.on(EventName.OTHER_PLAYER_MOVE, this.OtherPlayerMove, this);

        this.nodeMainPlayer.zIndex = this.nPlayerZIndex;
        this.nodeOtherPlayer.zIndex = this.nPlayerZIndex;
        this.nodeMainPlayer.active = false;
        this.nodeOtherPlayer.active = false;
        this.nodeJoystickBg.active = false;

        this.bGameStarted = false;

        cc.game.on(EventName.CLIENT_GAME_START, this.clientGameStart, this);
        cc.game.on(EventName.CLIENT_GAME_SHOW_START, this.gameViewShow, this);

        cc.game.on(EventName.CLIENT_SHOW_TIPS, this.showTips, this);
        cc.game.on(EventName.CLIENT_HIDE_TIPS, this.hideTips, this);

        // 固定的摇杆
        // this.nodeJoystickBg.on(cc.Node.EventType.TOUCH_START, this.JoyStickTouchStart, this);
        // this.nodeJoystickBg.on(cc.Node.EventType.TOUCH_MOVE, this.JoyStickTouchMove, this);
        // this.nodeJoystickBg.on(cc.Node.EventType.TOUCH_END, this.JoyStickTouchEnd, this);
        // this.nodeJoystickBg.on(cc.Node.EventType.TOUCH_CANCEL, this.JoyStickTouchEnd, this);

        this.showGraLines();
    }

    showTips(strCon, nFrontSize = 30)
    {
        this.labelTipsNode.node.active = true;
        this.labelTipsNode.fontSize = nFrontSize;
        this.labelTipsNode.lineHeight = nFrontSize;
        this.labelTipsNode.string = strCon;
        this.labelTipsNode.node.position = cc.v3(0, 120);
        this.labelTipsNode.node.opacity = 255;
        this.labelTipsNode.node.stopAllActions();
        cc.tween(this.labelTipsNode.node)
            .delay(2)
            .parallel(
                cc.tween(this.labelTipsNode.node).to(0.3, {position: cc.v3(0, 160)}),
                cc.tween(this.labelTipsNode.node).to(0.3, {opacity: 0}),
            )
            .call(()=>
            {
                this.labelTipsNode.node.active = false;
            })
            .start();
    }

    hideTips()
    {
        this.labelTipsNode.node.active = false;
        this.labelTipsNode.node.position = cc.v3(0, 120);
    }

    gameViewShow()
    {
        if(this.bRoomMainPlayer)
        {
            cc.game.emit(EventName.CLIENT_SHOW_TIPS, "你是猎人, 请追捕猎物");
        }
        else
        {
            cc.game.emit(EventName.CLIENT_SHOW_TIPS, "你是猎物, 请逃脱这场追捕");
        }
        this.nGameAllCount = 300;
        this.labelTimeCount.string = this.nGameAllCount+"";
        this.schedule(this.scheduleTimeCount, 1);
    }

    scheduleTimeCount()
    {
        this.nGameAllCount--;
        this.nShowMeatCount--;
        this.labelTimeCount.string = this.nGameAllCount + "";
        if(this.nShowMeatCount == 0)
        {
            this.nShowMeatCount = this.nAllMeatCount;
            this.showMeatPlayerPos();
        }
        if(this.nGameAllCount == 0)
        {
            this.unschedule(this.scheduleTimeCount);
            this.clientGameTimeEnd();
        }
    }

    showMeatPlayerPos()
    {
        if (this.bRoomMainPlayer)
        {
            cc.game.emit(EventName.CLIENT_SHOW_TIPS, "猎物位置显示,快追!!!!!!!!!!");
            this.nodeArrow.active = true;

            this.showOtherPos();
            this.schedule(this.showOtherPos, 0.01, 500);
            this.nodeArrow.stopAllActions();
            cc.tween(this.nodeArrow)
                .delay(2)
                .call(() =>
                {
                    this.unschedule(this.showOtherPos);
                    this.nodeArrow.active = false;
                })
                .start();
        }
        else
        {
            cc.game.emit(EventName.CLIENT_SHOW_TIPS, "位置暴露,请尽快躲避到其他地方!!!!!!!!!!!!");
        }
    }

    showOtherPos()
    {
        let posOther = this.nodeOtherPlayer.position;
        let posMain = this.nodeMainPlayer.position;
        let vecArrow = cc.v3(posOther.x - posMain.x, posOther.y - posMain.y);
        this.nodeArrow.position = posMain;
        let nNewAngle = Math.atan2(vecArrow.x, vecArrow.y) * (180 / Math.PI);
        this.nodeArrow.angle = -nNewAngle;
    }

    clientGameTimeEnd()
    {
        cc.game.emit(EventName.CLIENT_SHOW_TIPS, "时间到");
        this.bGameStarted = false;
    }

    clientGameStart(strMainID:string)
    {
        this.bGameStarted = true;

        // netManager.strRoomMainID = strMainID;

        this.nodeMainPlayer.active =  true;
        this.nodeOtherPlayer.active = true;
        this.nodeJoystickBg.active =  true;


        //两种摇杆方案
        //摇杆随触摸移动而移动
        this.nodeUIRoot.on(cc.Node.EventType.TOUCH_START , this.onTouchStart, this)
        this.nodeUIRoot.on(cc.Node.EventType.TOUCH_MOVE  , this.onTouchMove, this)
        this.nodeUIRoot.on(cc.Node.EventType.TOUCH_END   , this.onTouchEnd, this)
        this.nodeUIRoot.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)


        this.nodeMainPlayer.color = cc.color(255, 255, 255);
        this.nodeOtherPlayer.color = cc.color(255, 255, 255);
        this.fPerFrameSpeed = 5;
        if(strMainID == netManager.strMyPlayerID)
        {
            // 速度加快
            this.fPerFrameSpeed = 7;
            this.bRoomMainPlayer = true;
            this.nodeMainPlayer.position = cc.v3(0, 0);
            this.nodeOtherPlayer.position = cc.v3(2500, -1600);
            this.nodeMainPlayer.color = cc.color(255, 100, 100);
        }
        else
        {
            this.bRoomMainPlayer = false;
            this.nodeMainPlayer.position = cc.v3(2500, -1600);
            this.nodeOtherPlayer.position = cc.v3(0, 0);
            this.nodeOtherPlayer.color = cc.color(255, 100, 100);
        }

        this.cameraMain.node.position = this.nodeMainPlayer.position;

        this.showGraLines();
    }

    OtherPlayerMove(id, data)
    {
        this.nodeOtherPlayer.position = cc.v3(data.x, data.y);
    }

    onTouchStart(event)
    {
        if(!this.bGameStarted)
        {
            return;
        }
        let posLocal = event.getLocation();
        posLocal = this.nodeJoystickBg.parent.convertToNodeSpaceAR(posLocal);
        this.nodeJoystickBg.position = cc.v3(posLocal.x, posLocal.y);
    }
    onTouchMove(event)
    {
        if(!this.bGameStarted)
        {
            return;
        }
        this.bCanMove = true;
        let posLocal = event.getLocation();
        posLocal = this.nodeJoystickBg.convertToNodeSpaceAR(posLocal);
        this.posCurrentJoyStick = posLocal;

        //移动到范围外, 最多移动到半径位置
        let fPosLength = posLocal.mag();
        if(fPosLength > 75)
        {
            let fSin = posLocal.y/fPosLength;
            let fCos = posLocal.x/fPosLength;
            let fMaxX = 75*fCos;
            let fMaxY = 75*fSin;

            this.nodeJoystickBall.setPosition(fMaxX, fMaxY);
        }
        else
        {
            this.nodeJoystickBall.setPosition(this.posCurrentJoyStick);
        }
    }

    onTouchEnd(event)
    {
        if(!this.bGameStarted)
        {
            return;
        }
        let posLocal = event.getLocation();
        this.posCurrentJoyStick = cc.v3(0, 0);

        this.nodeJoystickBall.setPosition(this.posCurrentJoyStick);
        this.bCanMove = false;
    }


    //
    // JoyStickTouchStart(event)
    // {
    //     let posLocal = event.getLocation();
    //     posLocal = this.nodeJoystickBg.convertToNodeSpaceAR(posLocal);
    //     this.posCurrentJoyStick = posLocal;
    //
    //     this.nodeJoystickBall.setPosition(this.posCurrentJoyStick);
    //
    //     this.bCanMove = true;
    //
    // }
    //
    // JoyStickTouchMove(event)
    // {
    //     let posLocal = event.getLocation();
    //     posLocal = this.nodeJoystickBg.convertToNodeSpaceAR(posLocal);
    //     this.posCurrentJoyStick = posLocal;
    //
    //     //移动到范围外, 最多移动到半径位置
    //     let fPosLength = posLocal.mag();
    //     if(fPosLength > 75)
    //     {
    //         let fSin = posLocal.y/fPosLength;
    //         let fCos = posLocal.x/fPosLength;
    //         let fMaxX = 75*fCos;
    //         let fMaxY = 75*fSin;
    //
    //         this.nodeJoystickBall.setPosition(fMaxX, fMaxY);
    //     }
    //     else
    //     {
    //         this.nodeJoystickBall.setPosition(this.posCurrentJoyStick);
    //     }
    //
    // }
    //
    // JoyStickTouchEnd(event)
    // {
    //     let posLocal = event.getLocation();
    //     this.posCurrentJoyStick = cc.v3(0, 0);
    //
    //     this.nodeJoystickBall.setPosition(this.posCurrentJoyStick);
    //     this.bCanMove = false;
    // }
    //
    //

    update(dt: number)
    {
        if(this.bGameStarted)
        {
            let posOther = this.nodeOtherPlayer.position;
            let posMain = this.nodeMainPlayer.position;
            let vecArrow = cc.v3(posOther.x - posMain.x, posOther.y - posMain.y);
            let nDis = vecArrow.mag();
            if(nDis <= 26)
            {
                this.playerCatch();
            }
        }


        //使用了摇杆控制
        if (this.bGameStarted && this.bCanMove && this.posCurrentJoyStick.mag() > 10)
        {
            //算出joystick的正弦余弦, 乘上移动速度,就是x和y方向上的移动速度了.
            let fSin = this.posCurrentJoyStick.y / this.posCurrentJoyStick.mag();
            let fCos = this.posCurrentJoyStick.x / this.posCurrentJoyStick.mag();
            let fPerMoveX = this.fPerFrameSpeed * fCos;
            let fPerMoveY = this.fPerFrameSpeed * fSin;

            this.nodeMainPlayer.y += fPerMoveY;
            this.nodeMainPlayer.x += fPerMoveX;

            this.nodeMainPlayer.y = Math.min(this.nodeGameBg.height / 2 - this.nodeMainPlayer.height / 2, this.nodeMainPlayer.y)
            this.nodeMainPlayer.y = Math.max(-this.nodeGameBg.height / 2 + this.nodeMainPlayer.height / 2, this.nodeMainPlayer.y)

            this.nodeMainPlayer.x = Math.min(this.nodeGameBg.width / 2 - this.nodeMainPlayer.width / 2, this.nodeMainPlayer.x)
            this.nodeMainPlayer.x = Math.max(-this.nodeGameBg.width / 2 + this.nodeMainPlayer.width / 2, this.nodeMainPlayer.x)

            this.cameraMain.node.position = this.nodeMainPlayer.position;

            let pos = {x: this.nodeMainPlayer.position.x, y: this.nodeMainPlayer.position.y}
            netManager.sendPlayerMoveMsg(JSON.stringify(pos));
            this.showGraLines();
        }
    }

    playerCatch()
    {
        this.bGameStarted = false;
        this.unschedule(this.scheduleTimeCount);
        cc.game.emit(EventName.CLIENT_SHOW_TIPS, "可算逮到你个小比崽子了!!!!!!", 80);



        cc.tween(this)
            .delay(2.3)
            .call(()=>
            {
                cc.game.emit(EventName.CLIENT_SHOW_TIPS, "游戏重开, 双方角色互换!!!!", 50);

                this.reStartGame();
            })
            .start();
    }


    reStartGame()
    {
        this.bGameStarted = true;

        this.bRoomMainPlayer = !this.bRoomMainPlayer;
        this.nodeMainPlayer.color = cc.color(255, 255, 255);
        this.nodeOtherPlayer.color = cc.color(255, 255, 255);
        this.fPerFrameSpeed = 5;
        if(this.bRoomMainPlayer)
        {
            // 速度加快
            this.fPerFrameSpeed = 7;
            this.nodeMainPlayer.position = cc.v3(0, 0);
            this.nodeOtherPlayer.position = cc.v3(2500, -1600);
            this.nodeMainPlayer.color = cc.color(255, 100, 100);
        }
        else
        {
            this.nodeMainPlayer.position = cc.v3(2500, -1600);
            this.nodeOtherPlayer.position = cc.v3(0, 0);
            this.nodeOtherPlayer.color = cc.color(255, 100, 100);
        }
        this.cameraMain.node.position = this.nodeMainPlayer.position;
        this.showGraLines();

        this.gameViewShow();
    }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // 传入矩形, 返回4个点
    getRectFourPoint(node:cc.Node) : cc.Vec3[]
    {
        let nWidth = node.width / 2;
        let nHeight = node.height / 2;

        //坐标转化成世界坐标系, 因为墙体的节点和玩家不一定在同一根节点下
        let p1 = node.convertToWorldSpaceAR(cc.v3(-nWidth, -nHeight));   //左下
        let p2 = node.convertToWorldSpaceAR(cc.v3(+nWidth, -nHeight));   //右下
        let p3 = node.convertToWorldSpaceAR(cc.v3(+nWidth, +nHeight));   //右上
        let p4 = node.convertToWorldSpaceAR(cc.v3(-nWidth, +nHeight));   //左上

        let posArr = [p1, p2, p3, p4]
        return posArr;
    }


    // 检测矩形和某个点的边界. 找出夹角最大的两个角
    /**@
     * @param posArr        矩形的4个顶点
     * @param posPlayer     玩家位置
     * @param targetNode    玩家节点
     */
    checkRectEdge(posArr:cc.Vec3[], posPlayer:cc.Vec3, targetNode:cc.Node): cc.Vec3[]
    {
        // 存放向量用于计算
        let angleArr:cc.Vec3[] = [];
        for (let tempWorldPos of posArr)
        {
            //坐标转化, 因为getRectFourPoint中转出的是世界坐标,要变成主角所在的坐标系
            let tempPos = targetNode.parent.convertToNodeSpaceAR(tempWorldPos);

            let deX = tempPos.x - posPlayer.x
            let deY = tempPos.y - posPlayer.y
            angleArr.push(cc.v3(deX, deY));
        }


        let nMaxAngle = 0;
        let nMaxIndex = 0;
        let nMinIndex = 0;

        // 计算向量夹角,看看谁最大
        for (let i = 0; i < angleArr.length; i++)
        {
            let pos1 = angleArr[i];
            for (let j = i + 1; j < angleArr.length; j++)
            {
                let pos2 = angleArr[j];
                // 向量夹角计算公式,算出两个向量夹角, 那么夹角最大的肯定是视野边缘
                let cosO = ((pos2.x * pos1.x)+(pos2.y * pos1.y)) / (pos1.mag() * pos2.mag())
                let nJiaJiao = Math.acos(cosO) * (180 / Math.PI)
                //找出最大的夹角,然后记录下两个点的下标
                if (nJiaJiao > nMaxAngle)
                {
                    nMaxAngle = nJiaJiao;
                    nMaxIndex = i;
                    nMinIndex = j;
                }
            }
        }

        return [targetNode.parent.convertToNodeSpaceAR(posArr[nMaxIndex]),
            targetNode.parent.convertToNodeSpaceAR(posArr[nMinIndex])];
    }



    showGraLines()
    {
        this.graphicsLine.clear();
        let posPlayer = this.nodeMainPlayer.position;

        //遍历所有的墙体节点
        this.nodeWallRootArr.forEach((nodeRoot, index) =>
        {
            let posDes = cc.v3(nodeRoot.x - this.nodeMainPlayer.x, nodeRoot.y - this.nodeMainPlayer.y);
            // 屏幕显示极限, 超过这个距离的不用校验视野
            let winSizeMax = cc.v3(cc.winSize.width/2, cc.winSize.height/2).mag();
            if(posDes.mag() > winSizeMax + 200)
            {
                return;
            }
            let posArr = this.getRectFourPoint(nodeRoot);
            //拿到墙的节点,
            let drawPosArr = this.checkRectEdge(posArr, posPlayer, this.nodeMainPlayer);

            /*  先画墙体边缘的点,
                再画两个延长的阴影区域,
                再往回画另一个墙体边缘的点
            */
            this.graphicsLine.moveTo(drawPosArr[0].x, drawPosArr[0].y); //先画墙体边缘的点,
            for (let i in drawPosArr)
            {
                let pos = drawPosArr[i];
                //将阴影部分至少延长到屏幕外面,就是放大墙体边缘和主角的向量长度
                let posLine = cc.v3((pos.x - posPlayer.x) * 999, (pos.y - posPlayer.y) * 999);
                //再画两个延长的阴影区域,
                this.graphicsLine.lineTo(posPlayer.x + posLine.x, posPlayer.y + posLine.y);
            }
            //再往回画另一个墙体边缘的点
            this.graphicsLine.lineTo(drawPosArr[1].x, drawPosArr[1].y);
        })
        //填充所有这4个点围成的区域
        this.graphicsLine.fill();
        this.graphicsLine.stroke();
    }
}
