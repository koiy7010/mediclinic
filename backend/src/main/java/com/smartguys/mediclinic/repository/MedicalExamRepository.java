package com.smartguys.mediclinic.repository;

import com.smartguys.mediclinic.model.MedicalExam;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalExamRepository extends MongoRepository<MedicalExam, String> {
    
    List<MedicalExam> findByPatientId(String patientId);
    
    boolean existsByPatientId(String patientId);
}