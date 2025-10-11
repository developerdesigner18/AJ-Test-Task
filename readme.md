# Kubernetes Credential Management System

A microservices-based credential issuance and verification system built with TypeScript, Docker, and Kubernetes.

## 🏗️ Architecture Overview

### Backend Architecture

The backend services follow **Clean Architecture** principles with clear separation of concerns:

-   **Models** - Data structures and MongoDB schemas
-   **Services** - Business logic and core functionality
-   **Controllers** - HTTP request handling and response management
-   **Dependency Injection** - InversifyJS for loose coupling and testability
-   **TypeScript** - Full type safety throughout the application

### Current Testing Strategy

-   ✅ **Unit Tests** - Currently implemented for all services
-   🔄 **Integration Tests** - Would use TestContainers for comprehensive testing

## 🚀 Deployment

### Kubernetes Deployment

#### Using Default Namespace

```bash
# Deploy MongoDB
kubectl apply -f k8s/mongodb-deployment.yaml

# Build and push Docker images
docker build -t your-registry/issuance-service:latest ./issuance-service
docker push your-registry/issuance-service:latest

docker build -t your-registry/verification-service:latest ./verification-service
docker push your-registry/verification-service:latest

# Deploy services
kubectl apply -f k8s/issuance-deployment.yaml
k8s/verification-deployment.yaml

# Deploy ingress
kubectl apply -f k8s/ingress.yaml

# Check status
kubectl get pods
kubectl get services
kubectl get ingress
```

#### Using Tilt for Local Development

For local Kubernetes development with hot reloading:

1. Install [Tilt](https://tilt.dev/)
2. Create a `Tiltfile` in your project root
3. Run `tilt up` for automatic rebuilding and deployment

## 🌐 Ingress Configuration

The system uses NGINX Ingress Controller with the following routing:

### API Routes

-   **Issuance Service**: `/api/issuance/*` → `issuance-service:80`
-   **Verification Service**: `/api/verification/*` → `verification-service:80`

### Frontend Route

-   **Frontend**: `/` → `frontend:80`

### Access Methods

#### Local Development

```bash
# Port forward to access services locally
kubectl port-forward service/issuance-service 3000:80
kubectl port-forward service/verification-service 3001:80

# Access via ingress (if using local ingress controller)
curl http://localhost/api/issuance/health
```

#### AWS EKS/Cloud Deployment

When deployed on AWS with an ELB or ALB:

1. **Get Ingress External IP**:

    ```bash
    kubectl get ingress api-ingress
    ```

2. **Access via Load Balancer DNS**:

    ```bash
    # The ingress controller creates a load balancer
    curl http://<load-balancer-dns>/api/issuance/health
    ```

3. **Configure DNS** (optional):
    - Point your domain to the load balancer DNS
    - Update ingress rules for custom domains

## 📡 API Testing

### Issue Credential

```bash
curl -X POST http://<ingress-address>/api/issuance/credentials/issue \
  -H "Content-Type: application/json" \
  -d '{
    "credentialId": "CERT-001",
    "holderName": "John Doe",
    "holderEmail": "john@example.com",
    "credentialType": "certificate"
  }'
```

### Verify Credential

```bash
curl -X GET http://<ingress-address>/api/verification/credentials/verify \
  -H "Content-Type: application/json" \
  -d '{
    "credentialId": "CERT-001"
  }'
```

### Health Check

```bash
curl http://<ingress-address>/api/issuance/health
curl http://<ingress-address>/api/verification/health
```

## 🔧 Key Features

✅ **Clean Architecture** - Maintainable and testable code structure  
✅ **Dependency Injection** - Loose coupling with InversifyJS  
✅ **Type Safety** - TypeScript throughout the application  
✅ **MongoDB Integration** - Mongoose ODM with proper schemas  
✅ **Containerized** - Docker for consistent environments  
✅ **Kubernetes Native** - Designed for cloud-native deployment  
✅ **Scalable** - Horizontal pod autoscaling ready  
✅ **Worker Tracking** - Each response includes pod identification

## 🧪 Testing Strategy

### Current Implementation

-   **Unit Tests** - Comprehensive testing of individual components
-   **Mocked Dependencies** - Isolated testing with Jest mocks

### Future Integration Testing

For integration tests, the system would leverage **TestContainers** to:

-   Spin up real MongoDB instances
-   Test full API workflows
-   Validate service interactions
-   Ensure database operations work correctly

## 📁 Project Structure

```
├── issuance-service/
│   ├── src/
│   │   ├── models/          # Data models and schemas
│   │   ├── services/        # Business logic
│   │   ├── controllers/     # HTTP handlers
│   │   └── config/          # Dependency injection
│   └── tests/               # Unit tests
├── verification-service/    # Similar structure
├── k8s/                    # Kubernetes manifests
└── docker-compose.yml      # Local development
```

## 🔍 Monitoring & Debugging

```bash
# View logs
kubectl logs -l app=issuance-service
kubectl logs -l app=verification-service

# Check ingress status
kubectl describe ingress api-ingress

# Port forwarding for local access
kubectl port-forward deployment/issuance-service 3000:80
```

This architecture ensures the system is production-ready, scalable, and maintainable while following cloud-native best practices.
