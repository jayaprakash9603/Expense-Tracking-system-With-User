package com.jaya.config;

import feign.Logger;
import feign.codec.ErrorDecoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

    @Bean
    Logger.Level feignLoggerLevel() {
        // BASIC logs only method, URL, response status and timing.
        // FULL/HEADERS would leak the forwarded "Authorization: Bearer <JWT>"
        // and "X-Service-Token" headers into plaintext logs.
        return Logger.Level.BASIC;
    }

    @Bean
    public ErrorDecoder errorDecoder() {
        return new CustomErrorDecoder();
    }

    public static class CustomErrorDecoder implements ErrorDecoder {
        private final ErrorDecoder defaultErrorDecoder = new Default();

        @Override
        public Exception decode(String methodKey, feign.Response response) {
            System.err.println("Feign Error - Method: " + methodKey + ", Status: " + response.status());
            return defaultErrorDecoder.decode(methodKey, response);
        }
    }
}
