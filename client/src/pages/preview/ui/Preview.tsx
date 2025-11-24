import { UIBlock } from "@/shared/ui";
import { useSnackbar } from "notistack";
import { estimationRoute } from "@/shared/config";
import { errorRoute } from "@/shared/config";
import { setPreview } from "@/app/store/slices";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import {useDispatch, useSelector} from 'react-redux';
import { type JSX, useEffect, useState } from "react";
import type { IMainState, TMainDispatch } from "@/app/store";

import SvgLocation from '@/shared/assets/icons/location.svg'
import styles from "./Preview.module.scss";

const WAREHOUSES = [
  { id: "", name: "Выберите склад" },
  { id: "1", name: "Склад №1 — Центральный" },
  { id: "2", name: "Склад №2 — Северный" },
  { id: "3", name: "Склад №3 — Южный" },
];

const REGION = [
  { id: "", name: "Выберите регион" },
  { id: "1", name: "Йошкар-Ола" },
  { id: "2", name: "Москва" },
  { id: "3", name: "Санкт-Петербург" },
];

function PreviewPage(): JSX.Element {
  const previewState = useSelector((state: IMainState) => state.preview);
  const navigate = useNavigate();
  const dispatch = useDispatch<TMainDispatch>();

  const { enqueueSnackbar } = useSnackbar();
  const [load, setLoad] = useState<boolean>(false)

  const handleChangeWarehouse = (event: any) => {
    dispatch(setPreview({ warehouse: event.target.value }));
    
  };
  const handleChangeRegion = (event: any) => {
    dispatch(setPreview({ district: event.target.value }));
  };

  const handleInputLlatitude = (event: any) => {
    dispatch(setPreview({ coords: {...previewState.coords, latit: event.target.value } }));

  };
  const handleInputLongitude = (event: any) => {
    dispatch(setPreview({ coords: {...previewState.coords, longit: event.target.value } }));
  };

  async function handleGoPredict(): Promise<void> {
    setLoad(true)
    // Пишешь логику отправки запроса на сервер
    enqueueSnackbar('Тут сообщение результата', { variant: 'success' })
    setLoad(false);

    // Тут если не ошибка, то дальше, если ошибка, то рна страницу ошибок
    if(true) {
        navigate(estimationRoute)
    } else {
        navigate(errorRoute)
    }
  }

  useEffect(() => {
    document.title = "Начало работы"
  }, [])

  return (
    <div className={styles["preview-page"]}>
      <div className={styles["preview-page__ctx"]}>
        <UIBlock iconSrc={ SvgLocation } headTxt="Склад / Местоположение">
          <div className={styles["block-body"]}>
            <div className={styles["block-body__ctx"]}>
              <div>
                <h4>Склад / Площадка</h4>
                <select
                  className={styles["select-warehouse"]}
                  value={previewState.warehouse}
                  onChange={handleChangeWarehouse}
                  required
                >
                  <option value="" disabled hidden>
                    Выберите склад
                  </option>
                  {WAREHOUSES.filter((w) => w.id).map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <h4>Регион / Местоположение</h4>
                <select
                  className={styles["select-warehouse"]}
                  value={previewState.district}
                  onChange={handleChangeRegion}
                  required
                >
                  <option value="" disabled hidden>
                    Введите регион
                  </option>
                  {REGION.filter((w) => w.id).map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <h4>Координаты (опционально)</h4>
                <input
                  value={previewState.coords?.latit || ""}
                  onChange={handleInputLlatitude}
                  type="text"
                  className={styles["select-warehouse"]}
                  placeholder="Широта"
                  style={{ background: "#F2F2F2" }}
                />
              </div>
              <div>
                <h4>&nbsp;</h4>
                <input
                  value={previewState.coords?.longit || ""}
                  onChange={handleInputLongitude}
                  type="text"
                  className={styles["select-warehouse"]}
                  placeholder="Долгота"
                  style={{ background: "#F2F2F2" }}
                />
              </div>
            </div>
            <Button
              fullWidth
              className="square"
              variant="contained"
              loadingPosition="start"
              loading={load}
              onClick={handleGoPredict}
            >
              Поиск
            </Button>
          </div>
        </UIBlock>
      </div>
    </div>
  );
}

export default PreviewPage;
