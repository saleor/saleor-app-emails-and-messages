import { Controller, useForm } from "react-hook-form";
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  TextFieldProps,
  Typography,
} from "@material-ui/core";
import { Button, makeStyles } from "@saleor/macaw-ui";
import React from "react";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { SellerShopConfig } from "../sendgrid-config";
import { useQuery } from "@tanstack/react-query";

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
  onSubmit(data: SellerShopConfig["sendgridConfiguration"]): Promise<void>;
  initialData?: SellerShopConfig["sendgridConfiguration"] | null;
};

export const SendgridConfigurationForm = (props: Props) => {
  const { register, handleSubmit, control, setValue, getValues } = useForm<
    SellerShopConfig["sendgridConfiguration"]
  >({
    defaultValues: props.initialData ?? undefined,
  });

  const fetchTemplates = async () => {
    console.log("key", props.initialData?.apiKey);
    const res = await fetch(
      "https://api.sendgrid.com/v3/templates?generations=dynamic&page_size=18",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${props.initialData?.apiKey}`,
        },
      }
    );
    const resJson = await res.json();
    console.log(resJson);
    const templates =
      resJson.result?.map((r) => ({ value: r.id, label: r.name })) ||
      ([] as {
        value: string;
        label: string;
      }[]);
    return templates;
  };

  const {
    data: templateChoices,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["sendgridTemplates"],
    queryFn: fetchTemplates,
    enabled: !!props.initialData?.apiKey.length,
  });

  console.log(isLoading, templateChoices, error);

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
        Configure Sendgrid
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
        name="sandboxMode"
        defaultValue={getValues("sandboxMode")}
        render={({ field: { value, onChange } }) => {
          return (
            <FormControlLabel
              control={
                <Switch
                  value={value}
                  checked={value}
                  onChange={(event, val) => {
                    setValue(`sandboxMode`, val);
                    return onChange(val);
                  }}
                />
              }
              label="Sandbox mode"
            />
          );
        }}
      />
      <TextField label="Sender name" {...CommonFieldProps} {...register("senderName")} />
      <TextField label="Sender email" {...CommonFieldProps} {...register("senderEmail")} />
      <TextField label="API Key" {...CommonFieldProps} {...register("apiKey")} />
      <TextField
        label="Order Created Email subject"
        {...CommonFieldProps}
        {...register("templateOrderCreatedSubject")}
      />
      {/* <TextField
        label="Order Created Email template"
        multiline={true}
        minRows={20}
        maxRows={50}
        {...CommonFieldProps}
        {...register("templateOrderCreatedTemplate")}
      /> */}

      <Controller
        control={control}
        name="templateOrderCreatedTemplate"
        defaultValue={getValues("templateOrderCreatedTemplate")}
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl className={styles.field} fullWidth>
              <InputLabel id="demo-simple-select-label">Template for Order Created</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                variant="outlined"
                value={value}
                onChange={(event, val) => {
                  setValue(`templateOrderCreatedTemplate`, event.target.value);
                  return onChange(event.target.value);
                }}
              >
                {!!templateChoices?.length &&
                  templateChoices.map((choice) => (
                    <MenuItem key={choice.value} value={choice.value}>
                      {choice.label}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          );
        }}
      />
      <TextField
        label="Order Fulfilled Email subject"
        {...CommonFieldProps}
        {...register("templateOrderFulfilledSubject")}
      />
      <Controller
        control={control}
        name="templateOrderFulfilledTemplate"
        defaultValue={getValues("templateOrderFulfilledTemplate")}
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl className={styles.field} fullWidth>
              <InputLabel id="demo-simple-select-label">Template for Order Fulfilled</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                variant="outlined"
                value={value}
                onChange={(event, val) => {
                  setValue(`templateOrderFulfilledTemplate`, event.target.value);
                  return onChange(event.target.value);
                }}
              >
                {!!templateChoices?.length &&
                  templateChoices.map((choice) => (
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
