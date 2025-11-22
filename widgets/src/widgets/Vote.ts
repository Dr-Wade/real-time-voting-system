import { createApp, defineCustomElement, h } from "vue";
import { createPinia } from "pinia";
import MyVote from "./vote/myVote.vue";
import styles from "@/assets/tailwind.css?inline";

const MyVoteElement = defineCustomElement({
    styles: [styles],
    setup: () => {
        const app = createApp(MyVote);
        app.use(createPinia());
        return () => h(MyVote);
    }
});
customElements.define("my-vote", MyVote);