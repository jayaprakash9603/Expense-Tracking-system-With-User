//package com.jaya.config;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.fasterxml.jackson.databind.SerializationFeature;
//import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
//import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
//import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.context.annotation.Primary;
//import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
//
//import java.time.format.DateTimeFormatter;
//
//@Configuration
//public class JacksonConfig {
//
//    private static final String DATE_FORMAT = "yyyy-MM-dd";
//    private static final String DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
//
//    @Bean
//    @Primary
//    public ObjectMapper objectMapper() {
//        return Jackson2ObjectMapperBuilder.json()
//                .modules(new JavaTimeModule())
//                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
//                .serializers(new LocalDateSerializer(DateTimeFormatter.ofPattern(DATE_FORMAT)))
//                .serializers(new LocalDateTimeSerializer(DateTimeFormatter.ofPattern(DATETIME_FORMAT)))
//                .build();
//    }
//}