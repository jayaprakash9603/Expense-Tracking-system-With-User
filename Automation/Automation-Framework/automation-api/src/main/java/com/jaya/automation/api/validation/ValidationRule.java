package com.jaya.automation.api.validation;

public record ValidationRule(
        String name,
        String description,
        ValidationCondition condition
) {
}
