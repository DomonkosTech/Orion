export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
export const wbsocket = import.meta.env.PROD
  ? `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/ws/`
  : "ws://localhost:4000";
