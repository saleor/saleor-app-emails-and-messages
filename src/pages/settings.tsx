import TextField from "@material-ui/core/TextField";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { SALEOR_AUTHORIZATION_BEARER_HEADER, SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import { ConfirmButton, ConfirmButtonTransitionState, makeStyles } from "@saleor/macaw-ui";
import { SyntheticEvent, useEffect, useState } from "react";
import { Navigation } from "../components/navigation";
import { SettingsApiResponse, SettingsUpdateApiRequest } from "./api/configuration";

const useStyles = makeStyles((theme) => ({
  confirmButton: {
    marginLeft: "auto",
  },
  fieldContainer: {
    marginBottom: theme.spacing(2),
  },
}));

const SettingsPage = () => {
  const { appBridgeState, appBridge } = useAppBridge();
  const [transitionState, setTransitionState] = useState<ConfirmButtonTransitionState>("loading");
  const [smtpHost, setSMTPHost] = useState("localhost");
  const [smtpPort, setSMTPPort] = useState("1025");

  const classes = useStyles();

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setTransitionState("loading");

    const newSettings: SettingsUpdateApiRequest = {
      mailhog: { smtpHost, smtpPort },
      client: "mailhog",
      isActive: true,
    };

    const response = await fetch("/api/configuration", {
      method: "POST",
      headers: [
        ["content-type", "application/json"],
        [SALEOR_DOMAIN_HEADER, appBridgeState?.domain!],
        [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
      ],
      body: JSON.stringify(newSettings),
    });

    if (response.status === 200) {
      setTransitionState("success");
      const { data } = (await response.json()) as SettingsApiResponse;

      if (data?.mailhog) {
        setSMTPHost(data.mailhog.smtpHost);
        setSMTPPort(data.mailhog.smtpPort);
      }

      appBridge?.dispatch({
        type: "notification",
        payload: {
          status: "success",
          title: "Success",
          text: "Settings updated successfully",
          actionId: "submit-success",
        },
      });
    } else {
      setTransitionState("error");
      appBridge?.dispatch({
        type: "notification",
        payload: {
          status: "error",
          title: "Error",
          text: `Updating the settings unsuccessful. The API responded with status ${response.status}`,
          actionId: "submit-success",
        },
      });
    }
  };

  useEffect(() => {
    setTransitionState("loading");

    const fetchConfiguration = async () => {
      const response = await fetch("/api/configuration", {
        method: "GET",
        headers: [
          ["content-type", "application/json"],
          [SALEOR_DOMAIN_HEADER, appBridgeState?.domain!],
          [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
        ],
      });

      setTransitionState("default");

      const { data } = (await response.json()) as SettingsApiResponse;
      if (data?.mailhog) {
        setSMTPHost(data.mailhog.smtpHost);
        setSMTPPort(data.mailhog.smtpPort);
      }
    };

    fetchConfiguration();
  }, [appBridgeState?.token, appBridgeState?.domain]);

  return (
    <>
      <Navigation />
      <article>
        <h1>Mailhog settings</h1>
        <p>Requests are send via SMTP</p>
        {appBridgeState?.ready ? (
          <form onSubmit={handleSubmit}>
            <div className={classes.fieldContainer}>
              <TextField
                label="Host"
                name="smtpHost"
                onChange={(e) => {
                  setSMTPHost(e.target.value);
                }}
                fullWidth
                value={smtpHost}
                disabled={transitionState === "loading"}
              />
            </div>
            <div className={classes.fieldContainer}>
              <TextField
                label="Port"
                name="smtpPort"
                onChange={(e) => {
                  setSMTPPort(e.target.value);
                }}
                fullWidth
                value={smtpPort}
                disabled={transitionState === "loading"}
              />
            </div>
            <div>
              <ConfirmButton
                type="submit"
                variant="primary"
                transitionState={transitionState}
                labels={{
                  confirm: "Save",
                  error: "Error",
                }}
                className={classes.confirmButton}
              />
            </div>
          </form>
        ) : (
          <p>Install this app in your Dashboard and check extra powers!</p>
        )}
      </article>
    </>
  );
};

export default SettingsPage;
