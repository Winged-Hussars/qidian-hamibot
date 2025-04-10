/**
 * @file mainInterface.js
 * @description 主界面功能模块
 * 
 * 提供起点APP主界面相关功能，包括：
 * 1. 应用启动：初始化应用并获取基础坐标
 * 2. 投票功能：投推荐票
 * 3. 签到功能：每日签到、抽奖、连签礼包、周日兑换
 * 
 * @requires utils.js
 * 
 * @exports {Object} 导出主界面功能对象
 * @exports {Function} start - 启动应用并初始化
 * @exports {Function} poll - 投推荐票功能
 * @exports {Function} qdao - 签到功能
 */

const utils = require('./utils');

// 启动起点获取坐标中心点
function start() {
    if (auto.service == null) {
        log("请先开启无障碍服务！");
    } else {
        log("无障碍服务已开启");
        home()
        sleep(1000)
        launch("com.qidian.QDReader");
        waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity')
        textStartsWith("签到").findOne(3000)
        back()
        bounds = className("android.widget.FrameLayout").depth(0).findOne()
        centerX = utils.getXy(bounds).centerX;
        centerY = utils.getXy(bounds).centerY;
        right = bounds.bounds().right
        log("应用已启动")
    }
}

// 投推荐票
function poll() {
    if (ham.text_01 === '') {
        console.log('没填书');
        return;
    }

    var bookText = textContains(ham.text_01).findOne(500);
    if (bookText === null) {
        console.log('没找到该书');
        return;
    }
    if (!utils.longClickParentIfClickable(bookText)) {
        console.log('投票出现问题请重试');
        return;
    }
    utils.clickParentIfClickable(text('投推荐票').findOne());
    var recommendTicket = textMatches(/拥有\d+主站推荐票/).findOne();
    let votes = utils.jstime(recommendTicket);
    if (votes > 0) {
        utils.clickParentIfClickable(text('全部').findOne());
        utils.clickParentIfClickable(textMatches(/投\d+票/).findOne());
        console.log('已投' + votes + '票');
    } else {
        console.log('没有推荐票');
        back();
    }
}

// 签到
function qdao() {
    log("签到")
    utils.clickParentIfClickable(textStartsWith('签到').findOne())
    var today = new Date();
    var dayOfWeek = today.getDay();
    var thread = threads.start(function () {
        events.observeToast();
        events.onToast(function (toast) {
            let news = toast.getText();
            if (news.indexOf('风险等级') != -1) {
                console.log(news);
                engines.stopAllAndToast()
            }
        });
    });
    utils.clickParentIfClickable(text("免费抽奖").findOne(1500))
    utils.clickParentIfClickable(text("连签礼包 ").findOne())
    text("连签说明").waitFor()
    do {
        utils.clickParentIfClickable(text("未领取").findOnce())
    } while (text("未领取").exists());
    back()
    waitForActivity('com.qidian.QDReader.ui.activity.QDBrowserActivity')
    text("阅读积分").waitFor()
    log("抽奖详情")
    //抽奖
    let initialNumber
    let currentNumber
    if (desc("明天再来").exists() || desc("明日再来抽奖").exists()) {
        console.log('无抽奖')
    } else {
        do {
            utils.clickParentIfClickable(descContains("抽奖").findOne())
            while (!(desc("抽 奖").exists() || desc("看视频抽奖喜+1").exists()) && !(desc("明天再来").exists() || desc("明日再来抽奖").exists())) {
                sleep(500)
            }
            if (desc("抽 奖").exists()) {
                console.log('点击抽奖')
                while (utils.clickParentIfClickable(desc("抽 奖").findOne(1000)) == null) {
                    swipe(centerX, centerY, centerX, centerY - 100, 100)
                }
                initialNumber = utils.jstime(textMatches(/剩余\d+次/).findOne())
                while (initialNumber == (currentNumber = utils.jstime(textMatches(/剩余\d+次/).findOne())) && currentNumber != 0) {
                    sleep(500)
                }
            } else if (desc("看视频抽奖喜+1").exists()) {
                while (utils.clickParentIfClickable(desc("看视频抽奖喜+1").findOne(1000)) == null) {
                    swipe(centerX, centerY, centerX, centerY - 100, 100)
                }
                waitad()
            }
            utils.clickParentIfClickable(desc("javascript:").findOne(500))
            sleep(500)
        } while (!(desc("明天再来").exists() || desc("明日再来抽奖").exists()))
    }
    thread.interrupt();
    if (dayOfWeek === 0) {
        log("今天是周日");
        do {
            if (utils.clickParentIfClickable(text("周日兑换章节卡").findOne(1000)) == null && utils.clickParentIfClickable(text("积攒碎片可在本周日兑换").findOne(1000)) == null) {
                swipe(centerX, centerY, centerX, centerY - 100, 100)
            }
            sleep(500)
        } while (!text("兑换").exists())
        array = text("兑换").find()
        utils.clickParentIfClickable(array[array.length - 1])
        sleep(500)
        array = text("兑换").find()
        utils.clickParentIfClickable(array[array.length - 1])
        sleep(1500)
    } else {
        log("今天不是周日");
    }
    back()
    sleep(500)
    if (text("免费抽奖").exists()) {
        back()
    }
}

module.exports = {
    start,
    poll,
    qdao
}; 