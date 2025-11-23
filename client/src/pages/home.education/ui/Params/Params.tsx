// import { UIBlock } from "@/shared/ui/Block";
// import type { JSX } from "react";

// import SvgBoxPoint from "@/shared/assets/icons/BoxPoint.svg";
// import styles from "./Params.module.scss";

// import Button from "@mui/material/Button";

// function Params(): JSX.Element {
//   return (
//     <section style={{ width: "100%" }}>
//       <UIBlock
//         type="violet"
//         iconSrc={SvgBoxPoint}
//         headTxt="Параметры партии угля"
//       >
//         <div className={styles["block-body"]}>
//           <div className={styles["block-body__ctx"]}>
//             <div>
//               <h4>Fires.csv</h4>
//               <Button variant="contained" style={{color: "#9E9A9A", backgroundColor: "#F2F2F2"}}>
//                 Загрузить изменения
//               </Button>
//             </div>
//             <div>
//               <h4>Supplies.csv</h4>
//               <Button variant="contained" style={{color: "#9E9A9A", backgroundColor: "#F2F2F2"}}>
//                 Загрузить изменения
//               </Button>
//             </div>
//             <div>
//               <h4>Temperature.csv</h4>
//               <Button variant="contained" style={{color: "#9E9A9A", backgroundColor: "#F2F2F2"}}>
//                 Загрузить изменения
//               </Button>
//             </div>
//             <div>
//               <h4>Weather.csv</h4>
//               <Button variant="contained" style={{color: "#9E9A9A", backgroundColor: "#F2F2F2"}} >
//                 Загрузить изменения
//               </Button>
//             </div>
//           </div>
//         </div>
//       </UIBlock>
//     </section>
//   );
// }

// export default Params;


import { UIBlock } from "@/shared/ui/Block";
import type { JSX } from "react";
import { useRef, useState } from "react";
import { useSnackbar } from 'notistack';

import SvgBoxPoint from "@/shared/assets/icons/BoxPoint.svg";
import styles from "./Params.module.scss";
import Button from "@mui/material/Button";

function Params(): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();

  const firesInputRef = useRef<HTMLInputElement>(null);
  const suppliesInputRef = useRef<HTMLInputElement>(null);
  const temperatureInputRef = useRef<HTMLInputElement>(null);
  const weatherInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>({
    fires: "",
    supplies: "",
    temperature: "",
    weather: "",
  });

  const isValidCSV = (filename: string): boolean => {
    return filename.toLowerCase().endsWith('.csv');
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isValidCSV(file.name)) {
      enqueueSnackbar('Файл должен иметь расширение .csv', {
        variant: 'error', // ← `bad` не существует, используй 'error'
        autoHideDuration: 3000,
      });

      // Сброс инпута, чтобы можно было выбрать снова
      if (event.target) {
        event.target.value = '';
      }
      return;
    }

    setSelectedFiles((prev) => ({
      ...prev,
      [key]: file.name,
    }));

    console.log(`Выбран файл для ${key}:`, file);
    // Здесь можно отправить файл на сервер и т.д.
  };

  const triggerInput = (ref: React.RefObject<HTMLInputElement | null>) => {
    ref.current?.click();
  };

  return (
    <section style={{ width: "100%" }}>
      <UIBlock
        type="violet"
        iconSrc={SvgBoxPoint}
        headTxt="Параметры партии угля"
      >
        <div className={styles["block-body"]}>
          <div className={styles["block-body__ctx"]}>
            <div>
              <h4>Fires.csv</h4>
              <Button
                variant="contained"
                onClick={() => triggerInput(firesInputRef)}
                sx={{
                  color: "#9E9A9A",
                  backgroundColor: "#F2F2F2",
                  "&:hover": {
                    backgroundColor: "#e0e0e0",
                  },
                }}
              >
                Загрузить изменения
              </Button>
              <input
                type="file"
                ref={firesInputRef}
                onChange={(e) => handleFileChange(e, "fires")}
                accept=".csv"
                style={{ display: "none" }}
              />
              {selectedFiles.fires && (
                <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                  Выбрано: {selectedFiles.fires}
                </p>
              )}
            </div>

            <div>
              <h4>Supplies.csv</h4>
              <Button
                variant="contained"
                onClick={() => triggerInput(suppliesInputRef)}
                sx={{
                  color: "#9E9A9A",
                  backgroundColor: "#F2F2F2",
                }}
              >
                Загрузить изменения
              </Button>
              <input
                type="file"
                ref={suppliesInputRef}
                onChange={(e) => handleFileChange(e, "supplies")}
                accept=".csv"
                style={{ display: "none" }}
              />
              {selectedFiles.supplies && (
                <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                  Выбрано: {selectedFiles.supplies}
                </p>
              )}
            </div>

            <div>
              <h4>Temperature.csv</h4>
              <Button
                variant="contained"
                onClick={() => triggerInput(temperatureInputRef)}
                sx={{
                  color: "#9E9A9A",
                  backgroundColor: "#F2F2F2",
                }}
              >
                Загрузить изменения
              </Button>
              <input
                type="file"
                ref={temperatureInputRef}
                onChange={(e) => handleFileChange(e, "temperature")}
                accept=".csv"
                style={{ display: "none" }}
              />
              {selectedFiles.temperature && (
                <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                  Выбрано: {selectedFiles.temperature}
                </p>
              )}
            </div>

            <div>
              <h4>Weather.csv</h4>
              <Button
                variant="contained"
                onClick={() => triggerInput(weatherInputRef)}
                sx={{
                  color: "#9E9A9A",
                  backgroundColor: "#F2F2F2",
                }}
              >
                Загрузить изменения
              </Button>
              <input
                type="file"
                ref={weatherInputRef}
                onChange={(e) => handleFileChange(e, "weather")}
                accept=".csv"
                style={{ display: "none" }}
              />
              {selectedFiles.weather && (
                <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                  Выбрано: {selectedFiles.weather}
                </p>
              )}
            </div>
          </div>
        </div>
      </UIBlock>
    </section>
  );
}

export default Params;