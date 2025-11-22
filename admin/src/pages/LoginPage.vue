<template>
  <div class="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-200">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        Admin Login
      </h1>
      <p class="text-gray-600 mb-8">
        Enter your credentials to access the admin dashboard
      </p>

      <form
        class="space-y-4"
        @submit.prevent="login"
      >
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2"
            for="personID"
          >
            Person ID
          </label>
          <input
            id="personID"
            v-model="form.personID"
            class="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#30715e] focus:border-transparent"
            placeholder="Enter your person ID"
            required
            type="text"
          >
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2"
            for="password"
          >
            Password
          </label>
          <input
            id="password"
            v-model="form.password"
            class="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#30715e] focus:border-transparent"
            placeholder="Enter your password"
            required
            type="password"
          >
        </div>

        <button
          class="w-full bg-brand hover:bg-brand-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors"
          :disabled="isLoading"
          type="submit"
        >
          {{ isLoading ? "Logging in..." : "Login" }}
        </button>
      </form>

      <div
        v-if="error"
        class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4"
      >
        <p class="text-red-700 text-sm">
          {{ error }}
        </p>
      </div>

      <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p class="text-gray-700 text-sm mb-2">
          <strong>Demo Credentials:</strong>
        </p>
        <p class="text-gray-600 text-xs">
          Person ID: <code class="bg-white px-2 py-1 rounded border border-gray-200">admin</code>
        </p>
        <p class="text-gray-600 text-xs mt-1">
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
        const response = await axios.post(`${API_URL}/api/auth/login`, {
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
