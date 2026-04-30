# Medical Clinic API Documentation

This document describes the Next.js API routes that proxy requests to the Java Spring Boot backend.

## Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=Smart Guys Medical Clinic
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=development
```

## API Endpoints

All API routes are prefixed with `/api` and proxy requests to the Spring Boot backend.

### Health Check

- **GET** `/api/health` - Check frontend and backend health status

### Patients

- **GET** `/api/patients` - List patients with pagination and search
- **POST** `/api/patients` - Create a new patient
- **GET** `/api/patients/[id]` - Get patient by ID
- **PUT** `/api/patients/[id]` - Update patient
- **DELETE** `/api/patients/[id]` - Delete patient

### Medical Exams

- **GET** `/api/patients/[patientId]/medical-exams` - List medical exams for a patient
- **POST** `/api/patients/[patientId]/medical-exams` - Create medical exam
- **GET** `/api/patients/[patientId]/medical-exams/[id]` - Get medical exam by ID
- **PUT** `/api/patients/[patientId]/medical-exams/[id]` - Update medical exam

### Lab Reports

- **GET** `/api/patients/[patientId]/lab-reports` - List lab reports for a patient
- **POST** `/api/patients/[patientId]/lab-reports` - Create lab report
- **GET** `/api/patients/[patientId]/lab-reports/[id]` - Get lab report by ID
- **PUT** `/api/patients/[patientId]/lab-reports/[id]` - Update lab report

### ECG Reports

- **GET** `/api/patients/[patientId]/ecg-reports` - List ECG reports for a patient
- **POST** `/api/patients/[patientId]/ecg-reports` - Create ECG report
- **GET** `/api/patients/[patientId]/ecg-reports/[id]` - Get ECG report by ID
- **PUT** `/api/patients/[patientId]/ecg-reports/[id]` - Update ECG report

### X-ray Reports

- **GET** `/api/patients/[patientId]/xray-reports` - List X-ray reports for a patient
- **POST** `/api/patients/[patientId]/xray-reports` - Create X-ray report
- **GET** `/api/patients/[patientId]/xray-reports/[id]` - Get X-ray report by ID
- **PUT** `/api/patients/[patientId]/xray-reports/[id]` - Update X-ray report

### UTZ Reports

- **GET** `/api/patients/[patientId]/utz-reports` - List UTZ reports for a patient
- **POST** `/api/patients/[patientId]/utz-reports` - Create UTZ report
- **GET** `/api/patients/[patientId]/utz-reports/[id]` - Get UTZ report by ID
- **PUT** `/api/patients/[patientId]/utz-reports/[id]` - Update UTZ report

### Queue Management

- **GET** `/api/queue` - List queue entries with filters
- **POST** `/api/queue` - Create queue entry
- **PATCH** `/api/queue/[id]/status` - Update queue entry status
- **DELETE** `/api/queue/completed` - Remove completed queue entries

### Search

- **GET** `/api/search?q={query}` - Global patient search

### Activity Logs

- **GET** `/api/activity-logs` - List activity logs with filters

### Result Releasing

- **GET** `/api/releasing` - List release records
- **POST** `/api/releasing/[id]/release` - Release patient results

## Usage Examples

### Using the API Client

```typescript
import { apiClient } from '@/lib/api-client';

// List patients
const patients = await apiClient.patients.list({ search: 'John', page: 0, size: 10 });

// Create a patient
const newPatient = await apiClient.patients.create({
  firstName: 'John',
  lastName: 'Doe',
  // ... other patient data
});

// Get patient by ID
const patient = await apiClient.patients.getById('patient-id');

// Create a lab report
const labReport = await apiClient.labReports.create('patient-id', {
  reportType: 'BLOOD_TEST',
  // ... other report data
});
```

### Using React Hooks

```typescript
import { usePatients, usePatient, useMutation } from '@/lib/hooks/use-api';
import { apiClient } from '@/lib/api-client';

function PatientList() {
  const { data: patients, loading, error, refetch } = usePatients({ page: 0, size: 10 });
  
  const { mutate: createPatient, loading: creating } = useMutation(apiClient.patients.create);

  const handleCreatePatient = async (patientData: any) => {
    const result = await createPatient(patientData);
    if (result) {
      refetch(); // Refresh the list
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {patients?.content.map(patient => (
        <div key={patient.id}>{patient.firstName} {patient.lastName}</div>
      ))}
    </div>
  );
}
```

### Direct Fetch Usage

```typescript
// List patients with search
const response = await fetch('/api/patients?search=John&page=0&size=10');
const patients = await response.json();

// Create a patient
const response = await fetch('/api/patients', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    // ... other patient data
  }),
});
const newPatient = await response.json();

// Update a patient
const response = await fetch('/api/patients/patient-id', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedPatientData),
});
const updatedPatient = await response.json();
```

## Error Handling

All API routes include comprehensive error handling:

- **400** - Bad Request (validation errors)
- **404** - Not Found
- **409** - Conflict (e.g., trying to delete a patient with associated reports)
- **500** - Internal Server Error

Error responses follow this format:

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "details": { /* Additional error details */ }
}
```

## Query Parameters

### Pagination

Most list endpoints support pagination:

- `page` - Page number (0-based)
- `size` - Number of items per page
- `sort` - Sort field and direction (e.g., `firstName,asc`)

### Filtering

- `search` - Text search across relevant fields
- `status` - Filter by status (for queue, releasing)
- `reportType` - Filter lab reports by type
- `date` - Filter by date (for queue entries)
- `startDate` / `endDate` - Date range filtering (for activity logs)

## Authentication

Currently, the API routes don't include authentication. To add authentication:

1. Update the `getApiHeaders()` function in `lib/api-config.ts`
2. Add authentication middleware to the API routes
3. Include JWT tokens or session handling as needed

## CORS Configuration

The backend should be configured to allow requests from the Next.js frontend. Ensure the Spring Boot application includes proper CORS configuration for your frontend domain.

## Development

To start development:

1. Start the Spring Boot backend on port 8080
2. Start the Next.js frontend: `npm run dev`
3. The frontend will proxy API requests to the backend

## Production Deployment

For production:

1. Set the `BACKEND_URL` environment variable to your production backend URL
2. Ensure proper CORS configuration on the backend
3. Consider adding authentication and rate limiting
4. Monitor API performance and error rates