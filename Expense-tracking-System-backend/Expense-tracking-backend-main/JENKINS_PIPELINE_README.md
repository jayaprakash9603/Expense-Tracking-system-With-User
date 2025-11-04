# Jenkins Pipeline for Expense Tracker Backend Services

This directory contains Jenkins pipeline configurations for building all backend microservices.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Jenkins Configuration](#jenkins-configuration)
- [Pipeline Features](#pipeline-features)
- [Usage](#usage)
- [Services](#services)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Required Tools

1. **Jenkins** (v2.300+)
2. **Maven** (v3.8.0+)
3. **JDK** (v17)
4. **Git**

### Jenkins Plugins Required

```
- Pipeline
- Git Plugin
- Maven Integration Plugin
- AnsiColor Plugin (for colored console output)
- Timestamper Plugin
- Pipeline Utility Steps
```

## ⚙️ Jenkins Configuration

### 1. Global Tool Configuration

Navigate to: `Jenkins → Manage Jenkins → Global Tool Configuration`

#### Maven Configuration

```
Name: Maven-3.9.0
Install automatically: Yes
Version: 3.9.0
```

#### JDK Configuration

```
Name: JDK-17
JAVA_HOME: /usr/lib/jvm/java-17-openjdk (or your JDK path)
Install automatically: Yes
Version: jdk-17.0.2
```

### 2. Create Pipeline Job

1. Click "New Item" in Jenkins
2. Enter name: `Expense-Tracker-Backend-Build`
3. Select "Pipeline"
4. Click "OK"

### 3. Configure Pipeline

In the Pipeline section, configure:

```groovy
Definition: Pipeline script from SCM
SCM: Git
Repository URL: [Your Git Repository URL]
Branch Specifier: */release-3 (or your branch)
Script Path: Expense-tracking-System-backend/Expense-tracking-backend-main/Jenkinsfile
```

## 🚀 Pipeline Features

### ✨ Key Features

1. **Parallel Builds**: All 14 services build simultaneously for faster execution
2. **Smart Logging**: Emoji-based, colored console output with timestamps
3. **Build Parameters**: Customizable build options
4. **Error Handling**: Comprehensive error catching and reporting
5. **Artifact Management**: Automatic JAR collection and archiving
6. **Build Metrics**: Duration tracking and summary reports
7. **Workspace Cleanup**: Automatic cleanup post-build

### 📊 Build Parameters

| Parameter            | Type    | Default | Description                                   |
| -------------------- | ------- | ------- | --------------------------------------------- |
| `SKIP_TESTS`         | Boolean | true    | Skip running tests during build               |
| `CLEAN_BUILD`        | Boolean | true    | Perform clean build (mvn clean)               |
| `BUILD_ALL_SERVICES` | Boolean | true    | Build all services in parallel                |
| `LOG_LEVEL`          | Choice  | INFO    | Maven build log level (INFO/DEBUG/WARN/ERROR) |

### 🎯 Pipeline Stages

1. **📋 Initialization**: Setup environment and display build info
2. **🔍 Pre-Build Validation**: Verify tools and workspace
3. **🏗️ Build Services**: Parallel build of all microservices
4. **📦 Artifact Collection**: Gather and archive JAR files
5. **📊 Build Summary**: Display build metrics and results

## 🏢 Services Built

The pipeline builds the following 14 microservices:

| Service                | Emoji | Port | Description                       |
| ---------------------- | ----- | ---- | --------------------------------- |
| user-service           | 🔐    | 6001 | User authentication & management  |
| social-media-app       | 📱    | 6000 | Main expense tracking application |
| eureka-server          | 🌐    | 8761 | Service discovery server          |
| Gateway                | 🚪    | 8080 | API Gateway                       |
| Budget-Service         | 💰    | -    | Budget management                 |
| Category-Service       | 📋    | -    | Expense categories                |
| Payment-method-Service | 💳    | -    | Payment methods                   |
| Bill-Service           | 🧾    | -    | Bill tracking                     |
| Notification-Service   | 🔔    | -    | Notifications                     |
| FriendShip-Service     | 👥    | -    | Friend management                 |
| Chat-Service           | 💬    | -    | Chat functionality                |
| Event-Service          | 📅    | -    | Event management                  |
| Audit-Service          | 🔍    | -    | Audit logging                     |
| AnalyticsService       | 📊    | -    | Analytics & reporting             |

## 📝 Usage

### Running the Pipeline

#### Option 1: Manual Build

1. Open the pipeline job in Jenkins
2. Click "Build Now"
3. Monitor the build in "Console Output"

#### Option 2: Build with Parameters

1. Open the pipeline job in Jenkins
2. Click "Build with Parameters"
3. Configure parameters:
   - ✅ SKIP_TESTS: Check to skip tests
   - ✅ CLEAN_BUILD: Check for clean build
   - ✅ BUILD_ALL_SERVICES: Check to build all
   - Select LOG_LEVEL: INFO/DEBUG/WARN/ERROR
4. Click "Build"

#### Option 3: Automated Builds

Configure SCM polling or webhooks:

**Poll SCM** (Jenkins Configuration → Build Triggers):

```
H/5 * * * * (Check every 5 minutes)
```

**GitHub Webhook**:

```
URL: http://your-jenkins-url/github-webhook/
```

### Viewing Build Results

1. **Console Output**: Real-time build logs with colored output
2. **Build History**: Click on build number for details
3. **Artifacts**: Download JAR files from "Build Artifacts"
4. **Workspace**: View workspace files

## 🔍 Understanding Console Output

### Build Status Indicators

```
✅ Success      - Operation completed successfully
❌ Error        - Operation failed
⚠️  Warning     - Warning or unstable state
ℹ️  Info        - Informational message
🔨 Building     - Build in progress
📦 Artifact     - JAR file created
⏱️  Duration    - Time taken
```

### Example Console Output

```
═══════════════════════════════════════════════════════════════
🚀 EXPENSE TRACKER BACKEND SERVICES - BUILD PIPELINE
═══════════════════════════════════════════════════════════════
📅 Build Date: 2025-11-04_14-30-00
🔧 Jenkins Build: #42
🌿 Branch: release-3
👤 Started by: admin
⚙️  Skip Tests: true
🧹 Clean Build: true
📊 Log Level: INFO
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ 🔐 Building: user-service
└─────────────────────────────────────────────────────────────┘
📍 Working Directory: /workspace/user-service
🔨 Executing: mvn clean package -DskipTests
⏳ Build in progress...
✅ user-service built successfully in 45.3s
📦 Artifact: user-service-0.0.1.jar (52.4M)
└─────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════╗
║                 ✅ BUILD SUCCESSFUL! ✅                    ║
╚════════════════════════════════════════════════════════════╝
🎉 All backend services built successfully!
📦 Build artifacts are ready for deployment
⏱️  Total Build Time: 3m 45s
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Maven Not Found

```
Error: mvn: command not found
```

**Solution**: Configure Maven in Global Tool Configuration

#### 2. Java Version Mismatch

```
Error: Unsupported class file major version
```

**Solution**: Ensure JDK-17 is configured correctly

#### 3. Build Timeout

```
Error: Build timed out
```

**Solution**: Increase timeout in pipeline options or optimize build

#### 4. Memory Issues

```
Error: Java heap space
```

**Solution**: Increase Maven memory in Jenkinsfile:

```groovy
MAVEN_OPTS = '-Xmx4096m -XX:MaxPermSize=512m'
```

#### 5. Parallel Build Failures

```
Error: Some services fail intermittently
```

**Solution**: Set `BUILD_ALL_SERVICES` to false and build sequentially

### Debug Mode

To enable detailed logging, set build parameter:

```
LOG_LEVEL: DEBUG
```

This will show:

- Detailed Maven output
- Dependency resolution
- Compilation details
- Test execution (if not skipped)

### Clean Workspace

If builds fail due to stale artifacts:

1. Go to pipeline job
2. Click "Wipe Out Workspace"
3. Re-run build

## 📈 Performance Tips

### 1. Optimize Build Time

- Keep `SKIP_TESTS = true` for faster builds
- Use parallel builds (default)
- Enable Maven daemon (optional)

### 2. Resource Management

- Allocate sufficient Jenkins executor slots (14+ for parallel builds)
- Ensure adequate disk space for artifacts
- Monitor memory usage

### 3. Caching

Configure Maven local repository in Jenkins:

```
-Dmaven.repo.local=/var/jenkins_home/.m2/repository
```

## 🔄 CI/CD Integration

### Continuous Integration Setup

1. **Trigger on Push**:

```groovy
triggers {
    githubPush()
}
```

2. **Scheduled Builds**:

```groovy
triggers {
    cron('H 2 * * *') // Daily at 2 AM
}
```

3. **Downstream Jobs**:
   After successful build, trigger deployment pipeline

## 📧 Notifications

### Email Notifications (Optional)

Uncomment in Jenkinsfile `post` section:

```groovy
emailext (
    subject: "Build ${currentBuild.result}: ${env.JOB_NAME} - #${env.BUILD_NUMBER}",
    body: "Build ${env.BUILD_NUMBER} ${currentBuild.result}",
    to: "team@example.com"
)
```

### Slack Notifications (Optional)

Add to `post` section:

```groovy
slackSend (
    color: currentBuild.result == 'SUCCESS' ? 'good' : 'danger',
    message: "Build ${currentBuild.result}: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
)
```

## 📚 Additional Resources

- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Maven Build Lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
- [Jenkins Best Practices](https://www.jenkins.io/doc/book/pipeline/pipeline-best-practices/)

## 🤝 Contributing

To modify the pipeline:

1. Update `Jenkinsfile` in your repository
2. Commit and push changes
3. Jenkins will use the updated pipeline on next build

## 📄 License

This pipeline configuration is part of the Expense Tracker System project.

---

**Last Updated**: November 2025  
**Maintainer**: DevOps Team  
**Version**: 1.0.0
