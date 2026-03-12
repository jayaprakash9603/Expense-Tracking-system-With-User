package com.jaya.automation.api.config;

import com.jaya.automation.core.config.AutomationConfig;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.builder.ResponseSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import io.restassured.specification.ResponseSpecification;

public final class ApiSpecifications {
    private final AutomationConfig automationConfig;

    public ApiSpecifications(AutomationConfig automationConfig) {
        this.automationConfig = automationConfig;
    }

    public RequestSpecification requestSpec() {
        return new RequestSpecBuilder()
                .setBaseUri(automationConfig.apiBaseUrl())
                .setContentType(ContentType.JSON)
                .build();
    }

    public ResponseSpecification responseSpec() {
        return new ResponseSpecBuilder()
                .expectContentType(ContentType.JSON)
                .build();
    }
}
