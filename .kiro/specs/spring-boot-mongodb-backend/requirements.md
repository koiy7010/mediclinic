# Requirements Document

## Introduction

This document specifies the requirements for a Spring Boot backend with MongoDB that serves as the REST API layer for the MediClinic Health Records System ("smart-guys-web"). The backend replaces the current hardcoded mock data in the Next.js frontend with a persistent, secure, and validated data layer. The system handles medical and clinical data for a clinic in the Philippines, covering patient registration, laboratory reports, radiology (X-Ray), ultrasound (UTZ), ECG, medical examinations, queue management, result releasing, and activity logging.

## Glossary

- **API**: The Spring Boot REST API backend application
- **Patient**: A person registered in the MediClinic system for medical services
- **Lab_Report**: A laboratory test result belonging to a Patient, of a specific type (Urinalysis, Hematology, Chem10, HbA1c, Serology, Fecalysis, Blood Typing)
- **Radiology_Report**: An X-Ray examination report belonging to a Patient
- **UTZ_Report**: An ultrasound examination report belonging to a Patient
- **ECG_Report**: An electrocardiogram report belonging to a Patient
- **Medical_Exam**: A comprehensive medical examination record belonging to a Patient, including physical examination, past medical history, lab/diagnostic summary, and evaluation
- **Queue_Entry**: A record representing a Patient's position in the clinic's daily service queue
- **Release_Record**: A record tracking the release of completed results to a Patient or their representative
- **Activity_Log**: An audit trail entry recording actions performed in the system
- **Frontend**: The existing Next.js web application that consumes the API
- **Reference_Range**: The clinically normal range for a laboratory measurement, used for validation and flagging

---

## Requirements

### Requirement 1: Project Structure and Configuration

**User Story:** As a developer, I want a well-structured Spring Boot project with MongoDB integration, so that the backend follows industry best practices and is maintainable.

#### Acceptance Criteria

1. THE API SHALL be a Spring Boot 3.x application using Java 21 with Spring Data MongoDB as the persistence layer
2. THE API SHALL organize code into layered packages: controller, service, repository, model, dto, config, exception, and validation
3. THE API SHALL use Maven as the build tool with a properly configured pom.xml including all required dependencies
4. THE API SHALL provide environment-based configuration via application.yml with profiles for development, test, and production
5. THE API SHALL connect to a MongoDB instance using a configurable connection URI with database name "mediclinic"
6. WHEN the API starts, THE API SHALL run successfully and expose a health check endpoint at GET /api/health

---

### Requirement 2: Patient Management

**User Story:** As a front desk staff member, I want to register, search, and manage patient records, so that patient information is persisted and retrievable.

#### Acceptance Criteria

1. THE API SHALL store Patient documents in MongoDB with fields: id, registration_date, last_name, first_name, middle_name, address, contact_number, employer, birthdate, marital_status, gender, nationality, created_at, and updated_at
2. WHEN a POST request is sent to /api/patients with valid patient data, THE API SHALL create a new Patient document and return it with HTTP 201
3. WHEN a GET request is sent to /api/patients/{id}, THE API SHALL return the Patient document with HTTP 200
4. IF a GET request is sent to /api/patients/{id} with a non-existent ID, THEN THE API SHALL return HTTP 404 with a descriptive error message
5. WHEN a PUT request is sent to /api/patients/{id} with valid data, THE API SHALL update the Patient document and return it with HTTP 200
6. WHEN a GET request is sent to /api/patients with optional query parameters (search, page, size), THE API SHALL return a paginated list of patients matching the search criteria
7. WHEN a search query is provided, THE API SHALL match against last_name, first_name, employer, and id fields using case-insensitive partial matching
8. THE API SHALL validate that last_name and first_name are non-empty when creating or updating a Patient
9. IF a POST or PUT request contains invalid patient data, THEN THE API SHALL return HTTP 400 with field-level validation error details

---

### Requirement 3: Laboratory Reports

**User Story:** As a lab technician, I want to save and retrieve laboratory test results for patients, so that lab data is persisted per test type.

#### Acceptance Criteria

