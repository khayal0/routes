export interface RoutePoint {
  pointType: string;

  calculationType: string;

  spread: number;

  feeCost: number;

  tariffCostFixed: number;

  tariffCostVariable: number;

  finalCost: number;

  value: number;

  otmItm: "O|Itm";
}

export interface Route {
  routeId: number;

  routeName: string;

  source: number;

  points: RoutePoint[];
}

export interface OptionType {
  value: number;
  label: string;
}
