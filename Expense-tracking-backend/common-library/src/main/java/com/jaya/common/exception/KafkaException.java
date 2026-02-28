package com.jaya.common.exception;

import com.jaya.common.error.ErrorCode;





public class KafkaException extends BaseException {

    private static final long serialVersionUID = 1L;

    


    private final String topic;

    public KafkaException(ErrorCode errorCode) {
        super(errorCode);
        this.topic = null;
    }

    public KafkaException(ErrorCode errorCode, String topic) {
        super(errorCode, "Topic: " + topic);
        this.topic = topic;
    }

    public KafkaException(ErrorCode errorCode, String topic, Throwable cause) {
        super(errorCode, "Topic: " + topic, cause);
        this.topic = topic;
    }

    public String getTopic() {
        return topic;
    }

    
    public static KafkaException sendFailed(String topic, Throwable cause) {
        return new KafkaException(ErrorCode.KAFKA_SEND_FAILED, topic, cause);
    }

    public static KafkaException consumeFailed(String topic, Throwable cause) {
        return new KafkaException(ErrorCode.KAFKA_CONSUME_FAILED, topic, cause);
    }

    public static KafkaException serializationFailed(String topic) {
        return new KafkaException(ErrorCode.KAFKA_SERIALIZATION_FAILED, topic);
    }

    public static KafkaException deserializationFailed(String topic) {
        return new KafkaException(ErrorCode.KAFKA_DESERIALIZATION_FAILED, topic);
    }

    public static KafkaException connectionFailed() {
        return new KafkaException(ErrorCode.KAFKA_CONNECTION_FAILED);
    }
}
