# Implementation Plan: Spring Boot MongoDB Backend

## Overview

This plan implements a Spring Boot 3.x REST API backend with MongoDB for the MediClinic Health Records System. The implementation follows a layered architecture (Controller → Service → Repository) and is organized into incremental steps: project scaffolding, data models, DTOs, services, controllers, cross-cutting concerns, and testing. Each task builds on previous ones, ensuring no orphaned code.

## Tasks

- [x] 1. Project scaffolding and configuration
  - [x] 1.1 Create Maven project with pom.xml and Spring Boot dependencies
    - Create `backend/pom.xml` with Spring Boot 3.x parent, Java 21, and dependencies: spring-boot-starter-web, spring-boot-starter-data-mongodb, spring-boot-starter-validation, spring-boot-starter-aop, springdoc-openapi-starter-webmvc-ui, lombok, spring-boot-starter-test, de.flapdoodle.embed.mongo.spring3x (test), net.jqwik (test), mockito (test)
    - Create `backend/src/main/java/com/smartguys/mediclinic/MediclinicApplication.java` with `@SpringBootApplication`
    - _Requirements: 1.1, 1.3_

  - [x] 1.2 Create application configuration files
    - Create `backend/src/main/resources/application.yml` with MongoDB URI (`mongodb://localhost:27017/mediclinic`), server port 8080, and default profile
    - Create `backend/src/main/resources/application-dev.yml` with development-specific settings
    - Create `backend/src/main/resources/application-test.yml` with embedded MongoDB settings
    - Create `backend/src/main/resources/application-prod.yml` with production placeholders
    - _Requirements: 1.4, 1.5_

  - [x] 1.3 Create CORS configuration and OpenAPI configuration
    - Create `CorsConfig.java` allowing configurable origins (default `http://localhost:3000`), methods GET/POST/PUT/PATCH/DELETE, headers Content-Type/Authorization/Accept, and exposing the Location header
    - Create `OpenApiConfig.java` with API title "MediClinic API", description, and version
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 16.1, 16.3_

  - [x] 1.4 Create health check endpoint
    - Create `HealthController.java` with GET `/api/health` returning `{ "status": "UP" }`
    - _Requirements: 1.6_

