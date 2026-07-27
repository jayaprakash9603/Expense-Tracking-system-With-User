package com.jaya.automation.api.contract;

import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.net.URL;
import java.nio.file.FileSystem;
import java.nio.file.FileSystemAlreadyExistsException;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

public final class CatalogValidator {

    private static final AutomationLogger LOG = LoggerFactory.getLogger(CatalogValidator.class);
    private static final Pattern ENDPOINT_KEY_PATTERN =
            Pattern.compile("request to \"([^\"]+)\"");
    private static final Pattern SCHEMA_KEY_PATTERN =
            Pattern.compile("match the \"([^\"]+)\" schema");

    private CatalogValidator() {
    }

    public static ValidationResult validate() {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        Map<String, ApiEndpointContract> contracts = loadCatalog(errors);
        if (contracts == null) {
            return new ValidationResult(errors, warnings);
        }

        Set<String> schemaKeys = scanResourceKeys("schemas", ".schema.json");
        Set<String> payloadKeys = scanResourceKeys("payloads", ".json");
        detectSchemaPayloadCollisions(schemaKeys, payloadKeys, warnings);

        Set<String> featureEndpointKeys = new HashSet<>();
        Set<String> featureSchemaKeys = new HashSet<>();
        scanFeatureReferences(featureEndpointKeys, featureSchemaKeys);
        detectUnresolvedEndpointKeys(contracts, featureEndpointKeys, errors);
        detectUnresolvedSchemaKeys(schemaKeys, featureSchemaKeys, warnings);
        detectUncoveredEndpoints(contracts, featureEndpointKeys, warnings);

        return new ValidationResult(errors, warnings);
    }

    private static Map<String, ApiEndpointContract> loadCatalog(List<String> errors) {
        try {
            return EndpointCatalogLoader.load();
        } catch (IllegalStateException ex) {
            errors.add("Catalog load failed: " + ex.getMessage());
            return null;
        }
    }

    private static void detectSchemaPayloadCollisions(
            Set<String> schemaKeys,
            Set<String> payloadKeys,
            List<String> warnings
    ) {
        Set<String> collisions = new HashSet<>(schemaKeys);
        collisions.retainAll(payloadKeys);
        for (String collision : collisions) {
            warnings.add("Key collision between schema and payload: " + collision);
        }
    }

    private static void detectUnresolvedEndpointKeys(
            Map<String, ApiEndpointContract> contracts,
            Set<String> featureKeys,
            List<String> errors
    ) {
        for (String key : featureKeys) {
            if (!contracts.containsKey(key)) {
                errors.add("Feature file references unknown endpoint key: " + key);
            }
        }
    }

    private static void detectUnresolvedSchemaKeys(
            Set<String> schemaKeys,
            Set<String> featureSchemaKeys,
            List<String> warnings
    ) {
        for (String key : featureSchemaKeys) {
            if (!schemaKeys.contains(key)) {
                warnings.add("Feature file references schema key not found on classpath: " + key);
            }
        }
    }

    private static void detectUncoveredEndpoints(
            Map<String, ApiEndpointContract> contracts,
            Set<String> featureEndpointKeys,
            List<String> warnings
    ) {
        for (String catalogKey : contracts.keySet()) {
            if (!featureEndpointKeys.contains(catalogKey)) {
                warnings.add("Catalog endpoint has no feature coverage: " + catalogKey);
            }
        }
    }

    private static Set<String> scanResourceKeys(String rootDir, String suffix) {
        Set<String> keys = new HashSet<>();
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        URL rootUrl = classLoader.getResource(rootDir);
        if (rootUrl == null) {
            return keys;
        }
        String protocol = rootUrl.getProtocol();
        if ("file".equals(protocol)) {
            scanFileSystemKeys(Paths.get(URI.create(rootUrl.toString())), suffix, keys);
        } else if ("jar".equals(protocol)) {
            scanJarKeys(rootUrl, rootDir, suffix, keys);
        }
        return keys;
    }

    private static void scanFileSystemKeys(Path root, String suffix, Set<String> keys) {
        try (Stream<Path> walker = Files.walk(root)) {
            walker.filter(Files::isRegularFile)
                    .filter(p -> p.toString().endsWith(suffix))
                    .forEach(p -> {
                        String relative = root.relativize(p).toString().replace('\\', '/');
                        keys.add(extractShortKey(relative, suffix));
                    });
        } catch (IOException exception) {
            LOG.debug("Unable to scan filesystem keys under {}: {}", root, exception.getMessage());
        }
    }

