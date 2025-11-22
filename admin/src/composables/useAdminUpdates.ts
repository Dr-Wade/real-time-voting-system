import { ref, onMounted, onUnmounted } from "vue";
import { getWebSocketUrl } from "../config/api";

interface AdminMessage {
    type: "event_updated" | "event_activated" | "event_deactivated" | "poll_activated" | "poll_created" | "poll_updated"
    eventId: string
    data: Record<string, unknown>
}

export function useAdminUpdates (eventId: string) {
    const socket = ref<WebSocket | null>(null);
    const isConnected = ref(false);
    const lastMessage = ref<AdminMessage | null>(null);

    const connect = () => {
        if (socket.value) {
            return;
        }

        const url = getWebSocketUrl(`/admin/events/${eventId}/updates`);

        socket.value = new WebSocket(url);

        socket.value.onopen = () => {
            isConnected.value = true;
            console.log("Connected to admin updates WebSocket");
        };

        socket.value.onmessage = event => {
            try {
                const message: AdminMessage = JSON.parse(event.data);
                lastMessage.value = message;
                console.log("Received admin update:", message);
            } catch (error) {
                console.error("Failed to parse admin message:", error);
            }
        };

        socket.value.onerror = error => {
            console.error("WebSocket error:", error);
            isConnected.value = false;
        };

        socket.value.onclose = () => {
            isConnected.value = false;
            console.log("Disconnected from admin updates WebSocket");
        };
    };

    const disconnect = () => {
        if (socket.value) {
            socket.value.close();
            socket.value = null;
            isConnected.value = false;
        }
    };

    onMounted(() => {
        connect();
    });

    onUnmounted(() => {
        disconnect();
    });

    return {
        socket,
        isConnected,
        lastMessage,
        connect,
        disconnect,
    };
}
