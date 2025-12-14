/**
 * Surge Panel：顯示 IP 風險分數、類型、入口/出口 IP 與代理策略
 * - 改為在面板中顯示（僅手動打開/刷新面板才執行）
 * - 需自行填寫 ipinfo & ipregistry 的 key
 */

const ipinfoToken = "YOUR_IPINFO_TOKEN";           // ipinfo.io token
const ipregistryKey = "YOUR_IPREGISTRY_KEY";       // ipregistry.co key

; (async () => {
    try {
        // 1) 當前策略（不同 Surge 版本可能略有差異）
        // 若無法取得，可先保留或自行查閱 Surge 日誌、官網文檔。
        let policy = $surge?.select || "未知策略";

        // 2) 出口 IP (示例使用 ipinfo)
        let outboundUrl = `https://ipinfo.io/json?token=${ipinfoToken}`;
        let outbound = await httpGet(outboundUrl);
        let outIP = outbound?.ip || "未知";
        let outCountry = outbound?.country || "";
        let outRegion = outbound?.region || "";
        let outCity = outbound?.city || "";
        let outOrg = outbound?.org || "";
        let outGeo = `${outCountry} ${outRegion} ${outCity}`.trim();

        // 3) 入口 IP (示例使用 ipregistry)
        // 可能與出口相同，若需真實本機 IP 需配合服務端或自建 API。
        let inboundUrl = `https://api.ipregistry.co/?key=${ipregistryKey}`;
        let inbound = await httpGet(inboundUrl);
        let inIP = inbound?.ip || "未知";
        let inCountry = inbound?.location?.country?.name || "";
        let inRegion = inbound?.location?.region?.name || "";
        let inCity = inbound?.location?.city || "";
        let inOrg = inbound?.connection?.organization || "";
        let inASN = inbound?.connection?.asn || "";
        let ipType = inbound?.connection?.type || "未知"; // dataCenter / residential / etc.
        let riskScore = inbound?.security?.threat_score ?? "未知";
        let riskLevel = inbound?.security?.is_threat ? "高" : "低";

        let contentLines = [
            `代理策略：${policy}`,
            `出口 IP：${outIP}`,
            `出口地理：${outGeo}`,
            `出口 ASN/ISP：${outOrg}`,
            `入口 IP：${inIP}`,
            `入口地理：${inCountry} ${inRegion} ${inCity}`.trim(),
            `入口 ASN/ISP：${inASN}`,
            `IP 類型：${ipType}`,
            `風險評分：${riskScore} (${riskLevel})`
        ];

        $done({
            title: "IP 風險 & 地理資訊",
            content: contentLines.join("\n"),
            icon: "shield.lefthalf.fill",
            "icon-color": "#0066CC"
        });
    } catch (err) {
        $done({
            title: "IP 信息腳本錯誤",
            content: String(err),
            icon: "exclamationmark.triangle.fill",
            "icon-color": "#FF0000"
        });
    }
})();

function httpGet(url) {
    return new Promise((resolve, reject) => {
        $httpClient.get(url, (error, response, data) => {
            if (error) {
                return reject(error);
            }
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                reject(e);
            }
        });
    });
}
