import { UIBlock } from "@/shared/ui/Block";
import type { JSX } from "react";
import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import type { IMainState, TMainDispatch } from "@/app/store";
import { setParams } from "@/app/store/slices/estimation";

import SvgBox from "@/shared/assets/icons/box.svg";
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
  { id: "4", name: "0.4" },
  { id: "5", name: "0.5" },
 
];

function Params(): JSX.Element {
  const paramsState = useSelector((state: IMainState) => state.estimation);
  const dispatch = useDispatch<TMainDispatch>();

  const [date, setDate] = useState<string>("");

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <section style={{ width: "100%" }}>
      <UIBlock type="orange" iconSrc={SvgBox} headTxt="Параметры партии угля">
        <div className={styles["block-body"]}>
          <div className={styles["block-body__ctx"]}>
            <div>
              <h4>Марка (Опционально)</h4>
              <select
                className={styles["select-params"]}
                value={paramsState.params?.mark || ""}
                onChange={(event: any) =>
                  dispatch(setParams({ mark: event.target.value }))
                }
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
              <h4>Зольность,%(Опционально)</h4>
              <select
                className={styles["select-params"]}
                value={paramsState.params?.ash || ""}
                onChange={(event: any) =>
                  dispatch(setParams({ ash: event.target.value }))
                }
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
                value={paramsState.params?.humidity || ""}
                onChange={(event: any) =>
                  dispatch(setParams({ humidity: event.target.value }))
                }
                type="text"
                className={styles["select-params"]}
                placeholder="0.0"
              />
            </div>
            <div>
              <h4>Осадок, %</h4>
              <input
                value={paramsState.params?.sulfur || ""}
                onChange={(event: any) =>
                  dispatch(setParams({ sulfur: event.target.value }))
                }
                type="text"
                className={styles["select-params"]}
                placeholder="0.0"
              />
            </div>

            <div>
              <h4>Размер частиц (Опционально)</h4>
              <input
                value={paramsState.params?.fraction || ""}
                onChange={(event: any) =>
                  dispatch(setParams({ fraction: event.target.value }))
                }
                type="text"
                className={styles["select-params"]}
                placeholder="0.0"
              />
            </div>

            <div>
              <h4>Объем партии, (Опционально)</h4>
              <input
                value={paramsState.params?.volume || ""}
                onChange={(event: any) =>
                  dispatch(setParams({ volume: event.target.value }))
                }
                type="text"
                className={styles["select-params"]}
                placeholder="0.0"
              />
            </div>

            <div className={styles["full-width"]}>
              <h4>Дата начала хранения</h4>
              <input
                // value={formatDateForInput(paramsState.params?.date )}
                onChange={(e: any) =>
                  dispatch(setParams({ date: e.target.value }))
                }
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
