FROM maven:3.9.9-eclipse-temurin-17

WORKDIR /opt/automation
COPY . /opt/automation

RUN mvn -pl automation-app -am -DskipTests test-compile

ENTRYPOINT ["sh", "/opt/automation/docker/automation-job/run.sh"]
