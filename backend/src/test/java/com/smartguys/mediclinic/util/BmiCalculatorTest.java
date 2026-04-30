package com.smartguys.mediclinic.util;

import com.smartguys.mediclinic.model.enums.BmiClassification;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BmiCalculatorTest {
    
    @Test
    void testCalculateBmi() {
        // Test normal BMI calculation
        double bmi = BmiCalculator.calculateBmi(170, 70);
        assertEquals(24.22, bmi, 0.01);
        
        // Test edge cases
        assertThrows(IllegalArgumentException.class, () -> BmiCalculator.calculateBmi(0, 70));
        assertThrows(IllegalArgumentException.class, () -> BmiCalculator.calculateBmi(170, 0));
        assertThrows(IllegalArgumentException.class, () -> BmiCalculator.calculateBmi(-170, 70));
    }
    
    @Test
    void testClassifyBmi() {
        assertEquals(BmiClassification.UNDERWEIGHT, BmiCalculator.classifyBmi(17.5));
        assertEquals(BmiClassification.NORMAL, BmiCalculator.classifyBmi(22.0));
        assertEquals(BmiClassification.OVERWEIGHT, BmiCalculator.classifyBmi(27.0));
        assertEquals(BmiClassification.OBESE_I, BmiCalculator.classifyBmi(32.0));
        assertEquals(BmiClassification.OBESE_II, BmiCalculator.classifyBmi(37.0));
        assertEquals(BmiClassification.OBESE_III, BmiCalculator.classifyBmi(42.0));
    }
}