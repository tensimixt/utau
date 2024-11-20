//@ts-nocheck
import { useContext, useEffect, useRef, useState } from "react";
import {
    NOTE_COLOR,
    NOTE_HEIGHT,
    NOTE_STROKE_COLOR,
    NOTE_WIDTH,
    SELECTED_NOTE_COLOR,
} from "../../utils/constants";
import {
    DarkModeContext,
    GridRefContext,
    LayersContext,
    NotesContext,
    PianoRollRefContext,
} from "../../utils/context";
import { allNotes, PIANO_ROLL_HEIGHT } from "../../utils/globals";
import { NoteData } from "../../utils/types";
import {
    ellipsized,
    getNearestBar,
    hexToRgb,
} from "../../utils/util-functions";
import { ProgressSelector } from "../progress-selector/ProgressSelector";
import { HorizontalScrollBar } from "../scroll-bars/HorizontalScrollBar";

interface GridProps {
    handleMouseDownOnGrid: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    handleMouseMoveOnGrid: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export const Grid = ({
    handleMouseDownOnGrid,
    handleMouseMoveOnGrid,
}: GridProps): JSX.Element => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { layers } = useContext(LayersContext);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(
        null
    );
    const [gridWidth, setGridWidth] = useState<number>(window.innerWidth);

