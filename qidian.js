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
// var clickResults
// var news = ''
//工具模块
/*//通知
function observeNews() {
    events.observeToast();
    events.onToast(function (toast) {
        news = toast.getText();
    });
}*/

//提取数字
function jstime(textObj) {
    // 存储初始文本内容
    var initText = textObj.text();
    // log(initText)
    //获取时间
    var match = initText.match(/\d+/g);
    return match ? parseInt(match[0]) : null;
}

/*//提取坐标中心-老方法
function getXy(obj) {
    var bounds = obj.bounds();
    return {
        centerX: (bounds.left + bounds.right) / 2,
        centerY: (bounds.top + bounds.bottom) / 2
    };
}
//点击坐标中心
function clickCenter(params) {
    var center = getXy(params);
    click(center.centerX, center.centerY);
    console.log('点击坐标')
}*/

//提取坐标中心
function getXy(obj) {
    if (obj == null) {
        return null;
    }
    var bounds = obj.bounds();
    return {
        centerX: (bounds.left + bounds.right) / 2,
        centerY: (bounds.top + bounds.bottom) / 2
    };
}

//点击坐标中心
function clickCenter(params) {
    var center = getXy(params);
    if (center == null) {
        console.log('没找到')
        return
    }
    click(center.centerX, center.centerY);
    console.log('点击坐标')
}

//判断广告时间
function adtime() {
    return jstime(textEndsWith("获得奖励").findOne())
}

//返回首页
function backHome(params) {
    /*while (!(text("书架").visibleToUser(true).exists() && text("精选").visibleToUser(true).exists() && text("听书").visibleToUser(true).exists() && text("发现").visibleToUser(true).exists() && text("我").visibleToUser(true).exists())) {
        back()
    }*/
    /*do {
        back()
        sleep(550)
    } while (!(id("normal").visibleToUser(true).exists()))*/
    do {
        back()
    } while (id("normal").findOne(500) == null)
    console.log('已到主界面');
}

/*//直到能点击-老方法
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
}*/

function clickParentIfClickable(widget) {
    if (InitialValue == null) {
        InitialValue = widget
    }
    if (widget === null) {
        console.log('找不到');
        InitialValue = null
        return null;  // 终止递归的条件：如果 widget 是空值，则结束递归
    }
    if (widget.click()) {
        console.log('已点击');
        InitialValue = null
        return true;  // 点击控件
    }
    var parentWidget = widget.parent();  // 获取控件的父类
    if (parentWidget === null) {
        console.log('不可点击');
        clickCenter(InitialValue)
        InitialValue = null
        return false;
    }
    return clickParentIfClickable(parentWidget);
    // 递归调用自身，传入父类控件进行下一次查找和点击
}

//直到能长按
/*function autolongClick_have(params) {
    obj = params.findOne()
    longClickParentIfClickable(obj)
}*/

function longClickParentIfClickable(widget) {
    if (widget === null) {
        console.log('找不到');
        return null;  // 终止递归的条件：如果 widget 是空值，则结束递归
    }
    if (widget.longClick()) {
        console.log('已长按');
        return true;  // 点击控件
    }
    var parentWidget = widget.parent();  // 获取控件的父类
    if (parentWidget === null) {
        console.log('不可长按');
        return false
    }
    return longClickParentIfClickable(parentWidget);  // 递归调用自身，传入父类控件进行下一次查找和点击
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
        // id("imgClose").findOne(750)
        textStartsWith("签到").findOne(3000)
        back()
        bounds = className("android.widget.FrameLayout").depth(0).findOne()
        centerX = getXy(bounds).centerX;
        centerY = getXy(bounds).centerY;
        right = bounds.bounds().right
        log("应用已启动")
        // sleep(1500)

    }
}

