'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../api-client';

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

// Specific hooks for common API calls
export function usePatients(params?: { search?: string; page?: number; size?: number }) {
  return useApi(() => apiClient.patients.list(params), [params]);
}

export function usePatient(id: string) {
  return useApi(() => apiClient.patients.getById(id), [id]);
}

export function useMedicalExams(patientId: string) {
  return useApi(() => apiClient.medicalExams.list(patientId), [patientId]);
}

export function useLabReports(patientId: string, reportType?: string) {
  return useApi(() => apiClient.labReports.list(patientId, reportType), [patientId, reportType]);
}

export function useEcgReports(patientId: string) {
  return useApi(() => apiClient.ecgReports.list(patientId), [patientId]);
}

export function useXrayReports(patientId: string) {
  return useApi(() => apiClient.xrayReports.list(patientId), [patientId]);
}

export function useUtzReports(patientId: string) {
  return useApi(() => apiClient.utzReports.list(patientId), [patientId]);
}

export function useQueue(params?: { date?: string; status?: string; search?: string; page?: number; size?: number }) {
  return useApi(() => apiClient.queue.list(params), [params]);
}

export function useActivityLogs(params?: { 
  startDate?: string; 
  endDate?: string; 
  module?: string; 
  action?: string; 
  search?: string; 
  page?: number; 
  size?: number;
}) {
  return useApi(() => apiClient.activityLogs.list(params), [params]);
}

export function useReleasing(params?: { status?: string; search?: string; page?: number; size?: number }) {
  return useApi(() => apiClient.releasing.list(params), [params]);
}

// Hook for mutations (create, update, delete operations)
export function useMutation<T, P>(
  mutationFn: (params: P) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (params: P): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFn(params);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}