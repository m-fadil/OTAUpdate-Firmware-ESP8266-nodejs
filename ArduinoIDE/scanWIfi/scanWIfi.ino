#include <ESP8266WiFi.h>

void setup() {
  Serial.begin(115200);

  // Mulai WiFi mode pemindaian
  WiFi.mode(WIFI_STA);
  
  // Mulai pemindaian WiFi
  Serial.println("Memulai pemindaian WiFi...");
  int networksFound = WiFi.scanNetworks();

  // Cek apakah ada jaringan WiFi yang ditemukan
  if (networksFound == 0) {
    Serial.println("Tidak ada jaringan WiFi yang ditemukan.");
  } else {
    Serial.printf("%d jaringan WiFi ditemukan:\n", networksFound);
    // Tampilkan informasi setiap jaringan WiFi yang ditemukan
    for (int i = 0; i < networksFound; ++i) {
      Serial.printf("%d: %s (Signal: %d dBm)\n", i + 1, WiFi.SSID(i).c_str(), WiFi.RSSI(i));
    }
  }
}

void loop() {
  // Tidak ada tindakan di loop
}
