package com.smartguys.mediclinic.repository;

import com.smartguys.mediclinic.model.EcgReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EcgReportRepository extends MongoRepository<EcgReport, String> {
    
    List<EcgReport> findByPatientId(String patientId);
    
    boolean existsByPatientId(String patientId);
}