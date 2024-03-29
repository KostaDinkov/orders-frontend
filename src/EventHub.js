import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import PubSub from "pubsub-js";

const hostName = process.env.REACT_APP_API_SERVER_URL;
const eventHubPath = process.env.REACT_APP_API_SERVER_EVENT_HUB_PATH;

export default class EventHub {
  constructor() {
    this.eventConnection = new HubConnectionBuilder()
      .withUrl(`${hostName}${eventHubPath}`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    if (this.eventConnection) {
      this.eventConnection.logging = true;
      this.eventConnection.start().then((result) => {
        this.eventConnection.on("UpdateOrders", (message) => {
          PubSub.publish("DBOrdersUpdated", message);
        });
      });
    }
  }

  sendUpdateOrders = () => {
    if (this.eventConnection.state === HubConnectionState.Connected) {
      this.eventConnection
        .invoke("UpdateClients")
        .catch((err) => console.log(err));
    }
  };
}
