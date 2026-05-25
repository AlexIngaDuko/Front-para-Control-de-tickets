import { Worker, MealSchedule, ScanRecord, SystemNotification } from './types';

export const HOSPITAL_WORKERS: Worker[] = [
  {
    id: 'w1',
    dni: '12345678',
    names: 'Alex Sandro German',
    lastNames: 'Inga Camus',
    service: 'Sistemas',
    role: 'Administrador',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w2',
    dni: '45678912',
    names: 'Lorena Lucía',
    lastNames: 'Mendoza Arrieta',
    service: 'Pediatría',
    role: 'Médico Especialista',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w3',
    dni: '78912345',
    names: 'Carlos Fernando',
    lastNames: 'Pérez Ruiz',
    service: 'Cuidados Intensivos (UCI)',
    role: 'Médico Residente',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w4',
    dni: '23456789',
    names: 'Rosa Elena',
    lastNames: 'Rojas Cabrera',
    service: 'Enfermería General',
    role: 'Licenciada en Enfermería',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w5',
    dni: '98765432',
    names: 'Jorge Luis',
    lastNames: 'Benavente Castro',
    service: 'Seguridad',
    role: 'Supervisor de Vigilancia',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w6',
    dni: '56789012',
    names: 'Eliana Edith',
    lastNames: 'Soto Quintanilla',
    service: 'Nutrición y Dietética',
    role: 'Nutricionista de Guardia',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w7',
    dni: '34567890',
    names: 'Miguel Ángel',
    lastNames: 'Valdivia Ponce',
    service: 'Mantenimiento y Auxiliar',
    role: 'Técnico de Calderas',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'VACATION'
  },
  {
    id: 'w8',
    dni: '65432109',
    names: 'Diana Carolina',
    lastNames: 'Bustamante Flores',
    service: 'Ginecobstetricia y Neonatología',
    role: 'Médico Residente II',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'VACATION'
  },
  {
    id: 'w9',
    dni: '44556677',
    names: 'Víctor Hugo',
    lastNames: 'Albarracín Cáceres',
    service: 'Farmacia Centro',
    role: 'Farmacéutico',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w10',
    dni: '99887766',
    names: 'Karina Isabel',
    lastNames: 'Ortega Mansilla',
    service: 'Emergencias',
    role: 'Jefa de Guardia Médica',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w11',
    dni: '11112222',
    names: 'Enrique Daniel',
    lastNames: 'Sánchez Meléndez',
    service: 'Pediatría Especializada',
    role: 'Médico Especialista en Cirugía Infantil',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w12',
    dni: '33334444',
    names: 'Patricia Pilar',
    lastNames: 'Ríos Quiroga',
    service: 'Cardiología Pediátrica',
    role: 'Médico Especialista',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w13',
    dni: '55556666',
    names: 'Fernando José',
    lastNames: 'Guzmán Prado',
    service: 'UCI Pediátrica',
    role: 'Médico Intensivista',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w14',
    dni: '77778888',
    names: 'Diana Carolina',
    lastNames: 'Quispe Rosales',
    service: 'Neuropediatría',
    role: 'Médico de Turno',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w15',
    dni: '41235678',
    names: 'Jorge Mario',
    lastNames: 'Sotomayor Alba',
    service: 'Infectología Pediátrica',
    role: 'Médico Asistente III',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w16',
    dni: '42345678',
    names: 'Silvia Roxana',
    lastNames: 'Montes Cabrejos',
    service: 'Oncohematología Pediátrica',
    role: 'Médico Especialista Jefe',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w17',
    dni: '43456789',
    names: 'Jaime Antonio',
    lastNames: 'Pazos Benites',
    service: 'Urgencias y Shock Trauma',
    role: 'Médico de Guardia / Pediatra',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w18',
    dni: '44567890',
    names: 'Milagros Del Pilar',
    lastNames: 'Ortiz Quiroz',
    service: 'Neumología Pediátrica',
    role: 'Médico Especialista Staff',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w19',
    dni: '45678901',
    names: 'Carlos Alfonso',
    lastNames: 'Del Campo Ríos',
    service: 'Cirugía Neonatal y Pediátrica',
    role: 'Jefe del Departamento de Cirugía',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w20',
    dni: '50102030',
    names: 'Ricardo Luis',
    lastNames: 'Vargas Machuca',
    service: 'Cardiología Pediátrica',
    role: 'Médico Subespecialista',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w21',
    dni: '51203040',
    names: 'Patricia Elena',
    lastNames: 'Sánchez Pinillos',
    service: 'Gastroenterología Pediátrica',
    role: 'Médico de Turno Staff',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w22',
    dni: '52304050',
    names: 'Gustavo Adolfo',
    lastNames: 'Barreda Valdivia',
    service: 'Cuidado Crítico Quirúrgico',
    role: 'Médico Intensivista Asistente',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w23',
    dni: '53405060',
    names: 'María Estela',
    lastNames: 'Ganoza De la Cruz',
    service: 'Genética Médica Pediátrica',
    role: 'Médico Especialista Genético',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'w24',
    dni: '54506070',
    names: 'Francisco Javier',
    lastNames: 'Zavala Cáceres',
    service: 'Traumatología Pediátrica',
    role: 'Médico Traumatólogo de Guardia',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  }
];

