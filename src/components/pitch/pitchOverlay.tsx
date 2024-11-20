//@ts-nocheck
// src/components/pitch/PitchOverlay.tsx
import { useContext } from 'react';
import { NotesContext } from '../../utils/context';
import { NOTE_HEIGHT, NOTE_WIDTH } from '../../utils/constants';

export const PitchOverlay = () => {
    const { notes } = useContext(NotesContext);

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {notes.notes.map(note => {
                if (!note.pitch?.points) return null;
                
                const noteWidth = note.units * NOTE_WIDTH;
                const startX = note.column * NOTE_WIDTH;
                const y = note.row * NOTE_HEIGHT;

                return (
                    <div 
                        key={note.id}
                        className="absolute"
                        style={{
                            left: `${startX}px`,
                            top: `${y}px`,
                            width: `${noteWidth}px`,
                            height: `${NOTE_HEIGHT}px`
                        }}
                    >
                        <svg width="100%" height="100%" className="pitch-line">
                            <polyline
                                points={note.pitch.points.map(point => 
                                    `${point.position},${point.value}`
                                ).join(' ')}
                                fill="none"
                                stroke="#2196f3"
                                strokeWidth="2"
                            />
                        </svg>
                    </div>
                );
            })}
        </div>
    );
};