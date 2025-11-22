<template>
  <div class="min-h-screen bg-linear-to-br from-white to-gray-50 p-4">
    <div class="min-w-[80vw] max-w-2xl mx-auto">
      <!-- Access Denied View -->
      <div
        v-if="accessDenied"
        class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-auto mt-20 border border-gray-200"
      >
        <h1 class="text-xl font-bold text-gray-900 mb-2">
          Accès non autorisé
        </h1>
        <p class="text-gray-600">
          Tu n'as pas accès au système de vote
        </p>
      </div>

      <template v-else>
        <EventsList
          v-if="!selectedEvent"
          :events="events"
          @select="selectEvent"
        />

        <!-- Event Detail View -->
        <div
          v-else
          class="space-y-6"
        >
          <EventHeader
            :event="selectedEvent"
            @back="selectedEvent = null"
          />

          <PollDisplay :active-poll="selectedEvent.activePoll">
            <!-- Loading Phase -->
            <div v-if="isLoadingPoll" />

            <!-- Voting Phase -->
            <VotingPhase
              v-if="!userVote && !isVoting && props.canvote"
              :is-voting="isVoting"
              :options="pollOptions"
              :selected-option="selectedOption"
              @select="selectedOption = $event"
              @vote="castVote"
            />

            <!-- Results Phase -->
            <ResultsPhase
              v-else
              :can-vote="props.canvote"
              :options="pollOptions"
            />
          </PollDisplay>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, onBeforeMount, computed } from "vue";
import axios from "axios";
import EventsList from "./EventsList.vue";
import EventHeader from "./EventHeader.vue";
import PollDisplay from "./PollDisplay.vue";
import VotingPhase from "./VotingPhase.vue";
import ResultsPhase from "./ResultsPhase.vue";


const API_URL = (import.meta.env as Record<string, string>).VITE_API_URL || "http://localhost:3333";

interface Event {
    id: string
    name: string
    type: string
    active: boolean
    activePoll: Poll | null
}

interface Poll {
    id: string
    title: string
}

interface PollOption {
    id: string
    title: string
    score?: number
}

const props = defineProps<{
    personid: string
    token: string
    canvote: boolean
}>();

defineEmits<{
    logout: []
}>();

// Authentication state
const isAuthenticated = ref(false);
const accessDenied = ref(false);
const authToken = ref<string | null>(null);

// Voting state
const events = ref<Event[]>([]);
const selectedEvent = ref<Event | null>(null);
const pollOptions = ref<PollOption[]>([]);
const selectedOption = ref<string | null>(null);
const userVote = ref<string | null>(null);
const isLoadingEvents = ref(true);
const isLoadingPoll = ref(true);
const isVoting = ref(false);

// Auto-login with props credentials
const autoLogin = async () => {
    if (!props.personid || !props.token) {
        accessDenied.value = true;
        return;
    }

    try {
        // Login with personID and password hash
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
            personID: props.personid,
            password: props.token,
        });

        const token = loginResponse.data.token;
        authToken.value = token;

        isAuthenticated.value = true;

        // Fetch events after login
        await fetchEvents();
    } catch (error) {
        console.error("Authentication failed:", error);
        accessDenied.value = true;
    }
};

// Helper to get auth headers
const getAuthHeaders = () => ({
    headers: {
        Authorization: `Bearer ${authToken.value}`,
    },
});

const fetchEvents = async () => {
    isLoadingEvents.value = true;
    try {
        const response = await axios.get(`${API_URL}/api/events`, getAuthHeaders());
        // Filter to only show active events
        events.value = (response.data.events || []).filter((event: Event) => event.active);
    } catch (error) {
        console.error("Failed to fetch events:", error);
    } finally {
        isLoadingEvents.value = false;
    }
};

const selectEvent = async (event: Event) => {
    selectedEvent.value = event;
    selectedOption.value = null;
    userVote.value = null;

    if (event.activePoll) {
        await fetchPollOptions(event.activePoll.id);
    }
};

const fetchPollOptions = async (pollId: string) => {
    if (!selectedEvent.value) return;

    isLoadingPoll.value = true;
    try {
        const response = await axios.get(`${API_URL}/api/events/${selectedEvent.value.id}/polls/${pollId}`, getAuthHeaders());
        const poll = response.data.poll;
        console.log("Fetched poll options:", poll.options);
        pollOptions.value = poll.options || [];

        // Check if user has already voted on this poll
        try {
            const voteResponse = await axios.get(
                `${API_URL}/api/events/${selectedEvent.value.id}/polls/${pollId}/my-vote`,
                getAuthHeaders()
            );
            if (voteResponse.status === 200 && voteResponse.data.pollOptionId) {
                console.log("User already voted:", voteResponse.data);
                userVote.value = voteResponse.data.pollOptionId;
                selectedOption.value = null; // Clear selected option to show results
            } else {
                userVote.value = null;
                selectedOption.value = null;
            }
        } catch (voteError: any) {
            // 204 means user hasn't voted yet, which is fine
            if (voteError.response?.status !== 204) {
                console.error("Failed to check vote status:", voteError);
            }
        }
    } catch (error) {
        console.error("Failed to fetch poll options:", error);
    } finally {
        isLoadingPoll.value = false;
    }
};

