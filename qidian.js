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
var cxy = false
var ca = false
// 退出坐标对象
var zb
//工具模块
//提取数字
function jstime(datatime) {
    var textObj = datatime
    // 存储初始文本内容
    var initText = textObj.text();
    log(initText)
    //获取时间
    var match = initText.match(/\d+/g);
    if (match) {
        var numbers = [];
        for (var i = 0; i < match.length; i++) {
            numbers.push(parseInt(match[i]));
        }
        return numbers[0]
    } else {
        return null
    }
}
//提取坐标中心
function getXy(obj) {
    var button = obj;
    var bounds = button.bounds();
    var centerX = (bounds.left + bounds.right) / 2;
    var centerY = (bounds.top + bounds.bottom) / 2;

    return {
        centerX: centerX,
        centerY: centerY
    };
}
//判断广告时间
function adtime() {
    return jstime(textContains("观看").findOne())
}
//返回首页
function backHome(params) {
    while (true) {
        if (textStartsWith('签到').exists() && text('书架').exists()) {
            break
        } else {
            back()
            sleep(1000)
        }
    }
    console.log('已到主界面');
}
//点击坐标中心
function clickCenter(params) {
    var bounds = params.bounds(); // 获取控件的位置信息
    var centerX = bounds.centerX(); // 计算中心点的 x 坐标
    var centerY = bounds.centerY(); // 计算中心点的 y 坐标
    click(centerX, centerY); // 点击中心点坐标
    console.log('点击坐标');
}
//直到能点击
function autoClick_have(params) {
    obj = params.findOne()
    clickParentIfClickable(obj)
    if (cxy) {
        clickCenter(obj)
        cxy = false
    } else {
        //点击事件成功
        return true
    }
}
function clickParentIfClickable(widget) {
    if (widget === null) {
        console.log('找不到');
        return;  // 终止递归的条件：如果 widget 是空值，则结束递归
    }
    if (widget.click()) {
        console.log('已点击');
        return;  // 点击控件
    }
    var parentWidget = widget.parent();  // 获取控件的父类
    if (parentWidget === null) {
        console.log('不可点击');
        return cxy = true;
    }
    clickParentIfClickable(parentWidget);  // 递归调用自身，传入父类控件进行下一次查找和点击
}
//直到能长按 
function autolongClick_have(params) {
    obj = params.findOne()
    longClickParentIfClickable(obj)
}
function longClickParentIfClickable(widget) {
    if (widget === null) {
        console.log('找不到');
        return;  // 终止递归的条件：如果 widget 是空值，则结束递归
    }
    if (widget.longClick()) {
        console.log('已长按');
        return;  // 点击控件
    }
    var parentWidget = widget.parent();  // 获取控件的父类
    if (parentWidget === null) {
        console.log('不可长按');
        return ca = true
    }
    longClickParentIfClickable(parentWidget);  // 递归调用自身，传入父类控件进行下一次查找和点击
}



