# Jenkins Pipeline Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Jenkins Plugins

```bash
# Go to Jenkins → Manage Jenkins → Manage Plugins → Available
# Search and install:
1. Pipeline
2. Git Plugin
3. Maven Integration
4. AnsiColor (optional, for colored output)
5. Timestamper
```

### Step 2: Configure Tools

```bash
# Go to Jenkins → Manage Jenkins → Global Tool Configuration

# Maven:
Name: Maven-3.9.0
☑ Install automatically
Version: 3.9.0

# JDK:
Name: JDK-17
☑ Install automatically
Version: jdk-17.0.2
```

### Step 3: Create Pipeline Job

```bash
1. Jenkins Dashboard → New Item
2. Enter name: "Expense-Tracker-Backend-Build"
3. Select: Pipeline
4. Click OK
```

### Step 4: Configure Pipeline

```groovy
# In Pipeline section:
Definition: Pipeline script from SCM
SCM: Git
Repository URL: <your-repo-url>
Branch: */release-3
Script Path: Expense-tracking-System-backend/Expense-tracking-backend-main/Jenkinsfile
```

### Step 5: Run Build

```bash
# Click "Build Now"
# Watch the magic happen! ✨
```

## 📁 Available Pipeline Files

### 1. **Jenkinsfile** (Recommended)

- ✅ Full-featured with parallel builds
- ✅ Detailed logging and error handling
- ✅ Build metrics and summaries
- ⏱️ Build Time: ~3-5 minutes

**Use when**: Production builds, CI/CD

### 2. **Jenkinsfile.simple**

- ✅ Sequential builds (easier debugging)
- ✅ Minimal configuration
- ✅ Quick setup
- ⏱️ Build Time: ~10-15 minutes

**Use when**: Testing pipeline setup, debugging

### 3. **Jenkinsfile.docker**

- ✅ Maven builds + Docker image creation
- ✅ Push to Docker registry
- ✅ Multi-stage builds
- ⏱️ Build Time: ~8-12 minutes

**Use when**: Containerized deployments

## 🎯 Build Parameters

### Standard Build (Recommended)

```
✅ SKIP_TESTS: true
✅ CLEAN_BUILD: true
✅ BUILD_ALL_SERVICES: true
📊 LOG_LEVEL: INFO
```

### Debug Build

```
❌ SKIP_TESTS: false
✅ CLEAN_BUILD: true
✅ BUILD_ALL_SERVICES: true
📊 LOG_LEVEL: DEBUG
```

### Quick Build (No Clean)

```
✅ SKIP_TESTS: true
❌ CLEAN_BUILD: false
✅ BUILD_ALL_SERVICES: true
📊 LOG_LEVEL: INFO
```

## 🔧 Troubleshooting

### Build Fails with "Maven not found"

```bash
Solution: Configure Maven in Global Tool Configuration
Jenkins → Manage Jenkins → Global Tool Configuration → Maven
```

### Build Fails with "Java version mismatch"

```bash
Solution: Ensure JDK-17 is configured
Jenkins → Manage Jenkins → Global Tool Configuration → JDK
```

### Services Build but JAR not found

```bash
Check: Service might be a POM-only project (no JAR produced)
This is normal for parent POMs
```

### Out of Memory Error

```bash
Solution: Increase Jenkins JVM memory
Edit jenkins.xml or systemd service:
-Xmx4096m -Xms2048m
```

### Parallel Build Fails

```bash
Solution: Switch to Jenkinsfile.simple for sequential builds
Or increase Jenkins executors:
Jenkins → Manage Jenkins → Configure System → # of executors
```

## 📊 Expected Output

### Successful Build

```
═══════════════════════════════════════════════════════════════
🚀 EXPENSE TRACKER BACKEND SERVICES - BUILD PIPELINE
═══════════════════════════════════════════════════════════════
📅 Build Date: 2025-11-04_14-30-00
🔧 Jenkins Build: #1
═══════════════════════════════════════════════════════════════

✅ user-service built successfully in 45.3s
✅ social-media-app built successfully in 52.1s
✅ eureka-server built successfully in 38.7s
... (all services)

╔════════════════════════════════════════════════════════════╗
║                 ✅ BUILD SUCCESSFUL! ✅                    ║
╚════════════════════════════════════════════════════════════╝
🎉 All backend services built successfully!
⏱️  Total Build Time: 3m 45s
```

## 🎓 Best Practices

### 1. First Build

```
Use: Jenkinsfile.simple
Why: Easier to debug if issues occur
```

### 2. Regular Builds

```
Use: Jenkinsfile (default)
Why: Fastest with parallel execution
```

### 3. Production Deployment

```
Use: Jenkinsfile.docker
Why: Creates deployable Docker images
```

## 📈 Performance Tips

### Speed Up Builds

1. ✅ Keep SKIP_TESTS enabled (tests in separate pipeline)
2. ✅ Use parallel builds
3. ✅ Enable Maven daemon
4. ✅ Cache Maven dependencies

### Resource Allocation

```
Recommended Jenkins Configuration:
- Executors: 14+ (for parallel builds)
- Memory: 4GB+ JVM heap
- Disk: 50GB+ for workspace and artifacts
```

## 🔄 Automated Builds

### Trigger on Git Push

```groovy
// Add to Jenkinsfile
triggers {
    githubPush()
}
```

### Scheduled Builds

```groovy
// Daily at 2 AM
triggers {
    cron('H 2 * * *')
}
```

### Poll SCM

```
# Jenkins Job Configuration → Build Triggers
☑ Poll SCM
Schedule: H/5 * * * * (every 5 minutes)
```

## 📦 Artifacts

After successful build, find:

```
Build → Build Artifacts
├── user-service-0.0.1.jar
├── social-media-app-0.0.1.jar
├── eureka-server-0.0.1.jar
└── ... (all JAR files)
```

## 🆘 Getting Help

### Check Logs

```
1. Click on build number
2. Click "Console Output"
3. Search for ❌ or ERROR
```

### Common Log Patterns

```
✅ = Success
❌ = Error
⚠️  = Warning
🔨 = Building
📦 = Artifact created
```

## 🎉 Success Checklist

- [ ] Jenkins plugins installed
- [ ] Maven configured (Maven-3.9.0)
- [ ] JDK configured (JDK-17)
- [ ] Pipeline job created
- [ ] Git repository connected
- [ ] First build successful
- [ ] JAR artifacts generated
- [ ] Build time < 5 minutes (parallel)

---

**Ready to build?** Click "Build Now" and watch the magic! 🚀

**Questions?** Check the full documentation in `JENKINS_PIPELINE_README.md`
