package com.jaya.exceptions;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

@ControllerAdvice
public class GlobalExceptions {

	
	@ExceptionHandler(UserException.class)
	public ResponseEntity<ErrorDetails>userExceptionHandler(UserException ue,WebRequest req)
	{
		ErrorDetails error=new ErrorDetails(ue.getMessage(),req.getDescription(false),LocalDateTime.now());
		return new ResponseEntity<ErrorDetails>(error,HttpStatus.BAD_REQUEST);
	}
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ErrorDetails>resourceNotFoundExceptionHandler(ResourceNotFoundException ue,WebRequest req)
	{
		ErrorDetails error=new ErrorDetails(ue.getMessage(),req.getDescription(false),LocalDateTime.now());
		return new ResponseEntity<ErrorDetails>(error,HttpStatus.NOT_FOUND);
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorDetails>IllegalArgumentHandler(IllegalArgumentException ue,WebRequest req)
	{
		ErrorDetails error=new ErrorDetails(ue.getMessage(),req.getDescription(false),LocalDateTime.now());
		return new ResponseEntity<ErrorDetails>(error,HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	public ResponseEntity<ErrorDetails>IllegalArgumentHandler(HttpRequestMethodNotSupportedException ue,WebRequest req)
	{
		ErrorDetails error=new ErrorDetails(ue.getMessage(),req.getDescription(false),LocalDateTime.now());
		return new ResponseEntity<ErrorDetails>(error,HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(MissingRequestHeaderException.class)
	public ResponseEntity<ErrorDetails>missingHeaderHandler(MissingRequestHeaderException ue,WebRequest req)
	{

		ErrorDetails error=new ErrorDetails(ue.getMessage(),req.getDescription(false),LocalDateTime.now());
		return new ResponseEntity<ErrorDetails>(error,HttpStatus.BAD_REQUEST);
	}
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorDetails>otherExceptionHandler(Exception ue,WebRequest req)
	{
		
		ErrorDetails error=new ErrorDetails(ue.getMessage(),req.getDescription(false),LocalDateTime.now());
		
		return new ResponseEntity<ErrorDetails>(error,HttpStatus.BAD_REQUEST);
	}




}
