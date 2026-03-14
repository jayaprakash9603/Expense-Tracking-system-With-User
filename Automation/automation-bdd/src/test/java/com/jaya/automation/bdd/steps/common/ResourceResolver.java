package com.jaya.automation.bdd.steps.common;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URL;
import java.nio.file.FileSystem;
import java.nio.file.FileSystemAlreadyExistsException;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Stream;

public final class ResourceResolver {

    private static final Map<String, String> SCHEMA_INDEX = new ConcurrentHashMap<>();
    private static final Map<String, String> PAYLOAD_INDEX = new ConcurrentHashMap<>();
    private static volatile boolean initialized = false;

    private ResourceResolver() {
    }

    public static String resolveSchema(String key) {
        ensureInitialized();
        if (looksLikeFullPath(key)) {
            return key;
        }
        String normalized = stripSuffix(key, ".schema.json");
        String resolved = SCHEMA_INDEX.get(normalized);
        if (resolved == null) {
            throw new IllegalArgumentException(
                    "Unknown schema key: \"" + key + "\". Available: " + SCHEMA_INDEX.keySet());
        }
        return resolved;
    }

    public static String resolvePayload(String key) {
        ensureInitialized();
        if (looksLikeFullPath(key)) {
            return key;
        }
        String normalized = stripSuffix(key, ".json");
        String resolved = PAYLOAD_INDEX.get(normalized);
        if (resolved == null) {
            throw new IllegalArgumentException(
                    "Unknown payload key: \"" + key + "\". Available: " + PAYLOAD_INDEX.keySet());
        }
        return resolved;
    }

    private static synchronized void ensureInitialized() {
        if (initialized) {
            return;
        }
        scanDirectory("schemas", ".schema.json", SCHEMA_INDEX);
        scanDirectory("payloads", ".json", PAYLOAD_INDEX);
        initialized = true;
    }

    private static void scanDirectory(String rootDir, String suffix, Map<String, String> index) {
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        URL rootUrl = classLoader.getResource(rootDir);
        if (rootUrl == null) {
            return;
        }

        String protocol = rootUrl.getProtocol();
        if ("file".equals(protocol)) {
            scanFileSystem(Paths.get(URI.create(rootUrl.toString())), rootDir, suffix, index);
        } else if ("jar".equals(protocol)) {
            scanJar(rootUrl, rootDir, suffix, index);
        }
    }

    private static void scanFileSystem(Path root, String rootDir, String suffix, Map<String, String> index) {
        try (Stream<Path> walker = Files.walk(root)) {
            walker.filter(Files::isRegularFile)
                    .filter(p -> p.toString().endsWith(suffix))
                    .forEach(p -> {
                        String relativePath = root.relativize(p).toString().replace('\\', '/');
                        String fullClasspath = rootDir + "/" + relativePath;
                        String shortKey = extractKey(relativePath, suffix);
                        index.put(shortKey, fullClasspath);
                    });
        } catch (IOException ignored) {
        }
    }

    private static void scanJar(URL rootUrl, String rootDir, String suffix, Map<String, String> index) {
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
                                String fullClasspath = p.toString();
                                if (fullClasspath.startsWith("/")) {
                                    fullClasspath = fullClasspath.substring(1);
                                }
                                String relativePath = fullClasspath.substring(rootDir.length() + 1);
                                String shortKey = extractKey(relativePath, suffix);
                                index.put(shortKey, fullClasspath);
                            });
                }
            }
        } catch (IOException ignored) {
        }
    }

    private static String extractKey(String relativePath, String suffix) {
        String withoutSuffix = relativePath.substring(0, relativePath.length() - suffix.length());
        int lastSlash = withoutSuffix.lastIndexOf('/');
        return lastSlash >= 0 ? withoutSuffix.substring(lastSlash + 1) : withoutSuffix;
    }

    private static String stripSuffix(String key, String suffix) {
        return key.endsWith(suffix) ? key.substring(0, key.length() - suffix.length()) : key;
    }

    private static boolean looksLikeFullPath(String key) {
        return key.contains("/") || key.endsWith(".json");
    }
}