//主界面模块
//启动起点获取坐标中心点
function start() {
    if (auto.service == null) {
        log("请先开启无障碍服务！");
    } else {
        log("无障碍服务已开启");
        home()
        sleep(1000)
        app.launchPackage("com.qidian.QDReader");
        waitForPackage('com.qidian.QDReader')
        waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity')
        id("btnCheckIn").waitFor
        bounds = className("android.widget.FrameLayout").depth(0).findOne()
        centerX = getXy(bounds).centerX;
        centerY = getXy(bounds).centerY;
        right = bounds.bounds().right
        log("应用已启动")
        sleep(1500)
        back()
    }
}
//投推荐票
function poll(params) {
    if (ham.text_01 === '') {
        console.log('没填书');
    }
    if (ham.text_01 !== '' && textContains(ham.text_01).exists()) {
        autolongClick_have(textContains(ham.text_01))
        if (ca) {
            console.log('投票出现问题请重试');
            ca = false
            return
        }
        autoClick_have(text('投推荐票'))
        if (jstime(textMatches(/拥有\d+主站推荐票/).findOne()) > 0) {
            autoClick_have(text('全部'))
            autoClick_have(textMatches(/投\d+票/))
        } else {
            console.log('没有推荐票');
            back()
        }
    } else {
        console.log('没找到该书');
    }
}
//签到
function qdao() {
    log("签到")
    autoClick_have(textStartsWith('签到'))
    //等待加载
    log("等待抽奖")
    text("阅读积分").waitFor()
    var today = new Date();
    var dayOfWeek = today.getDay();
    log("抽奖详情")
    while (true) {
        if (textContains("明日").exists() || descContains("明日").exists()) {
            log("抽奖结束")
            break
        } else if (descContains("抽奖").exists() && !text("抽 奖").exists() && !text("看视频抽奖喜+1").exists()) {
            log("点击抽奖")
            autoClick_have(descContains("抽奖"))
            log("等待抽奖界面出现")
            sleep(500)
        } else if (text("抽 奖").exists()) {
            log("点击抽奖")
            autoClick_have(text("抽 奖"))
            log("等待转盘结束")
            text("剩余0次").waitFor()
        } else if (text("看视频抽奖喜+1").exists()) {
            log("点击看视频抽奖喜+1")
            autoClick_have(text("看视频抽奖喜+1"))
            waitad()
            if (!textContains("抽").exists()) {
                log('未退出广告，重新点击退出')
                clickParentIfClickable(zb[0])
                if (cxy) {
                    clickCenter(zb[0])
                    cxy = false
                }
                click(X, Y)
            }
            text("剩余1次").waitFor()
        }
    }
    if (dayOfWeek === 0) {
        log("今天是周日");
        text("周日兑换章节卡").findOne().parent().click()
        sleep(500)
        array = text("兑换").find()
        clickParentIfClickable(array[array.length - 1])
        sleep(500)
        array = text("兑换").find()
        clickParentIfClickable(array[array.length - 1])
    }
    else {
        log("今天不是周日");
    }
    back()

}



//精选模块
//激励碎片
function looksp() {
    log('领碎片')
    autoClick_have(text("精选"))
    log('已进入精选')
    autoClick_have(text("新书"))
    log('已进入新书')
    log('点击换一换')
    autoClick_have(text("换一换"))
    sleep(800)
    autoClick_have(id("rootBookLayout"))
    log('已进入小说详细页')
    autoClick_have(textEndsWith("阅读"))
    log('已打开小说')
    waitForActivity("com.qidian.QDReader.ui.activity.QDReaderActivity");
    // sleep(2000)
    //找红包
    while (true) {
        while (true) {
            log('找红包位置')
            while (true) {
                click(right - 1, centerY);
                click(centerX, centerY);
                log('点击屏幕')
                sleep(700)
                if (text("听书").exists()) {
                    break
                }
            }
            autoClick_have(text("下一章"))
            waitForActivity("com.qidian.QDReader.ui.activity.QDReaderActivity");
            click(1, centerY);
            click(1, centerY);
            sleep(800)
            if (text("红包").exists()) {
                log('红包位置已找到')
                break
            }
        }
        if (text("0个").exists()) {
            log('没有红包')
            break
        }
        log('点击红包')
        autoClick_have(text("红包"))
        log('打开红包')
        autoClick_have(text("马上抢"))
        //看视频
        waitad()
        if (!text("红包").exists()) {
            log('未退出广告，重新点击退出')
            clickParentIfClickable(zb[0])
            if (cxy) {
                clickCenter(zb[0])
                cxy = false
            }
            click(X, Y)
        }
        //领碎片
        log('领碎片')
        autoClick_have(text("立即领取"))
        sleep(500)
        if (id("btnOk").exists()) {
            id("btnOk").findOne().click()
        }
        click(right - 1, centerY);
    }
    log('碎片已领完')
    back()
    autoClick_have(text("取消"))
    backHome()
    // sleep(500)
    // back()
    // sleep(500)
    // back()
    // sleep(500)
    // back()
}



