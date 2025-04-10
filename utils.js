/**
 * @file utils.js
 * @description 工具函数模块
 * 
 * 提供基础工具函数，包括：
 * 1. 文本处理：从文本中提取数字
 * 2. 坐标处理：获取控件中心坐标
 * 3. 点击操作：点击控件中心、递归查找可点击控件
 * 4. 页面导航：返回首页
 * 5. 计时功能：倒计时显示
 * 
 * @exports {Object} 导出工具函数对象
 * @exports {Function} jstime - 从文本中提取数字
 * @exports {Function} getXy - 获取控件中心坐标
 * @exports {Function} clickCenter - 点击控件中心
 * @exports {Function} backHome - 返回首页
 * @exports {Function} clickParentIfClickable - 递归查找可点击的父控件并点击
 * @exports {Function} longClickParentIfClickable - 递归查找可长按的父控件并长按
 * @exports {Function} startCountdown - 倒计时功能
 */

// 提取数字
function jstime(textObj) {
    if (textObj == null) {
        return null
    }
    // 存储初始文本内容
    var initText = textObj.text();
    // log(initText)
    //获取时间
    var match = initText.match(/\d+/g);
    return match ? parseInt(match[0]) : null;
}

// 提取坐标中心
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

// 点击坐标中心
function clickCenter(params) {
    var center = getXy(params);
    if (center == null) {
        console.log('没找到')
        return
    }
    click(center.centerX, center.centerY);
    console.log('点击坐标')
}

// 返回首页
function backHome(params) {
    do {
        back()
    } while (id("normal").findOne(500) == null)
    console.log('已到主界面');
}

// 递归查找可点击的父控件并点击
function clickParentIfClickable(widget) {
    if (InitialValue == null) {
        InitialValue = widget
    }
    if (widget === null) {
        console.log('找不到');
        InitialValue = null
        return null;
    }
    if (widget.click()) {
        console.log('已点击');
        InitialValue = null
        return true;
    }
    var parentWidget = widget.parent();
    if (parentWidget === null) {
        console.log('不可点击');
        clickCenter(InitialValue)
        InitialValue = null
        return false;
    }
    return clickParentIfClickable(parentWidget);
}

// 递归查找可长按的父控件并长按
function longClickParentIfClickable(widget) {
    if (widget === null) {
        console.log('找不到');
        return null;
    }
    if (widget.longClick()) {
        console.log('已长按');
        return true;
    }
    var parentWidget = widget.parent();
    if (parentWidget === null) {
        console.log('不可长按');
        return false
    }
    return longClickParentIfClickable(parentWidget);
}

// 倒计时
function startCountdown(minutes) {
    var count = minutes * 60;
    var remainingMinutes
    var remainingSeconds
    for (var i = count; i >= 0; i--) {
        remainingMinutes = Math.floor(i / 60);
        remainingSeconds = i % 60;
        console.clear()
        if (i > 60) {
            log("倒计时还剩 " + remainingMinutes + " 分钟 " + remainingSeconds + " 秒 ");
        }
        if (i <= 60) {
            log("倒计时还剩 " + i + " 秒");
        }
        sleep(1000);
        device.wakeUpIfNeeded();
    }
    console.clear()
    log("倒计时已结束");
}

module.exports = {
    jstime,
    getXy,
    clickCenter,
    backHome,
    clickParentIfClickable,
    longClickParentIfClickable,
    startCountdown
}; 