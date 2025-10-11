k8s_yaml("k8s/issuance-deployment.yaml")
k8s_yaml("k8s/verification-deployment.yaml")
k8s_yaml("k8s/frontend-deployment.yaml")
k8s_yaml("k8s/mongodb-deployment.yaml")


docker_build("issuance", "issuance-service")
docker_build("verification-service", "verification-service")
docker_build("frontend", "frontend")

local_resource(
'ingress-port-forward',
serve_cmd='kubectl port-forward -n ingress-nginx service/ingress-nginx-controller 3000:80',
labels=['ingress']
)