//投推荐票
function poll(params) {
    if (ham.text_01 === '') {
        console.log('没填书');
        return;
    }

    var bookText = textContains(ham.text_01).findOne(500);
    if (bookText === null) {
        console.log('没找到该书');
        return;
    }
    if (!longClickParentIfClickable(bookText)) {
        console.log('投票出现问题请重试');
        return;
    }
    /*if (ca) {
        console.log('投票出现问题请重试');
        ca = false;
        return;
    }*/
    clickParentIfClickable(text('投推荐票').findOne());
    var recommendTicket = textMatches(/拥有\d+主站推荐票/).findOne();
    if (jstime(recommendTicket) > 0) {
        clickParentIfClickable(text('全部').findOne());
        clickParentIfClickable(textMatches(/投\d+票/).findOne());
        console.log('已投票');
    } else {
        console.log('没有推荐票');
        back();
    }
}

//签到
function qdao() {
    log("签到")
    clickParentIfClickable(textStartsWith('签到').findOne())
    var today = new Date();
    var dayOfWeek = today.getDay();
    clickParentIfClickable(text("连签礼包 ").findOne())
    text("连签说明").waitFor()
    do {
        clickParentIfClickable(text("未领取").findOnce())
    } while (text("未领取").exists());
    back()
    waitForActivity('com.qidian.QDReader.ui.activity.QDBrowserActivity')
    text("阅读积分").waitFor()
    var currentPage = currentActivity();
    log("抽奖详情")
    //抽奖
    if (desc("点击抽奖+1").exists()) {
        clickParentIfClickable(desc("点击抽奖+1").findOne())
        do {
            do {
                //点击抽奖
                clickParentIfClickable(desc("抽 奖").findOne())
                while (textMatches(/剩余\d+次/).exists() && !desc("明天再来").exists()) {
                    sleep(500)
                }
                textMatches(/剩余\d+次/).waitFor()
            } while (desc("抽 奖").exists())
            if (desc("明天再来").exists() || desc("明日再来抽奖").exists()) {
                break
            }
            do {
//看视频
                clickParentIfClickable(desc("看视频抽奖喜+1").findOne())
                waitad(currentPage)
                sleep(850)
            } while (desc("看视频抽奖喜+1").exists())
            desc("抽 奖").waitFor()
        } while (true)
    } else if (desc("看视频，得抽奖机会").exists()) {
        clickParentIfClickable(desc("看视频，得抽奖机会").findOne())
        do {
            do {

                clickParentIfClickable(desc("看视频抽奖喜+1").findOne())
                waitad(currentPage)
                sleep(850)
            } while (desc("看视频抽奖喜+1").exists())
            desc("抽 奖").waitFor()
            do {
                clickParentIfClickable(desc("抽 奖").findOne())
                while (textMatches(/剩余\d+次/).exists() && !desc("明天再来").exists()) {
                    sleep(500)
                }
                textMatches(/剩余\d+次/).waitFor()
            } while (desc("抽 奖").exists())
            if (desc("明天再来").exists() || desc("明日再来抽奖").exists()) {
                break
            }
        } while (true)
    }
    //兑换章节卡
    if (dayOfWeek === 0) {
        log("今天是周日");
        back()
        sleep(1000)
        clickParentIfClickable(textStartsWith('签到').findOne())
        //等待加载
        waitForActivity('com.qidian.QDReader.ui.activity.QDBrowserActivity')
        text("阅读积分").waitFor()
        // text("周日兑换章节卡").findOne().parent().click()
        clickParentIfClickable(text("周日兑换章节卡").findOne())
        sleep(500)
        array = text("兑换").find()
        clickParentIfClickable(array[array.length - 1])
        sleep(500)
        array = text("兑换").find()
        // console.log(array.length);
        clickParentIfClickable(array[array.length - 1])
        sleep(1500)
    } else {
        log("今天不是周日");
    }
    back()

}