    private static void scanJarKeys(URL rootUrl, String rootDir, String suffix, Set<String> keys) {
        String jarPath = rootUrl.toString().split("!")[0];
        try {
            FileSystem fs;
            try {
                fs = FileSystems.newFileSystem(URI.create(jarPath), Collections.emptyMap());
            } catch (FileSystemAlreadyExistsException e) {
                fs = FileSystems.getFileSystem(URI.create(jarPath));
            }
            Path jarRoot = fs.getPath(rootDir);
            if (Files.exists(jarRoot)) {
                try (Stream<Path> walker = Files.walk(jarRoot)) {
                    walker.filter(Files::isRegularFile)
                            .filter(p -> p.toString().endsWith(suffix))
                            .forEach(p -> {
                                String fullPath = p.toString();
                                if (fullPath.startsWith("/")) {
                                    fullPath = fullPath.substring(1);
                                }
                                String relative = fullPath.substring(rootDir.length() + 1);
                                keys.add(extractShortKey(relative, suffix));
                            });
                }
            }
        } catch (IOException exception) {
            LOG.debug("Unable to scan jar keys in {}: {}", rootDir, exception.getMessage());
        }
    }

    private static String extractShortKey(String relativePath, String suffix) {
        String withoutSuffix = relativePath.substring(0, relativePath.length() - suffix.length());
        int lastSlash = withoutSuffix.lastIndexOf('/');
        return lastSlash >= 0 ? withoutSuffix.substring(lastSlash + 1) : withoutSuffix;
    }

    private static void scanFeatureReferences(Set<String> endpointKeys, Set<String> schemaKeys) {
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        URL featuresUrl = classLoader.getResource("features");
        if (featuresUrl == null) {
            return;
        }
        if (!"file".equals(featuresUrl.getProtocol())) {
            return;
        }
        Path root = Paths.get(URI.create(featuresUrl.toString()));
        try (Stream<Path> walker = Files.walk(root)) {
            walker.filter(Files::isRegularFile)
                    .filter(p -> p.toString().endsWith(".feature"))
                    .forEach(p -> parseFeatureFile(p, endpointKeys, schemaKeys));
        } catch (IOException exception) {
            LOG.debug("Unable to scan feature references under {}: {}", root, exception.getMessage());
        }
    }

    private static void parseFeatureFile(Path featurePath, Set<String> endpointKeys, Set<String> schemaKeys) {
        try {
            List<String> lines = Files.readAllLines(featurePath);
            for (String line : lines) {
                if (line.trim().startsWith("#") || line.trim().startsWith("@template")) {
                    continue;
                }
                Matcher endpointMatcher = ENDPOINT_KEY_PATTERN.matcher(line);
                while (endpointMatcher.find()) {
                    endpointKeys.add(endpointMatcher.group(1));
                }
                Matcher schemaMatcher = SCHEMA_KEY_PATTERN.matcher(line);
                while (schemaMatcher.find()) {
                    schemaKeys.add(schemaMatcher.group(1));
                }
            }
        } catch (IOException exception) {
            LOG.debug("Unable to read feature file {}: {}", featurePath, exception.getMessage());
        }
    }

    public record ValidationResult(List<String> errors, List<String> warnings) {
        public boolean hasErrors() {
            return !errors.isEmpty();
        }

        public boolean hasWarnings() {
            return !warnings.isEmpty();
        }

        public String summary() {
            StringBuilder sb = new StringBuilder();
            sb.append("Catalog Validation: ");
            if (!hasErrors() && !hasWarnings()) {
                sb.append("PASSED (no issues)");
                return sb.toString();
            }
            if (hasErrors()) {
                sb.append(errors.size()).append(" error(s)");
            }
            if (hasWarnings()) {
                if (hasErrors()) sb.append(", ");
                sb.append(warnings.size()).append(" warning(s)");
            }
            sb.append("\n");
            for (String error : errors) {
                sb.append("  ERROR: ").append(error).append("\n");
            }
            for (String warning : warnings) {
                sb.append("  WARN:  ").append(warning).append("\n");
            }
            return sb.toString();
        }
    }
}
