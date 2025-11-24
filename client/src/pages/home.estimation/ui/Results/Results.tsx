import { useSelector } from 'react-redux';
import type { JSX } from "react";
import type{ IMainState } from "@/app/store/types";
import { UIBlock } from "@/shared/ui/Block";
import SvgWarn from "@/shared/assets/icons/warn.svg";
import { UIRisk } from "@/shared/ui/Result-risk";
import { UINoRisk } from "@/shared/ui/NoResult-risk";
import styles from "./Results.module.scss";

function Results(): JSX.Element {
  const result = useSelector((state: IMainState) => state.estimation.result);

  return (
    <section id="hest-res" style={{ width: "100%" }} className={styles["results"]}>
      <UIBlock
        bordered="top"
        iconSrc={SvgWarn}
        headTxt="Результаты оценки риска"
      >
        {result ? (
          <UIRisk
            riskLevel={result.sealingLevel}
            probEvent={result.predProb}
            horizonDays={result.horizonDays}
            predictedDateRange={result.critTime}
            recommendations={result.recommendations}
          />
        ) : (
          <UINoRisk />
        )}
      </UIBlock>
    </section>
  );
}

export default Results;