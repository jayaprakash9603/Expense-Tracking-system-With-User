package com.jaya.automation.bdd.steps.common;

import com.jaya.automation.bdd.context.BddWorld;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import org.assertj.core.api.Assertions;

import java.util.Map;

public class FeatureSkeletonSteps {
    private static final Map<String, String> DOMAIN_ENDPOINT_PREFIX = Map.of(
            "dashboard", "user.",
            "expenses", "expenses.",
            "budgets", "budgets.",
            "friends", "friendships.",
            "groups", "groups.",
            "sharing", "shares.",
            "chat", "chats.",
            "settings", "user.",
            "admin", "admin."
    );

    @Given("{string} area is set up for testing")
    public void domainAutomationSkeletonIsReady(String domainName) {
        String normalizedDomain = domainName.toLowerCase();
        Assertions.assertThat(DOMAIN_ENDPOINT_PREFIX).containsKey(normalizedDomain);
        BddWorld.putAliasValue("domain.active", normalizedDomain);
    }

    @Then("{string} area has its test connections ready")
    public void domainPlaceholdersAreWired(String domainName) {
        String normalizedDomain = domainName.toLowerCase();
        String prefix = DOMAIN_ENDPOINT_PREFIX.get(normalizedDomain);
        boolean endpointExists = BddWorld.apiEndpointRegistry().all().keySet().stream()
                .anyMatch(endpointKey -> endpointKey.startsWith(prefix));
        Assertions.assertThat(endpointExists).isTrue();
    }
}
