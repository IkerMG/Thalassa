export interface WaterParameter {
  id: number;
  aquariumId: number;
  temperature: number | null;
  salinity: number | null;
  ph: number | null;
  alkalinityDKH: number | null;
  calciumPPM: number | null;
  magnesiumPPM: number | null;
  nitratesPPM: number | null;
  phosphatesPPM: number | null;
  measuredAt: string;
}

export type ParameterKey =
  | 'temperature'
  | 'salinity'
  | 'ph'
  | 'alkalinityDKH'
  | 'calciumPPM'
  | 'magnesiumPPM'
  | 'nitratesPPM'
  | 'phosphatesPPM';

export interface WaterParameterRequest {
  temperature?: number | null;
  salinity?: number | null;
  ph?: number | null;
  alkalinityDKH?: number | null;
  calciumPPM?: number | null;
  magnesiumPPM?: number | null;
  nitratesPPM?: number | null;
  phosphatesPPM?: number | null;
  measuredAt?: string;
}
