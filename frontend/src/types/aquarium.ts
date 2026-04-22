export type AquariumType = 'REEF' | 'FISH_ONLY' | 'MIXED';
export type LivestockCategory = 'FISH' | 'CORAL' | 'INVERTEBRATE';
export type EquipmentCategory = 'LIGHT' | 'PUMP' | 'SKIMMER' | 'HEATER' | 'OTHER';

export interface AquariumSummary {
  id: number;
  name: string;
  liters: number;
  type: AquariumType;
}

export interface LivestockItem {
  id: number;
  name: string;
  category: LivestockCategory;
  reefSafe: boolean;
  quantity: number;
  speciesCatalogId: number | null;
}

export interface EquipmentItem {
  id: number;
  name: string;
  powerWatts: number;
  hoursPerDay: number;
  category: EquipmentCategory | null;
}

export interface AquariumDetail extends AquariumSummary {
  equipment: EquipmentItem[];
  livestock: LivestockItem[];
}

export interface AquariumRequest {
  name: string;
  liters: number;
  type: AquariumType;
}

export interface AddLivestockRequest {
  name: string;
  category: LivestockCategory;
  reefSafe: boolean;
  quantity: number;
  speciesCatalogId?: number | null;
}

export interface AddLivestockResponse {
  livestock: LivestockItem;
  warning?: string | null;
}

export interface AddEquipmentRequest {
  name: string;
  powerWatts: number;
  hoursPerDay: number;
  category?: EquipmentCategory | null;
}
