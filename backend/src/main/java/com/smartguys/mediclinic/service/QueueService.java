package com.smartguys.mediclinic.service;

import com.smartguys.mediclinic.annotation.Auditable;
import com.smartguys.mediclinic.dto.request.QueueEntryRequest;
import com.smartguys.mediclinic.dto.request.StatusUpdateRequest;
import com.smartguys.mediclinic.dto.response.QueueEntryResponse;
import com.smartguys.mediclinic.exception.ResourceNotFoundException;
import com.smartguys.mediclinic.model.QueueEntry;
import com.smartguys.mediclinic.model.enums.ActionType;
import com.smartguys.mediclinic.model.enums.ModuleType;
import com.smartguys.mediclinic.model.enums.QueueStatus;
import com.smartguys.mediclinic.repository.QueueEntryRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class QueueService {
    
    @Autowired
    private QueueEntryRepository queueEntryRepository;
    
    @Autowired
    private CounterService counterService;
    
    @Auditable(action = ActionType.QUEUED, module = ModuleType.INFORMATION_DESK)
    public QueueEntryResponse createQueueEntry(QueueEntryRequest request) {
        QueueEntry entry = new QueueEntry();
        BeanUtils.copyProperties(request, entry);
        
        // Auto-assign queue number and set status to waiting
        long queueNumber = counterService.getNextQueueNumber(LocalDate.now());
        entry.setQueueNumber((int) queueNumber);
        entry.setStatus(QueueStatus.WAITING);
        
        LocalDateTime now = LocalDateTime.now();
        entry.setCreatedAt(now);
        entry.setUpdatedAt(now);
        
        QueueEntry savedEntry = queueEntryRepository.save(entry);
        
        QueueEntryResponse response = new QueueEntryResponse();
        BeanUtils.copyProperties(savedEntry, response);
        return response;
    }
    
    @Auditable(action = ActionType.STATUS_CHANGED, module = ModuleType.INFORMATION_DESK)
    public QueueEntryResponse updateQueueStatus(String entryId, StatusUpdateRequest request) {
        QueueEntry entry = queueEntryRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found with id: " + entryId));
        
        entry.setStatus(request.getStatus());
        entry.setUpdatedAt(LocalDateTime.now());
        
        QueueEntry savedEntry = queueEntryRepository.save(entry);
        
        QueueEntryResponse response = new QueueEntryResponse();
        BeanUtils.copyProperties(savedEntry, response);
        return response;
    }
    
    public Page<QueueEntryResponse> listQueueEntries(LocalDate date, QueueStatus status, String search, Pageable pageable) {
        LocalDateTime startDate = date.atStartOfDay();
        LocalDateTime endDate = date.plusDays(1).atStartOfDay();
        
        // Create custom sort: status priority (waiting < in_progress < done) then queue_number ascending
        Sort customSort = Sort.by(
            Sort.Order.asc("status"),
            Sort.Order.asc("queueNumber")
        );
        
        Pageable sortedPageable = PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            customSort
        );
        
        Page<QueueEntry> entries;
        if (status != null) {
            entries = queueEntryRepository.findByDateRangeAndStatus(startDate, endDate, status, sortedPageable);
        } else {
            entries = queueEntryRepository.findByDateRange(startDate, endDate, sortedPageable);
        }
        
        return entries.map(entry -> {
            QueueEntryResponse response = new QueueEntryResponse();
            BeanUtils.copyProperties(entry, response);
            return response;
        });
    }
    
    @Auditable(action = ActionType.UPDATED, module = ModuleType.INFORMATION_DESK)
    public int removeCompletedEntries(LocalDate date) {
        LocalDateTime startDate = date.atStartOfDay();
        LocalDateTime endDate = date.plusDays(1).atStartOfDay();
        
        // Count entries before deletion
        Page<QueueEntry> completedEntries = queueEntryRepository.findByDateRangeAndStatus(
            startDate, endDate, QueueStatus.DONE, Pageable.unpaged()
        );
        
        int count = (int) completedEntries.getTotalElements();
        
        // Delete completed entries
        queueEntryRepository.deleteByDateRangeAndStatusDone(startDate, endDate);
        
        return count;
    }
}