- [x] 2. Enums and MongoDB data models
  - [x] 2.1 Create enum types
    - Create enums in `model/enums/` package: `ReportType` (Urinalysis, Hematology, Chem10, HbA1c, Serology, Fecalysis, BloodTyping), `QueueStatus` (waiting, in_progress, done), `Department` (laboratory, medical_exam, xray, utz, ecg), `ReleaseStatus` (ready, released, pending), `ReleaseMethod` (pickup, email, portal), `ReceiverType` (patient, representative, company), `ActionType` (created, updated, viewed, saved, queued, released, status_changed), `ModuleType` (Information_Desk, Patient_Profile, Laboratory, Medical_Exam, X_Ray, UTZ, ECG, Releasing), `BmiClassification` (Underweight, Normal, Overweight, Obese_I, Obese_II, Obese_III)
    - Use `@JsonValue` for JSON serialization of kebab-case/display values
    - _Requirements: 3.2, 9.2, 9.3, 10.1, 11.1_

  - [x] 2.2 Create Patient model and repository
    - Create `Patient.java` with `@Document(collection = "patients")`, fields: id, registration_date, last_name, first_name, middle_name, address, contact_number, employer, birthdate, marital_status, gender, nationality, created_at, updated_at
    - Create `PatientRepository.java` extending `MongoRepository<Patient, String>` with custom query methods for search
    - Add `@TextIndexed` on last_name, first_name, employer for text search index
    - _Requirements: 2.1, 15.3, 15.5_

  - [x] 2.3 Create LabReport model and repository
    - Create `LabReport.java` with `@Document(collection = "lab_reports")`, fields: id, patient_id, report_type (ReportType enum), result_date, data (Map<String, Object> for type-specific embedded document), is_normal, remark, flags (Map<String, String>), created_at, updated_at
    - Create `LabReportRepository.java` with methods: `findByPatientId`, `findByPatientIdAndReportType`, `existsByPatientId`
    - Add `@Indexed` on patient_id and compound index on patient_id + report_type
    - _Requirements: 3.1, 15.3_

  - [x] 2.4 Create RadiologyReport, UtzReport, and EcgReport models and repositories
    - Create `RadiologyReport.java` with `@Document(collection = "radiology_reports")`, fields: id, patient_id, report_title, result_date, examination_type, xray_no, findings, impression, is_normal, created_at, updated_at
    - Create `UtzReport.java` with `@Document(collection = "utz_reports")`, fields: id, patient_id, report_title, result_date, examination_type, utz_no, findings, impression, is_normal, created_at, updated_at
    - Create `EcgReport.java` with `@Document(collection = "ecg_reports")`, fields: id, patient_id, report_title, result_date, examination_type, ecg_no, findings, impression, is_normal, created_at, updated_at
    - Create corresponding repositories with `findByPatientId` and `existsByPatientId` methods, `@Indexed` on patient_id
    - _Requirements: 5.1, 6.1, 7.1, 15.3_

  - [x] 2.5 Create MedicalExam model and repository
    - Create `MedicalExam.java` with `@Document(collection = "medical_exams")`, fields: id, patient_id, result_date, height, weight, bmi, bmi_classification, sa_no, past_medical_history (embedded), physical_examination (embedded), lab_diagnostic_summary (embedded), evaluation (embedded with evaluation grade, remarks, recommendations, for_clearance), created_at, updated_at
    - Create `MedicalExamRepository.java` with `findByPatientId` and `existsByPatientId`, `@Indexed` on patient_id
    - _Requirements: 8.1, 15.3_

  - [x] 2.6 Create QueueEntry, ReleaseRecord, ActivityLog, and Counter models and repositories
    - Create `QueueEntry.java` with `@Document(collection = "queue_entries")`, fields: id, patient_id, patient_name, employer, department, purpose, status, queue_number, created_at, updated_at; compound index on created_at + status
    - Create `ReleaseRecord.java` with `@Document(collection = "release_records")`, fields: id, patient_id, patient_name, employer, reports (List of embedded report references), status, release_method, released_at, received_by, receiver_type, claim_no, created_at, updated_at; indexes on patient_id and status
    - Create `ActivityLog.java` with `@Document(collection = "activity_logs")`, fields: id, timestamp, action, module, patient_name, patient_id, details, user, created_at; indexes on timestamp (desc) and compound module + action
    - Create `Counter.java` with `@Document(collection = "counters")`, fields: id (String key), seq (long)
    - Create corresponding repositories: `QueueEntryRepository`, `ReleaseRecordRepository`, `ActivityLogRepository`, `CounterRepository`
    - _Requirements: 9.1, 10.1, 11.1, 15.4_

- [x] 3. Checkpoint - Verify models compile
  - Ensure all models, enums, and repositories compile successfully. Ask the user if questions arise.

