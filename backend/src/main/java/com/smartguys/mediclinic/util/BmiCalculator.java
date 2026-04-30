package com.smartguys.mediclinic.util;

import com.smartguys.mediclinic.model.enums.BmiClassification;

public class BmiCalculator {
    
    public static double calculateBmi(double heightCm, double weightKg) {
        if (heightCm <= 0 || weightKg <= 0) {
            throw new IllegalArgumentException("Height and weight must be positive values");
        }
        
        double heightM = heightCm / 100.0;
        return weightKg / (heightM * heightM);
    }
    
    public static BmiClassification classifyBmi(double bmi) {
        if (bmi < 18.5) {
            return BmiClassification.UNDERWEIGHT;
        } else if (bmi < 25.0) {
            return BmiClassification.NORMAL;
        } else if (bmi < 30.0) {
            return BmiClassification.OVERWEIGHT;
        } else if (bmi < 35.0) {
            return BmiClassification.OBESE_I;
        } else if (bmi < 40.0) {
            return BmiClassification.OBESE_II;
        } else {
            return BmiClassification.OBESE_III;
        }
    }
}