package com.smartguys.mediclinic.service;

import com.smartguys.mediclinic.config.ReferenceRangeConfig;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ReferenceRangeService {
    
    public Map<String, String> evaluateFlags(Map<String, Object> labData) {
        Map<String, String> flags = new HashMap<>();
        
        if (labData == null) {
            return flags;
        }
        
        for (Map.Entry<String, Object> entry : labData.entrySet()) {
            String fieldName = entry.getKey();
            Object value = entry.getValue();
            
            if (value instanceof Number && ReferenceRangeConfig.REFERENCE_RANGES.containsKey(fieldName)) {
                double numericValue = ((Number) value).doubleValue();
                ReferenceRangeConfig.Range range = ReferenceRangeConfig.REFERENCE_RANGES.get(fieldName);
                
                String flag = evaluateFlag(numericValue, range);
                flags.put(fieldName, flag);
            }
        }
        
        return flags;
    }
    
    private String evaluateFlag(double value, ReferenceRangeConfig.Range range) {
        if (value < range.criticalMin || value > range.criticalMax) {
            return "critical";
        } else if (value < range.normalMin || value > range.normalMax) {
            return "abnormal";
        } else {
            return "normal";
        }
    }
}