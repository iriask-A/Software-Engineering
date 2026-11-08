import type { Room } from '../types';

// Fictional room catalog (data only, no logic). Times are minutes after midnight.
export const ROOMS: Room[] = [
  {
    id: 'A-101',
    name: 'Room A-101',
    capacity: 30,
    equipment: ['Projector', 'Whiteboard'],
    blocked: false,
    bookings: [[600, 660]], // 10:00-11:00 (the original single-room fixture)
  },
  {
    id: 'B-204',
    name: 'Seminar Room B-204',
    capacity: 12,
    equipment: ['Whiteboard', 'Video conferencing'],
    blocked: false,
    bookings: [
      [570, 630], // 09:30-10:30
      [780, 840], // 13:00-14:00
    ],
  },
  {
    id: 'C-310',
    name: 'Computer Lab C-310',
    capacity: 24,
    equipment: ['Computers', 'Projector', 'Power outlets'],
    blocked: true, // closed for maintenance
    bookings: [[720, 780]], // 12:00-13:00
  },
  {
    id: 'D-001',
    name: 'Lecture Hall D-001',
    capacity: 120,
    equipment: ['Projector', 'Whiteboard', 'Video conferencing', 'Power outlets'],
    blocked: false,
    bookings: [
      [660, 720], // 11:00-12:00
      [900, 960], // 15:00-16:00
    ],
  },
  {
    id: 'E-215',
    name: 'Study Room E-215',
    capacity: 6,
    equipment: ['Whiteboard'],
    blocked: false,
    bookings: [[720, 780]], // 12:00-13:00
  },
];
