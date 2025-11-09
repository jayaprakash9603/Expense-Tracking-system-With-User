package com.jaya.task.user.service.exceptions;

public class MissingRequestHeaderException extends RuntimeException{

   public MissingRequestHeaderException(String message) {
        super(message);
    }
}
