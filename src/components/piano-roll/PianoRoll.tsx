//@ts-nocheck
import { useState, useContext } from "react";
import { Grid } from "../grid/Grid";
import { Piano } from "../piano/Piano";
import { Selection } from "../selection/Selection";
import { usePianoRoll } from "./usePianoRoll";
import { DEFAULT_NOTE_LENGTH } from "../../utils/constants";
import { PitchOverlay } from "../pitch/pitchOverlay";
import { NotesContext } from "../../utils/context";
import { NoteData } from "../../utils/types"; // Use the existing NoteData type
import { PitchBend } from "../pitch-bend/PitchBend";


export const PianoRoll = (): JSX.Element => {
    const { notes } = useContext(NotesContext);
    const [noteLength, setNoteLength] = useState<number>(DEFAULT_NOTE_LENGTH);
    const {
        handleMouseMoveOnGrid,
        handleMouseDownOnGrid,
        handlePitchChange
    } = usePianoRoll(noteLength, setNoteLength);

    return (
        <>
            <Selection />
            <Piano />
            <Grid
                handleMouseMoveOnGrid={handleMouseMoveOnGrid}
                handleMouseDownOnGrid={handleMouseDownOnGrid}
            />
            <PitchOverlay />
            {notes.notes && notes.notes.map((note: NoteData) => (
                <PitchBend
                    key={note.id}
                    noteId={note.id.toString()}
                    pitch={note.pitch}
                    duration={note.units}
                    onPitchChange={handlePitchChange}
                />
            ))}
        </>
    );
};