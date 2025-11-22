export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

export function getApiUrl (path: string): string {
    return `${API_URL}${path}`;
}

export function getWebSocketUrl (path: string): string {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = new URL(API_URL).host;
    return `${protocol}//${host}${path}`;
}