//精选模块
//激励碎片
function looksp() {
    log('领碎片')
    clickParentIfClickable(text("精选").findOne())
    log('已进入精选')
    clickParentIfClickable(text("新书").findOne())
    log('已进入新书')
    log('点击换一换')
    clickParentIfClickable(text("换一换").findOne())
    sleep(800)
    clickParentIfClickable(id("rootBookLayout").findOne())
    log('已进入小说详细页')
    clickParentIfClickable(textEndsWith("阅读").findOne())
    log('已打开小说')
    waitForActivity("com.qidian.QDReader.ui.activity.QDReaderActivity");
    // sleep(2000)
    // var action
    var currentPage
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
            clickParentIfClickable(text("下一章").findOne())
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
        // var is
        // clickParentIfClickable(text("立即领取").findOne())
        currentPage = currentActivity();
        do {

            log('点击红包')
            clickParentIfClickable(text("红包").findOne())
            log('打开红包')
            // clickParentIfClickable(id("layoutHongbaoRoot").findOne())
            // text("马上抢").waitFor()
            clickParentIfClickable(text("马上抢").findOne())
            //看视频
            waitad(currentPage)
            //领碎片
            log('领碎片')

        } while (clickParentIfClickable(text("立即领取").findOne(3000)) == null)
        /*sleep(500)
        if (id("btnOk").exists()) {
            id("btnOk").findOne().click()
        }*/
        clickParentIfClickable(id("btnOk").findOne(500))
        click(right - 1, centerY);
    }
    log('碎片已领完')
    back()
    clickParentIfClickable(text("取消").findOne(500))
    backHome()

}


//福利中心模块
//看视频
function lookvd() {
    clickParentIfClickable(text("我").findOne())
    waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity')
    clickParentIfClickable(text("我知道了").findOne(1000))
    clickParentIfClickable(text("福利中心").findOne())
    log("等待福利中心加载")
    text("限时彩蛋").waitFor()
//获取当前活动
    var currentPage = currentActivity();
    while (clickParentIfClickable(text("看视频开宝箱").findOnce()) != null) {
        waitad(currentPage)
        clickParentIfClickable(text("我知道了").findOne(500))
    }

    while (clickParentIfClickable(text("看视频领福利").findOnce()) != null && !(text("明日再来吧").exists())) {
        waitad(currentPage)
        clickParentIfClickable(text("我知道了").findOne(500))

    }
    while (clickParentIfClickable(desc("看视频").findOnce()) != null) {
        waitad(currentPage)
        clickParentIfClickable(text("我知道了").findOne(500))
    }
    log('视频已看完')
    log("听书")
    listenToBook()
    log("玩游戏")
    play()
    log("领取奖励")
    getPrize()
    log("碎片兑换")
    buy()
    backHome()

}

//等待广告
function waitad(params) {
    sp++
    log('看视频' + sp + '个')
    log('看广告')
    // 广告时间对象
    var reward
    //等待广告出现
    while (className("android.view.View").depth(4).exists()) {
        sleep(500)
    }
//等待广告时间对象
    reward = textEndsWith("，可获得奖励").findOne(9000)
    if (reward == null) {
        if (params == currentActivity()) {
            console.log('未进入广告页面');
            return
        }
        if (!textMatches(/\d+/).exists()) {
            back()
            sleep(500)
            console.log('广告未加载');
            return
        }
    }
    //等待广告出现
    while (className("android.view.View").depth(4).exists()) {
        sleep(500)
    }
    if (textEndsWith("，可获得奖励").findOnce() == null) {
        back()
        sleep(500)
        console.log('广告未加载');
        return
    }
    //获取关闭坐标
    var gb = text("关闭").findOnce()
    var cross = text("cross").findOnce()
    var tg = text("跳过广告").findOnce()
    // var wz = text("此图片未加标签。打开右上角的“更多选项”菜单即可获取图片说明。").findOnce()
    var zb = null
    if (gb) {
        zb = gb
    } else if (cross) {
        zb = cross
    } else if (tg) {
        zb = tg
    } /*else if (wz) {
        zb = wz
    }*/
    if (zb == null) {
        console.log('获取关闭坐标')
        var video_quit = reward.bounds()
        var x1 = 0;
        var x2 = video_quit.left;
        var y1 = video_quit.top;
        var y2 = video_quit.bottom;
        X = parseInt((x1 + x2) / 2)
        Y = parseInt((y1 + y2) / 2)
        // var nocross = true
    }

    // 获取等待时间
    var time = adtime()
    if (time == null) {
        log('获取不到时间，重新获取')
        log('点击退出')
        do {
            if (zb == null) {
                click(X, Y)
            } else {
                clickParentIfClickable(zb)
            }
            sleep(450)
        } while (!text("继续观看").exists())
        time = adtime()
        clickParentIfClickable(text("继续观看").findOne())
        if (time == null) {
            time = textMatches(/\d+/).findOnce()
            if (time) {
                time = parseInt(time.text())
            }
        }
    }

//等待广告结束
    var num
    if (time) {
        log('等待' + (time + 1) + '秒')
        sleep(1000 * (time + 1))
        num = 0
        do {
            if (zb == null) {
                click(X, Y)
            } else {
                clickParentIfClickable(zb)
            }
            if (clickParentIfClickable(text("继续观看").findOne(550))) {
                sleep(1000)
                num++
                log('等待' + num + '秒')
            }
        } while (textEndsWith("，可获得奖励").exists());
    } else {
//获取不到时间
        log('等待视频结束')
        // clickParentIfClickable(text("继续观看").findOne())
        num = 0
        do {
            num++
            sleep(1000)
            log('等待' + num + '秒')
        } while (textEndsWith("，可获得奖励").exists());
    }
//判断是否还在广告页面
    if (currentActivity() != params) {
        back()
        sleep(500)
    }

    log('广告结束')

}

