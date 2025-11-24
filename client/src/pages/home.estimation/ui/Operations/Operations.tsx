import { UIBlock } from "@/shared/ui/Block";
import type { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { IMainState, TMainDispatch } from "@/app/store";
import { setOperations } from "@/app/store/slices/estimation";
import styles from "./Operations.module.scss";
import SvgSettings from "@/shared/assets/icons/settings.svg";

const FREQUENCY_OPTIONS = [
  { id: "1", name: "Частота 1" },
  { id: "2", name: "Частота 2" },
  { id: "3", name: "Частота 3" },
];

const MONITORING_SYSTEMS = [
  { id: "stationary", name: "Стационарные температурные датчики" },
  { id: "drone", name: "Тепловизионные дроны / аэросъемка" },
  { id: "portable", name: "Портативные пирометры" },
];

const PREVENTION_SYSTEMS = [
  { id: "sprinkler", name: "Система орошения / увлажнения" },
];

const MODES = [
  { id: "manual", name: "Ручной" },
  { id: "auto", name: "Автоматический" },
];

function Operations(): JSX.Element {
  const operations = useSelector(
    (state: IMainState) => state.estimation.operations
  );
  const dispatch = useDispatch<TMainDispatch>();

  const toggleSystem = (systemId: string) => {
    const current = operations?.monitSys || [];
    const updated = current.includes(systemId)
      ? current.filter((id) => id !== systemId)
      : [...current, systemId];
    dispatch(setOperations({ monitSys: updated }));
  };

  const safeOps = operations || {
    transFreq: "",
    tempFreq: "",
    monitSys: [],
    frequency: "",
    mode: "",
    isIncident: false,
  };

  return (
    <section style={{ width: "100%" }}>
      <UIBlock
        type="green"
        iconSrc={SvgSettings}
        headTxt="Операционные / Технологические параметры"
      >
        <div className={styles["block-body"]}>
          <div className={styles["block-body__ctx"]}>
            <div>
              <h4>Частота перевалки(Опционально)</h4>
              <select
                className={styles["select-params"]}
                value={safeOps.transFreq}
                onChange={(e) =>
                  dispatch(setOperations({ transFreq: e.target.value }))
                }
              >
                <option value="">Выберите частоту</option>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={`trans-${opt.id}`} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h4>Частота измерения температуры(Опционально)</h4>
              <select
                className={styles["select-params"]}
                value={safeOps.tempFreq}
                onChange={(e) =>
                  dispatch(setOperations({ tempFreq: e.target.value }))
                }
              >
                <option value="">Выберите частоту</option>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={`temp-${opt.id}`} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles["full-width"]}>
              <h4>Системы мониторинга(Опционально)</h4>
              <div className={styles["checkbox-group"]}>
                {MONITORING_SYSTEMS.map((sys) => (
                  <div key={`monitoring-${sys.id}`} className={styles["checkbox-item"]}>
                    <input
                      type="checkbox"
                      id={`sys-${sys.id}`}
                      checked={safeOps.monitSys.includes(sys.id)}
                      onChange={() => toggleSystem(sys.id)}
                      className={styles["checkbox"]}
                    />
                    <label
                      htmlFor={`sys-${sys.id}`}
                      className={styles["checkbox-label"]}
                    >
                      {sys.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles["full-width"]}>
              <h4>Системы предотвращения(Опционально)</h4>
              <div className={styles["checkbox-group"]}>
                {PREVENTION_SYSTEMS.map((sys) => (
                  <div key={`prev-${sys.id}`} className={styles["checkbox-item"]}>
                    <input
                      type="checkbox"
                      id={`sys-${sys.id}`}
                      checked={safeOps.monitSys.includes(sys.id)}
                      onChange={() => toggleSystem(sys.id)}
                      className={styles["checkbox"]}
                    />
                    <label
                      htmlFor={`sys-${sys.id}`}
                      className={styles["checkbox-label"]}
                    >
                      {sys.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4>Режим(Опционально)</h4>
              <select
                className={styles["select-params"]}
                value={safeOps.mode}
                onChange={(e) =>
                  dispatch(setOperations({ mode: e.target.value }))
                }
              >
                <option value="">Выберите режим</option>
                {MODES.map((opt) => (
                  <option key={`mode-${opt.id}`} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h4>Частота(Опционально)</h4>
              <input
                type="text"
                className={styles["select-params"]}
                value={safeOps.frequency}
                onChange={(e) =>
                  dispatch(setOperations({ frequency: e.target.value }))
                }
                placeholder="напр., каждые 6 часов"
              />
            </div>
          </div>
        </div>
      </UIBlock>
    </section>
  );
}

export default Operations;
