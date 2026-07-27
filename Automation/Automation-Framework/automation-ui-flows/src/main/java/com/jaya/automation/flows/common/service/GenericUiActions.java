package com.jaya.automation.flows.common.service;

import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.MuiSelectors;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.Map;

public final class GenericUiActions {

    private static final AutomationLogger LOG = LoggerFactory.getLogger(GenericUiActions.class);
    private static final DateTimeFormatter[] DATE_FORMATS = {
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd")
    };

    private final UiEngine uiEngine;
    private final GenericLocatorResolver locatorResolver;

    public GenericUiActions(UiEngine uiEngine) {
        this.uiEngine = uiEngine;
        this.locatorResolver = new GenericLocatorResolver(new UiActionRegistry());
    }

    public void navigateToUrl(String url, String baseUrl) {
        String absoluteUrl = toAbsoluteUrl(url, baseUrl);
        uiEngine.navigateTo(absoluteUrl);
        uiEngine.waits().forDocumentReady();
    }

    public void navigateToUrlWithTitle(String url, String expectedTitle, String baseUrl) {
        navigateToUrl(url, baseUrl);
        String actualTitle = uiEngine.pageTitle();
        if (actualTitle == null || !actualTitle.contains(expectedTitle)) {
            throw new IllegalStateException(
                    "Expected page title to contain '" + expectedTitle + "' but was '" + actualTitle + "'");
        }
    }

    public void reloadPage() {
        uiEngine.reload();
        uiEngine.waits().forDocumentReady();
    }

    public void navigateBack() {
        uiEngine.navigateBack();
        uiEngine.waits().forDocumentReady();
    }

    public void navigateForward() {
        uiEngine.navigateForward();
        uiEngine.waits().forDocumentReady();
    }

    public void waitForPageFullyLoaded() {
        uiEngine.waits().forDocumentReady();
        uiEngine.waits().forNetworkIdle();
    }

    public void clickButton(String label) {
        clickResolved(label, GenericLocatorResolver.ElementRole.BUTTON);
    }

    public void clickLink(String label) {
        clickResolved(label, GenericLocatorResolver.ElementRole.LINK);
    }

    public void clickSelector(String selector) {
        clickResolved(selector, GenericLocatorResolver.ElementRole.ELEMENT);
    }

    public void clickSelectorInFrame(String selector, String frameSelector) {
        runInFrame(frameSelector, () -> clickSelector(selector));
    }

    public void doubleClickSelector(String selector) {
        Locator locator = locatorResolver.resolveForEngine(uiEngine, selector, GenericLocatorResolver.ElementRole.ELEMENT);
        uiEngine.elements().doubleClick(locator);
    }

    public void pressKeyOnElement(String key, String element) {
        Locator locator = locatorResolver.resolveForEngine(uiEngine, element, GenericLocatorResolver.ElementRole.ELEMENT);
        uiEngine.elements().pressKey(locator, key);
    }

    public void fillTextField(String field, String value) {
        fillResolved(field, value, GenericLocatorResolver.ElementRole.FIELD);
    }

    public void fillTextFieldByName(String name, String value) {
        Locator locator = Locator.name(name);
        uiEngine.waits().forVisible(locator);
        uiEngine.elements().clearAndType(locator, value);
    }

    public void fillTextFieldBySelector(String selector, String value) {
        Locator locator = locatorResolver.resolveForEngine(uiEngine, selector, GenericLocatorResolver.ElementRole.FIELD);
        uiEngine.waits().forVisible(locator);
        uiEngine.elements().clearAndType(locator, value);
    }

    public void fillTextarea(String field, String value) {
        fillResolved(field, value, GenericLocatorResolver.ElementRole.TEXTAREA);
    }

    public void selectDropdownOption(String optionText, String dropdown) {
        Locator dropdownLocator = locatorResolver.resolveForEngine(
                uiEngine, dropdown, GenericLocatorResolver.ElementRole.FIELD);
        selectOption(dropdownLocator, optionText);
    }

    public void selectDropdownOptionByName(String optionText, String name) {
        Locator dropdownLocator = Locator.name(name);
        selectOption(dropdownLocator, optionText);
    }

    public void selectRadioButton(String group, String value) {
        Locator radio = Locator.css("input[type='radio'][name='" + group + "'][value='" + value + "']");
        uiEngine.waits().forClickable(radio);
        uiEngine.elements().setChecked(radio, true);
    }

    public void checkCheckbox(String checkbox) {
        setCheckboxState(checkbox, true, null);
    }

    public void checkCheckboxInFrame(String checkbox, String frameSelector) {
        runInFrame(frameSelector, () -> setCheckboxState(checkbox, true, null));
    }

    public void uncheckCheckbox(String checkbox) {
        setCheckboxState(checkbox, false, null);
    }

