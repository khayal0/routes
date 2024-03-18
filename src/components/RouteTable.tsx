import React from "react";
import { Route } from "../types";

interface RouteTableProps {
  routeData: Route;
}

const RouteTable: React.FC<RouteTableProps> = ({ routeData }) => {
  return (
    <div className="route-table">
      <h3 className="route-table__name">{routeData?.routeName}</h3>
      <table>
        <thead>
          <tr>
            <th>Point Type</th>
            <th>Calculation Type</th>
            <th>Spread</th>
            <th>Fee Cost</th>
            <th>Tariff Cost Fixed</th>
            <th>Tariff Cost Variable</th>
            <th>Final Cost</th>
            <th>Value</th>
            <th>OTM/ITM</th>
          </tr>
        </thead>
        <tbody>
          {routeData?.points.map((point) => (
            <tr key={`${point.pointType}-${point.calculationType}`}>
              <td>{point.pointType}</td>
              <td>{point.calculationType}</td>
              <td>{point.spread}</td>
              <td>{point.feeCost}</td>
              <td>{point.tariffCostFixed}</td>
              <td>{point.tariffCostVariable}</td>
              <td>{point.finalCost}</td>
              <td>{point.value}</td>
              <td>{point.otmItm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RouteTable;
