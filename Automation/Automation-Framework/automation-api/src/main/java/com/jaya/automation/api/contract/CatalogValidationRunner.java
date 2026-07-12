package com.jaya.automation.api.contract;

public final class CatalogValidationRunner {

    private static final int EXIT_FAILURE = 1;

    private CatalogValidationRunner() {
    }

    public static void main(String[] args) {
        CatalogValidator.ValidationResult result = CatalogValidator.validate();
        System.out.println(result.summary());
        if (result.hasErrors()) {
            System.exit(EXIT_FAILURE);
        }
    }
}