const castVote = async () => {
    if (!selectedOption.value || !selectedEvent.value?.activePoll || !authToken.value) return;

    isVoting.value = true;
    try {
        await axios.post(
            `${API_URL}/api/events/${selectedEvent.value.id}/polls/${selectedEvent.value.activePoll.id}/votes`,
            {
                pollOptionId: selectedOption.value,
            },
            getAuthHeaders()
        );

        userVote.value = selectedOption.value;
        selectedOption.value = null;

        // Refresh results
        await fetchPollOptions(selectedEvent.value.activePoll.id);
    } catch (error: any) {
        if (error.response?.status === 403) {
            console.error("You don't have permission to vote on this event type");
        } else {
            console.error("Failed to cast vote:", error);
        }
    } finally {
        isVoting.value = false;
    }
};

const getTotalVotes = (): number => {
    return pollOptions.value.reduce((sum, option) => sum + (option.score || 0), 0);
};

// WebSocket connections
const pollResultsSocket = ref<WebSocket | null>(null);
const eventUpdatesSocket = ref<WebSocket | null>(null);
const eventsListSocket = ref<WebSocket | null>(null);

const connectToPollResults = (pollId: string) => {
    try {
        if (pollResultsSocket.value) {
            pollResultsSocket.value.close();
            pollResultsSocket.value = null;
        }

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = new URL(API_URL).host;
        const url = `${protocol}//${host}/polls/${pollId}/results`;

        const socket = new WebSocket(url);

        socket.onopen = () => {
            console.log("Connected to poll results WebSocket");
            pollResultsSocket.value = socket;
        };

        socket.onmessage = event => {
            try {
                const message = JSON.parse(event.data);
                console.log("Poll results update:", message);
                // Update the specific option's score
                const option = pollOptions.value.find(opt => opt.id === message.pollOptionId);
                if (option) {
                    option.score = message.votes;
                    console.log("Updated option score:", option);
                }
            } catch (error) {
                console.error("Failed to parse poll results message:", error);
            }
        };

        socket.onerror = error => {
            console.error("Poll results WebSocket error:", error);
        };

        socket.onclose = () => {
            console.log("Disconnected from poll results");
            if (pollResultsSocket.value === socket) {
                pollResultsSocket.value = null;
            }
        };
    } catch (error) {
        console.error("Failed to connect to poll results:", error);
    }
};

const connectToEventUpdates = (eventId: string) => {
    try {
        if (eventUpdatesSocket.value) {
            eventUpdatesSocket.value.close();
            eventUpdatesSocket.value = null;
        }

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = new URL(API_URL).host;
        const url = `${protocol}//${host}/admin/events/${eventId}/updates`;

        const socket = new WebSocket(url);

        socket.onopen = () => {
            console.log("Connected to event updates WebSocket");
            eventUpdatesSocket.value = socket;
        };

        socket.onmessage = event => {
            try {
                const message = JSON.parse(event.data);
                console.log("Event update received:", message.type);

                if (message.type === "poll_activated" && message.data.event) {
                    // Active poll changed
                    selectedEvent.value = message.data.event;
                    if (message.data.event.activePoll) {
                        fetchPollOptions(message.data.event.activePoll.id);
                        connectToPollResults(message.data.event.activePoll.id);
                    };
                    userVote.value = null;
                    selectedOption.value = null;
                } else if (message.type === "event_activated" || message.type === "event_deactivated") {
                    // Event status changed
                    if (message.data.event) {
                        selectedEvent.value = message.data.event;
                    }
                }
            } catch (error) {
                console.error("Failed to parse event update message:", error);
            }
        };

        socket.onerror = error => {
            console.error("Event updates WebSocket error:", error);
        };

        socket.onclose = () => {
            console.log("Disconnected from event updates");
            if (eventUpdatesSocket.value === socket) {
                eventUpdatesSocket.value = null;
            }
        };
    } catch (error) {
        console.error("Failed to connect to event updates:", error);
    }
};

const connectToEventsList = () => {
    try {
        if (eventsListSocket.value) {
            eventsListSocket.value.close();
            eventsListSocket.value = null;
        }

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = new URL(API_URL).host;
        const url = `${protocol}//${host}/events/updates`;

        const socket = new WebSocket(url);

        socket.onopen = () => {
            console.log("Connected to events list WebSocket");
            eventsListSocket.value = socket;
        };

        socket.onmessage = event => {
            try {
                const message = JSON.parse(event.data);
                console.log("Events list update received:", message.type);

                if (message.type === "event_activated" || message.type === "event_deactivated") {
                    // Refresh the events list
                    fetchEvents();
                }
            } catch (error) {
                console.error("Failed to parse events list message:", error);
            }
        };

        socket.onerror = error => {
            console.error("Events list WebSocket error:", error);
        };

        socket.onclose = () => {
            console.log("Disconnected from events list");
            if (eventsListSocket.value === socket) {
                eventsListSocket.value = null;
            }
        };
    } catch (error) {
        console.error("Failed to connect to events list:", error);
    }
};

// Watch for active poll changes
watch(
    () => selectedEvent.value?.activePoll?.id,
    async newPollId => {
        if (newPollId && selectedEvent.value) {
            await fetchPollOptions(newPollId);
            connectToPollResults(newPollId);
        }
    }
);

// Watch for selected event changes
watch(
    () => selectedEvent.value?.id,
    newEventId => {
        if (newEventId) {
            connectToEventUpdates(newEventId);
        }
    }
);

const disconnectWebSockets = () => {
    if (pollResultsSocket.value) {
        pollResultsSocket.value.close();
        pollResultsSocket.value = null;
    }
    if (eventUpdatesSocket.value) {
        eventUpdatesSocket.value.close();
        eventUpdatesSocket.value = null;
    }
    if (eventsListSocket.value) {
        eventsListSocket.value.close();
        eventsListSocket.value = null;
    }
};

onMounted(() => {
    autoLogin();
    connectToEventsList();
});

onUnmounted(() => {
    disconnectWebSockets();
});
</script>