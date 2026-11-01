package com.smartration.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BeneficiaryLoginRequest {

    @NotBlank(message = "Ration card number is required")
    private String cardNumber;

    private String dateOfBirth;

    @NotBlank(message = "Password is required")
    private String password;

    /**
     * Parses the date of birth string consistently regardless of whether the UI
     * supplies ISO format (YYYY-MM-DD) or Indian/European display format (DD-MM-YYYY / DD/MM/YYYY).
     */
    public LocalDate getParsedDateOfBirth() {
        if (dateOfBirth == null || dateOfBirth.trim().isEmpty()) {
            return null;
        }
        String clean = dateOfBirth.trim();
        // 1. ISO format: yyyy-MM-dd
        if (clean.matches("^\\d{4}-\\d{2}-\\d{2}$")) {
            return LocalDate.parse(clean);
        }
        // 2. dd-MM-yyyy format
        if (clean.matches("^\\d{2}-\\d{2}-\\d{4}$")) {
            return LocalDate.parse(clean, DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        }
        // 3. dd/MM/yyyy format
        if (clean.matches("^\\d{2}/\\d{2}/\\d{4}$")) {
            return LocalDate.parse(clean, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        }
        // 4. yyyy/MM/dd format
        if (clean.matches("^\\d{4}/\\d{2}/\\d{2}$")) {
            return LocalDate.parse(clean, DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        }
        try {
            return LocalDate.parse(clean);
        } catch (Exception e) {
            return null;
        }
    }
}
