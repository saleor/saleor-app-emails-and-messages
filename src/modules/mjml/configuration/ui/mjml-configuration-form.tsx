import { Controller, useForm } from "react-hook-form";
import { FormControlLabel, Switch, TextField, TextFieldProps, Typography } from "@material-ui/core";
import { Button, makeStyles } from "@saleor/macaw-ui";
import React from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { SellerShopConfig } from "../mjml-config";

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
  onSubmit(data: SellerShopConfig["mjmlConfiguration"]): Promise<void>;
  initialData?: SellerShopConfig["mjmlConfiguration"] | null;
};

export const MjmlConfigurationForm = (props: Props) => {
  const { register, handleSubmit, control, setValue, getValues } = useForm<
    SellerShopConfig["mjmlConfiguration"]
  >({
    defaultValues: props.initialData ?? undefined,
  });

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
        Configure MJML
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
      <TextField label="Sender name" {...CommonFieldProps} {...register("senderName")} />
      <TextField label="Sender email" {...CommonFieldProps} {...register("senderEmail")} />
      <TextField label="SMTP server host" {...CommonFieldProps} {...register("smtpHost")} />
      <TextField label="SMTP server port" {...CommonFieldProps} {...register("smtpPort")} />
      <TextField label="SMTP server user" {...CommonFieldProps} {...register("smtpUser")} />
      <Controller
        control={control}
        name="useTls"
        defaultValue={getValues("useTls")}
        render={({ field: { value, onChange } }) => {
          return (
            <FormControlLabel
              control={
                <Switch
                  value={value}
                  checked={value}
                  onChange={(event, val) => {
                    setValue(`useTls`, val);
                    return onChange(val);
                  }}
                />
              }
              label="Use TLS"
            />
          );
        }}
      />
      <Controller
        control={control}
        name="useSsl"
        defaultValue={getValues("useSsl")}
        render={({ field: { value, onChange } }) => {
          return (
            <FormControlLabel
              control={
                <Switch
                  value={value}
                  checked={value}
                  onChange={(event, val) => {
                    setValue(`useSsl`, val);
                    return onChange(val);
                  }}
                />
              }
              label="Use SSL"
            />
          );
        }}
      />
      <TextField
        label="Order Created Email subject"
        {...CommonFieldProps}
        {...register("templateOrderCreatedSubject")}
      />
      <TextField
        label="Order Created Email template"
        multiline={true}
        minRows={20}
        maxRows={50}
        {...CommonFieldProps}
        {...register("templateOrderCreatedTemplate")}
      />
      <TextField
        label="Order Fulfilled Email subject"
        {...CommonFieldProps}
        {...register("templateOrderFulfilledSubject")}
      />
      <TextField
        label="Order Fulfilled Email template"
        multiline={true}
        minRows={20}
        maxRows={50}
        {...CommonFieldProps}
        {...register("templateOrderFulfilledTemplate")}
      />

      <Button type="submit" fullWidth variant="primary">
        Save channel configuration
      </Button>
    </form>
  );
};
