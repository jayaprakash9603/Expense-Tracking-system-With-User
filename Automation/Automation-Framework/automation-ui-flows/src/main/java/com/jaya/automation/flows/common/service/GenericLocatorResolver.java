package com.jaya.automation.flows.common.service;

import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.core.ui.LocatorParser;
import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorSet;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;

public final class GenericLocatorResolver {

    public enum ElementRole {
        BUTTON,
        LINK,
        FIELD,
        TEXTAREA,
        TEXT,
        ELEMENT
    }

    private final UiActionRegistry uiActionRegistry;

    public GenericLocatorResolver(UiActionRegistry uiActionRegistry) {
        this.uiActionRegistry = uiActionRegistry;
    }

    public Locator resolveForEngine(UiEngine uiEngine, String value, ElementRole role) {
        return resolveSet(value, role).resolve(uiEngine);
    }

    public LocatorSet resolveSet(String value, ElementRole role) {
        if (LocatorParser.looksLikeSelector(value)) {
            return LocatorSet.of("selector-" + role.name().toLowerCase(Locale.ROOT), LocatorParser.parse(value));
        }
        String normalized = normalize(value);
        List<Locator> candidates = new ArrayList<>();
        mergeRegistryCandidates(candidates, normalized, role);
        candidates.addAll(roleCandidates(value, normalized, role));
        return LocatorSet.of(role.name().toLowerCase(Locale.ROOT) + "-" + normalized,
                dedupe(candidates).toArray(new Locator[0]));
    }

    private void mergeRegistryCandidates(List<Locator> candidates, String normalized, ElementRole role) {
        switch (role) {
            case BUTTON -> mergeIfPresent(candidates, safeRegistry(() -> uiActionRegistry.action(normalized)));
            case FIELD, TEXTAREA -> mergeIfPresent(candidates, safeRegistry(() -> uiActionRegistry.field(normalized)));
            case TEXT, ELEMENT -> mergeIfPresent(candidates, safeRegistry(() -> uiActionRegistry.text(normalized)));
            case LINK -> {
                mergeIfPresent(candidates, safeRegistry(() -> uiActionRegistry.action(normalized)));
                mergeIfPresent(candidates, safeRegistry(() -> uiActionRegistry.text(normalized)));
            }
            default -> {
            }
        }
    }

    private LocatorSet safeRegistry(java.util.function.Supplier<LocatorSet> supplier) {
        try {
            return supplier.get();
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private void mergeIfPresent(List<Locator> candidates, LocatorSet set) {
        if (set != null) {
            candidates.addAll(set.candidates());
        }
    }

    private List<Locator> roleCandidates(String raw, String normalized, ElementRole role) {
        String escaped = escape(raw);
        return switch (role) {
            case BUTTON -> List.of(
                    Locator.css("[data-testid='" + normalized + "']"),
                    Locator.xpath("//button[normalize-space()='" + escaped + "']"),
                    Locator.xpath("//button[contains(normalize-space(),'" + escaped + "')]"),
                    Locator.css("[aria-label='" + escaped + "']"),
                    Locator.css("[title='" + escaped + "']"),
                    Locator.xpath("//*[@role='button'][normalize-space()='" + escaped + "']"),
                    Locator.text(raw)
            );
            case LINK -> List.of(
                    Locator.xpath("//a[normalize-space()='" + escaped + "']"),
                    Locator.css("a[href='" + raw + "']"),
                    Locator.css("#nav-item-" + normalized),
                    Locator.css("[data-shortcut='" + normalized + "']"),
                    Locator.text(raw)
            );
            case FIELD -> List.of(
                    Locator.css("input[name='" + normalized + "']"),
                    Locator.css("#" + normalized),
                    Locator.css("input[placeholder='" + escaped + "']"),
                    Locator.xpath("//label[normalize-space()='" + escaped + "']/following::input[1]"),
                    Locator.xpath("//input[@id=//label[normalize-space()='" + escaped + "']/@for]"),
                    Locator.css("[aria-label='" + escaped + "']"),
                    Locator.css("input[name='" + raw + "']")
            );
            case TEXTAREA -> List.of(
                    Locator.css("textarea[name='" + normalized + "']"),
                    Locator.css("#" + normalized),
                    Locator.css("textarea[placeholder='" + escaped + "']"),
                    Locator.xpath("//label[normalize-space()='" + escaped + "']/following::textarea[1]"),
                    Locator.css("[aria-label='" + escaped + "']")
            );
            case TEXT, ELEMENT -> List.of(
                    Locator.css("[data-testid='" + normalized + "']"),
                    Locator.xpath("//*[normalize-space()='" + escaped + "']"),
                    Locator.text(raw)
            );
        };
    }

    private String normalize(String key) {
        return key.trim()
                .toLowerCase(Locale.ROOT)
                .replace(" ", "-")
                .replace(".", "-")
                .replace("_", "-");
    }

    private String escape(String value) {
        return value.replace("'", "\\'");
    }

    private List<Locator> dedupe(List<Locator> candidates) {
        return new ArrayList<>(new LinkedHashSet<>(candidates));
    }
}
