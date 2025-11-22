import { createRouter, createWebHistory, RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from "vue-router";

const routes: RouteRecordRaw[] = [
    {
        path: "/login",
        name: "login",
        component: () => import("../pages/LoginPage.vue"),
        meta: { requiresAuth: false }
    },
    {
        path: "/",
        name: "events",
        component: () => import("../pages/EventsPage.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/events/:eventId",
        name: "event-detail",
        component: () => import("../pages/EventDetailPage.vue"),
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(
    (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
        const token = localStorage.getItem("authToken");
        const requiresAuth = to.meta.requiresAuth !== false;

        if (requiresAuth && !token) {
            // Redirect to login if trying to access protected route without token
            next("/login");
        } else if (to.path === "/login" && token) {
            // Redirect to home if already logged in and trying to access login
            next("/");
        } else {
            next();
        }
    }
);

export default router;
