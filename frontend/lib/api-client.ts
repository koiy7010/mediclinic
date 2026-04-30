// API Client for making requests to Next.js API routes
import { handleApiResponse, buildQueryString, PagedResponse } from './api-config';

const API_BASE = '/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    return handleApiResponse<T>(response);
  }

  // Patient API methods
  patients = {
    list: (params?: { search?: string; page?: number; size?: number }) => {
      const query = params ? `?${buildQueryString(params)}` : '';
      return this.request<PagedResponse<any>>(`/patients${query}`);
    },

    create: (data: any) =>
      this.request<any>('/patients', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getById: (id: string) =>
      this.request<any>(`/patients/${id}`),

    update: (id: string, data: any) =>
      this.request<any>(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      this.request<void>(`/patients/${id}`, {
        method: 'DELETE',
      }),
  };

  // Medical Exam API methods
  medicalExams = {
    list: (patientId: string) =>
      this.request<any[]>(`/patients/${patientId}/medical-exams`),

    create: (patientId: string, data: any) =>
      this.request<any>(`/patients/${patientId}/medical-exams`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getById: (patientId: string, id: string) =>
      this.request<any>(`/patients/${patientId}/medical-exams/${id}`),

    update: (patientId: string, id: string, data: any) =>
      this.request<any>(`/patients/${patientId}/medical-exams/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  };

  // Lab Report API methods
  labReports = {
    list: (patientId: string, reportType?: string) => {
      const query = reportType ? `?reportType=${reportType}` : '';
      return this.request<any[]>(`/patients/${patientId}/lab-reports${query}`);
    },

    create: (patientId: string, data: any) =>
      this.request<any>(`/patients/${patientId}/lab-reports`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getById: (patientId: string, id: string) =>
      this.request<any>(`/patients/${patientId}/lab-reports/${id}`),

    update: (patientId: string, id: string, data: any) =>
      this.request<any>(`/patients/${patientId}/lab-reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  };

  // ECG Report API methods
  ecgReports = {
    list: (patientId: string) =>
      this.request<any[]>(`/patients/${patientId}/ecg-reports`),

    create: (patientId: string, data: any) =>
      this.request<any>(`/patients/${patientId}/ecg-reports`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getById: (patientId: string, id: string) =>
      this.request<any>(`/patients/${patientId}/ecg-reports/${id}`),

    update: (patientId: string, id: string, data: any) =>
      this.request<any>(`/patients/${patientId}/ecg-reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  };

  // X-ray Report API methods
  xrayReports = {
    list: (patientId: string) =>
      this.request<any[]>(`/patients/${patientId}/xray-reports`),

    create: (patientId: string, data: any) =>
      this.request<any>(`/patients/${patientId}/xray-reports`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getById: (patientId: string, id: string) =>
      this.request<any>(`/patients/${patientId}/xray-reports/${id}`),

    update: (patientId: string, id: string, data: any) =>
      this.request<any>(`/patients/${patientId}/xray-reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  };

  // UTZ Report API methods
  utzReports = {
    list: (patientId: string) =>
      this.request<any[]>(`/patients/${patientId}/utz-reports`),

    create: (patientId: string, data: any) =>
      this.request<any>(`/patients/${patientId}/utz-reports`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getById: (patientId: string, id: string) =>
      this.request<any>(`/patients/${patientId}/utz-reports/${id}`),

    update: (patientId: string, id: string, data: any) =>
      this.request<any>(`/patients/${patientId}/utz-reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  };

  // Queue API methods
  queue = {
    list: (params?: { date?: string; status?: string; search?: string; page?: number; size?: number }) => {
      const query = params ? `?${buildQueryString(params)}` : '';
      return this.request<PagedResponse<any>>(`/queue${query}`);
    },

    create: (data: any) =>
      this.request<any>('/queue', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateStatus: (id: string, data: any) =>
      this.request<any>(`/queue/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    removeCompleted: (date?: string) => {
      const query = date ? `?date=${date}` : '';
      return this.request<{ removedCount: number }>(`/queue/completed${query}`, {
        method: 'DELETE',
      });
    },
  };

  // Search API methods
  search = {
    global: (query: string) =>
      this.request<any[]>(`/search?q=${encodeURIComponent(query)}`),
  };

  // Activity Log API methods
  activityLogs = {
    list: (params?: { 
      startDate?: string; 
      endDate?: string; 
      module?: string; 
      action?: string; 
      search?: string; 
      page?: number; 
      size?: number;
    }) => {
      const query = params ? `?${buildQueryString(params)}` : '';
      return this.request<PagedResponse<any>>(`/activity-logs${query}`);
    },
  };

  // Releasing API methods
  releasing = {
    list: (params?: { status?: string; search?: string; page?: number; size?: number }) => {
      const query = params ? `?${buildQueryString(params)}` : '';
      return this.request<PagedResponse<any>>(`/releasing${query}`);
    },

    release: (id: string, data: any) =>
      this.request<any>(`/releasing/${id}/release`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };
}

// Export singleton instance
export const apiClient = new ApiClient();