// src/types/pitch.ts
export enum PitchPointShape {
    io = 'io', // Default interpolation
    i = 'i',   // Sharp in
    o = 'o',   // Sharp out
    l = 'l'    // Linear
}

export interface PitchPoint {
    x: number;      // Position within note (0-1)
    y: number;      // Pitch value (-100 to 100 cents)
    shape: PitchPointShape;
}

export interface NotePitch {
    data: PitchPoint[];
    snapFirst?: boolean;
}