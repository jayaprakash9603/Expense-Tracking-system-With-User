package com.jaya.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JsonConverter {

    private static final Logger logger = LoggerFactory.getLogger(JsonConverter.class);
    private final ObjectMapper objectMapper;

    public JsonConverter() {
        try {
            this.objectMapper = new ObjectMapper();
            // Register JavaTimeModule to handle Java 8 date/time types correctly
            objectMapper.registerModule(new JavaTimeModule());
            objectMapper.findAndRegisterModules();
            objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            logger.info("JsonConverter initialized successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize JsonConverter", e);
            throw new RuntimeException("Failed to initialize JsonConverter", e);
        }
    }

    /**
     * Converts an object to JSON string.
     * Returns null if serialization fails.
     */
    public String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            logger.error("Failed to convert object to JSON: {}", obj.getClass().getSimpleName(), e);
            return null;
        }
    }

    /**
     * Converts JSON string to object of specified type.
     * Returns null if deserialization fails.
     */
    public <T> T fromJson(String json, Class<T> clazz) {
        try {
            return objectMapper.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            logger.error("Failed to convert JSON to object of type: {}", clazz.getSimpleName(), e);
            return null;
        }
    }
}