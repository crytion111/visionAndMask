import { Schema,type } from '@colyseus/schema'
import { randomChineseName } from '../Utils'
export class Player extends Schema {
    @type("string")
    name: string;  // 名称
    @type("number")
    x: number;    // x轴的位置
    @type("number")
    y: number;   // y轴的位置
    @type("boolean")
    dir: boolean; // 玩家的方向(左 false 右 true) 简单定义
    constructor(x: number, y: number, name?: string) {
        super();
        this.x = x;
        this.y = y;
        this.name = name || randomChineseName();
        this.dir = true;
    }
}