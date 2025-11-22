<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
    <div class="bg-slate-700 rounded-lg shadow-xl p-8 w-full max-w-md">
      <h1 class="text-3xl font-bold text-white mb-2">
        Admin Login
      </h1>
      <p class="text-slate-400 mb-8">
        Enter your credentials to access the admin dashboard
      </p>

      <form @submit.prevent="login" class="space-y-4">
        <div>
          <label for="personID" class="block text-sm font-medium text-slate-300 mb-2">
            Person ID
          </label>
          <input
            id="personID"
            v-model="form.personID"
            type="text"
            required
            class="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            placeholder="Enter your person ID"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-slate-300 mb-2">
            Password
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors"
        >
          {{ isLoading ? "Logging in..." : "Login" }}
        </button>
      </form>

      <div v-if="error" class="mt-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4">
        <p class="text-red-400 text-sm">
          {{ error }}
        </p>
      </div>

      <div class="mt-6 p-4 bg-slate-600 rounded-lg">
        <p class="text-slate-300 text-sm mb-2">
          <strong>Demo Credentials:</strong>
        </p>
        <p class="text-slate-400 text-xs">
          Person ID: <code class="bg-slate-700 px-2 py-1 rounded">admin</code>
        </p>
        <p class="text-slate-400 text-xs mt-1">
          Password: Hash of "admin" + secret key
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const API_URL = (import.meta.env as Record<string, string>).VITE_API_URL || "http://localhost:3333";
const ADMIN_PERSON_ID = (import.meta.env as Record<string, string>).VITE_ADMIN_PERSON_ID || "admin";

const router = useRouter();

const form = ref({
  personID: "",
  password: "",
});

const isLoading = ref(false);
const error = ref("");

const login = async () => {
  error.value = "";
  isLoading.value = true;

  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      personID: form.value.personID,
      password: form.value.password,
    });

    const { token, user } = response.data;

    // Check if user is admin
    if (user.personID !== ADMIN_PERSON_ID) {
      error.value = "Only admins can access this dashboard";
      isLoading.value = false;
      return;
    }

    // Store token
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));

    // Redirect to dashboard
    await router.push("/");
  } catch (err: any) {
    error.value = err.response?.data?.message || "Login failed";
  } finally {
    isLoading.value = false;
  }
};
</script>
