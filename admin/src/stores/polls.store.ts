import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import axios from "../config/axios";
import { isAxiosError } from "axios";

interface FormState {
    title: string
    options: string[]
}

interface Message {
    text: string
    type: "success" | "error"
}

interface Stats {
    totalPolls: number
    activePolls: number
}

interface Poll {
    id: string
    title: string
    options: Array<{
        id: string
        title: string
        score: number
    }>
}

export const usePolls = defineStore("polls", () => {
    const form = reactive<FormState>({
        title: "",
        options: ["", ""]
    });

    const message = reactive<Message>({
        text: "",
        type: "success"
    });

    const isLoading = ref(false);
    const isFetchingPolls = ref(false);

    const stats = reactive<Stats>({
        totalPolls: 0,
        activePolls: 0
    });

    const list = ref<Poll[]>([]);
    const selected = ref<string | null>(null);
    const currentView = ref<"create" | "edit">("create");
    const currentEventId = ref<string | null>(null);

    const addOption = (): void => {
        form.options.push("");
    };

    const removeOption = (index: number): void => {
        form.options.splice(index, 1);
    };

    const resetForm = (): void => {
        form.title = "";
        form.options = ["", ""];
        message.text = "";
    };

    const fetchPolls = async (): Promise<void> => {
        if (!currentEventId.value) {
            console.error("No event ID set");
            return;
        }

        isFetchingPolls.value = true;
        try {
            const response = await axios.get(`/events/${currentEventId.value}/polls`);
            list.value = response.data.polls || [];
            stats.totalPolls = list.value.length;
            stats.activePolls = list.value.length;
        } catch (err: unknown) {
            console.error("Failed to fetch polls:", err);
            message.text = "Failed to fetch polls";
            message.type = "error";
        } finally {
            isFetchingPolls.value = false;
        }
    };

    const selectPoll = (pollId: string): void => {
        selected.value = pollId;
        currentView.value = "edit";
        const selectedPoll = list.value.find(p => p.id === pollId);
        if (selectedPoll) {
            form.title = selectedPoll.title;
            form.options = selectedPoll.options.map(opt => opt.title);
        }
    };

    const goToCreate = (): void => {
        selected.value = null;
        currentView.value = "create";
        resetForm();
    };

    const upsertPoll = async (): Promise<void> => {
        if (!form.title.trim()) {
            message.text = "Please enter a poll title";
            message.type = "error";
            return;
        }

        const validOptions = form.options.filter((opt: string) => opt.trim());
        if (validOptions.length < 2) {
            message.text = "Please provide at least 2 options";
            message.type = "error";
            return;
        }

        isLoading.value = true;
        message.text = "";

        try {
            await axios.post(`/events/${currentEventId.value}/polls`, {
                id: selected.value ?? undefined,
                title: form.title,
                options: validOptions
            });

            message.text = `Poll "${form.title}" upserted successfully!`;
            message.type = "success";
            stats.totalPolls++;
            stats.activePolls++;
            if (!selected.value) resetForm();

            setTimeout(() => {
                message.text = "";
            }, 3000);
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                message.text = (err.response?.data as Record<string, unknown>)?.message as string || "Failed to create poll";
            } else {
                message.text = "An unexpected error occurred";
            }
            message.type = "error";
        } finally {
            isLoading.value = false;
        }
    };

    const deletePoll = async (pollId: string): Promise<void> => {
        if (!currentEventId.value) {
            console.error("No event ID set");
            return;
        }

        if (!confirm("Are you sure you want to delete this poll?")) {
            return;
        }

        isLoading.value = true;
        message.text = "";

        try {
            await axios.delete(`/events/${currentEventId.value}/polls/${pollId}`);
            message.text = "Poll deleted successfully!";
            message.type = "success";
            
            // Remove from list
            list.value = list.value.filter(p => p.id !== pollId);
            stats.totalPolls--;
            
            // Reset form if deleted poll was selected
            if (selected.value === pollId) {
                resetForm();
                goToCreate();
            }

            setTimeout(() => {
                message.text = "";
            }, 3000);
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                message.text = (err.response?.data as Record<string, unknown>)?.message as string || "Failed to delete poll";
            } else {
                message.text = "An unexpected error occurred";
            }
            message.type = "error";
        } finally {
            isLoading.value = false;
        }
    };

    return {
        form,
        message,
        isLoading,
        isFetchingPolls,
        stats,
        selected,
        list,
        currentView,
        currentEventId,
        addOption,
        removeOption,
        resetForm,
        upsertPoll,
        deletePoll,
        fetchPolls,
        selectPoll,
        goToCreate
    };
});