1. THE API SHALL store Lab_Report documents in MongoDB with fields: id, patient_id, report_type, result_date, data (type-specific fields as an embedded document), is_normal, remark, created_at, and updated_at
2. THE API SHALL support the following report_type values: Urinalysis, Hematology, Chem10, HbA1c, Serology, Fecalysis, BloodTyping
3. WHEN a POST request is sent to /api/patients/{patientId}/lab-reports with valid lab data, THE API SHALL create a new Lab_Report document and return it with HTTP 201
4. WHEN a PUT request is sent to /api/patients/{patientId}/lab-reports/{id} with valid data, THE API SHALL update the Lab_Report document and return it with HTTP 200
5. WHEN a GET request is sent to /api/patients/{patientId}/lab-reports, THE API SHALL return all Lab_Report documents for that patient
6. WHEN a GET request is sent to /api/patients/{patientId}/lab-reports with a report_type query parameter, THE API SHALL return only Lab_Report documents matching that type
7. WHEN a GET request is sent to /api/patients/{patientId}/lab-reports/{id}, THE API SHALL return the specific Lab_Report document
8. IF a lab report references a non-existent patient_id, THEN THE API SHALL return HTTP 404 with a descriptive error message
9. THE API SHALL validate that report_type is one of the supported values when creating or updating a Lab_Report
10. THE API SHALL validate that result_date is a valid date in ISO format when creating or updating a Lab_Report

---

### Requirement 4: Laboratory Reference Range Validation

**User Story:** As a lab technician, I want the backend to validate lab values against clinical reference ranges, so that abnormal and critical values are flagged automatically.

#### Acceptance Criteria

1. THE API SHALL maintain Reference_Range definitions for numeric lab fields including: rbc, hemoglobin, hematocrit, platelet, wbc, neutrophil, lymphocyte, monocyte, eosinophil, basophil, fbs, bun, uric_acid, creatinine, cholesterol, triglyceride, hdl, ldl, sgpt, sgot, hba1c, specific_gravity, and ph
2. WHEN a Lab_Report is created or updated with numeric values, THE API SHALL compare each numeric field against its Reference_Range and include a flags object in the response indicating normal, abnormal, or critical status per field
3. WHILE a numeric lab value falls below the critical low threshold or above the critical high threshold, THE API SHALL flag that field as "critical" in the response
4. WHILE a numeric lab value falls outside the normal range but within non-critical bounds, THE API SHALL flag that field as "abnormal" in the response

---

### Requirement 5: Radiology (X-Ray) Reports

**User Story:** As a radiologist, I want to save and retrieve X-Ray reports for patients, so that radiology findings are persisted.

#### Acceptance Criteria

1. THE API SHALL store Radiology_Report documents in MongoDB with fields: id, patient_id, report_title, result_date, examination_type, xray_no, findings, impression, is_normal, created_at, and updated_at
2. WHEN a POST request is sent to /api/patients/{patientId}/xray-reports with valid data, THE API SHALL create a new Radiology_Report document and return it with HTTP 201
3. WHEN a PUT request is sent to /api/patients/{patientId}/xray-reports/{id} with valid data, THE API SHALL update the Radiology_Report document and return it with HTTP 200
4. WHEN a GET request is sent to /api/patients/{patientId}/xray-reports, THE API SHALL return all Radiology_Report documents for that patient
5. WHEN a GET request is sent to /api/patients/{patientId}/xray-reports/{id}, THE API SHALL return the specific Radiology_Report document
6. THE API SHALL validate that findings and impression are non-empty when creating a Radiology_Report

---

### Requirement 6: UTZ (Ultrasound) Reports

**User Story:** As a sonographer, I want to save and retrieve ultrasound reports for patients, so that UTZ findings are persisted.

#### Acceptance Criteria

1. THE API SHALL store UTZ_Report documents in MongoDB with fields: id, patient_id, report_title, result_date, examination_type, utz_no, findings, impression, is_normal, created_at, and updated_at
2. WHEN a POST request is sent to /api/patients/{patientId}/utz-reports with valid data, THE API SHALL create a new UTZ_Report document and return it with HTTP 201
3. WHEN a PUT request is sent to /api/patients/{patientId}/utz-reports/{id} with valid data, THE API SHALL update the UTZ_Report document and return it with HTTP 200
4. WHEN a GET request is sent to /api/patients/{patientId}/utz-reports, THE API SHALL return all UTZ_Report documents for that patient
5. WHEN a GET request is sent to /api/patients/{patientId}/utz-reports/{id}, THE API SHALL return the specific UTZ_Report document

---

### Requirement 7: ECG Reports

**User Story:** As an ECG technician, I want to save and retrieve ECG reports for patients, so that ECG findings are persisted.

#### Acceptance Criteria

