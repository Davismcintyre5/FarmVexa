#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// ==================== CONFIG ====================
const char* ssid = "YourWiFiName";
const char* password = "YourWiFiPassword";

const char* serverUrl = "https://farmvexaserver.pxxl.click/api/internal/sensors/ingest";
const char* apiKey = "bdf426c0a147ab235c0d9e045eb6be6d3480d856adf662198917b210adb02a0e";

// ⚠️ CHANGE THIS PER DEVICE:
// Field DHT:    "ESP32_FIELD_01"
// Storage DHT:  "ESP32_STORAGE_01"
// Storage CO2:  "ESP32_STORAGE_CO2_01"
// Storage PIR:  "ESP32_STORAGE_PIR_01"
const char* deviceId = "ESP32_FIELD_01";

// ==================== PINS ====================
#define DHTPIN 4
#define DHTTYPE DHT22
#define SOIL_PIN 34
#define LIGHT_PIN 35
#define RAIN_PIN 32

// Storage sensors (optional — comment out if not used)
#define CO2_PIN 33       // Analog pin for CO2
#define PIR_PIN 14       // Digital pin for PIR motion

// ==================== OBJECTS ====================
DHT dht(DHTPIN, DHTTYPE);

// ==================== INTERVAL ====================
const unsigned long interval = 60000;  // 60 seconds
unsigned long lastTime = 0;

// PIR debounce
unsigned long lastPirTrigger = 0;
const unsigned long pirCooldown = 300000;  // 5 min between PIR triggers

// ==================== SETUP ====================
void setup() {
    Serial.begin(115200);
    dht.begin();
    pinMode(PIR_PIN, INPUT);

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

    checkPirMotion();
}

// ==================== CHECK PIR MOTION ====================
void checkPirMotion() {
    int pirState = digitalRead(PIR_PIN);
    
    if (pirState == HIGH) {
        if (millis() - lastPirTrigger >= pirCooldown) {
            lastPirTrigger = millis();
            Serial.println("🐀 Motion detected!");
            sendMotionAlert();
        }
    }
}

// ==================== SEND MOTION ALERT ====================
void sendMotionAlert() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("x-api-key", apiKey);

        String json = "{";
        json += "\"deviceId\":\"" + String(deviceId) + "\",";
        json += "\"motion\":true";
        json += "}";

        int code = http.POST(json);
        http.end();

        if (code == 200 || code == 201) {
            Serial.println("✅ Motion alert sent");
        } else {
            Serial.printf("❌ Server returned: %d\n", code);
        }
    }
}

// ==================== READ & SEND SENSORS ====================
void sendSensorData() {
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();

    if (isnan(temp) || isnan(hum)) {
        Serial.println("⚠️ DHT read failed");
        return;
    }

    String json = "{";
    json += "\"deviceId\":\"" + String(deviceId) + "\",";
    json += "\"temperature\":" + String(temp, 1) + ",";
    json += "\"humidity\":" + String(hum, 0);

    // Soil + Light + Rain (only for field devices)
    if (String(deviceId).indexOf("FIELD") >= 0) {
        int soilRaw = analogRead(SOIL_PIN);
        int soilMoisture = map(soilRaw, 4095, 1500, 0, 100);
        soilMoisture = constrain(soilMoisture, 0, 100);

        int lightRaw = analogRead(LIGHT_PIN);
        int lightLevel = map(lightRaw, 0, 4095, 0, 100);
        lightLevel = constrain(lightLevel, 0, 100);

        int rainRaw = analogRead(RAIN_PIN);
        int rainLevel = map(rainRaw, 0, 4095, 100, 0);
        rainLevel = constrain(rainLevel, 0, 100);

        json += ",\"soilMoisture\":" + String(soilMoisture);
        json += ",\"lightLevel\":" + String(lightLevel);
        json += ",\"rainLevel\":" + String(rainLevel);
    }

    // CO2 (only for CO2 devices)
    if (String(deviceId).indexOf("CO2") >= 0) {
        int co2Raw = analogRead(CO2_PIN);
        int co2Ppm = map(co2Raw, 0, 4095, 400, 5000);
        co2Ppm = constrain(co2Ppm, 400, 5000);
        json += ",\"co2\":" + String(co2Ppm);
    }

    json += "}";

    Serial.println("📡 Sending sensor data...");
    Serial.println("  " + json);

    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("x-api-key", apiKey);

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