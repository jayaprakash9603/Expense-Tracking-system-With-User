package com.jaya.exceptions;

public class HttpRequestMethodNotSupportedException extends RuntimeException{

    public HttpRequestMethodNotSupportedException(String message)
    {
        super(message);
    }
}