    const darkMode = useContext(DarkModeContext);
    const { notes } = useContext(NotesContext);
    const gridRef = useContext(GridRefContext);
    const pianoRollRef = useContext(PianoRollRefContext);
    const gridImgRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current as HTMLCanvasElement;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        setContext(ctx);
    }, []);

    const placeNote = (note: NoteData, ghost = false) => {
        if (!context) return;
        const x = note.column * NOTE_WIDTH;
        const y = (allNotes.length - 1 - note.row) * NOTE_HEIGHT;
        const height = NOTE_HEIGHT;
        const width = NOTE_WIDTH * note.units;
    
        // Draw the note rectangle
        const noteColorRGB = hexToRgb(NOTE_COLOR);
        const noteColor = `rgba(${noteColorRGB.r}, ${noteColorRGB.g}, ${
            noteColorRGB.b
        }, ${ghost ? 0.5 : 1})`;
    
        const selectedNoteColorRGB = hexToRgb(SELECTED_NOTE_COLOR);
        const selectedNoteColor = `rgba(${selectedNoteColorRGB.r}, ${
            selectedNoteColorRGB.g
        }, ${selectedNoteColorRGB.b}, ${ghost ? 0.1 : 1})`;
    
        context.fillStyle = note.selected ? selectedNoteColor : noteColor;
        context.fillRect(x, y, width, height);
        
        // Draw pitch curve if it exists
        if (note.pitch?.points && !ghost) {
            context.beginPath();
            context.strokeStyle = '#ff0000'; // Red color for pitch curve
            context.lineWidth = 2;
            
            note.pitch.points.forEach((point, index) => {
                const pointX = x + (width * point.x);
                // Convert pitch value from -100 to 100 range to pixel position
                const pointY = y + height * (1 - (point.y + 100) / 200);
                
                if (index === 0) {
                    context.moveTo(pointX, pointY);
                } else {
                    context.lineTo(pointX, pointY);
                }
            });
            
            context.stroke();
            context.lineWidth = 1;
        }
    
        if (ghost) return;
    
        // Draw note border and text
        context.strokeStyle = NOTE_STROKE_COLOR;
        context.strokeRect(x, y, width, height);
        context.fillStyle = "black";
        context.font = "16px sans-serif";
    
        let maxLength = 3;
        switch (note.units) {
            case 1: maxLength = -1; break;
            case 2: maxLength = 0; break;
            case 3: maxLength = 1;
        }
        context.fillText(ellipsized(note.note, maxLength), x + 2, y + 21);
   
        if (!ghost && note.pitch) {
            drawPitchCurve(note);
        }
   
    };

    const drawPitchCurve = (note: NoteData) => {
        if (!context || !note.pitch?.points.length) return;
        
        const x = note.column * NOTE_WIDTH;
        const y = (allNotes.length - 1 - note.row) * NOTE_HEIGHT;
        const width = NOTE_WIDTH * note.units;
        
        context.beginPath();
        context.strokeStyle = 'red';
        context.lineWidth = 2;
        
        // Draw current note pitch curve
        note.pitch.points.forEach((point, i) => {
            const pointX = x + (width * point.x);
            const pointY = y + NOTE_HEIGHT/2 - (point.y * NOTE_HEIGHT/2);
            
            if (i === 0) {
                context.moveTo(pointX, pointY);
            } else {
                context.lineTo(pointX, pointY);
            }
        });
        
        // If connected to next note, draw connection
        if (note.pitch.connectedToNext) {
            const nextNote = notes.notes.find(n => 
                n.column === note.column + note.units && 
                n.row === note.row
            );
            
            if (nextNote?.pitch?.points.length) {
                const nextX = nextNote.column * NOTE_WIDTH;
                const nextY = y + NOTE_HEIGHT/2 - (nextNote.pitch.points[0].y * NOTE_HEIGHT/2);
                context.lineTo(nextX, nextY);
            }
        }
        
        context.stroke();
        
        // Draw control points
        note.pitch.points.forEach(point => {
            const pointX = x + (width * point.x);
            const pointY = y + NOTE_HEIGHT/2 - (point.y * NOTE_HEIGHT/2);
            
            context.fillStyle = 'white';
            context.beginPath();
            context.arc(pointX, pointY, 4, 0, Math.PI * 2);
            context.fill();
            context.stroke();
        });
    };

    const handleRightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    useEffect(() => {
        pianoRollRef.current?.scrollTo(0, 1000); // scroll to c5
    }, []);

    useEffect(() => {
        if (!context) return;

        const farthestCol =
            notes.notes.length > 0 ? getNearestBar(notes.notes) : 0;
        const gridWidth = (farthestCol + 1) * NOTE_WIDTH + 3000;

        if (gridImgRef.current) {
            gridImgRef.current.style.minWidth = gridWidth + "px";
        }
        setGridWidth(gridWidth);

        context.clearRect(0, 0, gridWidth, PIANO_ROLL_HEIGHT);

        if (layers.length > 0) {
            for (let i = 0; i < layers.length; i++) {
                if (layers[i].id === notes.id) continue;
                for (let j = 0; j < layers[i].notes.length; j++) {
                    const note = layers[i].notes[j];
                    placeNote(note, true);
                }
            }

            // render selected layer last to make sure it's on top
            for (let i = 0; i < notes.notes.length; i++) {
                const note = notes.notes[i];
                placeNote(note);
            }
        }
    }, [notes, context, gridWidth]);
    return (
        <>
            <ProgressSelector />
            <div
                className="relative flex-shrink-0 w-full overflow-x-auto overflow-y-hidden"
                onContextMenu={handleRightClick}
                ref={gridRef}
                style={{
                    height: PIANO_ROLL_HEIGHT + "px",
                    transform: `translateX(-12px)`,
                }}
            >
                <div
                    ref={gridImgRef}
                    style={{
                        height: PIANO_ROLL_HEIGHT + "px",
                        //minWidth: gridWidth + 3000 + "px",
                        backgroundRepeat: "repeat",
                        backgroundImage: `url("assets/grid-${
                            darkMode ? "02" : "01"
                        }.svg")`,
                    }}
                >
                    <canvas
                        className="absolute"
                        onMouseDown={handleMouseDownOnGrid}
                        onMouseMove={handleMouseMoveOnGrid}
                        height={PIANO_ROLL_HEIGHT}
                        width={gridWidth}
                        ref={canvasRef}
                    ></canvas>
                </div>
            </div>
            <HorizontalScrollBar gridWidth={gridWidth} container={gridRef} />
        </>
    );
};
