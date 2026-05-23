# Emprenor Nexus — Posicionamiento Enterprise Argentina

## Vision

Ser la **plataforma operativa #1 de Argentina** para empresas que ejecutan obras y servicios en entornos criticos: energia, oil & gas, mineria, industrial, agro, utilities y sector publico/privado.

Referente de capacidades integradas: [IMEC Ingenieria 360°](https://www.imec-ingenieria360.com/) (ingenieria, fabricacion, montaje, llave en mano).

## Segmentos objetivo

| Segmento | Ejemplos de mercado | Modulo Nexus clave |
|----------|---------------------|-------------------|
| Energia / utilities | Distribuidoras, generacion | Legajo, HSE, documentacion red |
| Oil & Gas | YPF, refinacion, EPC | Permisos trabajo, ITP, piping |
| Mineria | Sites NOA/NEA | Ingreso site, auditoria cliente |
| Industrial | Plantas, manufactura | QMS, materiales, OT |
| Infraestructura | Civil, Skanska-type EPC | Adicionales, recepcion |
| Agro | Silos, ingenios | Obra rural, maquinaria |
| Servicios publicos | Agua, saneamiento | Transparencia, compliance |
| Residencial / privado | Countries, vivienda | Cliente portal, garantia 120d |

## Diferenciadores vs competencia internacional

1. **Compliance Argentina nativo** — AEA, IRAM, Ley 19.587, SRT, PAC/SIGCE, POL-GAR-001, CONF-EL-001.
2. **Cadena de tres niveles** — Plataforma → Empresa ejecutora → Cliente final.
3. **Aprobaciones con valor legal** — Adicionales y recepcion con constancia horaria.
4. **Sectores preconfigurados** — `lib/enterprise-sectors.ts` + `SiteType` extendido.

## Roadmap hacia 100% enterprise

- [x] Multi-tenant, chat, QMS, HSE, DMS base
- [x] Portal cliente (planos, personal, seguros, adicionales, recepcion)
- [x] Garantia 120 dias POL-GAR-001
- [x] Materiales con remito/factura/certificado por linea
- [x] Modulo cuenta corriente obra
- [x] Bitacora fotografica antes/durante/despues
- [x] Compliance sectorial con datos reales (PTW, RC, HSE)
- [x] Biblioteca PAC digital embebida por tenant
- [ ] Integracion SSO / dominio custom masivo
- [ ] App movil offline obra

## Codigo relacionado

- `lib/enterprise-sectors.ts` — catalogo sectores
- `components/marketing/marketing-site.tsx` — landing enterprise
- `docs/POL-GAR-001.md` — garantia servicio
