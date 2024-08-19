const token = PropertiesService.getScriptProperties().getProperty("token");
const client_secret = PropertiesService.getScriptProperties().getProperty("client_secret");
const meter_id = PropertiesService.getScriptProperties().getProperty("meter_id");
const webhook_url = PropertiesService.getScriptProperties().getProperty("webhook_url");

function main() {
  while(true) {
    let now = new Date();
    if ((now.getMinutes() % 5) === 0) {
      const t = now.getTime();
      const nonce = Utilities.getUuid();

      let options = {
        "headers": {
          "Authorization": token,
          "charset": "utf8",
          "Content-Type": "application/json",
          "nonce": nonce,
          "sign": Utilities.base64Encode(Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256, token+t+nonce, client_secret)),
          "t": String(t)
        },
        "method": "get"
      };

      const response = UrlFetchApp.fetch(`https://api.switch-bot.com/v1.1/devices/${meter_id}/status`, options);
      
      const status = JSON.parse(response.getContentText()).body;
      const payload = {
        "embeds": [
          {
            "title": "温湿度計",
            "description": `バッテリー残量: ${status.battery}％`,
            "timestamp": now.toISOString(),
            "color": 14694714,
            "fields": [
              {
                "name": "温度",
                "value": `${status.temperature}℃`,
                "inline": true
              },
              {
                "name": "湿度",
                "value": `${status.humidity}％`,
                "inline": true
              }
            ]
          }
        ]
      };

      options = {
        "contentType": "application/json",
        "method": "post",
        "payload": JSON.stringify(payload)
      }

      UrlFetchApp.fetch(webhook_url, options);
      break;
    }
    else {
      Utilities.sleep(50000);
      now = new Date();
    }
  }
}