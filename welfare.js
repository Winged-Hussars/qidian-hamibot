/**
 * @file welfare.js
 * @description 福利中心模块
 * 
 * 提供起点APP福利中心相关功能，包括：
 * 1. 视频任务：看视频开宝箱、看视频领福利
 * 2. 听书任务：完成听书任务
 * 3. 游戏任务：完成游戏任务
 * 4. 奖励领取：领取各类奖励
 * 5. 碎片兑换：兑换畅享卡等奖励
 * 
 * @requires utils.js
 * 
 * @exports {Object} 导出福利中心功能对象
 * @exports {Function} lookvd - 看视频任务
 * @exports {Function} waitad - 等待广告播放
 * @exports {Function} buy - 兑换功能
 * @exports {Function} listenToBook - 听书功能
 * @exports {Function} play - 玩游戏功能
 * @exports {Function} getPrize - 领取奖励功能
 */

const utils = require('./utils');

// 看视频
function lookvd() {
    utils.clickParentIfClickable(text("我").findOne())
    utils.clickParentIfClickable(text("我知道了").findOne(1000))
    utils.clickParentIfClickable(text("福利中心").findOne())
    log("等待福利中心加载")
    text("限时彩蛋").waitFor()
    var thread1 = threads.start(function () {
        let stop = textContains("领奖上限").findOne()
        console.log(stop.text());
        engines.stopAllAndToast();
    });
    var thread2 = threads.start(function () {
        let stop = textContains("风险等级").findOne()
        console.log(stop.text());
        engines.stopAllAndToast();
    });

    while (utils.clickParentIfClickable(text("看视频开宝箱").findOnce()) != null) {
        waitad()
        utils.clickParentIfClickable(text("我知道了").findOne(500))
    }

    while (utils.clickParentIfClickable(text("看视频领福利").findOnce()) != null && !(text("明日再来吧").exists())) {
        waitad()
        utils.clickParentIfClickable(text("我知道了").findOne(500))
    }
    while (utils.clickParentIfClickable(desc("看视频").findOnce()) != null) {
        waitad()
        utils.clickParentIfClickable(text("我知道了").findOne(500))
    }
    log('视频已看完')
    log("听书")
    listenToBook()
    log("玩游戏")
    play()
    log("领取奖励")
    getPrize()
    thread1.interrupt();
    thread2.interrupt();
    log("碎片兑换")
    buy()
    utils.backHome()
}

// 等待广告
function waitad() {
    log('看广告')
    var reward
    while (className("android.view.View").depth(4).exists()) {
        sleep(500)
    }
    reward = textEndsWith("可获得奖励").findOne(7000)
    if (reward == null) {
        if (className("android.view.View").depth(4).exists()) {
            while (className("android.view.View").depth(4).exists()) {
                sleep(500)
            }
            if (!textEndsWith("可获得奖励").exists()) {
                back()
                sleep(500)
                console.log('广告未加载1');
                return
            }
        } else if (className("android.view.View").depth(5).exists()) {
            back()
            sleep(500)
            console.log('广告未加载2');
            return
        } else {
            console.log('未进入广告页面');
            return
        }
    }
    while (className("android.view.View").depth(4).exists()) {
        sleep(500)
    }
    if (!textEndsWith("可获得奖励").exists()) {
        back()
        sleep(500)
        console.log('广告未加载3');
        return
    }
    var gb = text("关闭").findOne(400)
    var cross = text("cross").findOne(400)
    var tg = text("跳过广告").findOne(400)
    var zb = null
    if (gb) {
        zb = gb
    } else if (cross) {
        zb = cross
    } else if (tg) {
        zb = tg
    }
    if (zb == null) {
        console.log('获取关闭坐标')
        var video_quit = reward.bounds()
        var x1 = 0;
        var x2 = video_quit.left;
        var y1 = video_quit.top;
        var y2 = video_quit.bottom;
        X = parseInt((x1 + x2) / 2)
        Y = parseInt((y1 + y2) / 2)
    }

    var time = utils.jstime(textEndsWith("可获得奖励").findOne())
    if (time == null) {
        log('获取不到时间，重新获取')
        log('点击退出')
        do {
            if (!textEndsWith("可获得奖励").exists()) {
                back()
                sleep(500)
                console.log('获取不到坐标')
                return
            }
            if (zb == null) {
                click(X, Y)
            } else {
                utils.clickParentIfClickable(zb)
            }
            sleep(500)
        } while (!textStartsWith("继续").exists())
        time = utils.jstime(textEndsWith("可获得奖励").findOne())
        utils.clickParentIfClickable(textStartsWith("继续").findOne())
        if (time == null) {
            time = textMatches(/\d+/).findOnce()
            if (time) {
                time = parseInt(time.text())
            }
        }
    }

    var num
    if (time) {
        log('等待' + (time + 1) + '秒')
        sleep(1000 * (time + 1))
        num = 0
        do {
            if (zb == null) {
                click(X, Y)
            } else {
                utils.clickParentIfClickable(zb)
            }
            if (utils.clickParentIfClickable(textStartsWith("继续").findOne(500))) {
                sleep(1000)
                num++
                log('等待' + num + '秒')
            }
        } while (textEndsWith("可获得奖励").exists());
    } else {
        log('等待视频结束')
        num = 0
        do {
            num++
            sleep(1000)
            log('等待' + num + '秒')
        } while (textEndsWith("可获得奖励").exists());
    }
    if (className("android.view.View").depth(5).exists()) {
        back()
        sleep(500)
    }
    log('广告结束')
    sp++
    log('已看视频' + sp + '个')
}