- [x] 4. DTOs and validation infrastructure
  - [x] 4.1 Create request DTOs with Jakarta Bean Validation
    - Create `PatientRequest.java` with `@NotBlank` on last_name and first_name, and all patient fields
    - Create `LabReportRequest.java` with `@NotNull` report_type, `@Pattern` for result_date (ISO format), data map, is_normal, remark
    - Create `RadiologyReportRequest.java` with `@NotBlank` on findings and impression, result_date, report_title, examination_type, xray_no, is_normal
    - Create `UtzReportRequest.java` with result_date, report_title, examination_type, utz_no, findings, impression, is_normal
    - Create `EcgReportRequest.java` with result_date, report_title, examination_type, ecg_no, findings, impression, is_normal
    - Create `MedicalExamRequest.java` with result_date, height, weight, sa_no, past_medical_history, physical_examination, lab_diagnostic_summary, evaluation
    - Create `QueueEntryRequest.java` with patient_id, patient_name, employer, department, `@NotBlank` purpose
    - Create `StatusUpdateRequest.java` with `@NotNull` status
    - Create `ReleaseRequest.java` with release_method, received_by, receiver_type
    - _Requirements: 2.8, 2.9, 3.9, 3.10, 5.6, 9.8, 13.2, 13.5_

  - [x] 4.2 Create response DTOs
    - Create `PatientResponse.java`, `LabReportResponse.java` (including flags map), `RadiologyReportResponse.java`, `UtzReportResponse.java`, `EcgReportResponse.java`, `MedicalExamResponse.java`, `QueueEntryResponse.java`, `ReleaseRecordResponse.java`, `ActivityLogResponse.java`, `SearchResultResponse.java` (patient summary with report availability), `ErrorResponse.java` (with fieldErrors list), `PagedResponse.java` (generic paginated wrapper)
    - _Requirements: 4.2, 12.2, 13.1_

  - [x] 4.3 Create global string trimming deserializer and error response classes
    - Create `StringTrimDeserializer.java` extending `JsonDeserializer<String>` that trims leading/trailing whitespace from all incoming string fields
    - Register it globally via a Jackson `ObjectMapper` configuration bean in `MongoConfig.java` or a dedicated `JacksonConfig.java`
    - Create `ErrorResponse` and `FieldError` records for consistent error formatting
    - _Requirements: 13.1, 13.6_

  - [x] 4.4 Create custom exception classes and global exception handler
    - Create `ResourceNotFoundException.java`, `ValidationException.java`, `ConflictException.java`
    - Create `GlobalExceptionHandler.java` with `@RestControllerAdvice` handling: `MethodArgumentNotValidException` → 400, `ValidationException` → 400, `ResourceNotFoundException` → 404, `ConflictException` → 409, `HttpMessageNotReadableException` → 400, generic `Exception` → 500
    - Return consistent `ErrorResponse` JSON with timestamp, status, error, message, path, and fieldErrors
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 5. Utility services and cross-cutting concerns
  - [x] 5.1 Implement ReferenceRangeConfig and ReferenceRangeService
    - Create `ReferenceRangeConfig.java` as a static configuration class defining normal and critical ranges for all numeric lab fields: rbc, hemoglobin, hematocrit, platelet, wbc, neutrophil, lymphocyte, monocyte, eosinophil, basophil, fbs, bun, uric_acid, creatinine, cholesterol, triglyceride, hdl, ldl, sgpt, sgot, hba1c, specific_gravity, ph
    - Create `ReferenceRangeService.java` that evaluates a map of numeric lab values against the configured ranges and returns a `Map<String, String>` of field → flag ("normal", "abnormal", "critical")
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 5.2 Write property test for reference range flag correctness
    - **Property 5: Reference range flag correctness**
    - Generate random numeric values for each lab field and verify the flag is "normal" when within range, "abnormal" when outside normal but within critical bounds, and "critical" when beyond critical thresholds
    - **Validates: Requirements 4.2, 4.3, 4.4**

  - [x] 5.3 Implement BmiCalculator utility
    - Create `BmiCalculator.java` with static methods: `calculateBmi(double heightCm, double weightKg)` returning `weight / (heightCm / 100)²`, and `classifyBmi(double bmi)` returning `BmiClassification` enum
    - _Requirements: 8.6_

  - [x] 5.4 Write property test for BMI calculation and classification
    - **Property 6: BMI calculation and classification**
    - Generate random height (50–250 cm) and weight (10–300 kg) pairs, verify BMI formula correctness within floating-point tolerance and classification boundaries
    - **Validates: Requirements 8.6**

  - [x] 5.5 Implement CounterService for atomic sequences
    - Create `CounterService.java` using MongoDB `findAndModify` with upsert on the `counters` collection to atomically increment and return sequence numbers
    - Implement `getNextQueueNumber(LocalDate date)` with key `queue_{date}` and `getNextClaimNumber(LocalDate date)` with key `claim_{date}`
    - _Requirements: 9.4, 10.3_

  - [x] 5.6 Implement AOP audit logging
    - Create `@Auditable` annotation with `action` (ActionType) and `module` (ModuleType) attributes
    - Create `AuditAspect.java` with `@Around` advice that intercepts `@Auditable` service methods, extracts patient info from method arguments or return value, and writes an `ActivityLog` document
    - Create `ActivityLogService.java` for saving and querying activity logs with pagination and filtering by date, module, action, and search
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 6. Checkpoint - Verify utilities and cross-cutting concerns
  - Ensure all utility services, exception handling, audit aspect, and DTOs compile and any property tests pass. Ask the user if questions arise.

