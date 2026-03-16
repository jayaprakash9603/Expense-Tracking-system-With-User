package com.jaya.automation.app;

public enum SuiteType {
    SMOKE("smoke.xml"),
    REGRESSION("regression.xml"),
    API("api.xml"),
    UI("ui.xml");

    private final String suiteFileName;

    SuiteType(String suiteFileName) {
        this.suiteFileName = suiteFileName;
    }

    public String suiteFilePath() {
        return "src/test/resources/testng/" + suiteFileName;
    }
}
