/**
 * @file main.js
 * @description 主程序入口
 * 
 * 起点APP自动化任务主程序，功能包括：
 * 1. 初始化：设置控制台、获取环境变量
 * 2. 任务执行：
 *    - 启动APP
 *    - 投推荐票
 *    - 签到（可选）
 *    - 领取碎片（可选）
 *    - 福利任务（可选）
 * 
 * @requires mainInterface.js
 * @requires featured.js
 * @requires welfare.js
 * 
 * @param {Object} ham - Hamibot环境变量
 * @param {boolean} ham.checkbox_01 - 是否执行签到任务
 * @param {boolean} ham.checkbox_02 - 是否执行领取碎片任务
 * @param {boolean} ham.checkbox_03 - 是否执行福利任务
 * @param {string} ham.text_01 - 要投票的书名
 */

const mainInterface = require('./mainInterface');
const featured = require('./featured');
const welfare = require('./welfare');

console.show();
auto.waitFor();
console.setTitle("自动任务");
console.setPosition(device.width / 3, 0)
console.setSize(device.width / 3, device.height / 3)
var ham = hamibot.env
var bounds
var centerX
var centerY
var right
var sp = 0
var X
var Y
var InitialValue = null

// 启动APP
mainInterface.start()

// 投推荐票
mainInterface.poll()

// 签到
if (ham.checkbox_01) {
    mainInterface.qdao()
}

// 领碎片
if (ham.checkbox_02) {
    featured.looksp()
}

// 做福利任务
if (ham.checkbox_03) {
    welfare.lookvd()
}

console.hide()
engines.stopAllAndToast() 