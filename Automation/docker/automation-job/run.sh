#!/usr/bin/env sh
set -eu

RUN_MODE=${RUN_MODE:-run-only}
AUTOMATION_RUNNER=${AUTOMATION_RUNNER:-plain}
AUTOMATION_SUITE=${AUTOMATION_SUITE:-}
FEATURES_PATH=${FEATURES_PATH:-}
TEST_ENV=${TEST_ENV:-local}
AUTOMATION_ENGINE=${AUTOMATION_ENGINE:-playwright}
CUCUMBER_FILTER_TAGS=${CUCUMBER_FILTER_TAGS:-@smoke}
RERUN_FAILURES=${RERUN_FAILURES:-false}

EXEC_ARGS="--${RUN_MODE} --runner=${AUTOMATION_RUNNER} --env=${TEST_ENV} --engine=${AUTOMATION_ENGINE} --tags=${CUCUMBER_FILTER_TAGS}"

if [ -n "${AUTOMATION_SUITE}" ]; then
  EXEC_ARGS="${EXEC_ARGS} --suite=${AUTOMATION_SUITE}"
fi

if [ -n "${FEATURES_PATH}" ]; then
  EXEC_ARGS="${EXEC_ARGS} --features-path=${FEATURES_PATH}"
fi

if [ "${RERUN_FAILURES}" = "true" ]; then
  EXEC_ARGS="${EXEC_ARGS} --rerun-failures"
fi

mvn -pl automation-app -am exec:java \
  "-Dexec.args=${EXEC_ARGS}" \
  "-DTEST_ENV=${TEST_ENV}" \
  "-DAUTOMATION_ENGINE=${AUTOMATION_ENGINE}" \
  "-Dcucumber.filter.tags=${CUCUMBER_FILTER_TAGS}" \
  ${ADDITIONAL_MAVEN_ARGS:-}
