package com.jaya.automation.api.contract;

import java.util.Map;

public final class ApiEndpointRegistry {
    private final Map<String, ApiEndpointContract> contracts;

    public ApiEndpointRegistry() {
        this.contracts = EndpointCatalogLoader.load();
    }

    public ApiEndpointRegistry(String catalogClasspathLocation) {
        this.contracts = EndpointCatalogLoader.load(catalogClasspathLocation);
    }

    public ApiEndpointContract require(String endpointKey) {
        ApiEndpointContract contract = contracts.get(endpointKey);
        if (contract == null) {
            throw new IllegalArgumentException("Unknown endpoint key: " + endpointKey
                    + ". Available keys: " + contracts.keySet());
        }
        return contract;
    }

    public boolean has(String endpointKey) {
        return contracts.containsKey(endpointKey);
    }

    public Map<String, ApiEndpointContract> all() {
        return Map.copyOf(contracts);
    }

    public int size() {
        return contracts.size();
    }
}
