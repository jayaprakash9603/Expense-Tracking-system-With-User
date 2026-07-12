package com.jaya.automation.api.validation;

public record ValidationCondition(
        String source,
        String operator,
        String target
) {
}
