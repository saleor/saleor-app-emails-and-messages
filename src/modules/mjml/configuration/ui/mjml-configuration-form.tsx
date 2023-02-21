import { Controller, useForm } from "react-hook-form";
import { FormControlLabel, Switch, TextField, TextFieldProps, Typography } from "@material-ui/core";
import { Button, makeStyles } from "@saleor/macaw-ui";
import React, { useEffect } from "react";
import { MjmlConfiguration } from "../mjml-config";
import { MjmlEditor } from "./mjml-editor";
import { MjmlPreview } from "./mjml-preview";

const useStyles = makeStyles({
  field: {
    marginBottom: 20,
  },
  editor: {
    marginBottom: 20,
  },
  preview: {
    marginBottom: 20,
  },
  form: {
    padding: 20,
  },
});

type Props = {
  onSubmit(data: MjmlConfiguration): Promise<void>;
  initialData: MjmlConfiguration;
  configurationId?: string;
};

export const MjmlConfigurationForm = (props: Props) => {
  const { register, handleSubmit, control, setValue, getValues, reset } =
    useForm<MjmlConfiguration>({
      defaultValues: props.initialData,
    });

  // when the configuration tab is changed, initialData change and form has to be updated
  useEffect(() => {
    reset(props.initialData);
  }, [props.initialData]);

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

      <Typography variant="h4" paragraph>
        SMTP configuration
      </Typography>

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
        name="smtpHost"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="SMTP server host"
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        name="smtpPort"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="SMTP server port"
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        name="smtpUser"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextField
            label="SMTP server user"
            value={value}
            onChange={onChange}
            {...CommonFieldProps}
          />
        )}
      />

      <Controller
        control={control}
        name="useTls"
        render={({ field: { value, onChange } }) => {
          return (
            <FormControlLabel
              control={
                <Switch value={value} checked={value} onChange={(event, val) => onChange(val)} />
              }
              label="Use TLS"
            />
          );
        }}
      />
      <Controller
        control={control}
        name="useSsl"
        render={({ field: { value, onChange } }) => {
          return (
            <FormControlLabel
              control={
                <Switch value={value} checked={value} onChange={(event, val) => onChange(val)} />
              }
              label="Use SSL"
            />
          );
        }}
      />

      <Typography variant="h4" paragraph>
        Templates
      </Typography>
      <TextField
        label="Order Created Email subject"
        {...CommonFieldProps}
        {...register("templateOrderCreatedSubject")}
      />

      <Controller
        control={control}
        name="templateOrderCreatedTemplate"
        render={({ field: { value, onChange } }) => {
          return (
            <>
              <div className={styles.editor}>
                <MjmlEditor initialTemplate={value} value={value} onChange={onChange} />
              </div>
              <div className={styles.preview}>
                <MjmlPreview value={value} />
              </div>
            </>
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
        render={({ field: { value, onChange } }) => {
          return (
            <>
              <div className={styles.editor}>
                <MjmlEditor initialTemplate={value} value={value} onChange={onChange} />
              </div>
              <div className={styles.preview}>
                <MjmlPreview value={value} />{" "}
              </div>
            </>
          );
        }}
      />

      <TextField
        label="Order Confirmed Email subject"
        {...CommonFieldProps}
        {...register("templateOrderConfirmedSubject")}
      />
      <Controller
        control={control}
        name="templateOrderConfirmedTemplate"
        render={({ field: { value, onChange } }) => {
          return (
            <>
              <div className={styles.editor}>
                <MjmlEditor initialTemplate={value} value={value} onChange={onChange} />
              </div>
              <div className={styles.preview}>
                <MjmlPreview value={value} />{" "}
              </div>
            </>
          );
        }}
      />

      <TextField
        label="Order Cancelled Email subject"
        {...CommonFieldProps}
        {...register("templateOrderCancelledSubject")}
      />
      <Controller
        control={control}
        name="templateOrderCancelledTemplate"
        render={({ field: { value, onChange } }) => {
          return (
            <>
              <div className={styles.editor}>
                <MjmlEditor initialTemplate={value} value={value} onChange={onChange} />
              </div>
              <div className={styles.preview}>
                <MjmlPreview value={value} />{" "}
              </div>
            </>
          );
        }}
      />

      <TextField
        label="Order Fully Paid Email subject"
        {...CommonFieldProps}
        {...register("templateOrderFullyPaidSubject")}
      />
      <Controller
        control={control}
        name="templateOrderFullyPaidTemplate"
        render={({ field: { value, onChange } }) => {
          return (
            <>
              <div className={styles.editor}>
                <MjmlEditor initialTemplate={value} value={value} onChange={onChange} />
              </div>
              <div className={styles.preview}>
                <MjmlPreview value={value} />{" "}
              </div>
            </>
          );
        }}
      />

      <TextField
        label="Invoice Sent Email subject"
        {...CommonFieldProps}
        {...register("templateInvoiceSentSubject")}
      />
      <Controller
        control={control}
        name="templateInvoiceSentTemplate"
        render={({ field: { value, onChange } }) => {
          return (
            <>
              <div className={styles.editor}>
                <MjmlEditor initialTemplate={value} value={value} onChange={onChange} />
              </div>
              <div className={styles.preview}>
                <MjmlPreview value={value} />{" "}
              </div>
            </>
          );
        }}
      />

      <Button type="submit" fullWidth variant="primary">
        Save configuration
      </Button>
    </form>
  );
};
