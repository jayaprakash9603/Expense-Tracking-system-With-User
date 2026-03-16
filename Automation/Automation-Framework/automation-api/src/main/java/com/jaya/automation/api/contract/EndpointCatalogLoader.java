package com.jaya.automation.api.contract;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

public final class EndpointCatalogLoader {

    private static final String DEFAULT_CATALOG_DIR = "config/endpoints";
    private static final ObjectMapper YAML_MAPPER = new ObjectMapper(new YAMLFactory());

    private EndpointCatalogLoader() {
    }

    public static Map<String, ApiEndpointContract> load() {
        return loadDirectory(DEFAULT_CATALOG_DIR);
    }

    public static Map<String, ApiEndpointContract> load(String classpathLocation) {
        if (classpathLocation.endsWith(".yaml") || classpathLocation.endsWith(".yml")) {
            return loadSingleFile(classpathLocation);
        }
        return loadDirectory(classpathLocation);
    }

    private static Map<String, ApiEndpointContract> loadDirectory(String directoryPath) {
        List<EndpointEntry> allEntries = new ArrayList<>();
        List<String> loadedFiles = new ArrayList<>();
        Set<String> loadedFileKeys = new HashSet<>();

        try {
            Enumeration<URL> resources = Thread.currentThread().getContextClassLoader()
                    .getResources(directoryPath);

            while (resources.hasMoreElements()) {
                URL dirUrl = resources.nextElement();
                if (!"file".equals(dirUrl.getProtocol())) {
                    continue;
                }
                Path dirPath = Paths.get(URI.create(dirUrl.toString()));
                if (!Files.isDirectory(dirPath)) {
                    continue;
                }
                try (Stream<Path> files = Files.walk(dirPath)) {
                    files.filter(Files::isRegularFile)
                            .filter(p -> isYamlFile(p.getFileName().toString()))
                            .sorted()
                            .forEach(yamlFile -> {
                                String relName = relativeName(dirPath, yamlFile);
                                if (!loadedFileKeys.add(relName)) {
                                    return;
                                }
                                CatalogRoot root = parseFile(yamlFile);
                                if (root.endpoints != null) {
                                    allEntries.addAll(root.endpoints);
                                }
                                loadedFiles.add(relName);
                            });
                }
            }
        } catch (IOException ex) {
            throw new IllegalStateException(
                    "Failed to scan endpoint catalog directory: " + directoryPath, ex);
        }

        if (allEntries.isEmpty()) {
            throw new IllegalStateException(
                    "No endpoint entries found in catalog directory: " + directoryPath
                            + " (scanned files: " + loadedFiles + ")");
        }
        return toContracts(allEntries, directoryPath);
    }

    private static Map<String, ApiEndpointContract> loadSingleFile(String classpathLocation) {
        CatalogRoot root = parseSingleFile(classpathLocation);
        return toContracts(root.endpoints, classpathLocation);
    }

    private static CatalogRoot parseFile(Path filePath) {
        try (InputStream stream = Files.newInputStream(filePath)) {
            return YAML_MAPPER.readValue(stream, CatalogRoot.class);
        } catch (IOException ex) {
            throw new IllegalStateException(
                    "Failed to parse endpoint catalog file: " + filePath.getFileName(), ex);
        }
    }

    private static CatalogRoot parseSingleFile(String classpathLocation) {
        try (InputStream stream = resolveStream(classpathLocation)) {
            return YAML_MAPPER.readValue(stream, CatalogRoot.class);
        } catch (IOException ex) {
            throw new IllegalStateException(
                    "Failed to parse endpoint catalog: " + classpathLocation, ex);
        }
    }

    private static InputStream resolveStream(String classpathLocation) {
        InputStream stream = Thread.currentThread().getContextClassLoader()
                .getResourceAsStream(classpathLocation);
        if (stream == null) {
            throw new IllegalStateException(
                    "Endpoint catalog not found on classpath: " + classpathLocation);
        }
        return stream;
    }

    private static Map<String, ApiEndpointContract> toContracts(
            List<EndpointEntry> entries,
            String source
    ) {
        if (entries == null || entries.isEmpty()) {
            throw new IllegalStateException("Endpoint catalog is empty: " + source);
        }
        Map<String, ApiEndpointContract> contracts = new LinkedHashMap<>();
        List<String> errors = new ArrayList<>();

        for (EndpointEntry entry : entries) {
            validateEntry(entry, errors);
            if (contracts.containsKey(entry.key)) {
                errors.add("Duplicate endpoint key: " + entry.key);
                continue;
            }
            ApiHttpMethod httpMethod = parseMethod(entry);
            if (httpMethod == null) {
                errors.add("Invalid HTTP method '" + entry.method + "' for key: " + entry.key);
                continue;
            }
            contracts.put(entry.key, new ApiEndpointContract(
                    entry.key,
                    httpMethod,
                    entry.path,
                    entry.auth
            ));
        }

        if (!errors.isEmpty()) {
            throw new IllegalStateException(
                    "Endpoint catalog validation failed (" + source + "):\n - "
                            + String.join("\n - ", errors));
        }
        return contracts;
    }

    private static void validateEntry(EndpointEntry entry, List<String> errors) {
        if (entry.key == null || entry.key.isBlank()) {
            errors.add("Entry missing 'key' field");
        }
        if (entry.method == null || entry.method.isBlank()) {
            errors.add("Entry missing 'method' field for key: " + entry.key);
        }
        if (entry.path == null || entry.path.isBlank()) {
            errors.add("Entry missing 'path' field for key: " + entry.key);
        }
    }

    private static ApiHttpMethod parseMethod(EndpointEntry entry) {
        try {
            return ApiHttpMethod.valueOf(entry.method.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private static boolean isYamlFile(String fileName) {
        return fileName.endsWith(".yaml") || fileName.endsWith(".yml");
    }

    private static String relativeName(Path root, Path file) {
        return root.relativize(file).toString().replace('\\', '/');
    }

    static class CatalogRoot {
        public List<EndpointEntry> endpoints;
    }

    static class EndpointEntry {
        public String key;
        public String method;
        public String path;
        public boolean auth;
        public String domain;
    }
}
