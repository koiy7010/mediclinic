package com.smartguys.mediclinic.service;

import com.smartguys.mediclinic.annotation.Auditable;
import com.smartguys.mediclinic.dto.request.PatientRequest;
import com.smartguys.mediclinic.dto.response.PatientResponse;
import com.smartguys.mediclinic.exception.ConflictException;
import com.smartguys.mediclinic.exception.ResourceNotFoundException;
import com.smartguys.mediclinic.model.Patient;
import com.smartguys.mediclinic.model.enums.ActionType;
import com.smartguys.mediclinic.model.enums.ModuleType;
import com.smartguys.mediclinic.repository.*;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PatientService {
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private LabReportRepository labReportRepository;
    
    @Autowired
    private RadiologyReportRepository radiologyReportRepository;
    
    @Autowired
    private UtzReportRepository utzReportRepository;
    
    @Autowired
    private EcgReportRepository ecgReportRepository;
    
    @Autowired
    private MedicalExamRepository medicalExamRepository;
    
    @Auditable(action = ActionType.CREATED, module = ModuleType.PATIENT_PROFILE)
    public PatientResponse createPatient(PatientRequest request) {
        Patient patient = new Patient();
        BeanUtils.copyProperties(request, patient);
        
        LocalDateTime now = LocalDateTime.now();
        patient.setCreatedAt(now);
        patient.setUpdatedAt(now);
        
        if (patient.getRegistrationDate() == null) {
            patient.setRegistrationDate(now.toLocalDate());
        }
        
        Patient savedPatient = patientRepository.save(patient);
        
        PatientResponse response = new PatientResponse();
        BeanUtils.copyProperties(savedPatient, response);
        return response;
    }
    
    public PatientResponse getPatientById(String id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        
        PatientResponse response = new PatientResponse();
        BeanUtils.copyProperties(patient, response);
        return response;
    }
    
    @Auditable(action = ActionType.UPDATED, module = ModuleType.PATIENT_PROFILE)
    public PatientResponse updatePatient(String id, PatientRequest request) {
        Patient existingPatient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        
        BeanUtils.copyProperties(request, existingPatient, "id", "createdAt");
        existingPatient.setUpdatedAt(LocalDateTime.now());
        
        Patient savedPatient = patientRepository.save(existingPatient);
        
        PatientResponse response = new PatientResponse();
        BeanUtils.copyProperties(savedPatient, response);
        return response;
    }
    
    public Page<PatientResponse> listPatients(String search, Pageable pageable) {
        Page<Patient> patients;
        
        if (search != null && !search.trim().isEmpty()) {
            patients = patientRepository.findBySearchQuery(search.trim(), pageable);
        } else {
            patients = patientRepository.findAll(pageable);
        }
        
        return patients.map(patient -> {
            PatientResponse response = new PatientResponse();
            BeanUtils.copyProperties(patient, response);
            return response;
        });
    }
    
    @Auditable(action = ActionType.UPDATED, module = ModuleType.PATIENT_PROFILE)
    public void deletePatient(String id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        
        // Check for referential integrity
        if (labReportRepository.existsByPatientId(id) ||
            radiologyReportRepository.existsByPatientId(id) ||
            utzReportRepository.existsByPatientId(id) ||
            ecgReportRepository.existsByPatientId(id) ||
            medicalExamRepository.existsByPatientId(id)) {
            
            throw new ConflictException("Cannot delete patient with associated reports");
        }
        
        patientRepository.delete(patient);
    }
}