import type { JSX } from "react";
import { ESealingLevel } from "@/app/store/slices/types";
import styles from "./Risk.module.scss";

interface UIRiskProps {
  riskLevel: ESealingLevel;
  probEvent: number;
  horizonDays: number;
  predictedDateRange?: string;
  recommendations?: string[];
}

function UIRisk({
  riskLevel,
  probEvent,
  horizonDays,
  predictedDateRange,
  recommendations = [],
}: UIRiskProps): JSX.Element {
  const riskTextMap: Record<ESealingLevel, string> = {
    [ESealingLevel.LOW]: "НИЗКИЙ",
    [ESealingLevel.MEDIUM]: "СРЕДНИЙ",
    [ESealingLevel.HIGH]: "ВЫСОКИЙ",
    [ESealingLevel.CRITICAL]: "КРИТИЧЕСКИЙ",
  };

  const riskText = riskTextMap[riskLevel] || "НЕИЗВЕСТНО";
  const probPercent = `${(probEvent * 100).toFixed(1)}%`;

  return (
    <div className={styles["risk-result"]}>
      <div className={styles["level"]}>
        <p>Уровень риска</p>
        <div className={styles["risk-container"]}>
          <span className={styles["risk-badge"]}>{riskText}</span>
        </div>
      </div>

      <div className={styles["probability"]}>
        <p>Расчетная вероятность</p>
        <div className={styles["probability-container"]}>
          <span className={styles["probability-badge"]}>{probPercent}</span>
        </div>
      </div>

      <div className={styles["horizont"]}>
        <p>Горизонт прогноза</p>
        <div className={styles["horizont-container"]}>
          <span className={styles["horizont-badge"]}>
            Риск в ближайшие 3 дня
          </span>
        </div>
      </div>

      {/* {predictedDateRange && (
        <div className={styles["critical-time-first"]}>
          <p>Расчетное время до критического состояния</p>
          <div className={styles["critical-container1"]}>
            <span className={styles["critical-badge1"]}>
              {predictedDateRange}
            </span>
          </div>
        </div>
      )} */}

      {recommendations.length > 0 && (
        <div className={styles["critical-time-second"]}>
          <p>Рекомендации</p>
          <div className={styles["critical-container2"]}>
            <span className={styles["critical-badge2"]}>
              <ul className={styles["dots"]}>
                {recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default UIRisk;
