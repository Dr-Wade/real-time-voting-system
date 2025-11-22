import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import axios from "../config/axios";
import { isAxiosError } from "axios";

interface EventFormState {
    name: string
    type: string
}

interface Message {
    text: string
    type: "success" | "error"
}

interface Event {
    id: string
    name: string
    type: string
    active: boolean
    activePollId: string | null
    createdAt: string
    updatedAt: string
    activePoll?: {
        id: string
        title: string
    }
    polls?: Array<{
        id: string
        title: string
    }>
}

export const useEvents = defineStore("events", () => {
    const form = reactive<EventFormState>({
        name: "",
        type: ""
    });

    const message = reactive<Message>({
        text: "",
        type: "success"
    });

    const isLoading = ref(false);
    const isFetchingEvents = ref(false);

    const list = ref<Event[]>([]);
    const selected = ref<Event | null>(null);

    const resetForm = (): void => {
        form.name = "";
        form.type = "";
        message.text = "";
    };

    const fetchEvents = async (): Promise<void> => {
        isFetchingEvents.value = true;
        try {
            const response = await axios.get("/events");
            list.value = response.data.events || [];
        } catch (err: unknown) {
            console.error("Failed to fetch events:", err);
            message.text = "Failed to fetch events";
            message.type = "error";
        } finally {
            isFetchingEvents.value = false;
        }
    };

    const fetchEventById = async (eventId: string): Promise<Event | null> => {
        try {
            const response = await axios.get(`/events/${eventId}`);
            selected.value = response.data.event;
            return response.data.event;
        } catch (err: unknown) {
            console.error("Failed to fetch event:", err);
            message.text = "Failed to fetch event";
            message.type = "error";
            return null;
        }
    };

    const createEvent = async (): Promise<void> => {
        if (!form.name.trim()) {
            message.text = "Please enter an event name";
            message.type = "error";
            return;
        }

        if (!form.type.trim()) {
            message.text = "Please enter an event type";
            message.type = "error";
            return;
        }

        isLoading.value = true;
        message.text = "";

        try {
            const response = await axios.post("/events", {
                name: form.name,
                type: form.type
            });

            message.text = `Event "${form.name}" created successfully!`;
            message.type = "success";
            resetForm();

            await fetchEvents();

            setTimeout(() => {
                message.text = "";
            }, 3000);
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                message.text = (err.response?.data as Record<string, unknown>)?.message as string || "Failed to create event";
            } else {
                message.text = "An unexpected error occurred";
            }
            message.type = "error";
        } finally {
            isLoading.value = false;
        }
    };

    const deleteEvent = async (eventId: string): Promise<void> => {
        try {
            await axios.delete(`/events/${eventId}`);
            message.text = "Event deleted successfully!";
            message.type = "success";
            await fetchEvents();

            setTimeout(() => {
                message.text = "";
            }, 3000);
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                message.text = (err.response?.data as Record<string, unknown>)?.message as string || "Failed to delete event";
            } else {
                message.text = "An unexpected error occurred";
            }
            message.type = "error";
        }
    };

    const toggleEventActive = async (eventId: string): Promise<void> => {
        try {
            const event = selected.value;
            if (!event) return;

            const response = await axios.patch(`/events/${eventId}`, {
                active: !event.active
            });

            selected.value = response.data.event;
            message.text = `Event ${response.data.event.active ? "activated" : "deactivated"}!`;
            message.type = "success";

            await fetchEvents();

            setTimeout(() => {
                message.text = "";
            }, 2000);
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                message.text = (err.response?.data as Record<string, unknown>)?.message as string || "Failed to toggle event";
            } else {
                message.text = "An unexpected error occurred";
            }
            message.type = "error";
        }
    };

    const setActivePoll = async (eventId: string, pollId: string): Promise<void> => {
        try {
            const response = await axios.patch(`/events/${eventId}`, {
                activePollId: pollId
            });

            selected.value = response.data.event;
            message.text = "Active poll updated!";
            message.type = "success";

            setTimeout(() => {
                message.text = "";
            }, 2000);
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                message.text = (err.response?.data as Record<string, unknown>)?.message as string || "Failed to set active poll";
            } else {
                message.text = "An unexpected error occurred";
            }
            message.type = "error";
        }
    };

    const clearActivePoll = async (eventId: string): Promise<void> => {
        try {
            const response = await axios.patch(`/events/${eventId}`, {
                activePollId: null
            });

            selected.value = response.data.event;
            message.text = "Active poll cleared!";
            message.type = "success";

            setTimeout(() => {
                message.text = "";
            }, 2000);
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                message.text = (err.response?.data as Record<string, unknown>)?.message as string || "Failed to clear active poll";
            } else {
                message.text = "An unexpected error occurred";
            }
            message.type = "error";
        }
    };

    return {
        form,
        message,
        isLoading,
        isFetchingEvents,
        list,
        selected,
        resetForm,
        fetchEvents,
        fetchEventById,
        createEvent,
        deleteEvent,
        toggleEventActive,
        setActivePoll,
        clearActivePoll
    };
});
