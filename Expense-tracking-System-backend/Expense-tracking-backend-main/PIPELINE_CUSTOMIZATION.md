# Jenkins Pipeline - Customization Examples

This guide provides practical examples for customizing the Jenkins pipeline to meet specific needs.

## 📋 Table of Contents

1. [Adding New Services](#adding-new-services)
2. [Customizing Build Commands](#customizing-build-commands)
3. [Adding Build Profiles](#adding-build-profiles)
4. [Notification Configuration](#notification-configuration)
5. [Quality Gates Integration](#quality-gates-integration)
6. [Docker Registry Configuration](#docker-registry-configuration)
7. [Deployment Automation](#deployment-automation)
8. [Advanced Logging](#advanced-logging)

---

## 1. Adding New Services

### Example: Add "Analytics-v2-Service"

```groovy
// In Jenkinsfile, add to parallel stages:
stage('📊 Analytics V2 Service') {
    steps {
        script {
            buildService('Analytics-v2-Service', '📊')
        }
    }
}

// Also add to services list in artifact collection:
def services = [
    'user-service',
    'social-media-app',
    // ... existing services ...
    'Analytics-v2-Service'  // Add here
]
```

---

## 2. Customizing Build Commands

### Example: Add Maven Profiles

```groovy
// Modify buildService function:
def buildService(String serviceName, String emoji = '📦') {
    dir("${BACKEND_ROOT}/${serviceName}") {
        def cleanPhase = params.CLEAN_BUILD ? 'clean' : ''
        def testSkip = params.SKIP_TESTS ? '-DskipTests' : ''
        def profile = env.BUILD_PROFILE ?: 'dev'  // Add profile

        def buildCommand = "${mvnCmd} ${cleanPhase} package ${testSkip} -P${profile}"

        sh buildCommand
    }
}

// Add parameter to pipeline:
parameters {
    choice(
        name: 'BUILD_PROFILE',
        choices: ['dev', 'staging', 'prod'],
        description: 'Maven build profile'
    )
}
```

### Example: Custom Maven Goals

```groovy
// For specific service:
stage('User Service with Integration Tests') {
    steps {
        dir("${BACKEND_ROOT}/user-service") {
            sh 'mvn clean verify -Pintegration-tests'
        }
    }
}
```

---

## 3. Adding Build Profiles

### Example: Environment-Specific Builds

```groovy
pipeline {
    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'staging', 'production'],
            description: 'Target environment'
        )
    }

    environment {
        // Set environment-specific variables
        SPRING_PROFILE = "${params.ENVIRONMENT}"
        DB_CONFIG = credentials("db-config-${params.ENVIRONMENT}")
    }

    stages {
        stage('Build with Profile') {
            steps {
                script {
                    sh """
                        mvn clean package \
                        -Dspring.profiles.active=${SPRING_PROFILE} \
                        -Ddb.url=${DB_CONFIG_USR} \
                        -Ddb.password=${DB_CONFIG_PSW}
                    """
                }
            }
        }
    }
}
```

---

## 4. Notification Configuration

### Example: Email Notifications

```groovy
post {
    success {
        emailext (
            subject: "✅ Build Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: """
                <h2>Build Successful!</h2>
                <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
                <p><strong>Branch:</strong> ${env.GIT_BRANCH}</p>
                <p><a href="${env.BUILD_URL}">View Build</a></p>
            """,
            to: 'team@example.com',
            mimeType: 'text/html'
        )
    }

    failure {
        emailext (
            subject: "❌ Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: """
                <h2>Build Failed!</h2>
                <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                <p><strong>Failed Stage:</strong> ${env.STAGE_NAME}</p>
                <p><a href="${env.BUILD_URL}/console">View Console Output</a></p>
            """,
            to: 'team@example.com, manager@example.com',
            mimeType: 'text/html'
        )
    }
}
```

### Example: Slack Notifications

```groovy
post {
    success {
        slackSend (
            color: 'good',
            message: """
                :white_check_mark: *Build Success*
                *Job:* ${env.JOB_NAME}
                *Build:* #${env.BUILD_NUMBER}
                *Duration:* ${currentBuild.durationString}
                <${env.BUILD_URL}|View Build>
            """,
            channel: '#builds'
        )
    }

    failure {
        slackSend (
            color: 'danger',
            message: """
                :x: *Build Failed*
                *Job:* ${env.JOB_NAME}
                *Build:* #${env.BUILD_NUMBER}
                *Stage:* ${env.STAGE_NAME}
                <${env.BUILD_URL}/console|View Logs>
                @channel Please investigate!
            """,
            channel: '#builds'
        )
    }
}
```

### Example: Microsoft Teams Notification

```groovy
post {
    always {
        office365ConnectorSend (
            webhookUrl: 'https://your-teams-webhook-url',
            color: currentBuild.result == 'SUCCESS' ? '00FF00' : 'FF0000',
            message: "Build ${currentBuild.result}: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            status: currentBuild.result
        )
    }
}
```

---

## 5. Quality Gates Integration

### Example: SonarQube Integration

```groovy
stage('🔍 Code Quality Analysis') {
    steps {
        script {
            withSonarQubeEnv('SonarQube') {
                sh """
                    mvn sonar:sonar \
                    -Dsonar.projectKey=expense-tracker \
                    -Dsonar.host.url=${SONAR_HOST_URL} \
                    -Dsonar.login=${SONAR_AUTH_TOKEN}
                """
            }
        }
    }
}

stage('Quality Gate') {
    steps {
        timeout(time: 10, unit: 'MINUTES') {
            waitForQualityGate abortPipeline: true
        }
    }
}
```

### Example: OWASP Dependency Check

```groovy
stage('🛡️ Security Scan') {
    steps {
        script {
            sh 'mvn org.owasp:dependency-check-maven:check'
        }
    }
    post {
        always {
            dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
        }
    }
}
```

### Example: JaCoCo Code Coverage

```groovy
stage('📊 Code Coverage') {
    steps {
        script {
            sh 'mvn jacoco:report'
        }
    }
    post {
        always {
            jacoco(
                execPattern: '**/target/jacoco.exec',
                classPattern: '**/target/classes',
                sourcePattern: '**/src/main/java',
                minimumLineCoverage: '80',
                changeBuildStatus: true
            )
        }
    }
}
```

---

## 6. Docker Registry Configuration

### Example: Push to Multiple Registries

```groovy
stage('📤 Push Docker Images') {
    parallel {
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin
                        docker push myorg/expense-tracker-user-service:${BUILD_NUMBER}
                    """
                }
            }
        }

        stage('Push to AWS ECR') {
            steps {
                withAWS(credentials: 'aws-credentials', region: 'us-east-1') {
                    sh """
                        aws ecr get-login-password | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                        docker tag myorg/expense-tracker-user-service:${BUILD_NUMBER} ${ECR_REGISTRY}/user-service:${BUILD_NUMBER}
                        docker push ${ECR_REGISTRY}/user-service:${BUILD_NUMBER}
                    """
                }
            }
        }

        stage('Push to GCR') {
            steps {
                withCredentials([file(credentialsId: 'gcp-key', variable: 'GCP_KEY')]) {
                    sh """
                        cat ${GCP_KEY} | docker login -u _json_key --password-stdin https://gcr.io
                        docker tag myorg/expense-tracker-user-service:${BUILD_NUMBER} gcr.io/project/user-service:${BUILD_NUMBER}
                        docker push gcr.io/project/user-service:${BUILD_NUMBER}
                    """
                }
            }
        }
    }
}
```

---

## 7. Deployment Automation

### Example: Deploy to Kubernetes

```groovy
stage('🚀 Deploy to Kubernetes') {
    when {
        branch 'main'
        expression { params.AUTO_DEPLOY }
    }
    steps {
        script {
            withKubeConfig([credentialsId: 'kubeconfig']) {
                sh """
                    kubectl set image deployment/user-service \
                        user-service=${DOCKER_REGISTRY}/user-service:${BUILD_NUMBER} \
                        -n expense-tracker

                    kubectl rollout status deployment/user-service -n expense-tracker
                """
            }
        }
    }
}
```

### Example: Deploy to AWS ECS

```groovy
stage('🚀 Deploy to ECS') {
    steps {
        withAWS(credentials: 'aws-credentials', region: 'us-east-1') {
            sh """
                aws ecs update-service \
                    --cluster expense-tracker-cluster \
                    --service user-service \
                    --force-new-deployment \
                    --task-definition user-service:${BUILD_NUMBER}
            """
        }
    }
}
```

### Example: Blue-Green Deployment

```groovy
stage('🔵 Deploy Blue') {
    steps {
        script {
            sh """
                kubectl apply -f k8s/deployment-blue.yaml
                kubectl wait --for=condition=available deployment/user-service-blue
            """
        }
    }
}

stage('🔄 Switch Traffic') {
    input {
        message "Switch traffic to blue deployment?"
        ok "Switch"
    }
    steps {
        script {
            sh """
                kubectl patch service user-service -p '{"spec":{"selector":{"version":"blue"}}}'
            """
        }
    }
}

stage('🟢 Cleanup Green') {
    steps {
        script {
            sh "kubectl delete deployment user-service-green"
        }
    }
}
```

---

## 8. Advanced Logging

### Example: Structured Logging

```groovy
def logWithLevel(String level, String message) {
    def timestamp = new Date().format('yyyy-MM-dd HH:mm:ss.SSS')
    def color = [
        'DEBUG': '\033[0;36m',
        'INFO': '\033[0;32m',
        'WARN': '\033[0;33m',
        'ERROR': '\033[0;31m',
        'RESET': '\033[0m'
    ]

    echo "${color[level]}[${timestamp}] [${level}] ${message}${color['RESET']}"
}

// Usage:
logWithLevel('INFO', 'Starting build process')
logWithLevel('WARN', 'Tests were skipped')
logWithLevel('ERROR', 'Build failed for service X')
```

### Example: Build Metrics Collection

```groovy
def collectBuildMetrics() {
    def metrics = [
        buildNumber: env.BUILD_NUMBER,
        timestamp: new Date().format('yyyy-MM-dd HH:mm:ss'),
        duration: currentBuild.duration / 1000,
        result: currentBuild.result,
        services: []
    ]

    // Collect per-service metrics
    def services = getServicesList()
    services.each { service ->
        def jarSize = sh(
            script: "du -h ${BACKEND_ROOT}/${service}/target/*.jar 2>/dev/null | cut -f1 || echo 'N/A'",
            returnStdout: true
        ).trim()

        metrics.services << [
            name: service,
            jarSize: jarSize,
            buildTime: serviceMetrics[service]?.duration ?: 0
        ]
    }

    // Write metrics to JSON
    writeJSON file: 'build-metrics.json', json: metrics
    archiveArtifacts artifacts: 'build-metrics.json'
}
```

### Example: Send Metrics to Grafana

```groovy
post {
    always {
        script {
            def duration = currentBuild.duration / 1000
            def result = currentBuild.result == 'SUCCESS' ? 1 : 0

            sh """
                curl -X POST http://grafana:3000/api/metrics \
                -H 'Content-Type: application/json' \
                -d '{
                    "build_number": ${BUILD_NUMBER},
                    "duration": ${duration},
                    "success": ${result},
                    "timestamp": "${new Date().time}"
                }'
            """
        }
    }
}
```

---

## 9. Conditional Builds

### Example: Build Specific Services

```groovy
parameters {
    booleanParam(name: 'BUILD_USER_SERVICE', defaultValue: true)
    booleanParam(name: 'BUILD_SOCIAL_MEDIA', defaultValue: true)
    booleanParam(name: 'BUILD_GATEWAY', defaultValue: true)
}

stage('Conditional Builds') {
    parallel {
        stage('User Service') {
            when {
                expression { params.BUILD_USER_SERVICE }
            }
            steps {
                buildService('user-service')
            }
        }

        stage('Social Media App') {
            when {
                expression { params.BUILD_SOCIAL_MEDIA }
            }
            steps {
                buildService('social-media-app')
            }
        }
    }
}
```

### Example: Build Only Changed Services

```groovy
stage('Detect Changes') {
    steps {
        script {
            def changes = sh(
                script: 'git diff --name-only HEAD~1',
                returnStdout: true
            ).trim().split('\n')

            env.CHANGED_SERVICES = changes
                .findAll { it.contains('Service') }
                .collect { it.split('/')[0] }
                .unique()
                .join(',')

            echo "Changed services: ${env.CHANGED_SERVICES}"
        }
    }
}

stage('Build Changed Services') {
    steps {
        script {
            def services = env.CHANGED_SERVICES.split(',')
            services.each { service ->
                if (service) {
                    buildService(service)
                }
            }
        }
    }
}
```

---

## 10. Advanced Error Handling

### Example: Retry Failed Builds

```groovy
stage('Build with Retry') {
    steps {
        retry(3) {
            script {
                try {
                    buildService('user-service')
                } catch (Exception e) {
                    echo "Build failed: ${e.message}. Retrying..."
                    sleep 10
                    throw e
                }
            }
        }
    }
}
```

### Example: Timeout with Fallback

```groovy
stage('Build with Timeout') {
    steps {
        timeout(time: 10, unit: 'MINUTES') {
            script {
                try {
                    buildService('user-service')
                } catch (org.jenkinsci.plugins.workflow.steps.FlowInterruptedException e) {
                    echo "Build timed out. Using cached artifacts..."
                    sh 'cp /cache/user-service.jar target/'
                }
            }
        }
    }
}
```

---

## 🎓 Best Practices

1. **Keep Pipelines DRY**: Use functions for repeated code
2. **Parameterize Everything**: Make pipelines configurable
3. **Handle Errors Gracefully**: Always have fallback options
4. **Log Extensively**: Make debugging easier
5. **Test Locally**: Use Jenkins Pipeline Linter
6. **Version Control**: Keep pipeline code in Git
7. **Document Changes**: Update README when modifying pipeline
8. **Monitor Performance**: Track build times and optimize
9. **Security First**: Never hardcode credentials
10. **Fail Fast**: Validate early to save time

---

**For more examples, check the official documentation or create an issue in the repository.**
