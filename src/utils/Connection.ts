import * as mqtt from "mqtt";
export type Payload = { topic: string; message: string };

export class Connection {
  // this class connect to emqx broker
  public client: mqtt.Client;
  private options: mqtt.IClientOptions;
  private host: string;
  private port: number;
  private username: string;
  private password: string;
  private clientId: string;
  private topic: string;

  constructor(
    host: string,
    port: number,
    username: string,
    password: string,
    clientId: string,
    topic: string
  ) {
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;
    this.clientId = clientId;
    this.topic = topic;
    this.options = {
      host: this.host,
      port: this.port,
      username: this.username,
      password: this.password,
      clientId: this.clientId,
      keepalive: 60,
      reconnectPeriod: 1000,
      protocolId: "MQIsdp",
      protocolVersion: 3,
      clean: true,
    };
    this.client = mqtt.connect(this.options);
  }

  mqttSub(subscription) {
    if (this.client) {
      const { topic, qos } = subscription;
      this.client.subscribe(topic, { qos }, (error) => {
        if (error) {
          console.log("Subscribe to topics error", error);
          return false;
        }
        return true;
      });
    }
    return false;
  }

  mqttUnSub(subscription) {
    if (this.client) {
      const { topic } = subscription;
      this.client.unsubscribe(topic, (error) => {
        if (error) {
          console.log("Unsubscribe error", error);
          return true;
        }
        return false;
      });
    }
    return true;
  }

  async mqttPublish(context) {
    if (this.client) {
      const { topic, qos, payload } = context;
      this.client.publish(topic, payload, { qos }, (error) => {
        if (error) {
          console.log("Publish error: ", error);
          return false;
        }
        return true;
      });
    }
    return false;
  }

  mqttDisconnect() {
    if (this.client) {
      this.client.end(undefined, undefined, () => {
        console.log("Disconnected");
        return true;
      });
    }
    return false;
  }
}
