// src/components/pitch-bend/PitchBend.tsx
import { useContext } from 'react';
import { NotesContext } from '../../utils/context';
import { NOTE_WIDTH, NOTE_HEIGHT } from '../../utils/constants';


export const PitchBend = () => {
    const { notes } = useContext(NotesContext);
    
// In PitchBend.tsx
const handlePitchBendDraw = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add point to pitch curve
    const newPoint = {
        position: x / NOTE_WIDTH,
        value: y / NOTE_HEIGHT
    };
    
    // Update note's pitch points
    // Implementation needed
};
};