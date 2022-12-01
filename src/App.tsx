import {
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Box,
  Stack,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Button,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import mqtt from "mqtt/dist/mqtt";

export type Payload = { topic: string; message?: string };
export type Context = Payload & { qos: number };

function App() {
  const [voltage, setVoltage] = useState("0");
  const [auto, setAuto] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [payload, setPayload] = useState<Payload>({
    topic: "",
    message: "",
  });
  const [messages, setMessages] = useState<any[]>([]);
  const [client, setClient] = useState<null | mqtt.MqttClient>(null);
  const [connectStatus, setConnectStatus] = useState("Disconnected");

  const mqttDisconnect = () => {
    if (client) {
      client.end(() => {
        setConnectStatus("Connect");
      });
    }
  };

  const mqttPublish = (context: Context) => {
    if (client) {
      const { topic, qos, payload } = context;
      client.publish(topic, payload, { qos }, (error) => {
        if (error) {
          console.log("Publish error: ", error);
        }
      });
    }
  };

  const mqttSub = (subscription: Context) => {
    if (client) {
      const { topic, qos } = subscription;
      client.subscribe(topic, { qos }, (error) => {
        if (error) {
          console.log("Subscribe to topics error", error);
          return;
        }
        //setIsSub(true)
      });
    }
  };

  const mqttUnSub = (subscription: Context) => {
    if (client) {
      const { topic } = subscription;
      client.unsubscribe(topic, (error) => {
        if (error) {
          console.log("Unsubscribe error", error);
          return;
        }
        //setIsSub(false);
      });
    }
  };

  useEffect(() => {
    const client = mqtt.connect("ws://broker.emqx.io:8083/mqtt");
    setClient(client);
    mqttSub({ topic: "rgb/control", qos: 0 });
    mqttSub({ topic: "ldr/data", qos: 0 });
    client.on("connect", () => setConnectStatus("Connected"));

    client.on("error", (err) => {
      console.error("Connection error: ", err);
      client.end();
      setConnectStatus("Disconnected");
    });
    client.on("reconnect", () => {
      setConnectStatus("Reconnecting...");
    });
    client.on("message", (topic, message) => {
      const payload = { topic, message };
      setPayload(payload);
      if (topic === "ldr/data") {
        setVoltage(message);
      }
    });
  }, []);

  const handleCheckChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const defaultPayload = {
      red: 1,
      green: 1,
      blue: 1,
    };

    mqttPublish({
      topic: "rgb/control",
      qos: 0,

      payload: JSON.stringify({ ...defaultPayload, [event.target.value]: 0 }),
    });
  };

  return (
    <Grid
      container
      sx={{
        height: "100vh",
        width: "100vw",
        padding: 0,
      }}
    >
      <Grid
        item
        sx={{
          width: "50%",
          mx: "auto",
          height: "max-content",
          padding: 3,
          mt: 3,
          border: "1px solid black",
          borderRadius: 2,
          bgcolor: "#fff",
        }}
      >
        <Typography variant="h1">IOT</Typography>
        <Typography variant="h6">Status: {connectStatus}</Typography>
        <Stack direction="row" sx={{ alignItems: "center" }}>
          <Box
            component="span"
            sx={{
              "&::before": {
                content: "''",
                display: "block",
                width: "35px",
                height: "35px",
                mr: 1,
                borderRadius: "50%",
                backgroundColor: voltage > 0 ? "green" : "red",
              },
            }}
          ></Box>
          <Typography variant="h4">{voltage}</Typography>
        </Stack>

        <FormControlLabel
          control={
            <Switch
              checked={auto}
              onChange={() => setAuto(!auto)}
              inputProps={{ "aria-label": "controlled" }}
            />
          }
          label="Automatic mode"
        />
        {auto && <pre>{JSON.stringify(payload, null, 2)}</pre>}
        {!auto && (
          <Box>
            <FormControl>
              <FormLabel id="led-form-group">Color</FormLabel>
              <RadioGroup
                row
                aria-labelledby="led-form-group"
                name="led-state"
                onChange={handleCheckChange}
              >
                <FormControlLabel value="red" control={<Radio />} label="Red" />
                <FormControlLabel
                  value="green"
                  control={<Radio />}
                  label="Green"
                />
                <FormControlLabel
                  value="blue"
                  control={<Radio />}
                  label="Blue"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        )}
      </Grid>
    </Grid>
  );
}

export default App;
