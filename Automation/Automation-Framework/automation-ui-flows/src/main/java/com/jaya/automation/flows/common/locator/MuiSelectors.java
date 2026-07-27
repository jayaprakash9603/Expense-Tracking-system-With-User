package com.jaya.automation.flows.common.locator;

public final class MuiSelectors {

    public static final String LISTBOX = "[role='listbox'], .MuiMenu-list, .MuiAutocomplete-listbox";
    public static final String OPTION = "[role='option'], li.MuiMenuItem-root";
    public static final String DIALOG = "[role='dialog'].MuiDialog-root";
    public static final String PICKER = ".MuiPickersPopper-root, .MuiDateCalendar-root";
    public static final String DAY = ".MuiPickersDay-root:not(.MuiPickersDay-dayOutsideMonth)";
    public static final String TODAY = ".MuiPickersDay-today";
    public static final String HEADER = ".MuiPickersCalendarHeader-label";
    public static final String NEXT = "button[aria-label='Next month'], button[title='Next month']";
    public static final String PREV = "button[aria-label='Previous month'], button[title='Previous month']";

    private MuiSelectors() {
    }
}
