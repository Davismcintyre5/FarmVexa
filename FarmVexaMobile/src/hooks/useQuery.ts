import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';

export function useApiQuery<T>(
  key: string[],
  apiFunction: () => Promise<{ data: T }>,
  options?: Omit<UseQueryOptions<any, Error, T>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const response = await apiFunction();
      return response.data;
    },
    ...options,
  });
}

export function useApiMutation<T>(
  apiFunction: (data: any) => Promise<{ data: T }>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    invalidateKeys?: string[][];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiFunction(data);
      return response.data;
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}