package com.jaya.kafka.producer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;

import java.util.concurrent.CompletableFuture;











@Slf4j
@RequiredArgsConstructor
public abstract class NotificationEventProducer<T> {

    protected final KafkaTemplate<String, Object> kafkaTemplate;
    protected final ObjectMapper objectMapper;

    



    protected abstract String getTopicName();

    


    protected abstract String getEventTypeName();

    



    protected void validateEvent(T event) {
        if (event == null) {
            throw new IllegalArgumentException(getEventTypeName() + " event cannot be null");
        }
    }

    




    protected String generatePartitionKey(T event) {
        return getTopicName() + "-key";
    }

    



    protected void beforeSend(T event) {
        
        log.debug("Preparing to send {} event", getEventTypeName());
    }

    



    protected void afterSendSuccess(T event, SendResult<String, Object> result) {
        log.info("Successfully sent {} event to topic '{}' partition {} offset {}",
                getEventTypeName(),
                result.getRecordMetadata().topic(),
                result.getRecordMetadata().partition(),
                result.getRecordMetadata().offset());
    }

    



    protected void afterSendFailure(T event, Throwable ex) {
        log.error("Failed to send {} event to topic '{}': {}",
                getEventTypeName(), getTopicName(), ex.getMessage(), ex);
    }

    



    public void sendEvent(T event) {
        try {
            
            validateEvent(event);

            
            beforeSend(event);

            
            String key = generatePartitionKey(event);

            
            if (log.isDebugEnabled()) {
                try {
                    String eventJson = objectMapper.writeValueAsString(event);
                    log.debug("Sending {} event: {}", getEventTypeName(), eventJson);
                } catch (JsonProcessingException e) {
                    log.debug("Sending {} event (JSON serialization failed)", getEventTypeName());
                }
            }

            
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                    getTopicName(),
                    key,
                    event);

            
            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    afterSendFailure(event, ex);
                } else {
                    afterSendSuccess(event, result);
                }
            });

        } catch (Exception e) {
            log.error("Error while preparing to send {} event: {}", getEventTypeName(), e.getMessage(), e);
            throw new RuntimeException("Failed to send " + getEventTypeName() + " event", e);
        }
    }

    



    public SendResult<String, Object> sendEventSync(T event) {
        try {
            validateEvent(event);
            beforeSend(event);

            String key = generatePartitionKey(event);

            log.info("Sending {} event synchronously to topic '{}'", getEventTypeName(), getTopicName());

            SendResult<String, Object> result = kafkaTemplate.send(
                    getTopicName(),
                    key,
                    event).get(); 

            afterSendSuccess(event, result);
            return result;

        } catch (Exception e) {
            afterSendFailure(event, e);
            throw new RuntimeException("Failed to send " + getEventTypeName() + " event synchronously", e);
        }
    }
}
