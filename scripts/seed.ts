import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: 'emprenor-demo' },
    update: {
      status: 'ACTIVE',
      plan: 'PROFESSIONAL',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      name: 'Emprenor.com.ar',
      legalName: 'Emprenor S.R.L.',
      billingEmail: 'info@emprenor.com.ar',
      industry: 'Ingenieria, obra y compliance — Salta / NOA',
    },
    create: {
      name: 'Emprenor.com.ar',
      slug: 'emprenor-demo',
      legalName: 'Emprenor S.R.L.',
      plan: 'PROFESSIONAL',
      status: 'ACTIVE',
      industry: 'Ingenieria, obra y compliance — Salta / NOA',
      billingEmail: 'info@emprenor.com.ar',
    },
  });

  await prisma.tenantBranding.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      primaryColor: '#1e40af',
      secondaryColor: '#f97316',
    },
  });

  const platformPassword = await bcrypt.hash('platform2024', 10);
  await prisma.user.upsert({
    where: { email: 'owner@emprenor.com' },
    update: {
      role: 'PLATFORM_OWNER',
      organizationId: null,
      password: platformPassword,
      name: 'Global Platform Owner',
    },
    create: {
      email: 'owner@emprenor.com',
      password: platformPassword,
      name: 'Global Platform Owner',
      role: 'PLATFORM_OWNER',
    },
  });

  const adminPassword = await bcrypt.hash('johndoe123', 10);

  // Admin user (test account)
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: { role: 'ADMIN', organizationId: org.id },
    create: {
      email: 'john@doe.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
      organizationId: org.id,
    },
  });

  // Additional admin account
  const adminPass2 = await bcrypt.hash('admin2024', 10);
  await prisma.user.upsert({
    where: { email: 'admin@emprenor.com' },
    update: { role: 'ADMIN', organizationId: org.id },
    create: {
      email: 'admin@emprenor.com',
      password: adminPass2,
      name: 'Emprenor.com.ar — Administracion',
      role: 'ADMIN',
      organizationId: org.id,
    },
  });

  const clientPassword = await bcrypt.hash('cliente123', 10);

  /** Barrio Privado El Tipal — portal consorcio */
  const clientTipal = await prisma.user.upsert({
    where: { email: 'cliente@eltipal.com.ar' },
    update: { organizationId: org.id, name: 'Comision Directiva — El Tipal' },
    create: {
      email: 'cliente@eltipal.com.ar',
      password: clientPassword,
      name: 'Comision Directiva — El Tipal',
      role: 'CLIENTE',
      organizationId: org.id,
    },
  });

  /** Alias demo (misma obra El Tipal) */
  const client1 = await prisma.user.upsert({
    where: { email: 'cliente@ejemplo.com' },
    update: { organizationId: org.id, name: 'Sr. Martin Lopez — El Tipal' },
    create: {
      email: 'cliente@ejemplo.com',
      password: clientPassword,
      name: 'Sr. Martin Lopez — El Tipal',
      role: 'CLIENTE',
      organizationId: org.id,
    },
  });

  /** CRONEC SRL — cliente industrial Salta */
  const clientCronec = await prisma.user.upsert({
    where: { email: 'cliente@cronec.com.ar' },
    update: { organizationId: org.id },
    create: {
      email: 'cliente@cronec.com.ar',
      password: clientPassword,
      name: 'Ing. Roberto Cronenberg — CRONEC SRL',
      role: 'CLIENTE',
      organizationId: org.id,
    },
  });

  /** Gobierno de Salta — obra publica */
  const clientGobSalta = await prisma.user.upsert({
    where: { email: 'cliente@gobiernosalta.gov.ar' },
    update: { organizationId: org.id },
    create: {
      email: 'cliente@gobiernosalta.gov.ar',
      password: clientPassword,
      name: 'Direccion de Obras Publicas — Gob. Salta',
      role: 'CLIENTE',
      organizationId: org.id,
    },
  });

  /** Persona particular — refaccion vivienda */
  const clientParticular = await prisma.user.upsert({
    where: { email: 'cliente@particular.demo' },
    update: { organizationId: org.id },
    create: {
      email: 'cliente@particular.demo',
      password: clientPassword,
      name: 'Sr. Carlos Mendoza',
      role: 'CLIENTE',
      organizationId: org.id,
    },
  });

  /** Comercio / farmacia */
  const clientFarmacia = await prisma.user.upsert({
    where: { email: 'cliente@farmacia.demo' },
    update: { organizationId: org.id },
    create: {
      email: 'cliente@farmacia.demo',
      password: clientPassword,
      name: 'Farmacia del Pueblo S.A.',
      role: 'CLIENTE',
      organizationId: org.id,
    },
  });

  /** Empresa / sociedad comercial generica */
  const clientEmpresa = await prisma.user.upsert({
    where: { email: 'cliente@empresa.demo' },
    update: { organizationId: org.id },
    create: {
      email: 'cliente@empresa.demo',
      password: clientPassword,
      name: 'Servicios Integrales del Norte S.A.',
      role: 'CLIENTE',
      organizationId: org.id,
    },
  });

  /** Fundacion / corporacion sin fines de lucro */
  const clientFundacion = await prisma.user.upsert({
    where: { email: 'cliente@fundacion.demo' },
    update: { organizationId: org.id },
    create: {
      email: 'cliente@fundacion.demo',
      password: clientPassword,
      name: 'Fundacion Educativa NOA',
      role: 'CLIENTE',
      organizationId: org.id,
    },
  });

  const clientProfileSeeds: {
    userId: string;
    entityType: 'PARTICULAR' | 'EMPRESA' | 'COMERCIO' | 'INDUSTRIA' | 'PUBLICO' | 'CONSORCIO' | 'FUNDACION';
    legalName: string;
    taxId?: string;
    phone?: string;
    contactRole?: string;
    billingAddress?: string;
    city?: string;
    province?: string;
    sector?: string;
  }[] = [
    {
      userId: clientTipal.id,
      entityType: 'CONSORCIO',
      legalName: 'Administracion Barrio Privado El Tipal',
      taxId: '30-71234567-8',
      phone: '+54 387 422-1000',
      contactRole: 'Comision Directiva',
      billingAddress: 'Barrio Privado El Tipal, Ruta 51',
      city: 'Salta',
      province: 'Salta',
      sector: 'Barrio cerrado / residencial',
    },
    {
      userId: client1.id,
      entityType: 'CONSORCIO',
      legalName: 'Administracion Barrio Privado El Tipal',
      taxId: '30-71234567-8',
      phone: '+54 387 422-1001',
      contactRole: 'Sr. Martin Lopez',
      city: 'Salta',
      province: 'Salta',
      sector: 'Barrio cerrado',
    },
    {
      userId: clientCronec.id,
      entityType: 'INDUSTRIA',
      legalName: 'CRONEC S.R.L.',
      taxId: '30-70987654-1',
      phone: '+54 387 434-2200',
      contactRole: 'Ing. Roberto Cronenberg',
      billingAddress: 'Parque Industrial Salta, Lote 8',
      city: 'Salta',
      province: 'Salta',
      sector: 'Industrial / montaje',
    },
    {
      userId: clientGobSalta.id,
      entityType: 'PUBLICO',
      legalName: 'Gobierno de la Provincia de Salta',
      taxId: '30-99999999-9',
      phone: '+54 387 431-0100',
      contactRole: 'Direccion de Obras Publicas',
      billingAddress: 'Centro Civico',
      city: 'Salta',
      province: 'Salta',
      sector: 'Sector publico / infraestructura',
    },
    {
      userId: clientParticular.id,
      entityType: 'PARTICULAR',
      legalName: 'Carlos Mendoza',
      taxId: '20-25678901-3',
      phone: '+54 387 555-0101',
      contactRole: 'Propietario',
      billingAddress: 'Calle Belgrano 450, Salta',
      city: 'Salta',
      province: 'Salta',
      sector: 'Vivienda particular',
    },
    {
      userId: clientFarmacia.id,
      entityType: 'COMERCIO',
      legalName: 'Farmacia del Pueblo S.A.',
      taxId: '30-70111222-4',
      phone: '+54 387 422-8899',
      contactRole: 'Encargado de sucursal',
      billingAddress: 'Av. Mitre 1200, Salta',
      city: 'Salta',
      province: 'Salta',
      sector: 'Farmacia / comercio',
    },
    {
      userId: clientEmpresa.id,
      entityType: 'EMPRESA',
      legalName: 'Servicios Integrales del Norte S.A.',
      taxId: '30-70123456-7',
      phone: '+54 387 422-3300',
      contactRole: 'Gerencia de operaciones',
      billingAddress: 'Av. del Bicentenario 200, Salta',
      city: 'Salta',
      province: 'Salta',
      sector: 'Servicios / facilities',
    },
    {
      userId: clientFundacion.id,
      entityType: 'FUNDACION',
      legalName: 'Fundacion Educativa del Norte Argentino',
      taxId: '30-71222333-1',
      phone: '+54 387 431-5500',
      contactRole: 'Director ejecutivo',
      billingAddress: 'Pasaje Pedagogico 88',
      city: 'Salta',
      province: 'Salta',
      sector: 'Educacion / ONG',
    },
  ];

  for (const cp of clientProfileSeeds) {
    await prisma.clientProfile.upsert({
      where: { userId: cp.userId },
      update: cp,
      create: { ...cp, country: 'AR' },
    });
  }

  const specialistPassword = await bcrypt.hash('especialista123', 10);
  const civil = await prisma.user.upsert({
    where: { email: 'ingeniero@emprenor.com' },
    update: { role: 'INGENIERO_CIVIL', organizationId: org.id },
    create: {
      email: 'ingeniero@emprenor.com',
      password: specialistPassword,
      name: 'Ing. Laura Fernandez',
      role: 'INGENIERO_CIVIL',
      organizationId: org.id,
    },
  });

  const inspector = await prisma.user.upsert({
    where: { email: 'inspector@emprenor.com' },
    update: { role: 'INSPECTOR_OBRA', organizationId: org.id },
    create: {
      email: 'inspector@emprenor.com',
      password: specialistPassword,
      name: 'Inspector Martin Diaz',
      role: 'INSPECTOR_OBRA',
      organizationId: org.id,
    },
  });

  // Sample projects
  const project1 = await prisma.project.upsert({
    where: { id: 'proj-demo-1' },
    update: { organizationId: org.id },
    create: {
      id: 'proj-demo-1',
      organizationId: org.id,
      name: 'Edificio Residencial San Martin',
      address: 'Av. San Martin 1250, Buenos Aires',
      projectType: 'Obra Civil',
      description: 'Construccion de edificio residencial de 8 pisos con cocheras subterraneas.',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2026-09-30'),
      status: 'EN_CURSO',
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'proj-demo-2' },
    update: { organizationId: org.id },
    create: {
      id: 'proj-demo-2',
      organizationId: org.id,
      name: 'Instalacion Electrica Planta Industrial',
      address: 'Parque Industrial Norte, Lote 15',
      projectType: 'Electrica',
      description: 'Instalacion electrica completa para planta industrial de 2000m2.',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-12-31'),
      status: 'PLANIFICACION',
    },
  });

  const projectCronec = await prisma.project.upsert({
    where: { id: 'proj-cronec' },
    update: {
      organizationId: org.id,
      siteType: 'INDUSTRIA',
      name: 'Ampliacion nave industrial — CRONEC SRL',
      address: 'Parque Industrial Salta, Lote 8',
      budgetAmount: 8900000,
      budgetCurrency: 'ARS',
    },
    create: {
      id: 'proj-cronec',
      organizationId: org.id,
      name: 'Ampliacion nave industrial — CRONEC SRL',
      address: 'Parque Industrial Salta, Lote 8',
      projectType: 'Estructura metalica / montaje',
      siteType: 'INDUSTRIA',
      description:
        'Cliente CRONEC SRL: ampliacion de nave, montaje estructural y obra civil asociada. Emprenor.com.ar ejecutor.',
      startDate: new Date('2025-05-01'),
      endDate: new Date('2026-02-28'),
      status: 'EN_CURSO',
      budgetAmount: 8900000,
      budgetCurrency: 'ARS',
      liabilityInsuranceInsurer: 'Galeno ART',
      liabilityInsurancePolicy: 'RC-CRONEC-2025',
      liabilityInsuranceExpiry: new Date('2026-06-30'),
    },
  });

  const projectGobSalta = await prisma.project.upsert({
    where: { id: 'proj-gob-salta' },
    update: {
      organizationId: org.id,
      siteType: 'SERVICIOS_PUBLICOS',
      name: 'Refaccion edilicia — Edificio administrativo Gob. Salta',
      address: 'Centro Civico, Salta Capital',
      budgetAmount: 15200000,
      budgetCurrency: 'ARS',
    },
    create: {
      id: 'proj-gob-salta',
      organizationId: org.id,
      name: 'Refaccion edilicia — Edificio administrativo Gob. Salta',
      address: 'Centro Civico, Salta Capital',
      projectType: 'Obra publica / refaccion',
      siteType: 'SERVICIOS_PUBLICOS',
      description:
        'Gobierno de la Provincia de Salta: refaccion edilicia con documentacion para auditoria estatal.',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2026-04-30'),
      status: 'PLANIFICACION',
      budgetAmount: 15200000,
      budgetCurrency: 'ARS',
      siteRequirementsNotes:
        'Pliegos provinciales: planos, cronograma, seguros RC y legajo de personal con ART vigente.',
    },
  });

  const project3 = await prisma.project.upsert({
    where: { id: 'proj-demo-3' },
    update: {
      organizationId: org.id,
      name: 'Refaccion y ampliacion — Lote 24 Barrio Privado El Tipal',
      address: 'Barrio Privado El Tipal, Salta',
      siteType: 'BARRIO_PRIVADO',
      siteRequirementsNotes:
        'El Tipal: antecedentes penales, lista de materiales con remito, documentacion vehicular y ART vigente. Horario 8 a 17 hs.',
      liabilityInsuranceInsurer: 'La Caja ART y Caucion',
      liabilityInsurancePolicy: 'RC-EMPRENOR-TIPAL-2025',
      liabilityInsuranceExpiry: new Date('2026-03-31'),
      receptionReadyAt: new Date(),
      warrantyDays: 120,
      budgetAmount: 2450000,
      budgetCurrency: 'ARS',
    },
    create: {
      id: 'proj-demo-3',
      organizationId: org.id,
      name: 'Refaccion y ampliacion — Lote 24 Barrio Privado El Tipal',
      address: 'Barrio Privado El Tipal, Salta',
      projectType: 'Refacciones en barrio cerrado',
      siteType: 'BARRIO_PRIVADO',
      siteRequirementsNotes:
        'Administracion El Tipal: ingreso con antecedentes, lista de herramientas y seguro de vida.',
      description: 'Cliente consorcio El Tipal — ampliacion y refaccion vivienda lote 24.',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-08-31'),
      status: 'EN_CURSO',
      liabilityInsuranceInsurer: 'La Caja ART y Caucion',
      liabilityInsurancePolicy: 'RC-EMPRENOR-TIPAL-2025',
      liabilityInsuranceExpiry: new Date('2026-03-31'),
      budgetAmount: 2450000,
      budgetCurrency: 'ARS',
    },
  });

  for (const uid of [client1.id, clientTipal.id]) {
    await prisma.projectAssignment.upsert({
      where: { userId_projectId: { userId: uid, projectId: project3.id } },
      update: {},
      create: { userId: uid, projectId: project3.id },
    });
  }

  await prisma.projectAssignment.upsert({
    where: { userId_projectId: { userId: clientCronec.id, projectId: projectCronec.id } },
    update: {},
    create: { userId: clientCronec.id, projectId: projectCronec.id },
  });

  await prisma.projectAssignment.upsert({
    where: { userId_projectId: { userId: clientGobSalta.id, projectId: projectGobSalta.id } },
    update: {},
    create: { userId: clientGobSalta.id, projectId: projectGobSalta.id },
  });

  const projectParticular = await prisma.project.upsert({
    where: { id: 'proj-particular' },
    update: { organizationId: org.id, siteType: 'RESIDENCIAL' },
    create: {
      id: 'proj-particular',
      organizationId: org.id,
      name: 'Refaccion integral — vivienda Mendoza',
      address: 'Calle Belgrano 450, Salta',
      projectType: 'Refacciones',
      siteType: 'RESIDENCIAL',
      description: 'Cliente particular: electricidad, gas y terminaciones.',
      status: 'EN_CURSO',
      budgetAmount: 1850000,
      budgetCurrency: 'ARS',
    },
  });

  const projectFarmacia = await prisma.project.upsert({
    where: { id: 'proj-farmacia' },
    update: { organizationId: org.id, siteType: 'COMERCIAL' },
    create: {
      id: 'proj-farmacia',
      organizationId: org.id,
      name: 'Instalacion electrica y climatizacion — Farmacia del Pueblo',
      address: 'Av. Mitre 1200, Salta',
      projectType: 'Electrica',
      siteType: 'COMERCIAL',
      description: 'Comercio: obra en horario restringido, certificados de personal.',
      status: 'EN_CURSO',
      budgetAmount: 920000,
      budgetCurrency: 'ARS',
    },
  });

  const projectEmpresa = await prisma.project.upsert({
    where: { id: 'proj-empresa' },
    update: { organizationId: org.id, siteType: 'COMERCIAL' },
    create: {
      id: 'proj-empresa',
      organizationId: org.id,
      name: 'Mantenimiento edilicio — Sede corporativa SIN S.A.',
      address: 'Av. del Bicentenario 200, Salta',
      projectType: 'Mantenimiento',
      siteType: 'COMERCIAL',
      description: 'Empresa: mantenimiento preventivo y legajo de contratistas.',
      status: 'EN_CURSO',
      budgetAmount: 4100000,
      budgetCurrency: 'ARS',
    },
  });

  const projectFundacion = await prisma.project.upsert({
    where: { id: 'proj-fundacion' },
    update: { organizationId: org.id },
    create: {
      id: 'proj-fundacion',
      organizationId: org.id,
      name: 'Acondicionamiento sede — Fundacion Educativa NOA',
      address: 'Pasaje Pedagogico 88, Salta',
      projectType: 'Obra Civil',
      siteType: 'OBRA_GENERAL',
      description: 'Fundacion: accesibilidad, electricidad y banos.',
      status: 'PLANIFICACION',
      budgetAmount: 3200000,
      budgetCurrency: 'ARS',
    },
  });

  for (const [uid, pid] of [
    [clientParticular.id, projectParticular.id],
    [clientFarmacia.id, projectFarmacia.id],
    [clientEmpresa.id, projectEmpresa.id],
    [clientFundacion.id, projectFundacion.id],
  ] as const) {
    await prisma.projectAssignment.upsert({
      where: { userId_projectId: { userId: uid, projectId: pid } },
      update: {},
      create: { userId: uid, projectId: pid },
    });
  }

  await prisma.projectAssignment.upsert({
    where: { userId_projectId: { userId: inspector.id, projectId: projectCronec.id } },
    update: {},
    create: { userId: inspector.id, projectId: projectCronec.id },
  });

  await prisma.projectAssignment.upsert({
    where: { userId_projectId: { userId: civil.id, projectId: projectGobSalta.id } },
    update: {},
    create: { userId: civil.id, projectId: projectGobSalta.id },
  });

  await prisma.projectAssignment.upsert({
    where: { userId_projectId: { userId: civil.id, projectId: project1.id } },
    update: {},
    create: { userId: civil.id, projectId: project1.id },
  });

  await prisma.projectAssignment.upsert({
    where: { userId_projectId: { userId: inspector.id, projectId: project3.id } },
    update: {},
    create: { userId: inspector.id, projectId: project3.id },
  });

  // Sample workers
  await prisma.worker.upsert({
    where: { id: 'worker-demo-1' },
    update: {},
    create: {
      id: 'worker-demo-1',
      name: 'Juan Perez',
      workerRole: 'Capataz',
      certifications: 'Higiene y Seguridad, Trabajo en Altura',
      dni: '30456789',
      projectId: project1.id,
    },
  });

  await prisma.worker.upsert({
    where: { id: 'worker-demo-2' },
    update: {},
    create: {
      id: 'worker-demo-2',
      name: 'Roberto Gomez',
      workerRole: 'Electricista',
      certifications: 'Matricula Electricista, Riesgo Electrico',
      dni: '28123456',
      projectId: project1.id,
    },
  });

  await prisma.worker.upsert({
    where: { id: 'worker-tipal-1' },
    update: {
      backgroundCheckStatus: 'APROBADO',
      eppComplete: true,
      artNumber: 'ART-88721',
      artExpiry: new Date('2026-12-31'),
      lifeInsuranceExpiry: new Date('2026-12-31'),
      cuil: '20-30456789-4',
    },
    create: {
      id: 'worker-tipal-1',
      name: 'Juan Perez',
      workerRole: 'Capataz',
      dni: '30456789',
      cuil: '20-30456789-4',
      artNumber: 'ART-88721',
      artExpiry: new Date('2026-12-31'),
      lifeInsuranceExpiry: new Date('2026-12-31'),
      eppComplete: true,
      backgroundCheckStatus: 'APROBADO',
      backgroundCheckDate: new Date('2025-03-15'),
      projectId: project3.id,
    },
  });

  await prisma.technicalReport.upsert({
    where: { id: 'report-demo-pending' },
    update: { status: 'PENDIENTE_CLIENTE', requiresClientApproval: true },
    create: {
      id: 'report-demo-pending',
      title: 'Solicitud de correccion — humedad en muro',
      description: 'Se detecta humedad en paramento norte. Requiere autorizacion para tratamiento impermeabilizante.',
      reportType: 'SOLICITUD_CORRECCION',
      status: 'PENDIENTE_CLIENTE',
      requiresClientApproval: true,
      projectId: project3.id,
      authorId: inspector.id,
    },
  });

  await prisma.workExtra.upsert({
    where: { id: 'extra-demo-pending' },
    update: { status: 'PENDIENTE_CLIENTE' },
    create: {
      id: 'extra-demo-pending',
      title: 'Horas extra — refuerzo estructural',
      description: 'Trabajo adicional no previsto en presupuesto base.',
      amount: 185000,
      status: 'PENDIENTE_CLIENTE',
      projectId: project3.id,
    },
  });

  await prisma.liveFeedEvent.createMany({
    data: [
      {
        projectId: project3.id,
        type: 'REPORT_SUBMITTED',
        title: 'Informe pendiente: correccion humedad muro',
        body: 'Barrio Privado El Tipal',
        actorId: inspector.id,
      },
      {
        projectId: project3.id,
        type: 'EXTRA_PENDING',
        title: 'Adicional pendiente de aprobacion',
        body: '$185.000 refuerzo estructural',
        actorId: civil.id,
      },
      {
        projectId: project1.id,
        type: 'WORKER_ADDED',
        title: 'Personal registrado en obra San Martin',
        body: 'Juan Perez — Capataz',
      },
      {
        type: 'SYSTEM',
        title: 'Centro de comando Emprenor activo',
        body: 'Plataforma operativa lista para monitoreo',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: clientTipal.id,
        type: 'APPROVAL_REQUIRED',
        title: 'Informe pendiente — El Tipal',
        body: 'Solicitud de correccion — humedad en muro lote 24',
        link: `/dashboard/projects/${project3.id}?tab=reports`,
        projectId: project3.id,
      },
      {
        userId: clientTipal.id,
        type: 'APPROVAL_REQUIRED',
        title: 'Adicional pendiente — El Tipal',
        body: 'Horas extra — refuerzo estructural ($185.000)',
        link: `/dashboard/projects/${project3.id}?tab=extras`,
        projectId: project3.id,
      },
      {
        userId: clientCronec.id,
        type: 'SYSTEM',
        title: 'Obra CRONEC — nave industrial',
        body: 'Emprenor.com.ar: planos y cronograma disponibles en portal',
        link: `/dashboard/projects/${projectCronec.id}?tab=documents`,
        projectId: projectCronec.id,
      },
      {
        userId: clientGobSalta.id,
        type: 'SYSTEM',
        title: 'Licitacion Gob. Salta — documentacion',
        body: 'Carpeta digital de obra publica lista para auditoria',
        link: `/dashboard/projects/${projectGobSalta.id}?tab=info`,
        projectId: projectGobSalta.id,
      },
    ],
    skipDuplicates: true,
  });

  // Sample incidents
  await prisma.incident.upsert({
    where: { id: 'inc-demo-1' },
    update: {},
    create: {
      id: 'inc-demo-1',
      title: 'Demora en entrega de materiales',
      description: 'El proveedor de hormigon demoro la entrega programada para el 15/04.',
      status: 'EN_PROCESO',
      projectId: project1.id,
    },
  });

  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@emprenor.com' } });

  const orgChannel = await prisma.chatChannel.upsert({
    where: { id: 'chat-demo-org' },
    update: {},
    create: {
      id: 'chat-demo-org',
      organizationId: org.id,
      type: 'ORGANIZATION',
      name: `Empresa: ${org.name}`,
      description: 'Canal corporativo',
    },
  });

  const staffIds = await prisma.user.findMany({
    where: { organizationId: org.id },
    select: { id: true },
  });
  if (staffIds.length > 0) {
    await prisma.chatChannelMember.createMany({
      data: staffIds.map((u) => ({ channelId: orgChannel.id, userId: u.id })),
      skipDuplicates: true,
    });
  }

  if (adminUser) {
    await prisma.chatMessage.upsert({
      where: { id: 'msg-org-welcome' },
      update: {},
      create: {
        id: 'msg-org-welcome',
        channelId: orgChannel.id,
        authorId: adminUser.id,
        body: 'Canal corporativo activo. Aqui coordinamos todas las obras del tenant.',
        priority: 'NORMAL',
      },
    });
  }

  const channel3 = await prisma.chatChannel.upsert({
    where: { id: 'chat-demo-project3' },
    update: {},
    create: {
      id: 'chat-demo-project3',
      organizationId: org.id,
      projectId: project3.id,
      type: 'PROJECT',
      name: `Obra: ${project3.name}`,
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        channelId: channel3.id,
        authorId: inspector.id,
        body: 'Cliente: revisar informe de humedad en muro norte antes del viernes.',
        priority: 'HIGH',
      },
      {
        channelId: channel3.id,
        authorId: civil.id,
        body: 'Equipo de refuerzo estructural confirmado para manana 8:00.',
        priority: 'NORMAL',
      },
      {
        channelId: channel3.id,
        authorId: client1.id,
        body: 'Recibido. Aguardo presupuesto del adicional aprobado.',
        priority: 'NORMAL',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.workOrder.upsert({
    where: { id: 'wo-demo-1' },
    update: {},
    create: {
      id: 'wo-demo-1',
      organizationId: org.id,
      projectId: project3.id,
      number: 'OT-00001',
      title: 'Impermeabilizacion muro norte',
      description: 'Trabajo segun informe NC humedad',
      status: 'EN_EJECUCION',
      createdById: civil.id,
      slaDueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.qualityNonConformance.upsert({
    where: { id: 'nc-demo-1' },
    update: {},
    create: {
      id: 'nc-demo-1',
      organizationId: org.id,
      projectId: project3.id,
      code: 'NC-0001',
      title: 'Humedad en paramento',
      description: 'Filtracion detectada en inspeccion',
      isoClause: 'ISO 9001:2015 — 8.7',
      status: 'EN_TRATAMIENTO',
      authorId: inspector.id,
    },
  });

  await prisma.hseIncident.create({
    data: {
      organizationId: org.id,
      projectId: project1.id,
      title: 'Casi accidente — andamio',
      description: 'Falta de baranda lateral sector B',
      severity: 'MODERADO',
      reporterId: inspector.id,
    },
  });

  await prisma.projectMaterial.upsert({
    where: { id: 'mat-demo-1' },
    update: { supplier: 'Distribuidora Norte', brand: 'Bosch', deliveryStatus: 'ENTREGADO' },
    create: {
      id: 'mat-demo-1',
      projectId: project3.id,
      itemName: 'Amoladora angular 4 1/2',
      quantity: '2',
      unit: 'unidad',
      category: 'HERRAMIENTA',
      supplier: 'Distribuidora Norte',
      brand: 'Bosch',
      deliveryStatus: 'ENTREGADO',
    },
  });

  await prisma.siteLogEntry.upsert({
    where: { id: 'log-demo-1' },
    update: {},
    create: {
      id: 'log-demo-1',
      projectId: project3.id,
      phase: 'ANTES',
      title: 'Estado inicial muro norte',
      notes: 'Humedad visible antes de tratamiento',
      uploadedById: inspector.id,
    },
  });

  await prisma.siteLogEntry.upsert({
    where: { id: 'log-demo-2' },
    update: {},
    create: {
      id: 'log-demo-2',
      projectId: project3.id,
      phase: 'DURANTE',
      title: 'Aplicacion impermeabilizante',
      notes: 'Primera mano OT-00001',
      uploadedById: civil.id,
    },
  });

  await prisma.permitToWork.upsert({
    where: { id: 'ptw-demo-1' },
    update: { status: 'APROBADO' },
    create: {
      id: 'ptw-demo-1',
      projectId: project3.id,
      organizationId: org.id,
      permitNumber: 'PTW-00001',
      workType: 'ALTURA',
      location: 'Muro norte lote 12',
      description: 'Impermeabilizacion segun OT-00001',
      status: 'APROBADO',
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.safetyInspection.upsert({
    where: { id: 'si-demo-1' },
    update: {},
    create: {
      id: 'si-demo-1',
      projectId: project3.id,
      organizationId: org.id,
      title: 'Inspeccion HSE ingreso obra',
      result: 'OBSERVACION',
      checklist: { epp: true, barandas: false },
    },
  });

  await prisma.tenantPacDocument.upsert({
    where: { id: 'pac-demo-gar' },
    update: {},
    create: {
      id: 'pac-demo-gar',
      organizationId: org.id,
      code: 'POL-GAR-001',
      title: 'Politica de garantia 120 dias',
      revision: 'Rev.1',
      fileName: 'POL-GAR-001.pdf',
      cloudStoragePath: 'tenant/pac/POL-GAR-001.pdf',
    },
  });

  await prisma.projectMilestone.createMany({
    data: [
      {
        projectId: project3.id,
        name: 'Inicio obra / proteccion',
        dueDate: new Date('2025-04-15'),
        percentComplete: 100,
        status: 'COMPLETADO',
        sortOrder: 0,
      },
      {
        projectId: project3.id,
        name: 'Impermeabilizacion muro norte',
        dueDate: new Date('2025-06-01'),
        percentComplete: 40,
        status: 'EN_CURSO',
        sortOrder: 1,
      },
      {
        projectId: projectCronec.id,
        name: 'Estructura metalica montada',
        dueDate: new Date('2025-09-01'),
        percentComplete: 10,
        status: 'PENDIENTE',
        sortOrder: 0,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.projectTask.createMany({
    data: [
      {
        projectId: project3.id,
        title: 'Subir plano rev.2 firmado',
        priority: 'ALTA',
        status: 'PENDIENTE',
        dueAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdById: adminUser?.id ?? civil.id,
      },
      {
        projectId: project3.id,
        title: 'Pedir aprobacion adicional refuerzo',
        priority: 'URGENTE',
        status: 'EN_CURSO',
        dueAt: new Date(),
        createdById: inspector.id,
      },
      {
        projectId: projectCronec.id,
        title: 'Coordinar ingreso grua',
        priority: 'MEDIA',
        status: 'PENDIENTE',
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdById: civil.id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.dailyFieldReport.createMany({
    data: [
      {
        projectId: project3.id,
        reportDate: new Date(),
        weather: 'Soleado',
        crewCount: 4,
        summary: 'Preparacion superficie muro norte. Demolicion parcial terminada.',
        nextSteps: 'Aplicar primer mano impermeabilizante',
        authorId: inspector.id,
      },
      {
        projectId: projectCronec.id,
        reportDate: new Date(),
        weather: 'Nublado',
        crewCount: 8,
        summary: 'Marcacion de pilares en nave. Sin incidentes HSE.',
        authorId: civil.id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.platformMetric.upsert({
    where: { key_period: { key: 'mrr_usd', period: '2025-05' } },
    update: { value: 12450 },
    create: { key: 'mrr_usd', value: 12450, period: '2025-05' },
  });

  console.log('\n=== Datos de demo (desarrollo local) ===\n');
  console.log('PLATFORM OWNER (Global Command Center /platform):');
  console.log('  owner@emprenor.com  /  platform2024');
  console.log('ADMIN (tenant):');
  console.log('  admin@emprenor.com  /  admin2024');
  console.log('  john@doe.com        /  johndoe123');
  console.log('CLIENTES (portal — password: cliente123):');
  console.log('  cliente@eltipal.com.ar      — Barrio Privado El Tipal');
  console.log('  cliente@ejemplo.com         — Alias El Tipal (demo)');
  console.log('  cliente@cronec.com.ar       — CRONEC SRL');
  console.log('  cliente@gobiernosalta.gov.ar — Gobierno de Salta');
  console.log('  cliente@particular.demo   — Persona particular (proj-particular)');
  console.log('  cliente@farmacia.demo     — Comercio / farmacia (proj-farmacia)');
  console.log('  cliente@empresa.demo      — Empresa / sociedad (proj-empresa)');
  console.log('  cliente@fundacion.demo    — Fundacion / ONG (proj-fundacion)');
  console.log('ESPECIALISTAS (password: especialista123):');
  console.log('  ingeniero@emprenor.com  — Ingeniero civil');
  console.log('  inspector@emprenor.com  — Inspector de obra');
  console.log('\nObras Emprenor.com.ar:');
  console.log('  proj-cronec     — CRONEC SRL (industrial)');
  console.log('  proj-gob-salta  — Gobierno de Salta (publico)');
  console.log('  proj-demo-3     — Barrio Privado El Tipal');
  console.log('  proj-empresa    — Empresa SIN S.A.');
  console.log('  proj-particular — Vivienda particular');
  console.log('  proj-farmacia   — Farmacia del Pueblo');
  console.log('  proj-fundacion  — Fundacion Educativa NOA');
  console.log('Seed completed successfully\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
