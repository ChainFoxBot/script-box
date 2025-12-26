/**
 * 晚高峰自動切換腳本 (18:00 - 01:00)
 */


/**
 * 晚高峰自動切換腳本 (18:00 - 01:00)
 */

const now = new Date();
const hour = now.getHours();

// 定義晚高峰：18:00 之後 或 01:00 之前
// (18, 19, 20, 21, 22, 23, 0) 這些小時會觸發
const isPeakTime = (hour > 17 || hour < 2);

// 配置你的策略組名稱和節點名稱
const groupName = "PikPak"; // 策略組名稱
const peakNode = "Proxy";   // 高峰期使用的節點
const normalNode = "LowCost"; // 平時使用的節點

if (isPeakTime) {
    $surge.setSelectGroupPolicy(groupName, peakNode);
    $notification.post("Surge 晚高峰模式", "當前時間：" + hour + "點", "已自動切換至【高性能節點】");
} else {
    $surge.setSelectGroupPolicy(groupName, normalNode);
    $notification.post("Surge 常規模式", "當前時間：" + hour + "點", "已恢復至【普通節點】");
}

$done();

