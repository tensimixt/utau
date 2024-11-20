// src/types/note.ts
export interface PitchPoint {
    position: number;  // 0-1 range
    value: number;     // pitch value
}

export interface NotePitch {
    points: PitchPoint[];
}

export interface Note {
    id: string;
    pitch?: NotePitch;
    units: number;
    // other note properties
}