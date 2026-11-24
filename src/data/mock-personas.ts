export type Persona = {
  id: string;
  name: string;
  initials: string;
  color: string;
  neighborhood: string;
};

export const personas: Persona[] = [
  { id: 'alex', name: 'Alex Rivera', initials: 'AR', color: '#187A5A', neighborhood: 'Downingtown Borough' },
  { id: 'maya', name: 'Maya Reynolds', initials: 'MR', color: '#8B5CF6', neighborhood: 'East Downingtown' },
];

export const personaById = Object.fromEntries(personas.map((persona) => [persona.id, persona]));
