package com.jaya.automation.bdd.steps.common;

/**
 * Backward-compatible base class for step definitions.
 * All data resolution, dynamic value handling, and DataTable mapping methods
 * are now inherited from {@link AbstractStepDefinition}.
 * <p>
 * Existing step definitions extending StepDataSupport continue working
 * without modification.
 */
public abstract class StepDataSupport extends AbstractStepDefinition {
}
