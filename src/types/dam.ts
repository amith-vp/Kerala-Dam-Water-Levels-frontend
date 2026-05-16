
export type DamSource = "KSEB" | "Irrigation";
export type DamSourceFilter = "all" | DamSource;

export interface DamData {
  date: string;
  waterLevel: string;
  liveStorage: string;
  storagePercentage: string;
  inflow: string;
  powerHouseDischarge: string;
  spillwayRelease: string;
  totalOutflow: string;
  outflow?: string;
  rainfall: string;
  remarks?: string;
}

export interface Dam {
  id: string;
  name: string;
  officialName: string;
  source: DamSource;
  district?: string;
  MWL: string;
  FRL: string;
  grossStorage?: string;
  liveStorageAtFRL: string;
  ruleLevel: string;
  blueLevel: string;
  orangeLevel: string;
  redLevel: string;
  latitude: number;
  longitude: number;
  historyFile?: string;
  data: DamData[];
}

export interface DamsResponse {
  lastUpdate: string;
  lastUpdates?: Partial<Record<DamSource, string>>;
  dams: Dam[];
}
