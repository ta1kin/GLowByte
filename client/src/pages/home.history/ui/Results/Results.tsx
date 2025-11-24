import { UIBlock } from "@/shared/ui/Block";
import { useSelector } from "react-redux";
import type { JSX } from "react";
import type { IMainState } from "@/app/store";

import SvgSearch from "@/shared/assets/icons/search.svg";
import styles from "./Results.module.scss";

const results = [
  {
    date: "2025-11-15",
    warehouse: "Склад А площадка 3",
    mark: "Марка A",
    params: "B: 10.5м, Д: 45м, Ш: 20м",
    weather: "T: 28°C, В: 65%, Ветер: 3.2м/с",
    incident: true,
    risk: "ВЫСОКИЙ",
  },
  {
    date: "2025-11-15",
    warehouse: "Склад А площадка 3",
    mark: "Марка A",
    params: "B: 10.5м, Д: 45м, Ш: 20м",
    weather: "T: 28°C, В: 65%, Ветер: 3.2м/с",
    incident: false,
    risk: "СРЕДНИЙ",
  },
  {
    date: "2025-11-15",
    warehouse: "Склад А площадка 3",
    mark: "Марка A",
    params: "B: 10.5м, Д: 45м, Ш: 20м",
    weather: "T: 28°C, В: 65%, Ветер: 3.2м/с",
    incident: true,
    risk: "КРИТИЧЕСКИЙ",
  },
  {
    date: "2025-11-15",
    warehouse: "Склад А площадка 3",
    mark: "Марка A",
    params: "B: 10.5м, Д: 45м, Ш: 20м",
    weather: "T: 28°C, В: 65%, Ветер: 3.2м/с",
    incident: false,
    risk: "НИЗКИЙ",
  },
  {
    date: "2025-11-15",
    warehouse: "Склад А площадка 3",
    mark: "Марка A",
    params: "B: 10.5м, Д: 45м, Ш: 20м",
    weather: "T: 28°C, В: 65%, Ветер: 3.2м/с",
    incident: false,
    risk: "ВЫСОКИЙ",
  },
];

const getRiskColor = (risk: string): string => {
  switch (risk) {
    case "ВЫСОКИЙ":
      return "#FF5252";
    case "СРЕДНИЙ":
      return "#FF9800";
    case "НИЗКИЙ":
      return "#FFEB3B";
    case "КРИТИЧЕСКИЙ":
      return "#D32F2F";
    default:
      return "#ccc";
  }
};

function Results(): JSX.Element {
  const histResult = useSelector((state: IMainState) => state.history.result)

  return (
    <section style={{ width: "100%" }}>
      <UIBlock
        type="green"
        iconSrc={SvgSearch}
        headTxt="Результаты поиска"
        lowTxt="Найдено случаев: 5"
      >
        <div className={styles["block-body"]}>
          <h6>Склад / Площадка</h6>

          {/* Таблица — видна только на десктопе */}
          <table className={styles["block-body__ctx"]}>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Склад</th>
                <th>Марка угля</th>
                <th>Параметры штабеля</th>
                <th>Снимок погоды</th>
                <th>Инцидент?</th>
                <th>Уровень риска</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>{item.warehouse}</td>
                  <td>{item.mark}</td>
                  <td>{item.params}</td>
                  <td>{item.weather}</td>
                  <td>
                    <span
                      className={item.incident ? styles["incident-yes"] : ""}
                      style={{
                        color: item.incident ? "white" : "black",
                        border: item.incident
                          ? "1px solid red"
                          : "1px solid #F2F2F2",
                        borderRadius: "15px",
                        padding: "10px",
                        backgroundColor: item.incident ? "red" : "#F2F2F2",
                      }}
                    >
                      {item.incident ? "ДА" : "НЕТ"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={styles["risk-badge"]}
                      style={{
                        backgroundColor: getRiskColor(item.risk),
                        borderRadius: "15px",
                        padding: "10px",
                      }}
                    >
                      {item.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            {results.map((item, index) => (
              <div key={index} className={styles["mobile-card"]}>
                <div className={styles["card-row"]}>
                  <span className={styles["label"]}>Дата:</span>
                  <span className={styles["value"]}>{item.date}</span>
                </div>
                <div className={styles["card-row"]}>
                  <span className={styles["label"]}>Склад:</span>
                  <span className={styles["value"]}>{item.warehouse}</span>
                </div>
                <div className={styles["card-row"]}>
                  <span className={styles["label"]}>Марка:</span>
                  <span className={styles["value"]}>{item.mark}</span>
                </div>
                <div className={styles["card-row"]}>
                  <span className={styles["label"]}>Параметры:</span>
                  <span className={styles["value"]}>{item.params}</span>
                </div>
                <div className={styles["card-row"]}>
                  <span className={styles["label"]}>Погода:</span>
                  <span className={styles["value"]}>{item.weather}</span>
                </div>
                <div className={styles["card-row"]}>
                  <span className={styles["label"]}>Инцидент:</span>
                  <span
                    className={`${styles["value"]} ${
                      item.incident ? styles["incident-yes"] : ""
                    }`}
                  >
                    {item.incident ? "ДА" : "НЕТ"}
                  </span>
                </div>
                <div className={styles["card-row"]}>
                  <span className={styles["label"]}>Риск:</span>
                  <span
                    className={styles["risk-badge"]}
                    style={{ backgroundColor: getRiskColor(item.risk) }}
                  >
                    {item.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </UIBlock>
    </section>
  );
}

export default Results;
