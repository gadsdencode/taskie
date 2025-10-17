import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getErrorDetails } from "./errorHandler";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    let errorData: any = {};
    
    try {
      const text = await res.text();
      if (text) {
        try {
          // Try to parse as JSON first
          errorData = JSON.parse(text);
          errorMessage = errorData.error || errorData.message || text;
        } catch {
          // If not JSON, use the text as is
          errorMessage = text;
        }
      }
    } catch {
      // Fallback to status text if reading response fails
    }
    
    // Create an error object with all relevant information
    const error: any = new Error(`${res.status}: ${errorMessage}`);
    error.status = res.status;
    error.response = {
      status: res.status,
      data: errorData
    };
    
    // Attach user-friendly error details
    error.details = getErrorDetails(error);
    
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