export const MEAL_SCHEDULES: MealSchedule[] = [
  {
    type: 'DESAYUNO',
    label: 'Desayuno',
    startTime: '06:00',
    endTime: '09:00',
    calories: 420,
    protein: 18,
    carbs: 55,
    menuName: 'Pan integral con palta fresca + Tortilla de espinaca y claras + Infusión aromática'
  },
  {
    type: 'ALMUERZO',
    label: 'Almuerzo de Turno',
    startTime: '12:00',
    endTime: '15:00',
    calories: 780,
    protein: 38,
    carbs: 95,
    menuName: 'Pechuga de pollo grillada + Puré rústico de papas + Ensalada arcoíris con oliva + Mandarina'
  },
  {
    type: 'CENA',
    label: 'Cena Nutritiva',
    startTime: '19:00',
    endTime: '23:30',
    calories: 520,
    protein: 26,
    carbs: 62,
    menuName: 'Consomé caliente con verduras de estación + Filete de lubina al horno con quinoa graneada'
  }
];

// Seed some consumption records for today '2026-05-25' to make the dashboard alive instantly
export const INITIAL_SCAN_RECORDS: ScanRecord[] = [
  {
    id: 'scan-1',
    workerId: 'w2',
    names: 'Lorena Lucía',
    lastNames: 'Mendoza Arrieta',
    dni: '45678912',
    service: 'Pediatría',
    role: 'Médico Especialista',
    mealType: 'DESAYUNO',
    scanTime: '06:45:12',
    scanDate: '2026-05-25',
    status: 'VALID_COMPLETED',
    statusMessage: 'Autorizado - Desayuno Registrado',
    calories: 420,
    protein: 18,
    carbs: 55
  },
  {
    id: 'scan-2',
    workerId: 'w4',
    names: 'Rosa Elena',
    lastNames: 'Rojas Cabrera',
    dni: '23456789',
    service: 'Enfermería General',
    role: 'Licenciada en Enfermería',
    mealType: 'DESAYUNO',
    scanTime: '07:15:34',
    scanDate: '2026-05-25',
    status: 'VALID_COMPLETED',
    statusMessage: 'Autorizado - Desayuno Registrado',
    calories: 420,
    protein: 18,
    carbs: 55
  },
  {
    id: 'scan-3',
    workerId: 'w10',
    names: 'Karina Isabel',
    lastNames: 'Ortega Mansilla',
    dni: '99887766',
    service: 'Emergencias',
    role: 'Jefa de Guardia Médica',
    mealType: 'DESAYUNO',
    scanTime: '08:05:42',
    scanDate: '2026-05-25',
    status: 'VALID_COMPLETED',
    statusMessage: 'Autorizado - Desayuno Registrado',
    calories: 420,
    protein: 18,
    carbs: 55
  },
  {
    id: 'scan-4',
    workerId: 'w2',
    names: 'Lorena Lucía',
    lastNames: 'Mendoza Arrieta',
    dni: '45678912',
    service: 'Pediatría',
    role: 'Médico Especialista',
    mealType: 'DESAYUNO',
    scanTime: '08:22:15',
    scanDate: '2026-05-25',
    status: 'DUPLICATE',
    statusMessage: 'Denegado - Ticket duplicado para desayuno (Ya consumió a las 06:45:12)',
    calories: 0,
    protein: 0,
    carbs: 0
  },
  {
    id: 'scan-5',
    workerId: 'w9',
    names: 'Víctor Hugo',
    lastNames: 'Albarracín Cáceres',
    dni: '44556677',
    service: 'Farmacia Centro',
    role: 'Farmacéutico',
    mealType: 'DESAYUNO',
    scanTime: '09:12:00',
    scanDate: '2026-05-25',
    status: 'OUT_OF_SCHEDULE',
    statusMessage: 'Autorizado Excepcional - Escaneado fuera de horario (Desayuno cerró 09:00 AM)',
    calories: 420,
    protein: 18,
    carbs: 55,
    authByAdmin: true
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'Servicio de Desayuno Finalizado',
    message: 'El horario de desayuno ha concluido a las 09:00 AM de manera general.',
    type: 'info',
    timestamp: '09:00 AM',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Alerta de Intento de Duplicado',
    message: 'Se bloqueó un intento de consumo duplicado de desayuno por DNI: 45678912 (Pediatría).',
    type: 'warning',
    timestamp: '08:22 AM',
    read: false
  },
  {
    id: 'notif-3',
    title: 'Abastecimiento de Almuerzo Completo',
    message: 'Servicio de Nutrición reporta disponibilidad de 150 porciones calientes listas para almuerzo.',
    type: 'success',
    timestamp: '11:45 AM',
    read: false
  },
  {
    id: 'notif-4',
    title: 'Horario Escolar Especial',
    message: 'Recuerde aplicar el criterio de autorización manual para personal de guardia de doble turno que se extienda.',
    type: 'info',
    timestamp: '10:00 AM',
    read: true
  }
];
