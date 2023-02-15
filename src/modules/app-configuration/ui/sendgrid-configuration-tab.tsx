import { LinearProgress, Paper } from "@material-ui/core";
import React, { useEffect, useMemo, useState } from "react";
import { makeStyles } from "@saleor/macaw-ui";
import { ChannelsList } from "./channels-list";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { AppColumnsLayout } from "../../ui/app-columns-layout";
import { trpcClient } from "../../trpc/trpc-client";
import { SendgridConfigurationForm } from "../../sendgrid/configuration/ui/sendgrid-configuration-form";
import { SendgridConfigContainer } from "../../sendgrid/configuration/sendgrid-config-container";

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
    },
  };
});

export const SendgridConfigurationTab = () => {
  const styles = useStyles();
  const { appBridge } = useAppBridge();

  const { data: configurationData, refetch: refetchConfig } =
    trpcClient.sendgridConfiguration.fetch.useQuery();

  const channels = trpcClient.channels.fetch.useQuery();

  const { mutate, error: saveError } = trpcClient.sendgridConfiguration.setAndReplace.useMutation({
    onSuccess() {
      refetchConfig();
      appBridge?.dispatch(
        actions.Notification({
          title: "Success",
          text: "Saved configuration",
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
            <SendgridConfigurationForm
              channelID={activeChannel.id}
              key={activeChannelSlug}
              channelSlug={activeChannel.slug}
              onSubmit={async (data) => {
                const newConfig = SendgridConfigContainer.setChannelSendgridConfiguration(
                  configurationData
                )(activeChannel.slug)(data);

                mutate(newConfig);
              }}
              initialData={SendgridConfigContainer.getChannelSendgridConfiguration(
                configurationData
              )(activeChannel.slug)}
              channelName={activeChannel?.name ?? activeChannelSlug}
            />
            {saveError && <span>{saveError.message}</span>}
          </Paper>
        </div>
      ) : null}
    </AppColumnsLayout>
  );
};
