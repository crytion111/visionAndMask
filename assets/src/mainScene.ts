import {GameUtils} from "./GameUtils";


const {ccclass, property} = cc._decorator;

@ccclass
export default class mainScene extends cc.Component {

    @property(cc.Camera)
    cameraMain:cc.Camera = null;
    @property(cc.Camera)
    cameraUI:cc.Camera = null;

    @property(cc.Node)
    nodeGameBg:cc.Node = null;
    @property(cc.Node)
    nodePlayer:cc.Node = null;

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

    bCanMove:boolean = false;
    posCurrentJoyStick:cc.Vec3 = null;

    fPerFrameSpeed :number = 0;

    nodeWallRootArr:cc.Node[] = [];
    nPlayerZIndex = 98;
    nMaskZIndex = 99;
    nWallZIndex = 100;

    onLoad()
    {
        //开启碰撞
        let manager = cc.director.getPhysicsManager();
        manager.enabled = true;
        // manager.debugDrawFlags = 1;
        manager.gravity = cc.v2(0, 0);
    }

    start ()
    {
        this.graphicsLine.node.zIndex = this.nMaskZIndex;

        this.fPerFrameSpeed = 5;

        for (let i = 0; i < 500; i++)
        {
            let wallRootNode = cc.instantiate(this.preWallRoot);
            this.nodeWallRootArr.push(wallRootNode);

            // wallRootNode.angle = GameUtils.getIntRandom(0, 10);
            wallRootNode.setScale( Math.random() * 2 + 0.4, Math.random() * 2 + 0.4);
            let aaa = GameUtils.getIntRandom(-3600, 3600);
            let bbb = GameUtils.getIntRandom(-1800, 1800);
            wallRootNode.position = cc.v3(aaa, bbb);
            this.nodeGameBg.addChild(wallRootNode, this.nWallZIndex);
        }
        this.nodePlayer.position = cc.v3(0, 0);
        this.nodePlayer.zIndex = this.nPlayerZIndex;



        //两种摇杆方案

        //摇杆随触摸移动而移动
        this.nodeUIRoot.on(cc.Node.EventType.TOUCH_START , this.onTouchStart, this)
        this.nodeUIRoot.on(cc.Node.EventType.TOUCH_MOVE  , this.onTouchMove, this)
        this.nodeUIRoot.on(cc.Node.EventType.TOUCH_END   , this.onTouchEnd, this)
        this.nodeUIRoot.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)


        // 固定的摇杆
        // this.nodeJoystickBg.on(cc.Node.EventType.TOUCH_START, this.JoyStickTouchStart, this);
        // this.nodeJoystickBg.on(cc.Node.EventType.TOUCH_MOVE, this.JoyStickTouchMove, this);
        // this.nodeJoystickBg.on(cc.Node.EventType.TOUCH_END, this.JoyStickTouchEnd, this);
        // this.nodeJoystickBg.on(cc.Node.EventType.TOUCH_CANCEL, this.JoyStickTouchEnd, this);

        this.showGraLines();
    }

    onTouchStart(event)
    {
        let posLocal = event.getLocation();
        posLocal = this.nodeJoystickBg.parent.convertToNodeSpaceAR(posLocal);
        this.nodeJoystickBg.position = cc.v3(posLocal.x, posLocal.y);
    }
    onTouchMove(event)
    {
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
        let posLocal = event.getLocation();
        this.posCurrentJoyStick = cc.v3(0, 0);

        this.nodeJoystickBall.setPosition(this.posCurrentJoyStick);
        this.bCanMove = false;
    }



    JoyStickTouchStart(event)
    {
        let posLocal = event.getLocation();
        posLocal = this.nodeJoystickBg.convertToNodeSpaceAR(posLocal);
        this.posCurrentJoyStick = posLocal;

        this.nodeJoystickBall.setPosition(this.posCurrentJoyStick);

        this.bCanMove = true;

    }

    JoyStickTouchMove(event)
    {
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

    JoyStickTouchEnd(event)
    {
        let posLocal = event.getLocation();
        this.posCurrentJoyStick = cc.v3(0, 0);

        this.nodeJoystickBall.setPosition(this.posCurrentJoyStick);
        this.bCanMove = false;
    }

    update(dt: number)
    {
        //使用了摇杆控制
        if (this.bCanMove && this.posCurrentJoyStick.mag() > 10)
        {
            //算出joystick的正弦余弦, 乘上移动速度,就是x和y方向上的移动速度了.
            let fSin = this.posCurrentJoyStick.y / this.posCurrentJoyStick.mag();
            let fCos = this.posCurrentJoyStick.x / this.posCurrentJoyStick.mag();
            let fPerMoveX = this.fPerFrameSpeed * fCos;
            let fPerMoveY = this.fPerFrameSpeed * fSin;

            this.nodePlayer.y += fPerMoveY;
            this.nodePlayer.x += fPerMoveX;

            this.nodePlayer.y = Math.min(this.nodeGameBg.height / 2 - this.nodePlayer.height / 2, this.nodePlayer.y)
            this.nodePlayer.y = Math.max(-this.nodeGameBg.height / 2 + this.nodePlayer.height / 2, this.nodePlayer.y)

            this.nodePlayer.x = Math.min(this.nodeGameBg.width / 2 - this.nodePlayer.width / 2, this.nodePlayer.x)
            this.nodePlayer.x = Math.max(-this.nodeGameBg.width / 2 + this.nodePlayer.width / 2, this.nodePlayer.x)

            this.cameraMain.node.position = this.nodePlayer.position;
            this.showGraLines();
        }
    }


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
        let posPlayer = this.nodePlayer.position;

        //遍历所有的墙体节点
        this.nodeWallRootArr.forEach((nodeRoot, index) =>
        {
            let posDes = cc.v3(nodeRoot.x - this.nodePlayer.x, nodeRoot.y - this.nodePlayer.y);
            // 屏幕显示极限, 超过这个距离的不用校验视野
            let winSizeMax = cc.v3(cc.winSize.width/2, cc.winSize.height/2).mag();
            if(posDes.mag() > winSizeMax + 200)
            {
                return;
            }
            let posArr = this.getRectFourPoint(nodeRoot);
            //拿到墙的节点,
            let drawPosArr = this.checkRectEdge(posArr, posPlayer, this.nodePlayer);

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
