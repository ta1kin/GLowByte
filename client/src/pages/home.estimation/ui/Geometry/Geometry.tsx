import { UIBlock } from "@/shared/ui/Block";
import type { JSX } from "react";
import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import type { IMainState, TMainDispatch } from "@/app/store";
import { setGeometry } from "@/app/store/slices/estimation";


import SvgBoxStroke from "@/shared/assets/icons/box-stroke.svg";
import styles from "./Geometry.module.scss";

const MARK = [
  { id: "", name: "Выберите марку" },
  { id: "1", name: "Марка 1" },
  { id: "2", name: "Марка 2" },
  { id: "3", name: "Марка 3" },
];

const FORM = [
  { id: "", name: "Выберите форму" },
  { id: "1", name: "Форма 1" },
  { id: "2", name: "Форма 2" },
  { id: "3", name: "Форма 3" },
];

const LEVEL = [
  { id: "", name: "Выберите уровень" },
  { id: "1", name: "Уровень 1" },
  { id: "2", name: "Уровень 2" },
  { id: "3", name: "Уровень 3" },
];

const COVERING = [
  { id: "1", name: "Траншея" },
  { id: "2", name: "Покрытия" },
  { id: "3", name: "Гидроизолирующие покрытия" },
];

function Geometry(): JSX.Element {

  const geometryState = useSelector((state: IMainState) => state.estimation);
  const dispatch = useDispatch<TMainDispatch>();



  return (
    <section style={{ width: "100%" }}>
      <UIBlock
        type="violet"
        iconSrc={SvgBoxStroke}
        headTxt="Геометрия штабеля и условия хранения"
      >
        <div className={styles["block-body"]}>
          <div className={styles["block-body__ctx"]}>
            <div>
              <h4>Тип (Опционально)</h4>
              <select
                className={styles["select-params"]}
                value={geometryState.geometry?.type || ""}
                onChange={(event: any) => dispatch(setGeometry({ type: event.target.value }))}
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
              <h4>Высота штабеля, м</h4>
              <input
                value={geometryState.geometry?.height || ""}
                onChange={(event: any) => dispatch(setGeometry({ height: event.target.value }))}
                type="text"
                className={styles["select-params"]}
                placeholder="0.0"
              />
            </div>
            <div>
              <h4>Длина штабеля, м</h4>
              <input
                value={geometryState.geometry?.length || ""}
                onChange={(event: any) => dispatch(setGeometry({ length: event.target.value }))}
                type="text"
                className={styles["select-params"]}
                placeholder="0.0"
              />
            </div>
            <div>
              <h4>Ширина штабеля, м</h4>
              <input
                value={geometryState.geometry?.width || ""}
                onChange={(event: any) => dispatch(setGeometry({ width: event.target.value }))}
                type="text"
                className={styles["select-params"]}
                placeholder="0.0"
              />
            </div>

            <div>
              <h4>Форма(Опционально)</h4>
              <select
                className={styles["select-params"]}
                value={geometryState.geometry?.stackShape || ""}
                onChange={(event: any) => dispatch(setGeometry({ stackShape: event.target.value }))}
                required
              >
                <option value="" disabled hidden>
                  Выберите форму
                </option>
                {FORM.filter((f) => f.id).map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h4>Уплотнение(Опционально)</h4>
              <select
                className={styles["select-params"]}
                value={geometryState.geometry?.sealingLevel || ""}
                onChange={(event: any) => dispatch(setGeometry({ sealingLevel: event.target.value }))}
                required
              >
                <option value="" disabled hidden>
                  Выберите уровень
                </option>
                {LEVEL.filter((l) => l.id).map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles["full-width"]}>
              <h4>Расстояние до ближайшего штабеля(Опционально)</h4>
              <input
                value={geometryState.geometry?.distance || ""}
                onChange={(event: any) =>
                  dispatch(setGeometry({ distance: Number(event.target.value) }))
                }
                type="text"
                className={styles["select-params"]}
                placeholder="0.0"
              />
            </div>
            
            <div>
              <h4>Укрытие(Опционально)</h4>
              <div className={styles["radio-group"]}>
                {COVERING.map((option) => (
                  <div key={option.id} className={styles["radio-item"]}>
                    <input
                      type="radio"
                      id={`covering-${option.id || "default"}`}
                      name="coveringForm"
                      value={option.id}
                      checked={geometryState.geometry?.ProtectType === option.id}
                      onChange={(e) => dispatch(setGeometry({ ProtectType: e.target.value }))}
                      className={styles["radio"]}
                    />
                    <label
                      htmlFor={`covering-${option.id || "default"}`}
                      className={styles["radio-label"]}
                    >
                      {option.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </UIBlock>
    </section>
  );
}

export default Geometry;