1. THE API SHALL store ECG_Report documents in MongoDB with fields: id, patient_id, report_title, result_date, examination_type, ecg_no, findings, impression, is_normal, created_at, and updated_at
2. WHEN a POST request is sent to /api/patients/{patientId}/ecg-reports with valid data, THE API SHALL create a new ECG_Report document and return it with HTTP 201
3. WHEN a PUT request is sent to /api/patients/{patientId}/ecg-reports/{id} with valid data, THE API SHALL update the ECG_Report document and return it with HTTP 200
4. WHEN a GET request is sent to /api/patients/{patientId}/ecg-reports, THE API SHALL return all ECG_Report documents for that patient
5. WHEN a GET request is sent to /api/patients/{patientId}/ecg-reports/{id}, THE API SHALL return the specific ECG_Report document

---

### Requirement 8: Medical Examination

**User Story:** As a physician, I want to save and retrieve comprehensive medical examination records for patients, so that exam data including physical examination, past medical history, and evaluation is persisted.

#### Acceptance Criteria

1. THE API SHALL store Medical_Exam documents in MongoDB with fields: id, patient_id, result_date, height, weight, bmi, bmi_classification, sa_no, past_medical_history (embedded document), physical_examination (embedded document), lab_diagnostic_summary (embedded document), evaluation (embedded document with evaluation grade, remarks, recommendations, for_clearance), created_at, and updated_at
2. WHEN a POST request is sent to /api/patients/{patientId}/medical-exams with valid data, THE API SHALL create a new Medical_Exam document and return it with HTTP 201
3. WHEN a PUT request is sent to /api/patients/{patientId}/medical-exams/{id} with valid data, THE API SHALL update the Medical_Exam document and return it with HTTP 200
4. WHEN a GET request is sent to /api/patients/{patientId}/medical-exams, THE API SHALL return all Medical_Exam documents for that patient
5. WHEN a GET request is sent to /api/patients/{patientId}/medical-exams/{id}, THE API SHALL return the specific Medical_Exam document
6. WHEN height and weight are provided, THE API SHALL auto-calculate BMI as weight / (height_in_meters)^2 and classify it (Underweight, Normal, Overweight, Obese Class I/II/III)
7. THE API SHALL validate that vital signs (bp_systolic, bp_diastolic, pulse_rate, temperature, respiration) in the physical_examination are within plausible clinical ranges when provided

---

### Requirement 9: Queue Management

**User Story:** As a front desk staff member, I want to manage a daily patient queue, so that patients are tracked through the clinic workflow.

#### Acceptance Criteria

1. THE API SHALL store Queue_Entry documents in MongoDB with fields: id, patient_id, patient_name, employer, department, purpose, status, queue_number, created_at, and updated_at
2. THE API SHALL support the following status values: waiting, in-progress, done
3. THE API SHALL support the following department values: laboratory, medical-exam, xray, utz, ecg
4. WHEN a POST request is sent to /api/queue with valid data, THE API SHALL create a new Queue_Entry with status "waiting" and an auto-incremented queue_number for the current day, and return it with HTTP 201
5. WHEN a PATCH request is sent to /api/queue/{id}/status with a valid status value, THE API SHALL update the Queue_Entry status and return it with HTTP 200
6. WHEN a GET request is sent to /api/queue with optional query parameters (date, status, search), THE API SHALL return Queue_Entry documents matching the criteria, sorted by status priority (waiting first, then in-progress, then done) and queue_number
7. WHEN a DELETE request is sent to /api/queue/completed, THE API SHALL remove all Queue_Entry documents with status "done" for the current day and return the count of removed entries
8. THE API SHALL validate that purpose is non-empty when creating a Queue_Entry

---

### Requirement 10: Result Releasing

**User Story:** As a front desk staff member, I want to track the release of completed results to patients, so that there is a record of who received what and when.

#### Acceptance Criteria

1. THE API SHALL store Release_Record documents in MongoDB with fields: id, patient_id, patient_name, employer, reports (array of report references with id, label, done status), status (ready, released, pending), release_method (pickup, email, portal), released_at, received_by, receiver_type (patient, representative, company), claim_no, created_at, and updated_at
2. WHEN a GET request is sent to /api/releasing with optional query parameters (status, search), THE API SHALL return Release_Record documents matching the criteria
3. WHEN a POST request is sent to /api/releasing/{id}/release with release method and receiver details, THE API SHALL update the Release_Record status to "released", generate a unique claim_no in format CL-{yyyyMMdd}-{sequence}, record the release timestamp, and return it with HTTP 200
4. THE API SHALL determine release readiness by checking whether all referenced reports for a patient are completed
5. IF a release is attempted for a patient whose reports are not all completed, THEN THE API SHALL return HTTP 409 with a descriptive error message listing the pending reports

---

### Requirement 11: Activity Logging

