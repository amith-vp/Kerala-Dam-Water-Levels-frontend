
export interface DamData {
  date: string;
  waterLevel: string;
  liveStorage: string;
  storagePercentage: string;
  inflow: string;
  powerHouseDischarge: string;
  spillwayRelease: string;
  totalOutflow: string;
  rainfall: string;
}

export interface Dam {
  id: string;
  name: string;
  officialName: string;
  MWL: string;
  FRL: string;
  liveStorageAtFRL: string;
  ruleLevel: string;
  blueLevel: string;
  orangeLevel: string;
  redLevel: string;
  latitude: number;
  longitude: number;
  data: DamData[];
}

export interface DamsResponse {
  lastUpdate: string;
  dams: Dam[];
}
