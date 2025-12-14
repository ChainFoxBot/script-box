/**
 * 線路質量檢測（預設使用 Proxy 策略組）
 */

const targetPolicy = $argument || "Proxy";

// 帶上指定策略去發送請求
function httpGet(url, policyName) {
    return new Promise((resolve, reject) => {
        $httpClient.get({ url, policy: policyName }, (err, resp, data) => {
            if (err) return reject(err);
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                reject(e);
            }
        });
    });
}

(async () => {
    try {
        // 出口 IP：免 token 的 ipinfo
        const outbound = await httpGet("https://ipinfo.io/json", targetPolicy);
        const outIP = outbound?.ip || "未知";
        const outGeo = `${outbound?.country || ""} ${outbound?.region || ""} ${outbound?.city || ""}`.trim();
        const outOrg = outbound?.org || "";

        // 入口 IP：免 key 的 ip.sb geoip
        const inbound = await httpGet("https://api.ip.sb/geoip", targetPolicy);
        const inIP = inbound?.ip || "未知";
        const inGeo = `${inbound?.country || ""} ${inbound?.region || ""} ${inbound?.city || ""}`.trim();
        const inISP = `${inbound?.asn || ""} ${inbound?.isp || ""}`.trim();

        const contentLines = [
            `測試策略：${targetPolicy}`,
            `出口 IP：${outIP}`,
            `出口地理：${outGeo}`,
            `出口 ASN/ISP：${outOrg}`,
            `入口 IP：${inIP}`,
            `入口地理：${inGeo}`,
            `入口 ASN/ISP：${inISP}`
        ];

        $done({
            title: "線路質量檢測",
            content: contentLines.join("\n"),
            icon: "shield.lefthalf.fill",
            "icon-color": "#0066CC"
        });
    } catch (err) {
        $done({
            title: "線路質量檢測 - 錯誤",
            content: String(err),
            icon: "exclamationmark.triangle.fill",
            "icon-color": "#FF0000"
        });
    }
})();
