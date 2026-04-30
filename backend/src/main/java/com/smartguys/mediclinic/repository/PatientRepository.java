package com.smartguys.mediclinic.repository;

import com.smartguys.mediclinic.model.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends MongoRepository<Patient, String> {
    
    @Query("{ $or: [ " +
           "{ 'lastName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'firstName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'employer': { $regex: ?0, $options: 'i' } }, " +
           "{ 'id': { $regex: ?0, $options: 'i' } } " +
           "] }")
    Page<Patient> findBySearchQuery(String searchQuery, Pageable pageable);
    
    @Query("{ $text: { $search: ?0 } }")
    Page<Patient> findByTextSearch(String searchText, Pageable pageable);
}