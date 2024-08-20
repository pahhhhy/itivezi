import type {Role} from "@/types/auth";
import {defineStore} from "pinia";

export const useRoleStore = defineStore('role', {
    state: (): { role: Role } => {
        return {
            role: null,
        }
    },
    actions: {
        setRole(role: Role) {
            this.role = role
        }
    },
})
