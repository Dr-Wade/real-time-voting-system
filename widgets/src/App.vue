<template>
  <div
    id="app"
    class="flex min-h-screen flex-col gap-5 justify-center items-center"
  >
    <!-- Login Screen -->
    <div
      v-if="!isLoggedIn"
      class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
    >
      <h1 class="text-3xl font-bold text-gray-900 mb-1">
        Voting System
      </h1>
      <p class="text-gray-600 mb-8">
        Sign in to your account
      </p>
      
      <!-- Error Message -->
      <div
        v-if="loginError"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      >
        <p class="text-red-700 text-sm">
          {{ loginError }}
        </p>
      </div>

      <!-- Login Form -->
      <form
        class="space-y-4"
        @submit.prevent="handleLogin"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Person ID
          </label>
          <input
            v-model="formPersonID"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="Enter your person ID"
            type="text"
            @keyup.enter="handleLogin"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            v-model="formPassword"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="Enter your password"
            type="password"
            @keyup.enter="handleLogin"
          >
        </div>

        <button
          class="w-full bg-brand hover:bg-brand-dark disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          :disabled="isLoggingIn"
          type="submit"
        >
          {{ isLoggingIn ? "Signing in..." : "Sign In" }}
        </button>
      </form>

      <!-- Mode Selection -->
      <div class="mt-8 pt-8 border-t border-gray-200">
        <p class="text-sm font-medium text-gray-700 mb-4">
          Choose your mode:
        </p>
        
        <div class="space-y-3">
          <button
            :class="[
              'w-full py-2 px-4 rounded-lg font-semibold transition-colors',
              selectedMode === 'voter'
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="selectMode('voter')"
          >
            🗳️ Voter Mode
          </button>
          
          <button
            :class="[
              'w-full py-2 px-4 rounded-lg font-semibold transition-colors',
              selectedMode === 'presentation'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="selectMode('presentation')"
          >
            📊 Presentation Mode
          </button>
        </div>
      </div>
    </div>

    <!-- Voting/Presentation Screen -->
    <div
      v-else
      class="w-full relative"
    >
      <!-- Logout Button -->
      <div class="absolute top-4 right-4 z-10">
        <button
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>
      
      <MyVote
        class="w-full"
        v-bind="{ personid: currentPersonID, token: currentToken, canvote: isVoterMode }"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import MyVote from "./widgets/vote/MyVote.vue";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

const isLoggedIn = ref(false);
const isVoterMode = ref(true);
const isLoggingIn = ref(false);
const loginError = ref("");
const selectedMode = ref<"voter" | "presentation">("voter");

const formPersonID = ref("");
const formPassword = ref("");
const currentPersonID = ref("");
const currentToken = ref("");

// Storage keys
const STORAGE_KEYS = {
    personID: "voting_personID",
    token: "voting_token",
    mode: "voting_mode",
    isLoggedIn: "voting_isLoggedIn",
};

// Load from localStorage on mount
onMounted(() => {
    const storedIsLoggedIn = localStorage.getItem(STORAGE_KEYS.isLoggedIn);
    if (storedIsLoggedIn === "true") {
        const storedPersonID = localStorage.getItem(STORAGE_KEYS.personID);
        const storedToken = localStorage.getItem(STORAGE_KEYS.token);
        const storedMode = localStorage.getItem(STORAGE_KEYS.mode) as "voter" | "presentation" | null;

        if (storedPersonID && storedToken) {
            currentPersonID.value = storedPersonID;
            currentToken.value = storedToken;
            isVoterMode.value = storedMode === "presentation" ? false : true;
            isLoggedIn.value = true;
        }
    }
});

const selectMode = (mode: "voter" | "presentation") => {
    selectedMode.value = mode;
};

const handleLogin = async () => {
    if (!formPersonID.value || !formPassword.value) {
        loginError.value = "Please enter both Person ID and password";
        return;
    }

    isLoggingIn.value = true;
    loginError.value = "";

    try {
        const response = await axios.post(`${API_URL}/api/auth/login`, {
            personID: formPersonID.value,
            password: formPassword.value,
        });

        currentPersonID.value = formPersonID.value;
        currentToken.value = formPassword.value;
        isVoterMode.value = selectedMode.value === "voter";
        isLoggedIn.value = true;

        // Store in localStorage
        localStorage.setItem(STORAGE_KEYS.personID, formPersonID.value);
        localStorage.setItem(STORAGE_KEYS.token, formPassword.value);
        localStorage.setItem(STORAGE_KEYS.mode, selectedMode.value);
        localStorage.setItem(STORAGE_KEYS.isLoggedIn, "true");
    } catch (error: any) {
        loginError.value = error.response?.data?.message || "Login failed. Please check your credentials.";
    } finally {
        isLoggingIn.value = false;
    }
};

const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.personID);
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.mode);
    localStorage.removeItem(STORAGE_KEYS.isLoggedIn);

    // Reset state
    isLoggedIn.value = false;
    currentPersonID.value = "";
    currentToken.value = "";
    formPersonID.value = "";
    formPassword.value = "";
    selectedMode.value = "voter";
};
</script>
