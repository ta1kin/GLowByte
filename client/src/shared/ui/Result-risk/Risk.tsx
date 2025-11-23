import type { JSX } from "react";
import styles from "./Risk.module.scss";

function UIRisk(): JSX.Element {
  return (
    <div className={styles["risk-result"]}>
      <div className={styles["level"]}>
        <p>Уровень риска</p>
        <div className={styles["risk-container"]}>
          <span className={styles["risk-badge"]}>СРЕДНИЙ</span>
        </div>
      </div>
      <div className={styles["probability"]}>
        <p>Расчетная вероятность</p>
        <div className={styles["probability-container"]}>
          <span className={styles["probability-badge"]}>45.5%</span>
        </div>
      </div>
      <div className={styles["horizont"]}>
        <p>Горизонт прогноза</p>
        <div className={styles["horizont-container"]}>
          <span className={styles["horizont-badge"]}>
            Риск в ближайшие 7 дней
          </span>
        </div>
      </div>
      <div className={styles["critical-time-first"]}>
        <p>Расчетное время до критического состояния</p>
        <div className={styles["critical-container1"]}>
          <span className={styles["critical-badge1"]}>
            Приблизительно 12-15 дней
          </span>
        </div>
      </div>
      <div className={styles["critical-time-second"]}>
        <p>Расчетное время до критического состояния</p>
        <div className={styles["critical-container2"]}>
          <span className={styles["critical-badge2"]}>
            <ul className={styles["dots"]}>
              <li>Увеличить частоту перевалки штабеля до каждых 5 дней</li>
              <li>Увеличить частоту перевалки штабеля до каждых 7 дней</li>
              <li>Увеличить частоту перевалки штабеля до каждых 10 дней</li>
            </ul>
          </span>
        </div>
      </div>
    </div>
  );
}

export default UIRisk;
