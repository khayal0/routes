import { useCallback, useEffect, useRef, useState } from "react";
import { OptionType, Route, RoutePoint } from "./types";
import RouteTable from "./components/RouteTable";
import useConnection from "./useConnection";
import "./App.css";
import { MultiSelect } from "react-multi-select-component";

const signalRMethodName = "ReceiveMessage";

const App = () => {
  const [selectedRouteOptions, setSelectedRouteOptions] = useState<
    OptionType[]
  >([]);
  const [selectedRoutes, setSelectedRoutes] = useState<OptionType[]>([]);
  const [routes, _setRoutes] = useState<Record<number, Route>>({});
  const routesRef = useRef(routes);
  const connectionRef = useConnection();

  const handleSetRoute = (message: Route) => {
    routesRef.current = { ...routesRef.current, [message.routeId]: message };
    _setRoutes(routesRef.current);
    setSelectedRouteOptions(
      Object.values(routesRef.current).map((route) => ({
        value: route.routeId,
        label: route.routeName,
      }))
    );
  };

  const checkIfPointUpdated = (
    existingPoint: RoutePoint,
    point: RoutePoint
  ) => {
    const keysPoint = Object.keys(point) as Array<keyof RoutePoint>;
    for (const key of keysPoint) {
      if (point[key] !== existingPoint[key]) {
        return true;
      }
    }
    return false;
  };

  const sortPoints = (routes: RoutePoint[]) => {
    const sortOrder = [
      "Day",
      "Month",
      "Quarter",
      "Season",
      "CalYear",
      "GasYear",
    ];

    routes.sort(
      (a, b) => sortOrder.indexOf(a.pointType) - sortOrder.indexOf(b.pointType)
    );
    return routes;
  };

  const getLatestUniquePoints = useCallback((points: RoutePoint[]) => {
    const seen = new Map();
    const result = [];

    for (let i = points.length - 1; i >= 0; i--) {
      const point = points[i];
      const key = `${point.calculationType}-${point.pointType}`;

      if (!seen.has(key)) {
        result.unshift(point);
        seen.set(key, true);
      }
    }

    return sortPoints(result);
  }, []);

  const handleAddMessage = useCallback(
    (message: Route) => {
      const existingRoute = routesRef.current[message.routeId];
      const uniqueNewPoints = getLatestUniquePoints(message.points);
      let uniqueCurrentPoints = routesRef.current[message.routeId]?.points;
      if (!existingRoute) {
        handleSetRoute({ ...message, points: uniqueNewPoints });
      } else {
        const newPoints: RoutePoint[] = [];
        for (const point of uniqueNewPoints) {
          const existingPoint = uniqueCurrentPoints.find(
            (item) =>
              item.calculationType === point.calculationType &&
              item.pointType === point.pointType
          );
          if (!existingPoint) {
            newPoints.push(point);
          } else {
            if (checkIfPointUpdated(existingPoint, point)) {
              uniqueCurrentPoints = uniqueCurrentPoints.filter((item) => {
                return item.pointType !== point.pointType;
              });
              newPoints.push(point);
            }
          }
        }
        if (newPoints.length > 0) {
          const updatedPoints = sortPoints([
            ...uniqueCurrentPoints,
            ...newPoints,
          ]);
          const updatedState = {
            ...routesRef.current,
            [message.routeId]: {
              ...routesRef.current[message.routeId],
              points: updatedPoints,
            },
          };
          routesRef.current = updatedState;
          _setRoutes(routesRef.current);
        }
      }
    },
    [getLatestUniquePoints]
  );

  useEffect(() => {
    const connection = connectionRef.current;
    connection?.on(signalRMethodName, (message: Route) => {
      handleAddMessage(message);
    });
    return () => {
      connection?.stop();
    };
  }, [connectionRef, handleAddMessage]);

  const handleSelectChange = (value: OptionType[]) => {
    setSelectedRoutes(value);
  };

  return (
    <div>
      <MultiSelect
        options={selectedRouteOptions}
        value={selectedRoutes}
        onChange={handleSelectChange}
        labelledBy="Select"
      />
      {selectedRoutes.map((routeOption) => (
        <RouteTable
          key={routes[routeOption.value]?.routeId}
          routeData={routes[routeOption.value]}
        />
      ))}
    </div>
  );
};

export default App;
