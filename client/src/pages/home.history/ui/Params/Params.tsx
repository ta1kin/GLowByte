

import { UIBlock } from "@/shared/ui/Block";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { SEALING_LVL_SETTING } from "@/shared/config";
import { ESealingLevel } from "@/app/store/slices";
import { getHistory } from "@/app/store/slices";
import { setHistParams } from "@/app/store/slices";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useDispatch, useSelector } from "react-redux";
import { ru } from "date-fns/locale/ru";
import { type JSX, type ChangeEvent, useState } from "react";
import SvgSearch from "@/shared/assets/icons/search.svg";
import styles from "./Params.module.scss";
import { Button } from "@mui/material";
import type { IMainState, TMainDispatch } from "@/app/store";

const WAREHOUSES = [
  { id: "", name: "Выберите склад" },
  { id: "1", name: "Склад 1" },
  { id: "2", name: "Склад 2" },
  { id: "3", name: "Склад 3" },
];

const MARKS = [
  { id: "", name: "Выберите марку" },
  { id: "1", name: "Марка 1" },
  { id: "2", name: "Марка 2" },
  { id: "3", name: "Марка 3" },
];

const RISK_LEVELS = [
  {
    id: "0",
    value: ESealingLevel.LOW,
    label: SEALING_LVL_SETTING.LOW.label
  },
  {
    id: "1",
    value: ESealingLevel.MEDIUM,
    label: SEALING_LVL_SETTING.MEDIUM.label
  },
  {
    id: "2",
    value: ESealingLevel.HIGH,
    label: SEALING_LVL_SETTING.HIGH.label
  },
  {
    id: "3",
    value: ESealingLevel.CRITICAL,
    label: SEALING_LVL_SETTING.CRITICAL.label
  }
]

function Params(): JSX.Element {
  const historyParams = useSelector((state: IMainState) => state.history.params)

  const dispatch = useDispatch<TMainDispatch>();

  const [load, setLoad] = useState<boolean>(false)
  const [openCalendarFor, setOpenCalendarFor] = useState<"from" | "to" | null>(null);

  const handleSelectAreaName = (e: ChangeEvent<HTMLSelectElement>): void => {
    dispatch(setHistParams({areaName: e.target.value}))
  }

  const handleSelectCoalBrand = (e: ChangeEvent<HTMLSelectElement>): void => {
    dispatch(setHistParams({coalBrand: e.target.value}))
  }

  const handleSelectSealingLevel = (e: ChangeEvent<HTMLSelectElement>): void => {
    dispatch(setHistParams({sealingLevel: e.target.value as ESealingLevel}))
  }

  const handleDateSelect = (date: Date | null) => {
    if (openCalendarFor === "from") {
      dispatch(setHistParams({startDate: date}));
    } else if (openCalendarFor === "to") {
      dispatch(setHistParams({finishDate: date}));
    }

    setOpenCalendarFor(null);
  };

  const handleSearchHistory = async (): Promise<void> => {
    setLoad(true)

    const response = await dispatch(getHistory()).unwrap()

    if(!response || response === 'error') {
      
    }

    setLoad(false)
  }

  return (
    <section style={{ width: "100%" }}>
      <UIBlock type="green" iconSrc={SvgSearch} headTxt="Параметры партии угля">
        <div className={styles["block-body"]}>
          <div className={styles["block-body__ctx"]}>
            <div>
              <h4>Склад площадка</h4>
              <select
                className={styles["select-params"]}
                value={historyParams?.areaName}
                onChange={handleSelectAreaName}
              >
                <option value="" disabled hidden>
                  Любой склад
                </option>
                {WAREHOUSES.filter((w) => w.id).map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h4>Марка угля</h4>
              <select
                className={styles["select-params"]}
                value={historyParams?.coalBrand}
                onChange={handleSelectCoalBrand}
              >
                <option value="" disabled hidden>
                  Любая марка
                </option>
                {MARKS.filter((m) => m.id).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{gridColumn:"1/-1"}}>
              <h4>Уровень риска</h4>
              <select
                className={styles["select-params"]}
                value={historyParams?.sealingLevel || ""}
                onChange={handleSelectSealingLevel}
              >
                <option value="" disabled hidden>
                  Выберите уровень риска
                </option>
                {RISK_LEVELS.map((r) => (
                  <option key={r.id} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Кнопка "Дата с" */}
            
            <div>
              <h4>Дата с</h4>
              <Button
                variant="outlined"
                onClick={() => setOpenCalendarFor("from")}
                sx={{ width: "100%" }}
              >
                { historyParams?.startDate
                  ? new Date(historyParams.startDate).toLocaleDateString("ru-RU")
                  : "Выберите дату"
                }
              </Button>
            </div>

            {/* Кнопка "Дата по" */}
            <div>
              <h4>Дата по</h4>
              <Button
                variant="outlined"
                onClick={() => setOpenCalendarFor("to")}
                sx={{ width: "100%" }}
              >
                { historyParams?.finishDate
                  ? new Date(historyParams.finishDate).toLocaleDateString("ru-RU")
                  : "Выберите дату"
                }
              </Button>
            </div>

            {/* Календарь (показывается только при открытии) */}
            {openCalendarFor && (
              <div style={{ gridColumn: "1 / -1", marginTop: "16px" }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                  <DateCalendar
                    value={openCalendarFor === "from" ? historyParams?.startDate : historyParams?.finishDate}
                    onChange={handleDateSelect}
                    sx={{
                      width: "100%",
                      maxWidth: "300px",
                      margin: "0 auto",
                      borderRadius: "12px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                      "& .MuiPickersArrowSwitcher-button": {
                        color: "#1976d2",
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
            )}

            {/* Кнопка поиска */}
            <div style={{ gridColumn: "1 / -1", marginTop: "20px" }}>
              <Button
                className="green square"
                loadingPosition="start"
                loading={ load }
                startIcon={<img src={SvgSearch} />}
                variant="contained"
                sx={{ width: "100%" }}
                onClick={handleSearchHistory}
              >
                Начать поиск
              </Button>
            </div>
          </div>
        </div>
      </UIBlock>
    </section>
  );
}

export default Params;
