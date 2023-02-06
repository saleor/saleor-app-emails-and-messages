import { LinearProgress, Paper } from "@material-ui/core";
import React, { useEffect, useMemo, useState } from "react";
import { makeStyles } from "@saleor/macaw-ui";
import { AppConfigContainer } from "../app-config-container";
import { AppConfigurationForm } from "./app-configuration-form";
import { ChannelsList } from "./channels-list";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { AppColumnsLayout } from "../../ui/app-columns-layout";
import { Instructions } from "./instructions";
import { trpcClient } from "../../trpc/trpc-client";
import { MjmlConfigurationForm } from "../../mjml/configuration/ui/mjml-configuration-form";
import { MjmlConfigContainer } from "../../mjml/configuration/mjml-config-container";

const useStyles = makeStyles((theme) => {
  return {
    header: { marginBottom: 20 },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "start", gap: 40 },
    formContainer: {
      top: 0,
    },
    instructionsContainer: {
      padding: 15,
    },
    configurationColumn: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
    },
  };
});

export const ChannelsConfiguration = () => {
  const styles = useStyles();

  const { appBridge } = useAppBridge();

  const { data: configurationData, refetch: refetchConfig } =
    trpcClient.appConfiguration.fetch.useQuery();

  const { data: mjmlConfigurationData, refetch: mjmlRefetchConfig } =
    trpcClient.mjmlConfiguration.fetch.useQuery();

  const channels = trpcClient.channels.fetch.useQuery();

  const [activeChannelSlug, setActiveChannelSlug] = useState<string | null>(null);

  const { mutate, error: saveError } = trpcClient.appConfiguration.setAndReplace.useMutation({
    onSuccess() {
      refetchConfig();
      appBridge?.dispatch(
        actions.Notification({
          title: "Success",
          text: "Saved app configuration",
          status: "success",
        })
      );
    },
  });

  const { mutate: mjmlMutate, error: mjmlSaveError } =
    trpcClient.mjmlConfiguration.setAndReplace.useMutation({
      onSuccess() {
        mjmlRefetchConfig();
        appBridge?.dispatch(
          actions.Notification({
            title: "Success",
            text: "Saved mjml configuration",
            status: "success",
          })
        );
      },
    });

  useEffect(() => {
    if (channels.isSuccess) {
      setActiveChannelSlug(channels.data![0].slug ?? null);
    }
  }, [channels.isSuccess, channels.data]);

  const activeChannel = useMemo(() => {
    try {
      return channels.data!.find((c) => c.slug === activeChannelSlug)!;
    } catch (e) {
      return null;
    }
  }, [channels.data, activeChannelSlug]);

  if (channels.isLoading || !channels.data) {
    return <LinearProgress />;
  }

  if (!activeChannel) {
    return <div>Error. No channel available</div>;
  }

  return (
    <AppColumnsLayout>
      <ChannelsList
        channels={channels.data}
        activeChannelSlug={activeChannel.slug}
        onChannelClick={setActiveChannelSlug}
      />

      {activeChannel ? (
        <div className={styles.configurationColumn}>
          <Paper elevation={0} className={styles.formContainer}>
            <AppConfigurationForm
              channelID={activeChannel.id}
              key={activeChannelSlug}
              channelSlug={activeChannel.slug}
              onSubmit={async (data) => {
                const newConfig = AppConfigContainer.setChannelAppConfiguration(configurationData)(
                  activeChannel.slug
                )(data);

                mutate(newConfig);
              }}
              initialData={AppConfigContainer.getChannelAppConfiguration(configurationData)(
                activeChannel.slug
              )}
              channelName={activeChannel?.name ?? activeChannelSlug}
            />
            {saveError && <span>{saveError.message}</span>}
          </Paper>
          <Paper elevation={0} className={styles.formContainer}>
            <MjmlConfigurationForm
              channelID={activeChannel.id}
              key={activeChannelSlug}
              channelSlug={activeChannel.slug}
              onSubmit={async (data) => {
                const newConfig = MjmlConfigContainer.setChannelMjmlConfiguration(
                  mjmlConfigurationData
                )(activeChannel.slug)(data);

                mjmlMutate(newConfig);
              }}
              initialData={MjmlConfigContainer.getChannelMjmlConfiguration(mjmlConfigurationData)(
                activeChannel.slug
              )}
              channelName={activeChannel?.name ?? activeChannelSlug}
            />
            {mjmlSaveError && <span>{mjmlSaveError.message}</span>}
          </Paper>
        </div>
      ) : null}
      <Instructions />
    </AppColumnsLayout>
  );
};
