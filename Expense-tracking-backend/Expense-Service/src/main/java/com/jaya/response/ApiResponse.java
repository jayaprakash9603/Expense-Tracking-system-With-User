package com.jaya.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
	private boolean success;
	private T data;
	private String message;
	private String errorCode;


	public ApiResponse(String s, String notFound) {
		this.message=s;
		this.errorCode=notFound;
	}
}