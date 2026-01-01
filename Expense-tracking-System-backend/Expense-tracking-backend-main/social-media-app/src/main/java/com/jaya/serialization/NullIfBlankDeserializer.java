package com.jaya.serialization;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import java.io.IOException;

/**
 * Custom deserializer that trims incoming string values and converts blanks to
 * {@code null}.
 * Bean validation annotations (e.g. {@code @Pattern}) treat null values as
 * valid, allowing
 * optional fields to skip validation when clients do not supply a value.
 */
public class NullIfBlankDeserializer extends JsonDeserializer<String> {

    @Override
    public String deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        String value = parser.getValueAsString();
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
