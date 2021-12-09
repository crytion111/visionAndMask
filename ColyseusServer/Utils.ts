const NAMES: Array<string> = [
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
export function randomChineseName(): string {
    return NAMES[~~(NAMES.length * Math.random())];
}