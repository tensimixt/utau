import { useContext, useCallback } from 'react';
import { NotesContext } from '../../utils/context';
import { NOTE_WIDTH, NOTE_HEIGHT } from '../../utils/constants';

import { NotePitch, PitchPoint } from '../../utils/types';


interface PitchPoint {
    position: number;  // x position (0-1)
    value: number;    // y value (0-1)
}

interface NotePitch {
    points: PitchPoint[];
    connectedToNext?: boolean;  // instead of snapFirst

}

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
            x: Math.max(0, Math.min(1, x)),
            y: Math.max(0, Math.min(1, y))
        };

        const newPitch: NotePitch = {
            points: [...(pitch?.points || []), newPoint].sort((a, b) => a.x - b.x),
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