    public void uncheckCheckboxInFrame(String checkbox, String frameSelector) {
        runInFrame(frameSelector, () -> setCheckboxState(checkbox, false, null));
    }

    public void populateFormFields(Map<String, String> fieldValues) {
        for (Map.Entry<String, String> entry : fieldValues.entrySet()) {
            fillTextField(entry.getKey(), entry.getValue());
        }
    }

    public void selectDateInCalendar(String date, String iconSelector) {
        selectDateInCalendar(date, iconSelector, null);
    }

    public void selectDateInCalendar(String date, String iconSelector, String frameSelector) {
        Runnable action = () -> selectDate(iconSelector, date);
        if (frameSelector == null || frameSelector.isBlank()) {
            action.run();
        } else {
            runInFrame(frameSelector, action);
        }
    }

    public void selectTodayInCalendar(String iconSelector) {
        Locator iconLocator = locatorResolver.resolveForEngine(
                uiEngine, iconSelector, GenericLocatorResolver.ElementRole.ELEMENT);
        openDatePicker(iconLocator);
        Locator today = Locator.css(MuiSelectors.TODAY);
        uiEngine.waits().forVisible(today);
        uiEngine.elements().click(today);
    }

    public void clearCalendarSelection(String iconSelector) {
        Locator iconLocator = locatorResolver.resolveForEngine(
                uiEngine, iconSelector, GenericLocatorResolver.ElementRole.ELEMENT);
        String tag = uiEngine.elements().tagNameOf(iconLocator);
        if ("input".equalsIgnoreCase(tag)) {
            uiEngine.elements().clearAndType(iconLocator, "");
            return;
        }
        Locator input = Locator.xpath("//input[@placeholder='Choose a date']");
        if (uiEngine.elements().exists(input)) {
            uiEngine.elements().clearAndType(input, "");
        }
    }

    public String pageTitle() {
        return uiEngine.pageTitle();
    }

    public String currentUrl() {
        return uiEngine.currentUrl();
    }

    public boolean isElementVisible(String element) {
        return isElementVisible(element, null);
    }

    public boolean isElementVisibleInFrame(String element, String frameSelector) {
        try {
            uiEngine.frames().enter(locatorResolver.resolveForEngine(
                    uiEngine, frameSelector, GenericLocatorResolver.ElementRole.ELEMENT));
            return isElementVisible(element, null);
        } finally {
            uiEngine.frames().exitToRoot();
        }
    }

    public boolean isElementVisibleWithin(String element, long timeoutMs) {
        Locator locator = locatorResolver.resolveForEngine(
                uiEngine, element, GenericLocatorResolver.ElementRole.ELEMENT);
        return uiEngine.waits().forVisible(locator, timeoutMs);
    }

    public boolean elementExists(String element) {
        Locator locator = locatorResolver.resolveForEngine(
                uiEngine, element, GenericLocatorResolver.ElementRole.ELEMENT);
        return uiEngine.elements().exists(locator);
    }

    public String elementText(String element) {
        Locator locator = locatorResolver.resolveForEngine(
                uiEngine, element, GenericLocatorResolver.ElementRole.TEXT);
        return uiEngine.elements().textOf(locator);
    }

    public String elementTextInFrame(String element, String frameSelector) {
        try {
            uiEngine.frames().enter(locatorResolver.resolveForEngine(
                    uiEngine, frameSelector, GenericLocatorResolver.ElementRole.ELEMENT));
            return elementText(element);
        } finally {
            uiEngine.frames().exitToRoot();
        }
    }

    public boolean elementContainsText(String element, String expectedText) {
        String actual = elementText(element);
        return actual != null && actual.contains(expectedText);
    }

    public boolean elementContainsTextInFrame(String element, String expectedText, String frameSelector) {
        String actual = elementTextInFrame(element, frameSelector);
        return actual != null && actual.contains(expectedText);
    }

    public boolean textPresentInElement(String expectedText, String element) {
        return elementContainsText(element, expectedText);
    }

    private void clickResolved(String value, GenericLocatorResolver.ElementRole role) {
        Locator locator = locatorResolver.resolveForEngine(uiEngine, value, role);
        uiEngine.waits().forClickable(locator);
        uiEngine.elements().click(locator);
    }

    private void fillResolved(String field, String value, GenericLocatorResolver.ElementRole role) {
        Locator locator = locatorResolver.resolveForEngine(uiEngine, field, role);
        uiEngine.waits().forVisible(locator);
        uiEngine.elements().clearAndType(locator, value);
    }

    private void setCheckboxState(String checkbox, boolean checked, String ignored) {
        Locator locator = locatorResolver.resolveForEngine(
                uiEngine, checkbox, GenericLocatorResolver.ElementRole.ELEMENT);
        uiEngine.waits().forVisible(locator);
        uiEngine.elements().setChecked(locator, checked);
    }

