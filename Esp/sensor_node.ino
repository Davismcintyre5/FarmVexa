#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// ==================== CONFIG ====================
const char* ssid = "YourWiFiName";
const char* password = "YourWiFiPassword";

const char* serverUrl = "http://192.168.1.100:5000/api/internal/sensors/ingest";
const char* apiKey = "farmvexa_shared_secret_key_here";
const char* deviceId = "ESP32_FIELD_01";

// ==================== PINS ====================
#define DHTPIN 4
#define DHTTYPE DHT22
#define SOIL_PIN 34
#define LIGHT_PIN 35
#define RAIN_PIN 32

// ==================== OBJECTS ====================
DHT dht(DHTPIN, DHTTYPE);

// ==================== INTERVAL ====================
const unsigned long interval = 60000;  // 60 seconds
unsigned long lastTime = 0;

// ==================== SETUP ====================
void setup() {
    Serial.begin(115200);
    dht.begin();

    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(1000);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n✅ WiFi Connected");
        Serial.print("IP: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\n❌ WiFi Failed. Restarting...");
        ESP.restart();
    }
}

// ==================== LOOP ====================
void loop() {
    if (millis() - lastTime >= interval) {
        lastTime = millis();
        sendSensorData();
    }
}

// ==================== READ SENSORS ====================
void sendSensorData() {
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();

    if (isnan(temp) || isnan(hum)) {
        Serial.println("⚠️ DHT read failed");
        return;
    }

    int soilRaw = analogRead(SOIL_PIN);
    int soilMoisture = map(soilRaw, 4095, 1500, 0, 100);
    soilMoisture = constrain(soilMoisture, 0, 100);

    int lightRaw = analogRead(LIGHT_PIN);
    int lightLevel = map(lightRaw, 0, 4095, 0, 100);
    lightLevel = constrain(lightLevel, 0, 100);

    int rainRaw = analogRead(RAIN_PIN);
    int rainLevel = map(rainRaw, 0, 4095, 100, 0);
    rainLevel = constrain(rainLevel, 0, 100);

    Serial.println("📡 Sending sensor data...");
    Serial.printf("  Temp: %.1f°C | Hum: %.0f%% | Soil: %d%% | Light: %d%% | Rain: %d%%\n",
                  temp, hum, soilMoisture, lightLevel, rainLevel);

    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("x-api-key", apiKey);

        String json = "{";
        json += "\"deviceId\":\"" + String(deviceId) + "\",";
        json += "\"temperature\":" + String(temp, 1) + ",";
        json += "\"humidity\":" + String(hum, 0) + ",";
        json += "\"soilMoisture\":" + String(soilMoisture) + ",";
        json += "\"lightLevel\":" + String(lightLevel);
        json += "}";

        int code = http.POST(json);
        http.end();

        if (code == 200 || code == 201) {
            Serial.println("✅ Data sent successfully");
        } else {
            Serial.printf("❌ Server returned: %d\n", code);
        }
    } else {
        Serial.println("❌ WiFi disconnected. Reconnecting...");
        WiFi.reconnect();
    }
}