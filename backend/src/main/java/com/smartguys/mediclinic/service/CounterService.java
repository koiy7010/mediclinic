package com.smartguys.mediclinic.service;

import com.smartguys.mediclinic.model.Counter;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class CounterService {
    
    private final MongoTemplate mongoTemplate;
    
    public CounterService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }
    
    public long getNextQueueNumber(LocalDate date) {
        String key = "queue_" + date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        return getNextSequence(key);
    }
    
    public long getNextClaimNumber(LocalDate date) {
        String key = "claim_" + date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        return getNextSequence(key);
    }
    
    private long getNextSequence(String key) {
        Query query = new Query(Criteria.where("id").is(key));
        Update update = new Update().inc("seq", 1);
        FindAndModifyOptions options = new FindAndModifyOptions()
                .returnNew(true)
                .upsert(true);
        
        Counter counter = mongoTemplate.findAndModify(query, update, options, Counter.class);
        return counter != null ? counter.getSeq() : 1L;
    }
}