// package com.jaya.common.config;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.fasterxml.jackson.databind.SerializationFeature;
// import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
// import com.jaya.common.exception.handler.GlobalExceptionHandler;
// import com.jaya.common.kafka.producer.*;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.boot.autoconfigure.AutoConfiguration;
// import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
// import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
// import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
// import org.springframework.context.annotation.Bean;
// import org.springframework.kafka.core.KafkaTemplate;

// /**
//  * Auto-configuration for the Common Library.
//  * 
//  * This configuration is automatically loaded when the common-library JAR is
//  * on the classpath. Individual components can be disabled via properties.
//  * 
//  * Properties:
//  * - common.exception-handler.enabled=true/false (default: true)
//  * - common.kafka.enabled=true/false (default: true)
//  * 
//  * Usage:
//  * Simply add the dependency to your pom.xml:
//  * <dependency>
//  * <groupId>com.jaya.common</groupId>
//  * <artifactId>expense-common-library</artifactId>
//  * <version>1.0.0</version>
//  * </dependency>
//  */
// @AutoConfiguration
// @Slf4j
// public class CommonLibraryAutoConfiguration {

//     public CommonLibraryAutoConfiguration() {
//         log.info("Initializing Common Library Auto-Configuration");
//     }

//     /**
//      * Configure ObjectMapper with Java 8 date/time support.
//      */
//     @Bean
//     @ConditionalOnMissingBean
//     public ObjectMapper objectMapper() {
//         ObjectMapper mapper = new ObjectMapper();
//         mapper.registerModule(new JavaTimeModule());
//         mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
//         return mapper;
//     }

//     /**
//      * Configure Global Exception Handler.
//      */
//     @Bean
//     @ConditionalOnMissingBean(GlobalExceptionHandler.class)
//     @ConditionalOnProperty(name = "common.exception-handler.enabled", havingValue = "true", matchIfMissing = true)
//     public GlobalExceptionHandler globalExceptionHandler() {
//         log.info("Registering Global Exception Handler from Common Library");
//         return new GlobalExceptionHandler();
//     }

//     /**
//      * Kafka producers auto-configuration.
//      * Only activated when Kafka is on the classpath.
//      */
//     @AutoConfiguration
//     @ConditionalOnClass(KafkaTemplate.class)
//     @ConditionalOnProperty(name = "common.kafka.enabled", havingValue = "true", matchIfMissing = true)
//     public static class KafkaProducerAutoConfiguration {

//         @Bean
//         @ConditionalOnMissingBean
//         public UnifiedActivityEventProducer unifiedActivityEventProducer(
//                 KafkaTemplate<String, Object> kafkaTemplate,
//                 ObjectMapper objectMapper) {
//             log.info("Registering UnifiedActivityEventProducer from Common Library");
//             return new UnifiedActivityEventProducer(kafkaTemplate, objectMapper);
//         }

//         @Bean
//         @ConditionalOnMissingBean
//         public AuditEventProducer auditEventProducer(
//                 KafkaTemplate<String, Object> kafkaTemplate,
//                 ObjectMapper objectMapper) {
//             log.info("Registering AuditEventProducer from Common Library");
//             return new AuditEventProducer(kafkaTemplate, objectMapper);
//         }

//         @Bean
//         @ConditionalOnMissingBean
//         public FriendRequestEventProducer friendRequestEventProducer(
//                 KafkaTemplate<String, Object> kafkaTemplate,
//                 ObjectMapper objectMapper) {
//             log.info("Registering FriendRequestEventProducer from Common Library");
//             return new FriendRequestEventProducer(kafkaTemplate, objectMapper);
//         }

//         @Bean
//         @ConditionalOnMissingBean
//         public FriendActivityEventProducer friendActivityEventProducer(
//                 KafkaTemplate<String, Object> kafkaTemplate,
//                 ObjectMapper objectMapper) {
//             log.info("Registering FriendActivityEventProducer from Common Library");
//             return new FriendActivityEventProducer(kafkaTemplate, objectMapper);
//         }
//     }
// }
