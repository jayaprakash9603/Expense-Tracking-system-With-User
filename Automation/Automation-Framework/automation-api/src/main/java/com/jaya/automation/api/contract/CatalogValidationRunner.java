package com.jaya.automation.api.contract;

import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;

public final class CatalogValidationRunner {

    private static final AutomationLogger LOG = LoggerFactory.getLogger(CatalogValidationRunner.class);
    private static final int EXIT_FAILURE = 1;

    private CatalogValidationRunner() {
    }

    public static void main(String[] args) {
        CatalogValidator.ValidationResult result = CatalogValidator.validate();
        LOG.info(result.summary());
        if (result.hasErrors()) {
            System.exit(EXIT_FAILURE);
        }
    }
}