- [x] 7. Core service layer implementation
  - [x] 7.1 Implement PatientService
    - Create `PatientService.java` with methods: `createPatient`, `getPatientById`, `updatePatient`, `listPatients` (paginated with search), `deletePatient` (with referential integrity check across all report repositories)
    - Set `created_at` and `updated_at` timestamps automatically
    - Validate patient existence before returning, throw `ResourceNotFoundException` for missing patients
    - Throw `ConflictException` on delete if associated reports exist
    - Annotate methods with `@Auditable` for audit logging
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 15.1, 15.2, 15.6_

  - [x] 7.2 Write property tests for Patient service
    - **Property 1: Patient round-trip persistence** — Create patient with random valid data, read back by ID, verify all fields match after trimming
    - **Property 2: Patient update round-trip** — Update existing patient with random valid data, read back, verify fields match and updated_at >= created_at
    - **Property 14: Patient deletion referential integrity** — Verify delete fails with conflict for patients with reports, succeeds for patients without
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.5, 15.1, 15.2, 15.6**

  - [x] 7.3 Implement LabReportService
    - Create `LabReportService.java` with methods: `createLabReport`, `updateLabReport`, `getLabReportsByPatient` (with optional report_type filter), `getLabReportById`
    - Validate patient existence before creating/updating, throw `ResourceNotFoundException` if patient not found
    - Validate report_type is a supported enum value
    - Validate result_date is a valid ISO date via `LocalDate.parse()`
    - Call `ReferenceRangeService` to compute flags for numeric fields on create/update
    - Set `created_at` and `updated_at` timestamps automatically
    - Annotate methods with `@Auditable`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 4.2, 15.1, 15.2_

  - [x] 7.4 Write property tests for LabReport service
    - **Property 3: Lab report round-trip persistence** — Create lab report with random valid data for each report type, read back, verify fields match
    - **Property 4: Lab report type filtering** — Create mixed-type reports for a patient, filter by type, verify only matching reports returned with correct count
    - **Validates: Requirements 3.1, 3.3, 3.6, 3.7**

  - [x] 7.5 Implement RadiologyReportService, UtzReportService, and EcgReportService
    - Create `RadiologyReportService.java` with CRUD methods for X-Ray reports, patient existence validation, `@Auditable` annotations
    - Create `UtzReportService.java` with CRUD methods for UTZ reports, patient existence validation, `@Auditable` annotations
    - Create `EcgReportService.java` with CRUD methods for ECG reports, patient existence validation, `@Auditable` annotations
    - Set `created_at` and `updated_at` timestamps automatically for all three
    - _Requirements: 5.1–5.6, 6.1–6.5, 7.1–7.5, 15.1, 15.2_

  - [x] 7.6 Implement MedicalExamService
    - Create `MedicalExamService.java` with CRUD methods for medical exams
    - Auto-calculate BMI using `BmiCalculator` when height and weight are provided
    - Validate vital signs (bp_systolic, bp_diastolic, pulse_rate, temperature, respiration) are within plausible clinical ranges
    - Validate patient existence, set timestamps, annotate with `@Auditable`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 15.1, 15.2_

  - [x] 7.7 Implement QueueService
    - Create `QueueService.java` with methods: `createQueueEntry` (auto-assign queue_number via CounterService, set status to "waiting"), `updateQueueStatus`, `listQueueEntries` (filter by date/status/search, sort by status priority then queue_number), `removeCompletedEntries` (delete "done" entries for current day, return count)
    - Set timestamps, annotate with `@Auditable`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 15.1, 15.2_

  - [x] 7.8 Write property tests for Queue service
    - **Property 10: Queue number sequential assignment** — Create N queue entries on the same day, verify queue numbers are consecutive 1..N with no gaps or duplicates
    - **Property 11: Queue entry sort order** — Create entries with mixed statuses, list them, verify sorted by status priority (waiting < in-progress < done) then queue_number ascending
    - **Validates: Requirements 9.4, 9.6**

  - [x] 7.9 Implement ReleasingService
    - Create `ReleasingService.java` with methods: `listReleaseRecords` (filter by status/search), `releaseResults` (validate all reports done, generate claim_no via CounterService in format `CL-{yyyyMMdd}-{sequence}`, set status to "released", record released_at and receiver details)
    - Throw `ConflictException` if any report has `done == false` with message listing pending reports
    - Set timestamps, annotate with `@Auditable`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 15.1, 15.2_

  - [x] 7.10 Write property tests for Releasing service
    - **Property 12: Claim number format and uniqueness** — Perform N releases on the same day, verify each claim_no matches `CL-{yyyyMMdd}-{sequence}` pattern with unique, strictly increasing sequence numbers
    - **Property 13: Release readiness determination** — Generate random report completion states, verify status is "ready" iff all reports have done==true, otherwise "pending"
    - **Validates: Requirements 10.3, 10.4**

  - [x] 7.11 Implement SearchService
    - Create `SearchService.java` with method `globalSearch(String query)` that searches Patient last_name, first_name, employer, and id using case-insensitive partial matching
    - Return matching patients with a summary of available reports (which lab types exist, whether X-Ray/UTZ/ECG/Medical Exam records exist)
    - Limit results to 20, sort by relevance (exact matches first, then partial)
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 7.12 Write property test for patient search
    - **Property 9: Patient search case-insensitive partial matching** — For a random existing patient, take a random substring of their last_name/first_name/employer in any case variation, verify search results include that patient
    - **Validates: Requirements 2.7, 12.1**

