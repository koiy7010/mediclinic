package com.smartguys.mediclinic.service;

import com.smartguys.mediclinic.annotation.Auditable;
import com.smartguys.mediclinic.dto.request.MedicalExamRequest;
import com.smartguys.mediclinic.dto.response.MedicalExamResponse;
import com.smartguys.mediclinic.exception.ResourceNotFoundException;
import com.smartguys.mediclinic.exception.ValidationException;
import com.smartguys.mediclinic.model.MedicalExam;
import com.smartguys.mediclinic.model.enums.ActionType;
import com.smartguys.mediclinic.model.enums.ModuleType;
import com.smartguys.mediclinic.repository.MedicalExamRepository;
import com.smartguys.mediclinic.repository.PatientRepository;
import com.smartguys.mediclinic.util.BmiCalculator;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalExamService {
    
    @Autowired
    private MedicalExamRepository medicalExamRepository;
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Auditable(action = ActionType.CREATED, module = ModuleType.MEDICAL_EXAM)
    public MedicalExamResponse createMedicalExam(String patientId, MedicalExamRequest request) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        // Validate result date
        LocalDate resultDate = parseResultDate(request.getResultDate());
        
        MedicalExam exam = new MedicalExam();
        BeanUtils.copyProperties(request, exam, "resultDate");
        exam.setPatientId(patientId);
        exam.setResultDate(resultDate);
        
        // Auto-calculate BMI if height and weight are provided
        if (request.getHeight() != null && request.getWeight() != null) {
            validateVitalSigns(request);
            double bmi = BmiCalculator.calculateBmi(request.getHeight(), request.getWeight());
            exam.setBmi(bmi);
            exam.setBmiClassification(BmiCalculator.classifyBmi(bmi));
        }
        
        LocalDateTime now = LocalDateTime.now();
        exam.setCreatedAt(now);
        exam.setUpdatedAt(now);
        
        MedicalExam savedExam = medicalExamRepository.save(exam);
        
        MedicalExamResponse response = new MedicalExamResponse();
        BeanUtils.copyProperties(savedExam, response);
        return response;
    }
    
    @Auditable(action = ActionType.UPDATED, module = ModuleType.MEDICAL_EXAM)
    public MedicalExamResponse updateMedicalExam(String patientId, String examId, MedicalExamRequest request) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        MedicalExam existingExam = medicalExamRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical exam not found with id: " + examId));
        
        // Validate exam belongs to patient
        if (!existingExam.getPatientId().equals(patientId)) {
            throw new ValidationException("Medical exam does not belong to the specified patient");
        }
        
        // Validate result date
        LocalDate resultDate = parseResultDate(request.getResultDate());
        
        BeanUtils.copyProperties(request, existingExam, "id", "patientId", "createdAt", "resultDate");
        existingExam.setResultDate(resultDate);
        
        // Auto-calculate BMI if height and weight are provided
        if (request.getHeight() != null && request.getWeight() != null) {
            validateVitalSigns(request);
            double bmi = BmiCalculator.calculateBmi(request.getHeight(), request.getWeight());
            existingExam.setBmi(bmi);
            existingExam.setBmiClassification(BmiCalculator.classifyBmi(bmi));
        }
        
        existingExam.setUpdatedAt(LocalDateTime.now());
        
        MedicalExam savedExam = medicalExamRepository.save(existingExam);
        
        MedicalExamResponse response = new MedicalExamResponse();
        BeanUtils.copyProperties(savedExam, response);
        return response;
    }
    
    public List<MedicalExamResponse> getMedicalExamsByPatient(String patientId) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        List<MedicalExam> exams = medicalExamRepository.findByPatientId(patientId);
        
        return exams.stream()
                .map(exam -> {
                    MedicalExamResponse response = new MedicalExamResponse();
                    BeanUtils.copyProperties(exam, response);
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    public MedicalExamResponse getMedicalExamById(String patientId, String examId) {
        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        MedicalExam exam = medicalExamRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical exam not found with id: " + examId));
        
        // Validate exam belongs to patient
        if (!exam.getPatientId().equals(patientId)) {
            throw new ValidationException("Medical exam does not belong to the specified patient");
        }
        
        MedicalExamResponse response = new MedicalExamResponse();
        BeanUtils.copyProperties(exam, response);
        return response;
    }
    
    private LocalDate parseResultDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return LocalDate.now();
        }
        
        try {
            return LocalDate.parse(dateString.trim());
        } catch (DateTimeParseException e) {
            throw new ValidationException("Invalid date format. Expected yyyy-MM-dd");
        }
    }
    
    private void validateVitalSigns(MedicalExamRequest request) {
        if (request.getPhysicalExamination() != null) {
            var pe = request.getPhysicalExamination();
            
            // Validate blood pressure
            if (pe.getBpSystolic() != null && (pe.getBpSystolic() < 60 || pe.getBpSystolic() > 300)) {
                throw new ValidationException("Systolic blood pressure must be between 60 and 300 mmHg");
            }
            if (pe.getBpDiastolic() != null && (pe.getBpDiastolic() < 30 || pe.getBpDiastolic() > 200)) {
                throw new ValidationException("Diastolic blood pressure must be between 30 and 200 mmHg");
            }
            
            // Validate pulse rate
            if (pe.getPulseRate() != null && (pe.getPulseRate() < 30 || pe.getPulseRate() > 250)) {
                throw new ValidationException("Pulse rate must be between 30 and 250 bpm");
            }
            
            // Validate temperature
            if (pe.getTemperature() != null && (pe.getTemperature() < 30 || pe.getTemperature() > 45)) {
                throw new ValidationException("Temperature must be between 30 and 45 degrees Celsius");
            }
            
            // Validate respiration
            if (pe.getRespiration() != null && (pe.getRespiration() < 5 || pe.getRespiration() > 60)) {
                throw new ValidationException("Respiration rate must be between 5 and 60 breaths per minute");
            }
        }
    }
}