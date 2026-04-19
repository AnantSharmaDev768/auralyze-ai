# 🌌 Zenith Auralyze AI 
> **DSP Control Surface for Windows.** A React/Electron-based interface for system-wide audio virtualization and frequency-domain manipulation.

---

## 🏗️ Technical Architecture & Signal Path
Zenith acts as a high-level **Control Surface** that interfaces with the Windows audio pipeline via a kernel-level APO bridge.

### 🔊 Signal Flow
1. **Intercept:** System-wide PCM streams are intercepted at the driver level via **Equalizer APO**.
2. **Logic Layer:** The Electron main process manages real-time parameter injection into the APO configuration.
3. **Processing:** 32-bit Floating Point (IEEE 754) internal depth to preserve dynamic range and prevent digital clipping.
4. **Virtualization:** HRTF-based spatial mapping and frequency-masking algorithms.



---

## 📸 Interface Showcase
<p align="center">
  <img src="https://github.com/user-attachments/assets/97633a84-3de9-42d0-b84e-ae04e5671d9d" width="45%" />
  <img src="https://github.com/user-attachments/assets/7f62a9a7-2b9f-4d7a-ba12-74fed9077ec6" width="45%" />
</p>

---

## 💎 Key Features
- **Spatial Virtualization:** Simulates a 3D soundstage using proprietary HRTF-inspired filters.
- **APO Bridge:** Seamlessly links with the system audio engine for zero-latency parameter updates.
- **Dynamic EQ Mesh:** Real-time visual frequency analysis with a 32-bit float pipeline.
- **Calibrated Presets:** Pre-configured frequency signatures for Cinema, Gaming, and Monitoring.

## ⚙️ Development Note
This project is an open-source learning exercise by a 2nd-year engineering student. It focuses on exploring the intersection of modern web UI (Electron/React) and low-level Windows audio processing.

---
**Developed by Anant Kumar Sharma | CSE @ VIT Vellore**
