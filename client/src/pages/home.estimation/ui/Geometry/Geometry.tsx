import { UIBlock } from "@/shared/ui/Block";
import type { JSX } from "react";
import { useState } from "react";

import SvgBoxStroke from '@/shared/assets/icons/box-stroke.svg'
import styles from './Geometry.module.scss'

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
  { id: "1", name: "Что-то" },
  { id: "2", name: "Что-то" },
  { id: "3", name: "Что-то" },
];

function Geometry(): JSX.Element {
  const [storage, setStorage] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [length, setLength] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [form, setForm] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [distance, setDistance] = useState<number>();
  const [coveringForm, setCoveringForm] = useState<string>("");

  return (
    <section style={{ width: "100%" }}>
      <UIBlock
        type="violet"
        iconSrc=""
        headTxt="Геометрия штабеля и условия хранения"
      >
        <div className={styles["block-body"]}>
          <div className={styles["block-body__ctx"]}>
            <div>
              <h4>Тип хранения</h4>
              <select
                className={styles["select-params"]}
                value={storage}
                onChange={(event: any) => setStorage(event.target.value)}
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
                value={height || ""}
                onChange={(event: any) => setHeight(event.target.value)}
                type="text"
                className={styles["select-params"]}
                placeholder="0.0"
              />
            </div>
            <div>
              <h4>Длина штабеля, м</h4>
              <input
                value={length || ""}
                onChange={(event: any) => setLength(event.target.value)}
                type="text"
                className={styles["select-params"]}
                placeholder="0.0"
              />
            </div>
            <div>
              <h4>Ширина штабеля, м</h4>
              <input
                value={width || ""}
                onChange={(event: any) => setWidth(event.target.value)}
                type="text"
                className={styles["select-params"]}
                placeholder="0.0"
              />
            </div>

            <div>
              <h4>Форма штабеля</h4>
              <select
                className={styles["select-params"]}
                value={form}
                onChange={(event: any) => setForm(event.target.value)}
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
              <h4>Уровень уплотнения</h4>
              <select
                className={styles["select-params"]}
                value={level}
                onChange={(event: any) => setLevel(event.target.value)}
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

            <div className={ styles["full-width"] }>
              <h4>Расстояние до ближайшего штабеля, м</h4>
              <input
                value={distance || ""}
                onChange={(event: any) =>
                  setDistance(Number(event.target.value))
                }
                type="text"
                className={styles["select-params"]}
                placeholder="0.0"
              />
            </div>
            <div>
              <h4>Укрытие / Защита</h4>
              <div className={styles["radio-group"]}>
                {COVERING.map((option) => (
                  <div key={option.id} className={styles["radio-item"]}>
                    <input
                      type="radio"
                      id={`covering-${option.id || "default"}`}
                      name="coveringForm"
                      value={option.id}
                      checked={coveringForm === option.id}
                      onChange={(e) => setCoveringForm(e.target.value)}
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
