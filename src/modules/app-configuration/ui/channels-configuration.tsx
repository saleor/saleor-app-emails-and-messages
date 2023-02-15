import React from "react";
import { makeStyles, PageTab, PageTabs } from "@saleor/macaw-ui";
import { ChannelsConfigurationTab } from "./channels-configuration-tab";
import { MjmlConfigurationTab } from "./mjml-configuration-tab";
import { SendgridConfigurationTab } from "./sendgrid-configuration-tab";

const useStyles = makeStyles((theme) => {
  return {
    header: { marginBottom: 20 },
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
  const [activeTab, setActiveTab] = React.useState<Tab>("channels");

  const tabs = {
    channels: {
      component: <ChannelsConfigurationTab />,
      label: "Channels",
    },
    mjml: {
      component: <MjmlConfigurationTab />,
      label: "MJML",
    },
    sendgrid: {
      component: <SendgridConfigurationTab />,
      label: "Sendgrid",
    },
  };

  type Tab = keyof typeof tabs;

  return (
    <>
      <PageTabs value={activeTab} onChange={(value) => setActiveTab(value as Tab)}>
        {Object.entries(tabs).map(([key, config]) => (
          <PageTab key={key} value={key} label={config.label} />
        ))}
      </PageTabs>
      {tabs[activeTab].component}
    </>
  );
};
