import { UIBlock } from "@/shared/ui/Block";
import { useRef, useState } from "react";
import { type JSX } from "react";

import { useSnackbar } from "notistack";
import SvgBoxPoint from "@/shared/assets/icons/BoxPoint.svg";
import styles from "./Params.module.scss";

import Button from "@mui/material/Button";
import UploadSvg from "@/shared/assets/icons/upload.svg";

const FILE_LABELS = [
  { key: "fires", label: "Fires.csv" },
  { key: "supplies", label: "Supplies.csv" },
  { key: "temperature", label: "Temperature.csv" },
  { key: "weather", label: "Weather.csv" },
] as const;

export function Params(): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>(
    {}
  );

  const isValidCSV = (name: string) => name.toLowerCase().endsWith(".csv");

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidCSV(file.name)) {
      enqueueSnackbar("Файл должен иметь расширение .csv", {
        variant: "error",
      });
      e.target.value = "";
      return;
    }
    else {
      enqueueSnackbar("Файл успешно загружен", {
        variant: "success",
      });
    }

    setSelectedFiles((prev) => ({ ...prev, [key]: file.name }));
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
            {FILE_LABELS.map(({ key, label }) => (
              <div key={key}>
                <h4>{label}</h4>
                <Button
                  variant="contained"
                  onClick={() => fileRefs.current[key]?.click()}
                  className="white square"
                  startIcon={<img src={UploadSvg} />}
                >
                  Загрузить изменения
                </Button>
                <input
                  type="file"
                  ref={(el) => {fileRefs.current[key] = el;}}
                  onChange={(e) => handleFileChange(e, key)}
                  accept=".csv"
                  style={{ display: "none" }}
                />
                {selectedFiles[key] && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    Загружено: {selectedFiles[key]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </UIBlock>
      
    </section>
  );
}

export default Params;