**User Story:** As a clinic administrator, I want an audit trail of all actions performed in the system, so that I can review activity for compliance and troubleshooting.

#### Acceptance Criteria

1. THE API SHALL store Activity_Log documents in MongoDB with fields: id, timestamp, action (created, updated, viewed, saved, queued, released, status_changed), module (Information Desk, Patient Profile, Laboratory, Medical Exam, X-Ray, UTZ, ECG, Releasing), patient_name, patient_id, details, user, and created_at
2. WHEN any create, update, or status change operation is performed on a Patient, Lab_Report, Radiology_Report, UTZ_Report, ECG_Report, Medical_Exam, Queue_Entry, or Release_Record, THE API SHALL automatically create an Activity_Log entry recording the action
3. WHEN a GET request is sent to /api/activity-logs with optional query parameters (date, module, action, search, page, size), THE API SHALL return a paginated list of Activity_Log documents matching the criteria, sorted by timestamp descending
4. THE API SHALL record the user identifier in each Activity_Log entry

---

### Requirement 12: Global Patient Search

**User Story:** As a clinic staff member, I want to search for patients across the system, so that I can quickly find patient records from any module.

#### Acceptance Criteria

1. WHEN a GET request is sent to /api/search with a query parameter q, THE API SHALL search across Patient last_name, first_name, employer, and id fields using case-insensitive partial matching
2. THE API SHALL return matching patients with a summary of their available reports (which lab types exist, whether X-Ray, UTZ, ECG, and Medical Exam records exist)
3. THE API SHALL limit search results to a maximum of 20 entries and return them sorted by relevance (exact matches first, then partial matches)

---

### Requirement 13: Error Handling and Validation

**User Story:** As a developer, I want consistent error responses and input validation, so that the Frontend can display meaningful error messages.

#### Acceptance Criteria

1. THE API SHALL return all error responses in a consistent JSON format with fields: timestamp, status, error, message, and path
2. IF a request body fails validation, THEN THE API SHALL return HTTP 400 with a field-level errors array containing field name, rejected value, and error message for each invalid field
3. IF a requested resource is not found, THEN THE API SHALL return HTTP 404 with a descriptive message identifying the resource type and ID
4. IF an unexpected server error occurs, THEN THE API SHALL return HTTP 500 with a generic error message and log the full stack trace without exposing internal details to the client
5. THE API SHALL validate all date fields conform to ISO 8601 format (yyyy-MM-dd)
6. THE API SHALL trim leading and trailing whitespace from all string input fields before persistence

---

### Requirement 14: CORS and Frontend Integration

**User Story:** As a developer, I want the backend to support cross-origin requests from the Next.js frontend, so that the frontend can communicate with the API during development and production.

#### Acceptance Criteria

1. THE API SHALL configure CORS to allow requests from configurable origin URLs (defaulting to http://localhost:3000 for development)
2. THE API SHALL allow the HTTP methods GET, POST, PUT, PATCH, and DELETE in CORS configuration
3. THE API SHALL allow Content-Type, Authorization, and Accept headers in CORS configuration
4. THE API SHALL expose the Location header in CORS responses for resource creation endpoints

---

### Requirement 15: Data Integrity and Auditing

**User Story:** As a clinic administrator, I want all records to have timestamps and referential consistency, so that data integrity is maintained for medical records.

#### Acceptance Criteria

1. THE API SHALL automatically set created_at to the current UTC timestamp when a document is first created
2. THE API SHALL automatically set updated_at to the current UTC timestamp when a document is modified
3. THE API SHALL create a MongoDB index on patient_id for all report collections (Lab_Report, Radiology_Report, UTZ_Report, ECG_Report, Medical_Exam) to ensure query performance
4. THE API SHALL create a MongoDB index on the Queue_Entry collection for the combination of created_at date and status to support daily queue queries
5. THE API SHALL create a MongoDB text index on Patient for last_name, first_name, and employer to support search queries
6. IF a Patient document is requested for deletion, THEN THE API SHALL verify no associated reports exist and return HTTP 409 with a descriptive message if reports are found

---

### Requirement 16: API Documentation

**User Story:** As a developer, I want auto-generated API documentation, so that the Frontend team can understand and integrate with all endpoints.

#### Acceptance Criteria

1. THE API SHALL integrate SpringDoc OpenAPI to auto-generate API documentation
2. WHEN a GET request is sent to /swagger-ui.html, THE API SHALL serve an interactive Swagger UI page documenting all endpoints
3. THE API SHALL include request/response schemas, parameter descriptions, and example values in the OpenAPI specification
