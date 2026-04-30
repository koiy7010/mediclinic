package com.smartguys.mediclinic.service;

import com.smartguys.mediclinic.annotation.Auditable;
import com.smartguys.mediclinic.dto.request.ReleaseRequest;
import com.smartguys.mediclinic.dto.response.ReleaseRecordResponse;
import com.smartguys.mediclinic.exception.ConflictException;
import com.smartguys.mediclinic.exception.ResourceNotFoundException;
import com.smartguys.mediclinic.model.ReleaseRecord;
import com.smartguys.mediclinic.model.embedded.ReportReference;
import com.smartguys.mediclinic.model.enums.ActionType;
import com.smartguys.mediclinic.model.enums.ModuleType;
import com.smartguys.mediclinic.model.enums.ReleaseStatus;
import com.smartguys.mediclinic.repository.ReleaseRecordRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReleasingService {
    
    private final ReleaseRecordRepository releaseRecordRepository;
    private final CounterService counterService;
    
    public ReleasingService(ReleaseRecordRepository releaseRecordRepository, CounterService counterService) {
        this.releaseRecordRepository = releaseRecordRepository;
        this.counterService = counterService;
    }
    
    public Page<ReleaseRecordResponse> listReleaseRecords(ReleaseStatus status, String search, Pageable pageable) {
        Page<ReleaseRecord> records;
        
        if (status != null && search != null && !search.trim().isEmpty()) {
            records = releaseRecordRepository.findBySearchQueryAndStatus(search.trim(), status, pageable);
        } else if (status != null) {
            records = releaseRecordRepository.findByStatus(status, pageable);
        } else if (search != null && !search.trim().isEmpty()) {
            records = releaseRecordRepository.findBySearchQuery(search.trim(), pageable);
        } else {
            records = releaseRecordRepository.findAll(pageable);
        }
        
        return records.map(record -> {
            ReleaseRecordResponse response = new ReleaseRecordResponse();
            BeanUtils.copyProperties(record, response);
            return response;
        });
    }
    
    @Auditable(action = ActionType.RELEASED, module = ModuleType.RELEASING)
    public ReleaseRecordResponse releaseResults(String recordId, ReleaseRequest request) {
        ReleaseRecord record = releaseRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Release record not found with id: " + recordId));
        
        // Validate all reports are done
        List<ReportReference> pendingReports = record.getReports().stream()
                .filter(report -> report.getDone() == null || !report.getDone())
                .collect(Collectors.toList());
        
        if (!pendingReports.isEmpty()) {
            String pendingReportNames = pendingReports.stream()
                    .map(ReportReference::getReportType)
                    .collect(Collectors.joining(", "));
            throw new ConflictException("Cannot release results. Pending reports: " + pendingReportNames);
        }
        
        // Generate claim number
        long claimSequence = counterService.getNextClaimNumber(LocalDate.now());
        String claimNo = String.format("CL-%s-%03d", 
                LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")), 
                claimSequence);
        
        // Update record
        record.setStatus(ReleaseStatus.RELEASED);
        record.setReleaseMethod(request.getReleaseMethod());
        record.setReceivedBy(request.getReceivedBy());
        record.setReceiverType(request.getReceiverType());
        record.setClaimNo(claimNo);
        record.setReleasedAt(LocalDateTime.now());
        record.setUpdatedAt(LocalDateTime.now());
        
        ReleaseRecord savedRecord = releaseRecordRepository.save(record);
        
        ReleaseRecordResponse response = new ReleaseRecordResponse();
        BeanUtils.copyProperties(savedRecord, response);
        return response;
    }
}