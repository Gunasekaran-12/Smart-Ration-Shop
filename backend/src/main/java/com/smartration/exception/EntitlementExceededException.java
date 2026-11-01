package com.smartration.exception;

public class EntitlementExceededException extends RuntimeException {
    public EntitlementExceededException(String message) {
        super(message);
    }
}
