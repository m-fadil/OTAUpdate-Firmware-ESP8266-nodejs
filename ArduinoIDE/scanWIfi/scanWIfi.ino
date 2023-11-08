#include <ESP8266WiFi.h>

const char* ssid = "DESKTOP";
const char* password = "K7o75*12";

void setup() {
  Serial.begin(115200);
  delay(10);

  // Menghubungkan ke jaringan Wi-Fi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print("Koneksi ke Wi-Fi dengan ssid ");
    Serial.println(ssid);
  }

  Serial.println("Terhubung ke Wi-Fi");
}

void loop() {
  // Kode aplikasi Anda
}