//兑换
function buy() {
    clickParentIfClickable(desc('更多好礼').findOne())
    text('畅享卡').waitFor()
    var enjoyCard = textStartsWith('7天').findOne().parent().parent()
    var convertibleList = enjoyCard.find(text('兑换'))
    if (convertibleList.length > 0) {
        for (let i = convertibleList.length - 1; i >= 0; i--) {
            clickParentIfClickable(convertibleList[i])
            clickParentIfClickable(text("确认").findOne(2000))
            sleep(500)
        }

    }
    console.log('已兑换')

}

//听书
function listenToBook() {
    var bookV
    var bookVs//集合
    var bookVi//数量
    // let listenTime
    bookV = textContains("当日听书").findOne(1000)
    if (bookV == null) {
        console.log('没有听书')
        return
    }
    // if (textContains("当日玩游戏").findOnce() == null) {
    //      listenTime = jstime(bookVs);
    // }
    bookV = bookV.parent()
    if (clickParentIfClickable(bookV.findOne(text('去完成'))) != null) {
        text("听原创小说").waitFor()
        clickParentIfClickable(id("playIv").findOne())
        sleep(1000 * 10)
        back()
        clickParentIfClickable(id("btnLeft").findOne(500))
        back()
    }
}

//玩游戏
function play() {
    var game
    var games//集合
    var gamei//数量
    game = textContains("当日玩游戏").findOne(1000)
    if (game == null) {
        console.log('没有游戏可玩')
        return
    }
    game = game.parent()
    games = game.children()
    gamei = game.childCount()
    if (games[gamei - 3].child(0)) {
        if (games[gamei - 3].child(0).text() == '去完成') {
            while (true) {
                var pt = playtime()
                // var repetitions = 4
                if (pt) {
                    do {

                        if (!clickParentIfClickable(games[gamei - 3])) {
                            back()
                            clickParentIfClickable(text("游戏中心").findOne())
                        }
                        sleep(500)
                    } while (textContains("当日玩游戏").exists());
                    log("前往游戏中心")
                    textContains("热门").waitFor()
                    textContains("喜欢").waitFor()
                    textContains("推荐").waitFor()
                    if (text("排行").findOne(1000 * 15) == null) {
                        clickParentIfClickable(text("在线玩").findOne())
                    } else {
                        clickParentIfClickable(text("排行").findOne())
                        text("新游榜").waitFor()
                        text("热门榜").waitFor()
                        text("畅销榜").waitFor()
                        clickParentIfClickable(text("在线玩").findOne())
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
                    clickParentIfClickable(text("我").findOne())
                    waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity')
                    // clickParentIfClickable(text("我知道了").findOne(750))
                    clickParentIfClickable(text("福利中心").findOne())
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
        // prizePool[i].click()
        clickParentIfClickable(prizePool[i])
        clickParentIfClickable(text("我知道了").findOne(750))

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
console.hide()
engines.stopAllAndToast()