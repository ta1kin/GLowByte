import { UIBlock } from "@/shared/ui/Block";
import type { JSX } from "react";
import { useState } from "react";


import styles from "./Params.module.scss";

const MARK = [
  { id: "", name: "Выберите марку" },
  { id: "1", name: "Марка 1" },
  { id: "2", name: "Марка 2" },
  { id: "3", name: "Марка 3" },
];
const ASH = [
  { id: "", name: "0.0" },
  { id: "1", name: "0.1" },
  { id: "2", name: "0.2" },
  { id: "3", name: "0.3" },
];

function Params(): JSX.Element {
  const [mark, setMark] = useState<string>("");
  const [ash, setAsh] = useState<string>("");
  const [humidity, setHumidity] = useState<string>("");
  const [sulfur, setSulfur] = useState<string>("");
  const [fraction, setFraction] = useState<string>("");
  const [volume, setVolume] = useState<string>("");
  const [date, setDate] = useState<string>("");

  return (
    <section style={{ width: "100%" }}>
      <UIBlock type="orange" iconSrc="" headTxt="Параметры партии угля">
        <div className={styles["block-body"]}>
          <div className={styles["block-body__ctx"]}>
            <div>
              <h4>Марка / Тип угля</h4>
              <select
                className={styles["select-params"]}
                value={mark}
                onChange={(event: any) => setMark(event.target.value)}
                required
              >
                <option value="" disabled hidden>
                  Выберите марку
                </option>
                {MARK.filter((m) => m.id).map((mark) => (
                  <option key={mark.id} value={mark.id}>
                    {mark.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h4>Зольность, %</h4>
              <select
                className={styles["select-params"]}
                value={ash}
                onChange={(event: any) => setAsh(event.target.value)}
                required
              >
                <option value="" disabled hidden>
                  0.0
                </option>
                {ASH.filter((a) => a.id).map((ash) => (
                  <option key={ash.id} value={ash.id}>
                    {ash.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <h4>Влажность, %</h4>
              <input
                value={humidity || ""}
                onChange={(event: any) =>
                  setHumidity(event.target.value)
                }
                type="text"
                className={styles["select-params"]}
                placeholder="0.0"
           
              />
            </div>
            <div>
              <h4>Сера, %</h4>
              <input
                value={sulfur || ""}
                onChange={(event: any) => setSulfur(event.target.value)}
                type="text"
                className={styles["select-params"]}
                placeholder="0.0"
                
              />
            </div>

            <div>
              <h4>Размер частиц / фракция (мм)</h4>
              <input
                value={fraction || ""}
                onChange={(event: any) =>
                  setFraction(event.target.value)
                }
                type="text"
                className={styles["select-params"]}
                placeholder="0.0"
                
              />
            </div>

            <div>
              <h4>Объем партии, т</h4>
              <input
                value={volume || ""}
                onChange={(event: any) => setVolume(event.target.value)}
                type="text"
                className={styles["select-params"]}
                placeholder="0.0"
               
              />
            </div>

            <div className={ styles["full-width"] }>
              <h4>Дата начала хранения</h4>
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type="date"
                className={styles["select-params"] + " " + styles["input-date"]}
              />
            </div>
          </div>
        </div>
      </UIBlock>
    </section>
  );
}

export default Params;