- [x] 8. Checkpoint - Verify service layer
  - Ensure all services compile, property tests pass, and service-level logic is correct. Ask the user if questions arise.

- [x] 9. Controller layer implementation
  - [x] 9.1 Implement PatientController
    - Create `PatientController.java` with endpoints: POST `/api/patients`, GET `/api/patients/{id}`, PUT `/api/patients/{id}`, GET `/api/patients` (paginated with search), DELETE `/api/patients/{id}`
    - Use `@Valid` on request bodies, delegate to `PatientService`, return appropriate HTTP status codes (201 for create, 200 for get/update, 204 for delete)
    - Add OpenAPI annotations (`@Operation`, `@ApiResponse`, `@Tag`) for documentation
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 16.3_

  - [x] 9.2 Implement LabReportController
    - Create `LabReportController.java` with endpoints: POST `/api/patients/{patientId}/lab-reports`, PUT `/api/patients/{patientId}/lab-reports/{id}`, GET `/api/patients/{patientId}/lab-reports` (with optional report_type filter), GET `/api/patients/{patientId}/lab-reports/{id}`
    - Use `@Valid`, delegate to `LabReportService`, return appropriate status codes
    - Add OpenAPI annotations
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 16.3_

  - [x] 9.3 Implement RadiologyReportController, UtzReportController, and EcgReportController
    - Create `RadiologyReportController.java` with CRUD endpoints under `/api/patients/{patientId}/xray-reports`
    - Create `UtzReportController.java` with CRUD endpoints under `/api/patients/{patientId}/utz-reports`
    - Create `EcgReportController.java` with CRUD endpoints under `/api/patients/{patientId}/ecg-reports`
    - Use `@Valid`, delegate to respective services, add OpenAPI annotations
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 6.2, 6.3, 6.4, 6.5, 7.2, 7.3, 7.4, 7.5, 16.3_

  - [x] 9.4 Implement MedicalExamController
    - Create `MedicalExamController.java` with CRUD endpoints under `/api/patients/{patientId}/medical-exams`
    - Use `@Valid`, delegate to `MedicalExamService`, add OpenAPI annotations
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 16.3_

  - [x] 9.5 Implement QueueController
    - Create `QueueController.java` with endpoints: POST `/api/queue`, PATCH `/api/queue/{id}/status`, GET `/api/queue` (with date/status/search filters), DELETE `/api/queue/completed`
    - Use `@Valid`, delegate to `QueueService`, add OpenAPI annotations
    - _Requirements: 9.4, 9.5, 9.6, 9.7, 16.3_

  - [x] 9.6 Implement ReleasingController and ActivityLogController
    - Create `ReleasingController.java` with endpoints: GET `/api/releasing` (with status/search filters), POST `/api/releasing/{id}/release`
    - Create `ActivityLogController.java` with endpoint: GET `/api/activity-logs` (paginated with date/module/action/search filters)
    - Use `@Valid`, delegate to respective services, add OpenAPI annotations
    - _Requirements: 10.2, 10.3, 11.3, 16.3_

  - [x] 9.7 Implement SearchController
    - Create `SearchController.java` with endpoint: GET `/api/search?q=` delegating to `SearchService`
    - Add OpenAPI annotations
    - _Requirements: 12.1, 12.2, 12.3, 16.3_