// 兑换
function buy() {
    utils.clickParentIfClickable(desc('更多好礼').findOne())
    text('畅享卡').waitFor()
    var enjoyCard = textStartsWith('7天').findOne().parent().parent()
    var convertibleList = enjoyCard.find(text('兑换'))
    if (convertibleList.length > 0) {
        for (let i = convertibleList.length - 1; i >= 0; i--) {
            utils.clickParentIfClickable(convertibleList[i])
            utils.clickParentIfClickable(text("确认").findOne(2000))
            sleep(500)
        }
    }
    console.log('已兑换')
}

// 听书
function listenToBook() {
    var bookV
    bookV = textContains("当日听书").findOne(1000)
    if (bookV == null) {
        console.log('没有听书')
        return
    }
    bookV = bookV.parent()
    if (utils.clickParentIfClickable(bookV.findOne(text('去完成'))) != null) {
        sleep(1500)
        let isback=false
        if (text("听原创小说").exists()){
            isback=true
            text("听原创小说").waitFor()
            utils.clickParentIfClickable(id("playIv").findOne())
        }
        id("ivPlayCenter").waitFor()
        back()
        utils.clickParentIfClickable(id("btnLeft").findOne(850))
        if (isback){
            back()
        }
    }
}

// 玩游戏
function play() {
    var game
    game = textContains("当日玩游戏").findOne(1000)
    if (game == null) {
        console.log('没有游戏可玩')
        return
    }
    game = game.parent()
    let finishing
    var pt
    device.keepScreenDim();
    while ((finishing = game.findOne(text('去完成'))) != null) {
        pt = utils.jstime(game.findOne(textMatches(/\/\d+分钟/))) - utils.jstime(game.findOne(textMatches(/\d+/)))
        do {
            if (!utils.clickParentIfClickable(finishing)) {
                back()
                utils.clickParentIfClickable(text("游戏中心").findOne())
            }
            sleep(500)
        } while (textContains("当日玩游戏").exists());
        log("前往游戏中心")
        textContains("热门").waitFor()
        textContains("喜欢").waitFor()
        textContains("推荐").waitFor()
        if (utils.clickParentIfClickable(text("排行").findOne(5000)) == null) {
            utils.clickParentIfClickable(text("在线玩").findOne())
        } else {
            text("新游榜").waitFor()
            text("热门榜").waitFor()
            text("畅销榜").waitFor()
            utils.clickParentIfClickable(text("热门榜").findOne())
            utils.clickParentIfClickable(text("在线玩").findOne())
        }
        log("进入游戏")
        log('剩余' + (pt + 0.5) + '分钟')
        utils.startCountdown(pt + 0.5)
        utils.backHome()
        log("重新进入福利中心")
        utils.clickParentIfClickable(text("我").findOne())
        utils.clickParentIfClickable(text("福利中心").findOne())
        log("等待福利中心加载")
        text("限时彩蛋").waitFor()
        game = textContains("当日玩游戏").findOne(1000)
        game = game.parent()
    }
    device.cancelKeepingAwake();
}

// 领取
function getPrize() {
    var prizePool
    prizePool = text("领奖励").find()
    for (i = 0; i < prizePool.length; i++) {
        utils.clickParentIfClickable(prizePool[i])
        utils.clickParentIfClickable(text("我知道了").findOne(750))
    }
    utils.clickParentIfClickable(id("ivClose").findOne(500))
}

module.exports = {
    lookvd,
    waitad,
    buy,
    listenToBook,
    play,
    getPrize
}; 