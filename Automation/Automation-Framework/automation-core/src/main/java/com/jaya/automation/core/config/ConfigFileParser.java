package com.jaya.automation.core.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;

public final class ConfigFileParser {

    private static final AutomationLogger LOG = LoggerFactory.getLogger(ConfigFileParser.class);
    private static final ObjectMapper YAML_MAPPER = new ObjectMapper(new YAMLFactory());

    private ConfigFileParser() {
    }

    private static final String[] CLASSPATH_CANDIDATES = {
            "AutomationConfiguration.yaml",
            "AutomationConfiguration.yml",
            "AutomationConfiguration.properties"
    };

    public static Map<String, String> parse(Path file) {
        if (file == null || !Files.exists(file)) {
            return Map.of();
        }
        String fileName = file.getFileName().toString().toLowerCase();
        if (fileName.endsWith(".yaml") || fileName.endsWith(".yml")) {
            return parseYaml(file);
        }
        return parseProperties(file);
    }

    public static Map<String, String> parseFromClasspath() {
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        for (String candidate : CLASSPATH_CANDIDATES) {
            try (InputStream stream = classLoader.getResourceAsStream(candidate)) {
                if (stream == null) {
                    continue;
                }
                return candidate.endsWith(".properties")
                        ? parsePropertiesStream(stream)
                        : parseYamlStream(stream);
            } catch (IOException exception) {
                LOG.debug("Unable to read classpath config candidate {}: {}", candidate, exception.getMessage());
            }
        }
        return Map.of();
    }

    private static Map<String, String> parseProperties(Path file) {
        try (InputStream stream = Files.newInputStream(file)) {
            return parsePropertiesStream(stream);
        } catch (IOException exception) {
            LOG.debug("Unable to read properties file {}: {}", file, exception.getMessage());
            return new LinkedHashMap<>();
        }
    }

    private static Map<String, String> parsePropertiesStream(InputStream stream) throws IOException {
        Map<String, String> result = new LinkedHashMap<>();
        Properties properties = new Properties();
        properties.load(stream);
        properties.forEach((k, v) -> result.put(String.valueOf(k), String.valueOf(v)));
        return result;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, String> parseYaml(Path file) {
        try (InputStream stream = Files.newInputStream(file)) {
            return parseYamlStream(stream);
        } catch (IOException exception) {
            LOG.debug("Unable to read YAML file {}: {}", file, exception.getMessage());
            return new LinkedHashMap<>();
        }
    }

    @SuppressWarnings("unchecked")
    private static Map<String, String> parseYamlStream(InputStream stream) throws IOException {
        Map<String, String> result = new LinkedHashMap<>();
        Map<String, Object> tree = YAML_MAPPER.readValue(stream, Map.class);
        if (tree != null) {
            flattenYaml("", tree, result);
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private static void flattenYaml(String prefix, Map<String, Object> map, Map<String, String> result) {
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            String key = entry.getKey();
            String fullPath = prefix.isEmpty() ? key : prefix + "." + key;
            Object value = entry.getValue();

            if (value instanceof Map) {
                flattenYaml(fullPath, (Map<String, Object>) value, result);
                continue;
            }

            String strValue = String.valueOf(value);
            result.put(fullPath, strValue);

            if (key.contains(".")) {
                result.putIfAbsent(key, strValue);
                continue;
            }

            registerAliases(fullPath, strValue, result);
        }
    }

    private static void registerAliases(String dottedPath, String value, Map<String, String> result) {
        String[] segments = dottedPath.split("\\.");
        for (int i = 0; i < segments.length; i++) {
            String[] suffixSegments = Arrays.copyOfRange(segments, i, segments.length);

            String upperSnake = Arrays.stream(suffixSegments)
                    .map(ConfigFileParser::camelToUpperSnake)
                    .collect(Collectors.joining("_"));
            result.putIfAbsent(upperSnake, value);

            String lowerDot = Arrays.stream(suffixSegments)
                    .map(ConfigFileParser::camelToLowerDot)
                    .collect(Collectors.joining("."));
            result.putIfAbsent(lowerDot, value);
        }
    }

    static String camelToUpperSnake(String input) {
        return input.replaceAll("([a-z0-9])([A-Z])", "$1_$2").toUpperCase();
    }

    static String camelToLowerDot(String input) {
        return input.replaceAll("([a-z0-9])([A-Z])", "$1.$2").toLowerCase();
    }
}
