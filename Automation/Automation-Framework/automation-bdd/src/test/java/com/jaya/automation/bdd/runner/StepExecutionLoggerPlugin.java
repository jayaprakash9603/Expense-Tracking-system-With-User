package com.jaya.automation.bdd.runner;

import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import io.cucumber.plugin.ConcurrentEventListener;
import io.cucumber.plugin.event.EventPublisher;
import io.cucumber.plugin.event.PickleStepTestStep;
import io.cucumber.plugin.event.Result;
import io.cucumber.plugin.event.TestCaseFinished;
import io.cucumber.plugin.event.TestCaseStarted;
import io.cucumber.plugin.event.TestStep;
import io.cucumber.plugin.event.TestStepFinished;
import io.cucumber.plugin.event.TestStepStarted;

import java.time.Duration;

public final class StepExecutionLoggerPlugin implements ConcurrentEventListener {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(StepExecutionLoggerPlugin.class);
    private static final ThreadLocal<ScenarioStepLog> STEP_LOG = ThreadLocal.withInitial(ScenarioStepLog::new);

    @Override
    public void setEventPublisher(EventPublisher publisher) {
        publisher.registerHandlerFor(TestCaseStarted.class, this::onTestCaseStarted);
        publisher.registerHandlerFor(TestStepStarted.class, this::onTestStepStarted);
        publisher.registerHandlerFor(TestStepFinished.class, this::onTestStepFinished);
        publisher.registerHandlerFor(TestCaseFinished.class, this::onTestCaseFinished);
    }

    public static String currentStepLog() {
        ScenarioStepLog state = STEP_LOG.get();
        return state == null ? "" : state.content();
    }

    private void onTestCaseStarted(TestCaseStarted event) {
        ScenarioStepLog state = STEP_LOG.get();
        state.reset();
        String scenarioName = event.getTestCase().getName();
        String message = "SCENARIO STARTED: " + scenarioName;
        state.append(message);
        LOG.info(message);
    }

    private void onTestStepStarted(TestStepStarted event) {
        TestStep testStep = event.getTestStep();
        if (!isPickleStep(testStep)) {
            return;
        }
        ScenarioStepLog state = STEP_LOG.get();
        int stepNumber = state.nextStepNumber();
        String message = "STEP " + stepNumber + " STARTED: " + stepText(testStep);
        state.append(message);
        LOG.info(message);
    }

    private void onTestStepFinished(TestStepFinished event) {
        TestStep testStep = event.getTestStep();
        if (!isPickleStep(testStep)) {
            return;
        }
        ScenarioStepLog state = STEP_LOG.get();
        String message = stepCompletedMessage(state.currentStepNumber(), event.getResult(), stepText(testStep));
        state.append(message);
        LOG.info(message);
        appendError(state, event.getResult());
    }

    private void onTestCaseFinished(TestCaseFinished event) {
        ScenarioStepLog state = STEP_LOG.get();
        String scenarioName = event.getTestCase().getName();
        String status = event.getResult().getStatus().name();
        String message = "SCENARIO " + status + ": " + scenarioName;
        state.append(message);
        LOG.info(message);
        STEP_LOG.remove();
    }

    private void appendError(ScenarioStepLog state, Result result) {
        Throwable error = result.getError();
        if (error == null) {
            return;
        }
        String message = error.getMessage() == null ? error.getClass().getName() : error.getMessage();
        state.append("STEP ERROR: " + message);
        LOG.error("Step failure details", error);
    }

    private boolean isPickleStep(TestStep testStep) {
        return testStep instanceof PickleStepTestStep;
    }

    private String stepText(TestStep testStep) {
        PickleStepTestStep pickleStep = (PickleStepTestStep) testStep;
        String keyword = pickleStep.getStep().getKeyword();
        String text = pickleStep.getStep().getText();
        return keyword + text;
    }

    private String stepCompletedMessage(int stepNumber, Result result, String stepText) {
        String status = result.getStatus().name();
        return "STEP " + stepNumber + " " + status + " (" + durationMillis(result) + " ms): " + stepText;
    }

    private long durationMillis(Result result) {
        Duration duration = result.getDuration();
        return duration == null ? 0L : duration.toMillis();
    }

    private static final class ScenarioStepLog {
        private final StringBuilder lines = new StringBuilder();
        private int stepNumber;

        private void reset() {
            lines.setLength(0);
            stepNumber = 0;
        }

        private int nextStepNumber() {
            stepNumber++;
            return stepNumber;
        }

        private int currentStepNumber() {
            return stepNumber;
        }

        private void append(String line) {
            lines.append(line).append(System.lineSeparator());
        }

        private String content() {
            return lines.toString();
        }
    }
}
