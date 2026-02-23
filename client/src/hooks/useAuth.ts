import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface AuthUser {
    id: number;
    email: string;
    name: string;
    avatar?: string | null;
}

export function useUser() {
    return useQuery<AuthUser | null>({
        queryKey: ["/api/auth/me"],
        queryFn: async () => {
            const res = await fetch("/api/auth/me", { credentials: "include" });
            if (res.status === 401) return null;
            if (!res.ok) throw new Error("Failed to fetch user");
            return res.json();
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false,
    });
}

export function useLogin() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (data: { email: string; password: string }) => {
            const res = await apiRequest("POST", "/api/auth/login", data);
            return res.json() as Promise<AuthUser>;
        },
        onSuccess: (user) => {
            qc.setQueryData(["/api/auth/me"], user);
        },
    });
}

export function useRegister() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (data: { email: string; password: string; name: string }) => {
            const res = await apiRequest("POST", "/api/auth/register", data);
            return res.json() as Promise<AuthUser>;
        },
        onSuccess: (user) => {
            qc.setQueryData(["/api/auth/me"], user);
        },
    });
}

export function useLogout() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await apiRequest("POST", "/api/auth/logout");
        },
        onSuccess: () => {
            qc.setQueryData(["/api/auth/me"], null);
            qc.invalidateQueries();
        },
    });
}
