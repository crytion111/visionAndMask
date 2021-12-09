"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomChineseName = void 0;
const NAMES = [
    '断笔画墨',
    '默然相爱',
    '旅人不扰',
    '多余温情',
    '云中谁忆',
    '残雪冰心',
    '末世岛屿',
    '桑榆非晚',
    '扉匣与桔',
    '木槿暖夏',
    '空城旧梦',
];
/**
 * 返回随机的中文名
 *
 * @export
 * @returns {string}
 */
function randomChineseName() {
    return NAMES[~~(NAMES.length * Math.random())];
}
exports.randomChineseName = randomChineseName;
