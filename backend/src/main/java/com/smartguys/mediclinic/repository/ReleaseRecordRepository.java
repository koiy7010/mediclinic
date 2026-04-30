package com.smartguys.mediclinic.repository;

import com.smartguys.mediclinic.model.ReleaseRecord;
import com.smartguys.mediclinic.model.enums.ReleaseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ReleaseRecordRepository extends MongoRepository<ReleaseRecord, String> {
    
    Page<ReleaseRecord> findByStatus(ReleaseStatus status, Pageable pageable);
    
    @Query("{ $or: [ " +
           "{ 'patientName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'employer': { $regex: ?0, $options: 'i' } }, " +
           "{ 'claimNo': { $regex: ?0, $options: 'i' } } " +
           "] }")
    Page<ReleaseRecord> findBySearchQuery(String searchQuery, Pageable pageable);
    
    @Query("{ 'status': ?1, $or: [ " +
           "{ 'patientName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'employer': { $regex: ?0, $options: 'i' } }, " +
           "{ 'claimNo': { $regex: ?0, $options: 'i' } } " +
           "] }")
    Page<ReleaseRecord> findBySearchQueryAndStatus(String searchQuery, ReleaseStatus status, Pageable pageable);
}