//福利中心模块
//看视频
function lookvd() {
    autoClick_have(text("我"))
    waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity')
    sleep(1000)
    if (text("我知道了").exists()) {
        autoClick_have(text("我知道了"))
    }
    autoClick_have(textContains("福利中心"))
    log("等待福利中心加载")
    text("限时彩蛋").waitFor()
    while (true) {
        if (textContains("宝箱").exists()) {
            autoClick_have(textContains("宝箱"))
            waitad()
            if (!text("限时彩蛋").exists()) {
                log('未退出广告，重新点击退出')
                clickParentIfClickable(zb[0])
                if (cxy) {
                    clickCenter(zb[0])
                    cxy = false
                }
                click(X, Y)
            }
        }
        if (textContains("看视频").exists() && !(textContains("明日").exists())) {
            autoClick_have(textContains("看视频"))
            waitad()
            if (!text("限时彩蛋").exists()) {
                log('未退出广告，重新点击退出')
                clickParentIfClickable(zb[0])
                if (cxy) {
                    clickCenter(zb[0])
                    cxy = false
                }
                click(X, Y)
            }
        } else if (desc("看视频").exists()) {
            autoClick_have(desc("看视频"))
            waitad()
            if (!text("限时彩蛋").exists()) {
                log('未退出广告，重新点击退出')
                clickParentIfClickable(zb[0])
                if (cxy) {
                    clickCenter(zb[0])
                    cxy = false
                }
                click(X, Y)
            }
        } else {
            log('视频已看完')
            break
        }
    }
    log("听书")
    listenToBook()
    log("玩游戏")
    play()
    log("领取奖励")
    getPrize()
    log("碎片兑换")
    buy()
    backHome()
    // back()
    // sleep(500)
    // back()
    // sleep(500)
    // back()
}
//等待广告
function waitad() {
    sp++
    log('看视频' + sp + '个')
    log('看广告')
    // sleep(500)
    textEndsWith("获得奖励").waitFor()
    while (true) {
        zb = textEndsWith("获得奖励").findOne().parent().children()
        if (zb.length > 3) {
            break
        }
    }
    var video_quit = textEndsWith("获得奖励").findOne().bounds()
    var x1 = 0;
    var x2 = video_quit.left;
    var y1 = video_quit.top;
    var y2 = video_quit.bottom;
    X = parseInt((x1 + x2) / 2)
    Y = parseInt((y1 + y2) / 2)
    //等待时间
    var time = adtime()
    if (time) {
        //成功获取时间
        log('等待' + time + '秒')
        sleep(1000 * (time + 1))
    } else {
        //获取不到时间
        var num = 0
        var isOne = true
        while (true) {
            sleep(500)
            if (!textEndsWith("获得奖励").exists()) {
                log("视频已结束")
                break
            } else {
                num++
                sleep(1000)
                log('等待' + num + '秒')
                if (isOne) {
                    log('获取不到时间，重新获取')
                    log('点击退出')
                    // quitad.click()
                    while (true) {
                        clickParentIfClickable(zb[0])
                        if (cxy) {
                            clickCenter(zb[0])
                            cxy = false
                        }
                        click(X, Y)
                        sleep(500)
                        if (textContains("继续观看").exists()) {
                            break
                        }
                    }
                    time = adtime()
                    if (time) {
                        log('成功获取')
                        autoClick_have(textContains("继续观看"))
                        log('等待' + time + '秒')
                        sleep(1000 * (time + 1))
                        break
                    } else {
                        log('等待视频结束')
                        autoClick_have(textContains("继续观看"))
                        isOne = false
                    }
                }
            }
        }
    }
    //点击退出
    while (true) {
        log('点击退出')
        clickParentIfClickable(zb[0])
        if (cxy) {
            clickCenter(zb[0])
            cxy = false
        }
        click(X, Y)
        sleep(700)
        if (textContains("继续观看").exists()) {
            time = adtime()
            autoClick_have(textContains("继续观看"))
            log('等待' + time + '秒')
            sleep(1000 * (time + 1))
        }
        else {
            break
        }
    }
    log("关闭广告")
    sleep(500)
    if (textContains("我知道了").exists()) {
        autoClick_have(textContains("我知道了"))
    }
}
//兑换
function buy() {
    desc('更多好礼').findOne().click()
    text('畅享卡').waitFor()
    var one
    var two
    var three
    one = textStartsWith('7天').findOne().parent()
    two = textStartsWith('3天').findOne().parent()
    three = textStartsWith('1天').findOne().parent()
    one = one.child(one.childCount() - 1)
    two = two.child(two.childCount() - 1)
    three = three.child(three.childCount() - 1)
    if (one.click()) {
        sleep(500)
        if (textContains("确认").exists()) {
            className("android.widget.Button").text("确认").findOne().click()
            log('兑换成功7天')
        }
    }
    sleep(500)
    if (two.click()) {
        sleep(500)
        if (textContains("确认").exists()) {
            className("android.widget.Button").text("确认").findOne().click()
            log('兑换成功3天')
        }
    }
    sleep(500)
    if (three.click()) {
        sleep(500)
        if (textContains("确认").exists()) {
            className("android.widget.Button").text("确认").findOne().click()
            log('兑换成功1天')
        }
    }
    sleep(1000)
}
//听书
function listenToBook() {
    var bookV
    var bookVs//集合
    var bookVi//数量
    bookV = textContains("当日听书").findOne().parent()
    bookVs = bookV.children()
    bookVi = bookV.childCount()
    if (bookVs[bookVi - 1].child(0)) {
        if (bookVs[bookVi - 1].child(0).text() == '去完成') {
            bookVs[bookVi - 1].click()
            text("听原创小说").waitFor()
            var xy = getXy(id("playIv").findOne())
            click(xy.centerX, xy.centerY)
            // id("flIvContent").waitFor()
            // id("pagContent").waitFor()
            // waitForActivity('com.qidian.QDReader.ui.activity.AudioPlayActivity')
            sleep(4500)
            back()
            sleep(500)
            if (id("btnLeft").exists()) {
                id("btnLeft").findOne().click()
            }
            back()
        }
    }
}
//玩游戏
function play() {
    var game
    var games//集合
    var gamei//数量
    game = textContains("当日玩游戏").findOne().parent()
    games = game.children()
    gamei = game.childCount()
    if (games[gamei - 3].child(0)) {
        if (games[gamei - 3].child(0).text() == '去完成') {
            while (true) {
                var pt = playtime()
                // var repetitions = 4
                if (pt) {
                    clickParentIfClickable(games[gamei - 3])
                    if (cxy) {
                        clickCenter(games[gamei - 3])
                        cxy = false
                    }
                    log("前往游戏中心")
                    textContains("热门").waitFor()
                    textContains("喜欢").waitFor()
                    textContains("推荐").waitFor()
                    if (text("排行").findOne(1000 * 30) == null) {
                        autoClick_have(text("在线玩"))
                    } else {
                        autoClick_have(text("排行"))
                        text("新游榜").waitFor()
                        text("热门榜").waitFor()
                        text("畅销榜").waitFor()
                        autoClick_have(text("在线玩"))
                        // repetitions++
                    }
                    log("进入游戏")
                    log('剩余' + (pt + 0.5) + '分钟')
                    startCountdown(pt + 0.5)
                    backHome()
                    // for (let index = 0; index < repetitions; index++) {
                    //     back()
                    //     sleep(1000)
                    // }
                    log("重新进入福利中心")
                    autoClick_have(text("我"))
                    waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity')
                    sleep(1000)
                    if (text("我知道了").exists()) {
                        autoClick_have(text("我知道了"))
                    }
                    autoClick_have(textContains("福利中心"))
                    log("等待福利中心加载")
                    text("限时彩蛋").waitFor()

                } else {
                    break
                }
            }
        }
    }
}
//判断游戏时间
function playtime() {
    var game
    var games//集合
    var gamei//数量
    game = textContains("当日玩游戏").findOne().parent()
    games = game.children()
    gamei = game.childCount()
    return jstime(games[gamei - 1]) - jstime(games[gamei - 2])
}
//领取
function getPrize() {
    var prizePool
    prizePool = text("领奖励").find()
    for (i = 0; i < prizePool.length; i++) {
        prizePool[i].click()
        sleep(500)
        if (textContains("我知道了").exists()) {
            autoClick_have(textContains("我知道了"))
        }
    }
}
//倒计时
function startCountdown(minutes) {
    var count = minutes * 60; // 倒计时的秒数
    var lastToastTime = minutes
    for (var i = count; i >= 0; i--) {
        var remainingMinutes = Math.floor(i / 60); // 剩余分钟数
        var remainingSeconds = i % 60; // 剩余秒数
        // 每分钟提示倒计时
        if (lastToastTime > (i / 60).toFixed(1) && i > 5 && remainingSeconds != 0) {
            lastToastTime = (i / 60).toFixed(1)
            log("倒计时还剩 " + (i / 60).toFixed(1) + " 分钟 ");
        }
        if (remainingMinutes >= 1 && remainingSeconds == 0) {
            log("倒计时还剩 " + remainingMinutes + " 分钟 ");
        }
        // 剩余10秒钟提示倒计时
        if (i <= 5) {
            log("倒计时还剩 " + i + " 秒");
        }
        sleep(1000); // 等待1秒
    }
    log("倒计时已结束");
}


start()
//投推荐票
poll()
//签到
if (ham.checkbox_01) {
    qdao()
}
//领碎片
if (ham.checkbox_02) {
    looksp()
}
//做福利任务
if (ham.checkbox_03) {
    lookvd()
}
console.log('运行结束');
console.hide()
engines.stopAllAndToast()