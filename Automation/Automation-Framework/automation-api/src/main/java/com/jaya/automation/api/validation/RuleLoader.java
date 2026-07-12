package com.jaya.automation.api.validation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public final class RuleLoader {

    private static final Logger LOG = LoggerFactory.getLogger(RuleLoader.class);
    private static final ObjectMapper YAML_MAPPER = new ObjectMapper(new YAMLFactory());

    private RuleLoader() {
    }

    public static List<ValidationRule> load(String classpathPath) {
        InputStream stream = Thread.currentThread().getContextClassLoader()
                .getResourceAsStream(classpathPath);
        if (stream == null) {
            LOG.debug("Rule file not found on classpath: {}", classpathPath);
            return Collections.emptyList();
        }
        return parseRules(stream, classpathPath);
    }

    @SuppressWarnings("unchecked")
    private static List<ValidationRule> parseRules(InputStream stream, String source) {
        List<ValidationRule> rules = new ArrayList<>();
        try {
            List<Map<String, Object>> documents = YAML_MAPPER.readValue(stream,
                    YAML_MAPPER.getTypeFactory().constructCollectionType(List.class, Map.class));
            if (documents == null) {
                return rules;
            }
            for (Map<String, Object> doc : documents) {
                rules.add(mapToRule(doc));
            }
        } catch (IOException singleDocFallback) {
            try (InputStream retry = Thread.currentThread().getContextClassLoader()
                    .getResourceAsStream(source)) {
                if (retry == null) {
                    return rules;
                }
                Map<String, Object> doc = YAML_MAPPER.readValue(retry, Map.class);
                if (doc != null && doc.containsKey("rules")) {
                    List<Map<String, Object>> ruleList = (List<Map<String, Object>>) doc.get("rules");
                    for (Map<String, Object> entry : ruleList) {
                        rules.add(mapToRule(entry));
                    }
                }
            } catch (IOException ex) {
                throw new IllegalStateException("Failed to parse rule file: " + source, ex);
            }
        }
        return rules;
    }

    @SuppressWarnings("unchecked")
    private static ValidationRule mapToRule(Map<String, Object> raw) {
        String name = (String) raw.get("name");
        String description = (String) raw.getOrDefault("description", "");
        Map<String, String> condMap = (Map<String, String>) raw.get("condition");
        ValidationCondition condition = new ValidationCondition(
                condMap.get("source"),
                condMap.get("operator"),
                condMap.getOrDefault("target", null)
        );
        return new ValidationRule(name, description, condition);
    }
}
