import { useQuery } from "@tanstack/react-query";
import { meFn } from "./auth.server";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => meFn(),
    staleTime: 60_000,
  });
}
