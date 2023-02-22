import { makeStyles } from "@saleor/macaw-ui";
import { PropsWithChildren } from "react";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gridTemplateColumns: "280px auto",
    alignItems: "start",
    gap: 32,
    maxWidth: 1180,
    margin: "0 auto",
    padding: '50px 0',
  },
});

type Props = PropsWithChildren<{}>;

export const AppColumnsLayout = ({ children }: Props) => {
  const styles = useStyles();

  return <div className={styles.root}>{children}</div>;
};
