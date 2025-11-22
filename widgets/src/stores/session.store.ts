import { defineStore } from "pinia";

export interface StandardProps {
    personid: string
    token: string
}

export const useSession = defineStore("session", () => {
    const username = ref<string>();
    const token = ref<string>();

    const init = (data: StandardProps) => {
        username.value = data.personid;
        token.value = data.token;
    };

    return {
        username,
        token,
        init
    };
});