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
import { Payload, Connection } from "./utils/Connection";

function App() {
  const [voltage, setVoltage] = useState(0);
  const [auto, setAuto] = useState(true);

  const [payload, setPayload] = useState<Payload>({
    topic: "",
    message: "",
  });
  //const connection = new Connection("broker.emqx.io", 8083, "mqtt", "mqtt");
  const [client, setClient] = useState<null | mqtt.MqttClient>(null);
  const [connectStatus, setConnectStatus] = useState("Disconnected");
  const mqttConnect = (host: string, mqttOption?: mqtt.IClientOptions) => {
    setConnectStatus("Connecting");
    setClient(mqtt.connect(host, mqttOption));
  };

  useEffect(() => {
    if (client) {
      console.log(client);
      client.on("connect", () => {
        setConnectStatus("Connected");
      });
      client.on("error", (err) => {
        console.error("Connection error: ", err);
        client.end();
      });
      client.on("reconnect", () => {
        setConnectStatus("Reconnecting");
      });
      client.on("message", (topic, message) => {
        const payload = { topic, message: message.toString() };
        setPayload(payload);
      });
    }
  }, [client]);

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
          <Typography variant="h3">LDR voltage: {voltage}V</Typography>
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
        {auto && <pre>{JSON.stringify({ voltage, auto }, null, 2)}</pre>}
        {!auto && (
          <Box>
            <FormControl>
              <FormLabel id="led-form-group">Color</FormLabel>
              <RadioGroup row aria-labelledby="led-form-group" name="led-state">
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
