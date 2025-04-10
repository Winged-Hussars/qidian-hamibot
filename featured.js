/**
 * @file featured.js
 * @description 精选模块功能
 * 
 * 提供起点APP精选模块相关功能，包括：
 * 1. 领取激励碎片：通过阅读新书获取红包奖励
 * 2. 红包处理：查找、打开、领取红包
 * 
 * @requires utils.js
 * 
 * @exports {Object} 导出精选模块功能对象
 * @exports {Function} looksp - 领取激励碎片功能
 */

const utils = require('./utils');

// 激励碎片
function looksp() {
    log('领碎片')
    utils.clickParentIfClickable(text("精选").findOne())
    log('已进入精选')
    utils.clickParentIfClickable(text("新书").findOne())
    log('已进入新书')
    log('点击换一换')
    utils.clickParentIfClickable(text("换一换").findOne())
    sleep(800)
    utils.clickParentIfClickable(id("rootBookLayout").findOne())
    log('已进入小说详细页')
    utils.clickParentIfClickable(textEndsWith("阅读").findOne())
    log('已打开小说')
    waitForActivity("com.qidian.QDReader.ui.activity.QDReaderActivity");
    
    while (true) {
        do {
            log('找红包位置')
            while (true) {
                do {
                    click(right - 1, centerY);
                } while (id("tag").exists())
                click(centerX, centerY);
                log('点击屏幕')
                sleep(700)
                if (text("听书").exists()) {
                    break
                }
                if (text("粉丝值说明").exists() || text("全部").exists() || textMatches(/书友圈\d+书友正在讨论/).exists() || text("快去参与讨论").exists()) {
                    back()
                    sleep(1000)
                } else if (text("发表").exists()) {
                    back()
                    back()
                    sleep(1000)
                }
            }
            utils.clickParentIfClickable(text("下一章").findOne())
            click(1, centerY);
            click(1, centerY);
            sleep(800)
        } while (!textEndsWith("红包").exists())
        log('红包位置已找到')
        if (textStartsWith("0个").exists()) {
            log('没有红包')
            break
        }
        do {
            log('点击红包')
            utils.clickParentIfClickable(textEndsWith("红包").findOne())
            log('打开红包')
            text("红包广场").waitFor()
            sleep(1000)
            if (text("当前章节暂无红包").exists()) {
                break
            }
            text("马上抢").waitFor()
            utils.clickParentIfClickable(text("马上抢").findOne())
            waitad()
            log('领碎片')
        } while (utils.clickParentIfClickable(text("立即领取").findOne(3000)) == null)
        utils.clickParentIfClickable(id("btnOk").findOne(500))
        do {
            click(right - 1, centerY);
        } while (text("红包").exists() || id("tag").exists())
    }
    log('碎片已领完')
    back()
    utils.clickParentIfClickable(text("取消").findOne(500))
    utils.backHome()
}

module.exports = {
    looksp
}; 