import cloprodSizes from "@/data/cloprod-sizes.json";
import type { GarmentType } from "@/lib/garments";

// Cloprod's size charts (src/data/cloprod-sizes.json), in cm, measured laid flat.
// Cloprod names the columns differently per garment (Chest/Bust, Length/length,
// Shoulder/Shoulder Length, Sleeve length/Sleeve Length) and calls XXL "2XL";
// this normalises them to the shop's sizes.

export type SizeMeasurements = {
    size: string; // S, M, L, XL, XXL
    chest: number; // half chest, armpit to armpit
    length: number;
    shoulder: number;
    sleeve: number;
};

// Cloprod's stated tolerance on every measurement
export const SIZE_TOLERANCE_CM = 2.5;

type Row = Record<string, string | number>;

function pick(row: Row, keys: string[]): number {
    for (const key of Object.keys(row)) {
        if (keys.includes(key.toLowerCase())) return Number(row[key]);
    }
    return NaN;
}

const normaliseSize = (name: string) => (name === "2XL" ? "XXL" : name);

export function sizeChart(type: GarmentType): SizeMeasurements[] {
    const chart = (cloprodSizes as Record<string, { sizes: Row[] }>)[type];
    if (!chart) return [];
    return chart.sizes.map((row) => ({
        size: normaliseSize(String(row.name)),
        chest: pick(row, ["chest", "bust"]),
        length: pick(row, ["length"]),
        shoulder: pick(row, ["shoulder", "shoulder length"]),
        sleeve: pick(row, ["sleeve length"]),
    }));
}

// Centimetres to inches, 1 decimal
export const cmToInch = (cm: number) => Math.round((cm / 2.54) * 10) / 10;
