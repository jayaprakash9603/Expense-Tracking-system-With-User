package com.jaya.exceptions;

public class MissingRequestHeaderException extends RuntimeException{
   public MissingRequestHeaderException(String message)
    {
        super(message);
    }
}
