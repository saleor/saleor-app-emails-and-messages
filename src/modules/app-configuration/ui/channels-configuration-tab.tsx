import { CircularProgress, Paper } from "@material-ui/core";
import React, { useEffect, useMemo, useState } from "react";
import { makeStyles } from "@saleor/macaw-ui";
import { AppConfigContainer } from "../app-config-container";
import { AppConfigurationForm } from "./app-configuration-form";
import { ChannelsList } from "./channels-list";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { AppColumnsLayout } from "../../ui/app-columns-layout";
import { trpcClient } from "../../trpc/trpc-client";

const useStyles = makeStyles((theme) => {
  return {
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
      maxWidth: 600,
    },
    loaderContainer: {
      margin: "50px auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };
});

export const ChannelsConfigurationTab = () => {
  const styles = useStyles();
  const { appBridge } = useAppBridge();
  const [mjmlConfigurationsListData, setMjmlConfigurationsListData] = useState<
    { label: string; value: string }[]
  >([]);

  const [sendgridConfigurationsListData, setSendgridConfigurationsListData] = useState<
    { label: string; value: string }[]
  >([]);

  const { data: configurationData, refetch: refetchConfig } =
    trpcClient.appConfiguration.fetch.useQuery();

  trpcClient.mjmlConfiguration.fetch.useQuery(undefined, {
    onSuccess(data) {
      const keys = Object.keys(data.availableConfigurations);

      setMjmlConfigurationsListData(
        keys.map((key) => ({
          value: key,
          label: data.availableConfigurations[key].configurationName,
        }))
      );
    },
  });

  trpcClient.sendgridConfiguration.fetch.useQuery(undefined, {
    onSuccess(data) {
      const keys = Object.keys(data.availableConfigurations);

      setSendgridConfigurationsListData(
        keys.map((key) => ({
          value: key,
          label: data.availableConfigurations[key].configurationName,
        }))
      );
    },
  });

  const channels = trpcClient.channels.fetch.useQuery();

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

  const [activeChannelSlug, setActiveChannelSlug] = useState<string | null>(null);

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
    return (
      <div className={styles.loaderContainer}>
        <CircularProgress color="primary" />
      </div>
    );
  }

  if (!activeChannel) {
    return <div>Error. No channel available</div>;
  }

  return (
    <AppColumnsLayout>
      <ChannelsList
        channels={channels.data}
        activeChannelSlug={activeChannel.slug}
        onChannelClick={(slug) => {
          setActiveChannelSlug(slug);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
      {activeChannel ? (
        <div className={styles.configurationColumn}>
          <Paper elevation={0} className={styles.formContainer}>
            <AppConfigurationForm
              channelID={activeChannel.id}
              key={activeChannelSlug}
              channelSlug={activeChannel.slug}
              mjmlConfigurationChoices={mjmlConfigurationsListData}
              sendgridConfigurationChoices={sendgridConfigurationsListData}
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
        </div>
      ) : null}
    </AppColumnsLayout>
  );
};
