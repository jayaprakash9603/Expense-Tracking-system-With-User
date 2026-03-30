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

# Java 17+ module access flags (reflection into restricted packages)
JAVA_MODULE_OPTS="--add-opens java.xml/com.sun.org.apache.xerces.internal.jaxp.datatype=ALL-UNNAMED \
  --add-opens java.base/java.lang=ALL-UNNAMED \
  --add-opens java.base/java.math=ALL-UNNAMED"

# JVM tuning — G1GC with OOM crash
JVM_HEAP=${JVM_HEAP:--Xms512m -Xmx1536m}
JVM_GC_OPTS=${JVM_GC_OPTS:--XX:+UseG1GC -XX:ParallelGCThreads=4 -XX:+ExitOnOutOfMemoryError}

# Observability agent (e.g., New Relic, OpenTelemetry)
OBSERVABILITY_AGENT_OPTS=""
if [ -n "${OBSERVABILITY_AGENT_JAR:-}" ] && [ -f "${OBSERVABILITY_AGENT_JAR}" ]; then
  OBSERVABILITY_AGENT_OPTS="-javaagent:${OBSERVABILITY_AGENT_JAR} ${OBSERVABILITY_AGENT_EXTRA:-}"
fi

# Debug port (JDWP)
DEBUG_OPTS=""
if [ "${DEBUG_ENABLED:-false}" = "true" ]; then
  DEBUG_PORT=${DEBUG_PORT:-9090}
  DEBUG_OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:${DEBUG_PORT}"
fi

export JAVA_OPTS="${JAVA_MODULE_OPTS} ${JVM_HEAP} ${JVM_GC_OPTS} ${OBSERVABILITY_AGENT_OPTS} ${DEBUG_OPTS} ${EXTRA_JAVA_OPTS:-}"

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
