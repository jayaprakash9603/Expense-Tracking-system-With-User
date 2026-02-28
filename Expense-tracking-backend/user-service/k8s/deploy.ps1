param(
  [switch]$Ingress
)

Write-Host "Applying namespace and MySQL..." -ForegroundColor Cyan
kubectl apply -f 00-namespace.yaml
kubectl apply -f 10-mysql-secret.yaml
kubectl apply -f 11-mysql-configmap.yaml
kubectl apply -f 20-mysql.yaml
kubectl -n expense rollout status statefulset/mysql

Write-Host "Applying user-service..." -ForegroundColor Cyan
kubectl apply -f 25-user-config.yaml
kubectl apply -f 30-user-service.yaml

if ($Ingress) {
  Write-Host "Applying ingress..." -ForegroundColor Cyan
  kubectl apply -f 40-user-ingress.yaml
}

kubectl -n expense get all -o wide
Write-Host "Done. Point your Gateway to http://<node-ip>:30080" -ForegroundColor Green
