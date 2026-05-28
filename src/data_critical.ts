import { Worker } from './types';

export const SERVICE_DECRYPTIONS: Record<string, string> = {
  'ANEST': 'Anestesiología',
  'B.SANG': 'Banco de Sangre',
  'C.QUIRUR': 'Centro Quirúrgico',
  'CARDIO': 'Cardiología',
  'CIRUG.G': 'Cirugía General',
  'EMERG.': 'Emergencias',
  'LAB.EMERG': 'Laboratorio de Emergencia',
  'NEONAT': 'Neonatología',
  'RAYOS X': 'Rayos X / Radiología'
};

export const CRITICAL_HOSPITAL_WORKERS: Worker[] = [
  // 1. ANEST - Anestesiología (c1 to c10)
  {
    id: 'c1',
    dni: '80000101',
    names: 'Luis Alberto',
    lastNames: 'Mendoza Flores',
    service: 'ANEST',
    role: 'Jefe de Anestesiología',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c2',
    dni: '80000102',
    names: 'Ana María',
    lastNames: 'Reyes Gutiérrez',
    service: 'ANEST',
    role: 'Médico Anestesiólogo Asistente',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c3',
    dni: '80000103',
    names: 'Carlos Augusto',
    lastNames: 'Santillán Vega',
    service: 'ANEST',
    role: 'Médico Anestesiólogo Guardía',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c4',
    dni: '80000104',
    names: 'Milagros Esther',
    lastNames: 'Romero Beltrán',
    service: 'ANEST',
    role: 'Licenciada en Enfermería (Anestesia)',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c5',
    dni: '80000105',
    names: 'Guillermo Alonso',
    lastNames: 'Salazar Farfán',
    service: 'ANEST',
    role: 'Médico Residente de Anestesiología',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c6',
    dni: '80000106',
    names: 'Sofía Lorena',
    lastNames: 'Soto Palacios',
    service: 'ANEST',
    role: 'Enfermera Instrumentista de Guardia',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c7',
    dni: '80000107',
    names: 'Héctor Manuel',
    lastNames: 'Peralta Quiroz',
    service: 'ANEST',
    role: 'Médico Residente II',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c8',
    dni: '80000108',
    names: 'Gabriela Elena',
    lastNames: 'Cárdenas Vigo',
    service: 'ANEST',
    role: 'Licenciada de Recuperación',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c9',
    dni: '80000109',
    names: 'Ricardo José',
    lastNames: 'Barrios Alva',
    service: 'ANEST',
    role: 'Técnico en Anestesio y Chirugía',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c10',
    dni: '80000110',
    names: 'Diana Lucía',
    lastNames: 'Córdova Paz',
    service: 'ANEST',
    role: 'Licenciada Enfermería Especialista',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },

  // 2. B.SANG - Banco de Sangre (c11 to c20)
  {
    id: 'c11',
    dni: '80000211',
    names: 'Felipe Augusto',
    lastNames: 'Tello Miranda',
    service: 'B.SANG',
    role: 'Médico Hematólogo Jefe',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c12',
    dni: '80000212',
    names: 'María Angélica',
    lastNames: 'Noriega Silva',
    service: 'B.SANG',
    role: 'Licenciada de Hemoterapia',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c13',
    dni: '80000213',
    names: 'Renzo Daniel',
    lastNames: 'Espinoza Portillo',
    service: 'B.SANG',
    role: 'Tecnólogo Médico Analista',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c14',
    dni: '80000214',
    names: 'Verónica Rocío',
    lastNames: 'Vargas Alarcón',
    service: 'B.SANG',
    role: 'Bióloga de Banco de Sangre',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c15',
    dni: '80000215',
    names: 'Diego Armando',
    lastNames: 'Fuentes Paredes',
    service: 'B.SANG',
    role: 'Técnico Especialista de Inmuno',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c16',
    dni: '80000216',
    names: 'Roxana Elvira',
    lastNames: 'Carbajal León',
    service: 'B.SANG',
    role: 'Licenciada en Enfermería',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c17',
    dni: '80000217',
    names: 'Walter Manuel',
    lastNames: 'Carrasco Bedoya',
    service: 'B.SANG',
    role: 'Tecnólogo Clínico Inmunohemoterapia',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c18',
    dni: '80000218',
    names: 'Patricia Pilar',
    lastNames: 'Quispe Huamán',
    service: 'B.SANG',
    role: 'Técnica de Laboratorio Banco',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c19',
    dni: '80000219',
    names: 'Andrés Efraín',
    lastNames: 'Morales Ortiz',
    service: 'B.SANG',
    role: 'Auxiliar de Depósitos Sanguíneos',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c20',
    dni: '80000220',
    names: 'Martha Cecilia',
    lastNames: 'Gálvez Solórzano',
    service: 'B.SANG',
    role: 'Licenciada de Guardia Hemofilias',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },

  // 3. C.QUIRUR - Centro Quirúrgico (c21 to c30)
  {
    id: 'c21',
    dni: '80000321',
    names: 'César Augusto',
    lastNames: 'Vela de la Cruz',
    service: 'C.QUIRUR',
    role: 'Jefe de Quirófano Central',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c22',
    dni: '80000322',
    names: 'Erika Rossana',
    lastNames: 'Zegarra Benites',
    service: 'C.QUIRUR',
    role: 'Licenciada Instrumentista Principal',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c23',
    dni: '80000323',
    names: 'Juan Carlos',
    lastNames: 'Arriaga Montoya',
    service: 'C.QUIRUR',
    role: 'Médico Cirujano Pediátrico Guardia',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c24',
    dni: '80000324',
    names: 'Juana Flor',
    lastNames: 'Ochoa Castañeda',
    service: 'C.QUIRUR',
    role: 'Enfermera Especialista de Sala',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c25',
    dni: '80000325',
    names: 'Raúl Fernando',
    lastNames: 'Lozada Villanueva',
    service: 'C.QUIRUR',
    role: 'Médico Traumatólogo Quirófano',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c26',
    dni: '80000326',
    names: 'Liliana Isabel',
    lastNames: 'Guillén Peralta',
    service: 'C.QUIRUR',
    role: 'Licenciada Enfermería Circulante',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c27',
    dni: '80000327',
    names: 'Luis Francisco',
    lastNames: 'Cabrera Solís',
    service: 'C.QUIRUR',
    role: 'Licenciado de Enfermería Especialista',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c28',
    dni: '80000328',
    names: 'Nelly Sofía',
    lastNames: 'Palomino Guerra',
    service: 'C.QUIRUR',
    role: 'Técnica de Quirófano y Esterilización',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c29',
    dni: '80000329',
    names: 'Renato Alonso',
    lastNames: 'Valenzuela Prado',
    service: 'C.QUIRUR',
    role: 'Técnico Instrumental Quirúrgico',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c30',
    dni: '80000330',
    names: 'Clara Elena',
    lastNames: 'Jáuregui Montes',
    service: 'C.QUIRUR',
    role: 'Anestesista de Sala y Quirófanos',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },

  // 4. CARDIO - Cardiología (c31 to c40)
  {
    id: 'c31',
    dni: '80000431',
    names: 'Víctor Manuel',
    lastNames: 'Zárate Cisneros',
    service: 'CARDIO',
    role: 'Jefe del Servicio de Cardiología',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c32',
    dni: '80000432',
    names: 'Carmen Julia',
    lastNames: 'Pinedo Soria',
    service: 'CARDIO',
    role: 'Médico Cardiólogo Pediatra',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c33',
    dni: '80000433',
    names: 'Eduardo Daniel',
    lastNames: 'Zevallos Medina',
    service: 'CARDIO',
    role: 'Cardiólogo - Hemodinamista',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c34',
    dni: '80000434',
    names: 'Inés Mercedes',
    lastNames: 'Torres Villegas',
    service: 'CARDIO',
    role: 'Licenciada de Cardiología Crítica',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c35',
    dni: '80000435',
    names: 'Hugo Javier',
    lastNames: 'Salgado Portocarrero',
    service: 'CARDIO',
    role: 'Médico Residente de Cardiología',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c36',
    dni: '80000436',
    names: 'Teresa Gladys',
    lastNames: 'Navarro Ruiz',
    service: 'CARDIO',
    role: 'Tecnóloga Ecocardiografía Pediátrica',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c37',
    dni: '80000437',
    names: 'Pedro Alfonso',
    lastNames: 'Flores Valdivieso',
    service: 'CARDIO',
    role: 'Licenciado de Pruebas de Esfuerzo',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c38',
    dni: '80000438',
    names: 'Silvia Noemí',
    lastNames: 'Morales Serna',
    service: 'CARDIO',
    role: 'Enfermera de Consulta Externa Cardio',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c39',
    dni: '80000439',
    names: 'Humberto Joel',
    lastNames: 'Espinoza Rivera',
    service: 'CARDIO',
    role: 'Médico Cardiólogo Infantil Guardia',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c40',
    dni: '80000440',
    names: 'Claudia Viviana',
    lastNames: 'Calderón Hoyos',
    service: 'CARDIO',
    role: 'Técnico de Electrocardiogramas',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },

  // 5. CIRUG.G - Cirugía General (c41 to c50)
  {
    id: 'c41',
    dni: '80000541',
    names: 'Gustavo Adolfo',
    lastNames: 'Pinto Bustamante',
    service: 'CIRUG.G',
    role: 'Jefe del Departamento de Cirugía',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c42',
    dni: '80000542',
    names: 'Eliana Edith',
    lastNames: 'Cornejo Carpio',
    service: 'CIRUG.G',
    role: 'Médico Cirujano General de Guardia',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c43',
    dni: '80000543',
    names: 'Fernando Javier',
    lastNames: 'Romero Solórzano',
    service: 'CIRUG.G',
    role: 'Cirujano Pediatra Asistente',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c44',
    dni: '80000544',
    names: 'Liliana Patricia',
    lastNames: 'Casas Novoa',
    service: 'CIRUG.G',
    role: 'Licenciada de Hospitalización Cirugía',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c45',
    dni: '80000545',
    names: 'Augusto César',
    lastNames: 'Ríos Quiroz',
    service: 'CIRUG.G',
    role: 'Médico Residente de Cirugía General',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c46',
    dni: '80000546',
    names: 'Beatriz Teresa',
    lastNames: 'Hidalgo Palomino',
    service: 'CIRUG.G',
    role: 'Enfermera Especialista de Sala',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c47',
    dni: '80000547',
    names: 'Jorge Eduardo',
    lastNames: 'Mejía Vargas',
    service: 'CIRUG.G',
    role: 'Cirujano General Pediátrico Residente II',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c48',
    dni: '80000548',
    names: 'Roxana Mercedes',
    lastNames: 'Vera Sotomayor',
    service: 'CIRUG.G',
    role: 'Licenciada Enfermería Curaciones',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c49',
    dni: '80000549',
    names: 'César Enrique',
    lastNames: 'Beltrán Luna',
    service: 'CIRUG.G',
    role: 'Técnico de Hospitalización Cirugía',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c50',
    dni: '80000550',
    names: 'Lorena Lucía',
    lastNames: 'Márquez Rojas',
    service: 'CIRUG.G',
    role: 'Enfermera Instrumentista de Guardia',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },

  // 6. EMERG. - Emergencias / Urgencias (c51 to c60)
  {
    id: 'c51',
    dni: '80000651',
    names: 'Carlos Fernando',
    lastNames: 'Zavaleta Montenegro',
    service: 'EMERG.',
    role: 'Jefe del Departamento de Emergencias',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c52',
    dni: '80000652',
    names: 'Milagros del Pilar',
    lastNames: 'Vásquez Benites',
    service: 'EMERG.',
    role: 'Jefa de Guardia Médica Pediátrica',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c53',
    dni: '80000653',
    names: 'Andrés Daniel',
    lastNames: 'Bustamante Flores',
    service: 'EMERG.',
    role: 'Médico Emergenciólogo General Guardía',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c54',
    dni: '80000654',
    names: 'Rosa Elena',
    lastNames: 'Quiroga Cabrera',
    service: 'EMERG.',
    role: 'Licenciada Emergencias y Triage Asistente',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c55',
    dni: '80000655',
    names: 'Jaime Antonio',
    lastNames: 'Salcedo Torres',
    service: 'EMERG.',
    role: 'Médico Residente Especialista Emergencia',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c56',
    dni: '80000656',
    names: 'Flor de María',
    lastNames: 'Ortiz Mansilla',
    service: 'EMERG.',
    role: 'Licenciada de Shock Trauma Guardia',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c57',
    dni: '80000657',
    names: 'Ricardo Luis',
    lastNames: 'Vargas Ponce',
    service: 'EMERG.',
    role: 'Médico Asistente de Urgencias Infantiles',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c58',
    dni: '80000658',
    names: 'Patricia Isabel',
    lastNames: 'Ortega Cáceres',
    service: 'EMERG.',
    role: 'Licenciada Enfermería de Observación',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c59',
    dni: '80000659',
    names: 'Jorge Mario',
    lastNames: 'Benavente Castro',
    service: 'EMERG.',
    role: 'Técnico Especialista Urgencias',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c60',
    dni: '80000660',
    names: 'Karina Elena',
    lastNames: 'Soto Quintanilla',
    service: 'EMERG.',
    role: 'Enfermera Emergencióloga de Consulta',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },

  // 7. LAB.EMERG - Laboratorio de Emergencia (c61 to c70)
  {
    id: 'c61',
    dni: '80000761',
    names: 'Héctor Hugo',
    lastNames: 'Quispe Rosales',
    service: 'LAB.EMERG',
    role: 'Jefe del Laboratorio de Emergencias',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c62',
    dni: '80000762',
    names: 'Diana Roxana',
    lastNames: 'Beltrán Luna',
    service: 'LAB.EMERG',
    role: 'Bióloga Clínica Especialista Guardía',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c63',
    dni: '80000763',
    names: 'Rogelio Efraín',
    lastNames: 'Ortiz Quiroz',
    service: 'LAB.EMERG',
    role: 'Tecnólogo Médico de Laboratorio Emerg.',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c64',
    dni: '80000764',
    names: 'Patricia Pilar',
    lastNames: 'Ortiz Cabrejos',
    service: 'LAB.EMERG',
    role: 'Bióloga Especialista en Inmunología',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c65',
    dni: '80000765',
    names: 'Walter Alonso',
    lastNames: 'Espinoza Alarcón',
    service: 'LAB.EMERG',
    role: 'Tecnólogo Médico Hemogramas Guardia',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c66',
    dni: '80000766',
    names: 'Martha Clara',
    lastNames: 'León Zegarra',
    service: 'LAB.EMERG',
    role: 'Técnica de Laboratorio Especializada',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c67',
    dni: '80000767',
    names: 'Felipe Manuel',
    lastNames: 'Prado Montenegro',
    service: 'LAB.EMERG',
    role: 'Tecnólogo Clínico de Diagnóstico',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c68',
    dni: '80000768',
    names: 'Rosa Angélica',
    lastNames: 'Quispe Huamán',
    service: 'LAB.EMERG',
    role: 'Bióloga Control de Calidad Emergencia',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c69',
    dni: '80000769',
    names: 'Luis Francisco',
    lastNames: 'Jáuregui Soria',
    service: 'LAB.EMERG',
    role: 'Técnico de Toma de Muestras Guardia',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c70',
    dni: '80000770',
    names: 'Clara Viviana',
    lastNames: 'Ríos Benavides',
    service: 'LAB.EMERG',
    role: 'Tecnóloga Microbiológica Emergencia',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },

  // 8. NEONAT - Neonatología (c71 to c80)
  {
    id: 'c71',
    dni: '80000871',
    names: 'Milagros Lucía',
    lastNames: 'Del Campo Ríos',
    service: 'NEONAT',
    role: 'Jefa de Neonatología y Cuidados Críticos',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c72',
    dni: '80000872',
    names: 'Jorge Luis',
    lastNames: 'Bustamante Flores',
    service: 'NEONAT',
    role: 'Médico Especialista Pediatra Neonatólogo',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c73',
    dni: '80000873',
    names: 'Patricia Pilar',
    lastNames: 'Soto Palacios',
    service: 'NEONAT',
    role: 'Licenciada Especialista Neonatología UCIN',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c74',
    dni: '80000874',
    names: 'Carlos Alberto',
    lastNames: 'Romero Beltrán',
    service: 'NEONAT',
    role: 'Médico Neonatólogo Guardia Nocturna',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c75',
    dni: '80000875',
    names: 'Erika Isabel',
    lastNames: 'Ganoza de la Cruz',
    service: 'NEONAT',
    role: 'Licenciada de Cuidado Crítico Neonatal',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c76',
    dni: '80000876',
    names: 'Augusto César',
    lastNames: 'Mendoza Flores',
    service: 'NEONAT',
    role: 'Médico Residente de Neonatología II',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c77',
    dni: '80000877',
    names: 'Lorena Lucía',
    lastNames: 'Quispe Rosales',
    service: 'NEONAT',
    role: 'Enfermera Especialista Lactancia',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c78',
    dni: '80000878',
    names: 'Ricardo Luis',
    lastNames: 'Guzmán Prado',
    service: 'NEONAT',
    role: 'Técnico Especialista de Incubadoras UCIN',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c79',
    dni: '80000879',
    names: 'Clara Elena',
    lastNames: 'Mendoza Arrieta',
    service: 'NEONAT',
    role: 'Licenciada Neonatóloga de Tópicos',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c80',
    dni: '80000880',
    names: 'Humberto Raúl',
    lastNames: 'Beltrán Luna',
    service: 'NEONAT',
    role: 'Médico Pediatra Asistente Neonatología',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },

  // 9. RAYOS X - Rayos X / Radiología (c81 to c90)
  {
    id: 'c81',
    dni: '80000981',
    names: 'Eduardo Alfonso',
    lastNames: 'Ríos Quiroga',
    service: 'RAYOS X',
    role: 'Jefe de Diagnóstico por Imágenes',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c82',
    dni: '80000982',
    names: 'Patricia Elena',
    lastNames: 'Zegarra Benites',
    service: 'RAYOS X',
    role: 'Médico Radiólogo Pediátrico Asistente',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c83',
    dni: '80000983',
    names: 'Gustavo Adolfo',
    lastNames: 'Pazos Benites',
    service: 'RAYOS X',
    role: 'Tecnólogo Médico Radiólogo Principal',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c84',
    dni: '80000984',
    names: 'Rosa Elena',
    lastNames: 'Noriega Silva',
    service: 'RAYOS X',
    role: 'Tecnólogo Médico Tomografía',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c85',
    dni: '80000985',
    names: 'Juan Carlos',
    lastNames: 'Santillán Vega',
    service: 'RAYOS X',
    role: 'Tecnólogo Médico de Radiología Guardia',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c86',
    dni: '80000986',
    names: 'Liliana Patricia',
    lastNames: 'Carbajal León',
    service: 'RAYOS X',
    role: 'Enfermera de Radiología Intervencionista',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c87',
    dni: '80000987',
    names: 'Renato Efraín',
    lastNames: 'Salgado Portocarrero',
    service: 'RAYOS X',
    role: 'Técnico Especialista en Radioprotección',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c88',
    dni: '80000988',
    names: 'Martha Clara',
    lastNames: 'Vela de la Cruz',
    service: 'RAYOS X',
    role: 'Médico Ecografista Pediátrico Shift',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c89',
    dni: '80000989',
    names: 'Luis Francisco',
    lastNames: 'Espinoza Alarcón',
    service: 'RAYOS X',
    role: 'Auxiliar de Registro Diagnóstico',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'c90',
    dni: '80000990',
    names: 'Clara Elena',
    lastNames: 'Quispe Rosales',
    service: 'RAYOS X',
    role: 'Tecnólogo Clínico Resonancia Magnética',
    photoUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
    status: 'ACTIVE'
  }
];
