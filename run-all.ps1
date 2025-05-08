# run-all.ps1

# Stop on error
$ErrorActionPreference = 'Stop'

Write-Host "  Building Docker images and starting containers..."
docker-compose build
docker-compose up -d

Write-Host " Waiting 15s for containers to become healthy..."
Start-Sleep -Seconds 15

Write-Host " Applying Kubernetes manifests..."
kubectl apply -f k8s-deployment.yaml

Write-Host " All services launched."
Write-Host ""
Write-Host " Kubernetes status:"
kubectl get deployments,services,pods
