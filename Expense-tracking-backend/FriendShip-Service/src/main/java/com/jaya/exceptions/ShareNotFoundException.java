package com.jaya.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ShareNotFoundException extends RuntimeException {

    public ShareNotFoundException(String message) {
        super(message);
    }

    public ShareNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
