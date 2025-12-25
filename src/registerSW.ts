import { registerSW } from "virtual:pwa-register";

let updateIntervalId: number | undefined;

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload to update?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    if (import.meta.env.DEV) {
      console.log("App ready to work offline");
    }
  },
  onRegisteredSW(swUrl, registration) {
    if (import.meta.env.DEV) {
      console.log("Service Worker registered:", swUrl);
    }
    
    // Clear any existing interval before creating a new one
    if (updateIntervalId) {
      clearInterval(updateIntervalId);
    }
    
    // Check for updates every hour
    if (registration) {
      updateIntervalId = window.setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // 1 hour
    }
  },
  onRegisterError(error) {
    console.error("SW registration error:", error);
  },
});

// Cleanup function for when the module is hot-reloaded
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (updateIntervalId) {
      clearInterval(updateIntervalId);
    }
  });
}

export default updateSW;
