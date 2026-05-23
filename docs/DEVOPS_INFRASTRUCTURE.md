# DevOps & Infraestructura Cloud-Native

## Entornos

| Env | URL | Propósito |
|-----|-----|-----------|
| local | localhost:3001 | Desarrollo |
| staging | staging.emprenor.com | QA + demos |
| production | app.emprenor.com | Clientes |

## Docker (desarrollo)

```yaml
# docker-compose.yml (objetivo)
services:
  postgres: { image: postgres:16 }
  redis: { image: redis:7-alpine }
  elasticsearch: { image: elasticsearch:8.11.0 }
  app: { build: ., ports: ["3001:3001"] }
```

## Kubernetes (producción)

```
namespaces: emprenor-prod, emprenor-staging
deployments: web (Next.js), api (NestJS), realtime, workers
ingress: nginx-ingress + cert-manager
hpa: CPU 70 %, min 2 max 20 pods
```

## Terraform (AWS)

- VPC, EKS, RDS PostgreSQL Multi-AZ
- ElastiCache Redis
- S3 buckets por ambiente
- CloudFront + WAF
- Secrets Manager

## CI/CD (GitHub Actions)

```yaml
on: [push, pull_request]
jobs:
  lint → test → build → deploy-staging → e2e → deploy-prod (manual)
```

## Observabilidad

| Herramienta | Uso |
|-------------|-----|
| Prometheus + Grafana | Métricas |
| Loki | Logs |
| Sentry | Errores frontend/backend |
| Uptime Kuma | SLA externo |

## DR

- Backups RDS cada 6h, retención 30 días
- RPO 1h, RTO 4h documentado
- Runbook en `/docs/runbooks/`

## Seguridad pipeline

- Trivy scan imágenes
- Snyk dependencias
- OWASP ZAP en staging
