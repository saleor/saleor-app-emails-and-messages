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
import React, { useEffect } from "react";
import { SendgridConfiguration } from "../sendgrid-config";
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
  onSubmit(data: SendgridConfiguration): Promise<void>;
  initialData: SendgridConfiguration;
  configurationId?: string;
};

export const SendgridConfigurationForm = (props: Props) => {
  const { register, handleSubmit, control, setValue, getValues, reset } =
    useForm<SendgridConfiguration>({
      defaultValues: props.initialData,
    });

  // when the configuration tab is changed, initialData change and form has to be updated
  useEffect(() => {
    reset(props.initialData);
  }, [props.initialData]);

  const fetchTemplates = async () => {
    const response = await fetch(
      "https://api.sendgrid.com/v3/templates?generations=dynamic&page_size=18",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${props.initialData?.apiKey}`,
        },
      }
    );
    const resJson = (await response.json()) as {
      result?: { id: string; name: string }[];
    };
    const templates =
      resJson.result?.map((r) => ({
        value: r.id,
        label: r.name,
      })) || [];
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

  const CommonFieldProps: TextFieldProps = {
    className: styles.field,
    fullWidth: true,
  };

  const isNewConfiguration = !props.configurationId;

  return (
    <form
      onSubmit={handleSubmit((data, event) => {
        props.onSubmit(data);
      })}
      className={styles.form}
    >
      {isNewConfiguration ? (
        <Typography variant="h4" paragraph>
          Create a new configuration
        </Typography>
      ) : (
        <Typography variant="h4" paragraph>
          Configuration {props.initialData?.configurationName}
        </Typography>
      )}
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
      <TextField
        label="Configuration name"
        {...CommonFieldProps}
        {...register("configurationName")}
      />
      <TextField label="Sender name" {...CommonFieldProps} {...register("senderName")} />
      <TextField label="Sender email" {...CommonFieldProps} {...register("senderEmail")} />
      <TextField label="API Key" {...CommonFieldProps} {...register("apiKey")} />
      <TextField
        label="Order Created Email subject"
        {...CommonFieldProps}
        {...register("templateOrderCreatedSubject")}
      />

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
                  setValue(`templateOrderCreatedTemplate`, event.target.value as string);
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
                  setValue(`templateOrderFulfilledTemplate`, event.target.value as string);
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
        Save configuration
      </Button>
    </form>
  );
};
