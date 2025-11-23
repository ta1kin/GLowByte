import { UIBlock } from "@/shared/ui/Block";
import type { JSX } from "react";

import SvgWarn from "@/shared/assets/icons/warn.svg";
import { UIRisk } from "@/shared/ui/Result-risk";
import { UINoRisk } from "@/shared/ui/NoResult-risk";
import styles from "./Results.module.scss";

function Results(): JSX.Element {
  return (
    <section style={{ width: "100%" }} className={styles["results"]}>
      <UIBlock
        bordered="top"
        iconSrc={SvgWarn}
        headTxt="Результаты оценки риска"
      >
        <UIRisk />
      </UIBlock>

      <UIBlock
        bordered="top"
        iconSrc={SvgWarn}
        headTxt="Результаты оценки риска"
      >
        <UINoRisk />
      </UIBlock>
    </section>
  );
}

export default Results;
