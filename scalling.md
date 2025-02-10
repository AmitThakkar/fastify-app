# Horizontal Pod Autoscaler (HPA)

## REST API
To handle increased traffic efficiently, we can scale the app with HPA.

Below is the example to scale when CPU > 70% utilization.
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: climate-x
  namespace: climate-x
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: climate-x
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

## Temporal Worker
* Deploy a dedicated worker for bulk ingestion jobs.
* We can use HPA to scale Temporal worker(base on CPU, memory, pending tasks/queue length)