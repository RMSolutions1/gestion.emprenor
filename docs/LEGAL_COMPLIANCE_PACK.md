# Pack Legal & Compliance — Emprenor Nexus

> **Aviso:** Plantillas orientativas. Requiere revisión por abogado habilitado en Argentina antes de publicación.

## Documentos incluidos

| Documento | Ruta web | Marco |
|-----------|----------|-------|
| Política de Privacidad | `/legal/privacidad` | Ley 25.326, GDPR-ready |
| Términos y Condiciones | `/legal/terminos` | Consumo SaaS |
| Política de Cookies | `/legal/cookies` | Consentimiento |
| Acuerdo SaaS (B2B) | PDF / ventas | SLA, datos, responsabilidad |
| DPA (Tratamiento datos) | Anexo enterprise | Encargado vs responsable |
| SLA | Anexo Pro/Enterprise | Uptime 99.9 % |

## Principios de privacidad

1. Minimización de datos personales
2. Finalidad específica (gestión operativa)
3. Derechos ARCO: acceso, rectificación, cancelación, oposición
4. Transferencias internacionales con cláusulas estándar
5. Registro de actividades de tratamiento
6. Notificación de brechas en 72h (GDPR) / plazo AFIP/AAIP según aplique

## Seguridad de la información (ISO 27001)

- Política de control de acceso
- Gestión de incidentes de seguridad
- Continuidad del negocio
- Auditorías anuales

## SaaS B2B — Cláusulas clave

- Licencia de uso no exclusiva
- Propiedad de datos del cliente
- Confidencialidad
- Limitación de responsabilidad
- Jurisdicción: tribunales competentes Argentina (configurable enterprise)

## OWASP

- Validación input (Zod en todas las APIs)
- Rate limiting por IP/tenant
- CSP headers en Next.js
- Secrets solo en env / Secrets Manager
