
# Stop on any error
$ErrorActionPreference = 'Stop'

Write-Host "  Cleaning up Docker Compose stack..."
# Stop containers, remove containers, networks, volumes, and local images
docker-compose down --rmi all --volumes --remove-orphans

Write-Host "  Rebuilding and restarting Docker Compose services..."
docker-compose build
docker-compose up -d

Write-Host "`n Cleaning up Kubernetes resources..."
# Delete all resources defined in your manifest (ignores errors if already gone)
kubectl delete -f k8s-deployment.yaml --ignore-not-found

Write-Host "  Waiting 10s for k3s to settle..."
Start-Sleep -Seconds 10

Write-Host "  Re-applying Kubernetes manifests..."
kubectl apply -f k8s-deployment.yaml

Write-Host "`n  Reset complete."
Write-Host "  Docker containers:"
docker ps
Write-Host "`n  Kubernetes pods & services:"
kubectl get pods,services
