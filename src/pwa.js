import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New version available. Reload now?")) updateSW(true);
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});
