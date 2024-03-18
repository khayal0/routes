import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { useEffect, useRef } from "react";

const url = "http://86.183.144.249:5000/routes";

const useConnection = () => {
  const connectionRef = useRef<HubConnection | null>(null);
  useEffect(() => {
    const createConnection = async () => {
      const connection = new HubConnectionBuilder().withUrl(url).build();

      connection.start().catch((err: string) => {
        console.log("Error while starting the connection: ", err);
      });
      connectionRef.current = connection;
    };
    createConnection();
  }, []);

  return connectionRef;
};
export default useConnection;
