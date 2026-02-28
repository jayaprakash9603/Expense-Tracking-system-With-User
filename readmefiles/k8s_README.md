# Deploy user-service to Kubernetes (local)

This guides you to deploy MySQL and user-service into namespace `expense`, register with local Eureka, and route traffic via your local API Gateway.

Assumptions

- Kubernetes is local (Minikube or Docker Desktop).
- Eureka runs on your host: http://localhost:8761.
- API Gateway runs on your host and will call `http://<node-ip>:30080`.
- The Docker image `user-service:latest` exists locally.

Order

1. Namespace: `00-namespace.yaml`
2. MySQL Secret + ConfigMap: `10-mysql-secret.yaml`, `11-mysql-configmap.yaml`
3. MySQL StatefulSet + Service: `20-mysql.yaml`
4. Optional user-service config: `25-user-config.yaml`
5. user-service Service + Deployment: `30-user-service.yaml`
6. Optional Ingress (if you have an ingress controller): `40-user-ingress.yaml`

Build image

- From `user-service/` run a local build: `docker build -t user-service:latest .`
- For Minikube, load the image: `minikube image load user-service:latest`.

Apply manifests

- `kubectl apply -f 00-namespace.yaml`
- `kubectl apply -f 10-mysql-secret.yaml`
- `kubectl apply -f 11-mysql-configmap.yaml`
- `kubectl apply -f 20-mysql.yaml`
- `kubectl -n expense rollout status statefulset/mysql`
- `kubectl apply -f 25-user-config.yaml`
- `kubectl apply -f 30-user-service.yaml`

Verify

- Pods: `kubectl -n expense get pods -o wide`
- Logs: `kubectl -n expense logs deploy/user-service -f`
- Service: `kubectl -n expense get svc user-service`
- For Minikube node IP: `minikube ip`

Eureka

- By default, the Deployment uses `http://host.minikube.internal:8761/eureka/`.
- If using Docker Desktop Kubernetes, change env to `http://host.docker.internal:8761/eureka/` in `30-user-service.yaml`.
- The instance registers using Node IP and NodePort 30080 so your host apps can reach it.

Gateway routing

- Point your local API Gateway route for user-service to `http://<node-ip>:30080`.

Cleanup

- `kubectl delete -n expense -f 30-user-service.yaml`
- `kubectl delete -n expense -f 20-mysql.yaml`
- `kubectl delete -n expense -f 25-user-config.yaml -f 11-mysql-configmap.yaml -f 10-mysql-secret.yaml -f 00-namespace.yaml`
