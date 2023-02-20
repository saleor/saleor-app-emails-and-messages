import {
  makeStyles,
  OffsettedList,
  OffsettedListBody,
  OffsettedListItem,
  OffsettedListItemCell,
} from "@saleor/macaw-ui";
import clsx from "clsx";
import React from "react";

const useStyles = makeStyles((theme) => {
  return {
    listItem: {
      cursor: "pointer",
      height: "auto !important",
    },
    listItemActive: {
      border: `2px solid ${theme.palette.primary.main}`,
    },
    cellSlug: {
      fontFamily: "monospace",
      opacity: 0.8,
    },
  };
});

type Configurations = {
  name: string;
  id: string;
};

type Props = {
  configurations: Configurations[];
  activeConfigurationId?: string;
  onItemClick(configurationId?: string): void;
};

export const ConfigurationsList = ({
  configurations: channels,
  activeConfigurationId: activeChannelSlug,
  onItemClick: onChannelClick,
}: Props) => {
  const styles = useStyles();

  return (
    <OffsettedList gridTemplate={["1fr"]}>
      <OffsettedListBody>
        {channels.map((c) => {
          return (
            <OffsettedListItem
              className={clsx(styles.listItem, {
                [styles.listItemActive]: c.id === activeChannelSlug,
              })}
              key={c.id}
              onClick={() => {
                onChannelClick(c.id);
              }}
            >
              <OffsettedListItemCell>{c.name}</OffsettedListItemCell>
            </OffsettedListItem>
          );
        })}
        <OffsettedListItem
          className={clsx(styles.listItem, {
            [styles.listItemActive]: activeChannelSlug === undefined,
          })}
          key="new"
          onClick={() => {
            onChannelClick(undefined);
          }}
        >
          <OffsettedListItemCell>Create a new configuration</OffsettedListItemCell>
        </OffsettedListItem>
      </OffsettedListBody>
    </OffsettedList>
  );
};
