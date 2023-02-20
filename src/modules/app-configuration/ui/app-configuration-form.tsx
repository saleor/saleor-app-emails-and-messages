import { SellerShopConfig } from "../app-config";
import { Controller, useForm } from "react-hook-form";
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextFieldProps,
  Typography,
} from "@material-ui/core";
import { Button, makeStyles } from "@saleor/macaw-ui";
import React, { useEffect } from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";

const useStyles = makeStyles({
  field: {
    marginBottom: 20,
  },
  form: {
    padding: 20,
  },
  channelName: {
    fontFamily: "monospace",
    cursor: "pointer",
  },
});

type Props = {
  channelSlug: string;
  channelName: string;
  channelID: string;
  mjmlConfigurationChoices: { label: string; value: string }[];
  sendgridConfigurationChoices: { label: string; value: string }[];
  onSubmit(data: SellerShopConfig["appConfiguration"]): Promise<void>;
  initialData?: SellerShopConfig["appConfiguration"] | null;
};

export const AppConfigurationForm = (props: Props) => {
  const { handleSubmit, getValues, setValue, control, reset } = useForm<
    SellerShopConfig["appConfiguration"]
  >({
    defaultValues: props.initialData ?? undefined,
  });

  useEffect(() => {
    reset(props.initialData || undefined);
  }, [props.initialData]);

  const styles = useStyles();
  const { appBridge } = useAppBridge();

  const CommonFieldProps: TextFieldProps = {
    className: styles.field,
    fullWidth: true,
  };

  const handleChannelNameClick = () => {
    appBridge?.dispatch(
      actions.Redirect({
        to: `/channels/${props.channelID}`,
      })
    );
  };

  return (
    <form
      onSubmit={handleSubmit((data, event) => {
        props.onSubmit(data);
      })}
      className={styles.form}
    >
      <Typography variant="body1" paragraph>
        Configure
        <strong onClick={handleChannelNameClick} className={styles.channelName}>
          {` ${props.channelName} `}
        </strong>
        channel:
      </Typography>
      <Controller
        control={control}
        name="active"
        defaultValue={getValues("active")}
        render={({ field: { value, onChange } }) => {
          return (
            <FormControlLabel
              control={
                <Switch
                  value={value}
                  checked={value}
                  onChange={(event, val) => {
                    setValue(`active`, val);
                    return onChange(val);
                  }}
                />
              }
              label="Active"
            />
          );
        }}
      />

      <Controller
        control={control}
        name="mjmlConfigurationId"
        defaultValue={getValues("mjmlConfigurationId")}
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl className={styles.field} fullWidth>
              <InputLabel id="demo-simple-select-label">MJML Configuration</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                variant="outlined"
                value={value}
                onChange={(event, val) => {
                  setValue("mjmlConfigurationId", event.target.value as string);
                  return onChange(event.target.value);
                }}
              >
                {props.mjmlConfigurationChoices.map((choice) => (
                  <MenuItem key={choice.value} value={choice.value}>
                    {choice.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        }}
      />

      <Controller
        control={control}
        name="sendgridConfigurationId"
        defaultValue={getValues("sendgridConfigurationId")}
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl className={styles.field} fullWidth>
              <InputLabel id="demo-simple-select-label">Sendgrid Configuration</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                variant="outlined"
                value={value}
                onChange={(event, val) => {
                  setValue("sendgridConfigurationId", event.target.value as string);
                  return onChange(event.target.value);
                }}
              >
                {props.sendgridConfigurationChoices.map((choice) => (
                  <MenuItem key={choice.value} value={choice.value}>
                    {choice.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        }}
      />
      <Button type="submit" fullWidth variant="primary">
        Save channel configuration
      </Button>
    </form>
  );
};
