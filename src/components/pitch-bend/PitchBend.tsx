//@ts-nocheck
import { useContext, useCallback } from 'react';
import { NotesContext } from '../../utils/context';
import { NOTE_WIDTH, NOTE_HEIGHT } from '../../utils/constants';

import { NotePitch, PitchPoint } from '../../utils/types';



interface PitchBendProps {
    noteId: string;
    pitch?: NotePitch;
    duration: number;
    onPitchChange: (noteId: string, pitch: NotePitch) => void;
}

export const PitchBend: React.FC<PitchBendProps> = ({
    noteId,
    pitch,
    duration,
    onPitchChange
}) => {
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
    
        const newPoint: PitchPoint = {
            position: Math.max(0, Math.min(1, x)), // Changed from x to position
            value: Math.max(0, Math.min(1, y))     // Changed from y to value
        };
    
        const newPitch: NotePitch = {
            points: [...(pitch?.points || []), newPoint].sort((a, b) => a.position - b.position), // Changed from x to position
            connectedToNext: pitch?.connectedToNext || false
        };
    
        onPitchChange(noteId, newPitch);
    }, [noteId, pitch, onPitchChange]);

    return (
        <div 
            className="absolute inset-0"
            onMouseDown={handleMouseDown}
            style={{ width: duration * NOTE_WIDTH }}
        >
            <svg width="100%" height="100%" className="pitch-overlay">
                <polyline
                    points={pitch?.points?.map(pt => 
                        `${pt.position * 100},${pt.value * 100}`
                    ).join(' ') || ''}
                    fill="none"
                    stroke="#2196f3"
                    strokeWidth="2"
                />
            </svg>
        </div>
    );
};