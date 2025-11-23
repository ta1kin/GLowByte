

import { UIBlock } from "@/shared/ui/Block";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ru } from "date-fns/locale/ru";
import { type JSX, useState } from "react";
import SvgSearch from "@/shared/assets/icons/search.svg";
import styles from "./Params.module.scss";
import { Button } from "@mui/material";

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
  { id: "", name: "Выберите уровень риска" },
  { id: "1", name: "Уровень 1" },
  { id: "2", name: "Уровень 2" },
  { id: "3", name: "Уровень 3" },
];

function Params(): JSX.Element {
  const [warehouse, setWarehouse] = useState<string>("");
  const [coalMark, setCoalMark] = useState<string>("");
  const [riskLevel, setRiskLevel] = useState<string>("");
  
  // Диапазон дат
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  
  // Управление календарём
  const [openCalendarFor, setOpenCalendarFor] = useState<"from" | "to" | null>(null);

  const handleDateSelect = (date: Date | null) => {
    if (openCalendarFor === "from") {
      setDateFrom(date);
    } else if (openCalendarFor === "to") {
      setDateTo(date);
    }
    // Закрываем календарь после выбора
    setOpenCalendarFor(null);
  };

  return (
    <section style={{ width: "100%" }}>
      <UIBlock type="green" iconSrc={SvgSearch} headTxt="Параметры партии угля">
        <div className={styles["block-body"]}>
          <div className={styles["block-body__ctx"]}>
            <div>
              <h4>Склад площадка</h4>
              <select
                className={styles["select-params"]}
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
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
                value={coalMark}
                onChange={(e) => setCoalMark(e.target.value)}
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
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
              >
                <option value="" disabled hidden>
                  Выберите уровень риска
                </option>
                {RISK_LEVELS.filter((r) => r.id).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
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
                {dateFrom ? dateFrom.toLocaleDateString("ru-RU") : "Выберите дату"}
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
                {dateTo ? dateTo.toLocaleDateString("ru-RU") : "Выберите дату"}
              </Button>
            </div>

            {/* Календарь (показывается только при открытии) */}
            {openCalendarFor && (
              <div style={{ gridColumn: "1 / -1", marginTop: "16px" }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                  <DateCalendar
                    value={openCalendarFor === "from" ? dateFrom : dateTo}
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
                className="white"
                startIcon={<img src={SvgSearch} />}
                variant="contained"
                sx={{ width: "100%" }}
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