- [x] 10. Checkpoint - Verify controllers and full API
  - Ensure all controllers compile, the application starts successfully, and Swagger UI is accessible at `/swagger-ui.html`. Ask the user if questions arise.

- [x] 11. Validation and remaining property tests
  - [x] 11.1 Write property test for whitespace rejection on required fields
    - **Property 7: Required field whitespace rejection**
    - Generate whitespace-only strings, verify they are rejected by validation for patient last_name, first_name, radiology findings, radiology impression, and queue purpose
    - **Validates: Requirements 2.8, 5.6, 9.8**

  - [x] 11.2 Write property test for string trimming on persistence
    - **Property 8: String trimming on persistence**
    - Generate strings with leading/trailing whitespace, persist via service, read back, verify stored value equals `input.trim()`
    - **Validates: Requirements 13.6**

  - [x] 11.3 Write unit tests for error handling and edge cases
    - Test 404 responses for non-existent patient, lab report, radiology report, UTZ report, ECG report, medical exam, queue entry
    - Test 409 response for deleting patient with associated reports
    - Test 409 response for releasing incomplete results
    - Test 400 responses for invalid report_type, invalid date format, missing required fields
    - Test date validation for impossible dates (e.g., 2024-02-30)
    - Test enum validation for invalid queue status, department values
    - _Requirements: 2.4, 2.9, 3.8, 3.9, 3.10, 10.5, 13.1, 13.2, 13.3, 13.4, 13.5, 15.6_

  - [x] 11.4 Write integration tests for key API flows
    - Test patient CRUD flow end-to-end with embedded MongoDB
    - Test lab report creation with reference range flag computation
    - Test queue entry creation with auto-incremented queue number
    - Test release flow with claim number generation
    - Test activity log creation via AOP audit aspect
    - Test global search returning patient with report summary
    - _Requirements: 2.2, 2.3, 2.5, 3.3, 4.2, 9.4, 10.3, 11.2, 12.1_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Run `mvn clean test` in the `backend/` directory. Ensure all property-based tests, unit tests, and integration tests pass. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document using jqwik
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests use embedded MongoDB (Flapdoodle) for end-to-end verification
- The implementation language is Java 21 with Spring Boot 3.x as specified in the design
