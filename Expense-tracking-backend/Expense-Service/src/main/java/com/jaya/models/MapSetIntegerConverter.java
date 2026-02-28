package com.jaya.models;



import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.*;
import java.util.stream.Collectors;

@Converter
public class MapSetIntegerConverter implements AttributeConverter<Map<Integer, Set<Integer>>, String> {

    @Override
    public String convertToDatabaseColumn(Map<Integer, Set<Integer>> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "";
        }
        return attribute.entrySet().stream()
                .map(entry -> entry.getKey() + ":" + entry.getValue().stream().map(String::valueOf).collect(Collectors.joining(",")))
                .collect(Collectors.joining(";"));
    }

    @Override
    public Map<Integer, Set<Integer>> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return new HashMap<>();
        }
        return Arrays.stream(dbData.split(";"))
                .map(entry -> entry.split(":"))
                .collect(Collectors.toMap(
                        e -> Integer.valueOf(e[0]),
                        e -> Arrays.stream(e[1].split(",")).map(Integer::valueOf).collect(Collectors.toSet())
                ));
    }
}
