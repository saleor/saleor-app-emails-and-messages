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
    if (!props.initialData?.apiKey) {
      console.warn(
        "The Sendgrid API key has not been set up yet. Skipping fetching available templates."
      );
      return [];
    }
    const response = await fetch(
      "https://api.sendgrid.com/v3/templates?generations=dynamic&page_size=18",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${props.initialData?.apiKey}`,
        },
      }
    );
    if (!response.ok) {
      console.error("Could not fetch available Sendgrid templates");
      return [];
    }
    try {
      const resJson = (await response.json()) as {
        result?: { id: string; name: string }[];
      };
      const templates =
        resJson.result?.map((r) => ({
          value: r.id,
          label: r.name,
        })) || [];
      return templates;
    } catch (e) {
      console.error("Could not parse the response from Sendgrid", e);
      return [];
    }
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
                <Switch value={value} checked={value} onChange={(event, val) => onChange(val)} />
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
                <Switch value={value} checked={value} onChange={(event, val) => onChange(val)} />
              }
              label="Sandbox mode"
            />
          );
        }}
      />
      <Controller
        name="configurationName"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Configuration name"
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />
      <Controller
        name="senderName"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField label="Sender name" value={value} onChange={onChange} {...CommonFieldProps} />
        )}
      />
      <Controller
        name="senderEmail"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField label="Sender email" value={value} onChange={onChange} {...CommonFieldProps} />
        )}
      />
      <Controller
        name="apiKey"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField label="API key" value={value} onChange={onChange} {...CommonFieldProps} />
        )}
      />
      <Controller
        name="templateOrderCreatedSubject"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Order Created Email subject"
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        control={control}
        name="templateOrderCreatedTemplate"
        defaultValue={getValues("templateOrderCreatedTemplate")}
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl className={styles.field} fullWidth>
              <InputLabel>Template for Order Created</InputLabel>
              <Select
                variant="outlined"
                value={value}
                onChange={(event, val) => onChange(event.target.value)}
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

      <Controller
        name="templateOrderFulfilledSubject"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Order Fulfilled Email subject"
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        control={control}
        name="templateOrderFulfilledTemplate"
        defaultValue={getValues("templateOrderFulfilledTemplate")}
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl className={styles.field} fullWidth>
              <InputLabel>Template for Order Fulfilled</InputLabel>
              <Select
                variant="outlined"
                value={value}
                onChange={(event, val) => onChange(event.target.value)}
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

      <Controller
        name="templateOrderConfirmedSubject"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Order Confirmed Email subject"
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        control={control}
        name="templateOrderConfirmedTemplate"
        defaultValue={getValues("templateOrderConfirmedTemplate")}
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl className={styles.field} fullWidth>
              <InputLabel>Template for Order Confirmed</InputLabel>
              <Select
                variant="outlined"
                value={value}
                onChange={(event, val) => onChange(event.target.value)}
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

      <Controller
        name="templateOrderCancelledSubject"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Order Cancelled Email subject"
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        control={control}
        name="templateOrderCancelledTemplate"
        defaultValue={getValues("templateOrderCancelledTemplate")}
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl className={styles.field} fullWidth>
              <InputLabel>Template for Order Cancelled</InputLabel>
              <Select
                variant="outlined"
                value={value}
                onChange={(event, val) => onChange(event.target.value)}
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

      <Controller
        name="templateOrderFullyPaidSubject"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Order Fully Paid Email subject"
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        control={control}
        name="templateOrderFullyPaidTemplate"
        defaultValue={getValues("templateOrderFullyPaidTemplate")}
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl className={styles.field} fullWidth>
              <InputLabel>Template for Order Fully Paid</InputLabel>
              <Select
                variant="outlined"
                value={value}
                onChange={(event, val) => onChange(event.target.value)}
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

      <Controller
        name="templateInvoiceSentSubject"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Invoice sent Email subject"
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        control={control}
        name="templateInvoiceSentTemplate"
        defaultValue={getValues("templateInvoiceSentTemplate")}
        render={({ field: { value, onChange } }) => {
          return (
            <FormControl className={styles.field} fullWidth>
              <InputLabel>Template for Invoice Sent</InputLabel>
              <Select
                variant="outlined"
                value={value}
                onChange={(event, val) => onChange(event.target.value)}
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