    private void selectOption(Locator dropdownLocator, String optionText) {
        uiEngine.waits().forVisible(dropdownLocator);
        String tag = uiEngine.elements().tagNameOf(dropdownLocator);
        if ("select".equalsIgnoreCase(tag)) {
            uiEngine.elements().selectNativeOption(dropdownLocator, optionText);
            return;
        }
        uiEngine.waits().forClickable(dropdownLocator);
        uiEngine.elements().click(dropdownLocator);
        Locator optionLocator = Locator.xpath(
                "//li[normalize-space()='" + escape(optionText) + "']"
                        + " | //div[@role='option'][normalize-space()='" + escape(optionText) + "']"
                        + " | //*[@role='option'][normalize-space()='" + escape(optionText) + "']"
        );
        uiEngine.waits().forVisible(optionLocator);
        uiEngine.elements().click(optionLocator);
    }

    private void selectDate(String iconSelector, String date) {
        Locator iconLocator = locatorResolver.resolveForEngine(
                uiEngine, iconSelector, GenericLocatorResolver.ElementRole.ELEMENT);
        String tag = uiEngine.elements().tagNameOf(iconLocator);
        if ("input".equalsIgnoreCase(tag)) {
            String type = uiEngine.elements().attributeOf(iconLocator, "type");
            if ("date".equalsIgnoreCase(type)) {
                uiEngine.elements().clearAndType(iconLocator, toIsoDate(date));
                return;
            }
        }
        openDatePicker(iconLocator);
        LocalDate targetDate = parseDate(date);
        navigateCalendarTo(targetDate);
        Locator day = Locator.xpath(
                "//button[contains(@class,'MuiPickersDay-root')"
                        + " and not(contains(@class,'MuiPickersDay-dayOutsideMonth'))"
                        + " and normalize-space()='" + targetDate.getDayOfMonth() + "']"
        );
        uiEngine.waits().forVisible(day);
        uiEngine.elements().click(day);
    }

    private void openDatePicker(Locator iconLocator) {
        String tag = uiEngine.elements().tagNameOf(iconLocator);
        if ("input".equalsIgnoreCase(tag)) {
            uiEngine.elements().click(iconLocator);
            return;
        }
        uiEngine.waits().forClickable(iconLocator);
        uiEngine.elements().click(iconLocator);
        Locator input = Locator.css("input[placeholder='Choose a date']");
        if (uiEngine.elements().exists(input)) {
            uiEngine.elements().click(input);
        }
    }

    private void navigateCalendarTo(LocalDate targetDate) {
        Locator header = Locator.css(MuiSelectors.HEADER);
        for (int attempt = 0; attempt < 24; attempt++) {
            if (!uiEngine.elements().exists(header)) {
                return;
            }
            String headerText = uiEngine.elements().textOf(header).toLowerCase(Locale.ROOT);
            if (headerText.contains(monthName(targetDate.getMonthValue()))
                    && headerText.contains(String.valueOf(targetDate.getYear()))) {
                return;
            }
            uiEngine.elements().click(Locator.css(MuiSelectors.NEXT));
        }
    }

    private String monthName(int month) {
        return LocalDate.of(2000, month, 1).getMonth().name().toLowerCase(Locale.ROOT);
    }

    private LocalDate parseDate(String date) {
        for (DateTimeFormatter formatter : DATE_FORMATS) {
            try {
                return LocalDate.parse(date, formatter);
            } catch (DateTimeParseException exception) {
                LOG.debug("Date format {} did not match input {}: {}", formatter, date, exception.getMessage());
            }
        }
        throw new IllegalArgumentException("Unsupported date format: " + date);
    }

    private String toIsoDate(String date) {
        return parseDate(date).format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    private boolean isElementVisible(String element, String ignored) {
        Locator locator = locatorResolver.resolveForEngine(
                uiEngine, element, GenericLocatorResolver.ElementRole.ELEMENT);
        return uiEngine.elements().isVisible(locator);
    }

    private void runInFrame(String frameSelector, Runnable action) {
        Locator frameLocator = locatorResolver.resolveForEngine(
                uiEngine, frameSelector, GenericLocatorResolver.ElementRole.ELEMENT);
        try {
            uiEngine.frames().enter(frameLocator);
            action.run();
        } finally {
            uiEngine.frames().exitToRoot();
        }
    }

    private String toAbsoluteUrl(String url, String baseUrl) {
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url;
        }
        String normalizedBase = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        if (url.startsWith("/")) {
            return normalizedBase + url;
        }
        return normalizedBase + "/" + url;
    }

    private String escape(String value) {
        return value.replace("'", "\\'");
    }
}
