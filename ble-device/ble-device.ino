#include <BLE2902.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define BUTTON_PRESS_CHAR_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

#define BUTTON_PIN 11

#define LED_PIN 5

BLEServer* pServer                  = NULL;
BLECharacteristic* pButtonPressChar = NULL;

bool deviceConnected    = false;
bool oldDeviceConnected = false;
bool lastButtonState    = HIGH;
bool dirty              = 0;

rmt_data_t led_data[24];

class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("Client connected");
  };

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("Client disconnected");
  }
};

void setLED(uint8_t r, uint8_t g, uint8_t b) {
  uint8_t pixels[3] = { g, r, b };

  int i = 0;
  for (int byte_idx = 0; byte_idx < 3; byte_idx++) {
    for (int bit = 0; bit < 8; bit++) {
      if (pixels[byte_idx] & (1 << (7 - bit))) {
        // Send '1' bit: 800ns high, 400ns low
        led_data[i].level0    = 1;
        led_data[i].duration0 = 8;
        led_data[i].level1    = 0;
        led_data[i].duration1 = 4;
      } else {
        // Send '0' bit: 400ns high, 800ns low
        led_data[i].level0    = 1;
        led_data[i].duration0 = 4;
        led_data[i].level1    = 0;
        led_data[i].duration1 = 8;
      }
      i++;
    }
  }

  rmtWrite(LED_PIN, led_data, 24, RMT_WAIT_FOR_EVER);
}

void setup() {
  Serial.begin(115200);

  pinMode(BUTTON_PIN, INPUT_PULLUP);

  if (!rmtInit(LED_PIN, RMT_TX_MODE, RMT_MEM_NUM_BLOCKS_1, 10000000)) {
    Serial.println("RMT init failed!");
    while (1) {}
  }
  setLED(50, 0, 0);
  rmtDeinit(LED_PIN);

  Serial.println("Starting BLE Scanner Server...");

  BLEDevice::init("ValentineScanner");
  BLEDevice::setMTU(128);

  // Create BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create BLE Service
  BLEService* pService = pServer->createService(SERVICE_UUID);

  // Temperature Characteristic (READ + NOTIFY)
  pButtonPressChar = pService->createCharacteristic(
    BUTTON_PRESS_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pButtonPressChar->addDescriptor(new BLE2902());

  pService->start();

  // Start advertising
  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinInterval(0x20);
  pAdvertising->setMaxInterval(0x40);
  BLEDevice::startAdvertising();

  Serial.println("BLE Server is now advertising...");
  Serial.println("Press button to proceed scan");
}

void loop() {
  bool buttonState = digitalRead(BUTTON_PIN);

  static unsigned long lastButtonPressMs = 0;
  if (lastButtonState == LOW && buttonState == HIGH && deviceConnected) {
    lastButtonPressMs = millis();
    pButtonPressChar->setValue((uint8_t*) &buttonState, 1);
    pButtonPressChar->notify();
    dirty = 1;
  }

  lastButtonState = buttonState;

  if (dirty && millis() - lastButtonPressMs > 500) {
    dirty = 0;

    pButtonPressChar->setValue((uint8_t*) &buttonState, 0);
  }

  // Handle disconnection
  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    pServer->startAdvertising();
    Serial.println("Start advertising again");
    oldDeviceConnected = deviceConnected;
  }

  // Handle connection
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }
}
