import { UIBlock } from "@/shared/ui/Block";
import { type JSX, useRef, useState } from "react";
import { useSnackbar } from "notistack";
import SvgBoxPoint from "@/shared/assets/icons/box-stroke.svg";
import Button from "@mui/material/Button";
import axios from "axios";
import styles from "./Query.module.scss";
import UploadSvg from "@/shared/assets/icons/upload.svg";

export function Query(): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [metrics, setMetrics] = useState({
    precision: 0,
    accuracy: 0,
    recall: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      enqueueSnackbar("Файл должен быть в формате .csv", { variant: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await axios.post(
        "https://vmestedate.ru/ml/validate",
        formData,
        {
          params: {
            model_name: "coal_fire_model",
            model_version: "1.0.0",
          },
        }
      );
      console.log("ответ от сервера на проверку точности модели", response);
      const {
        precision = 0,
        accuracy = 0,
        recall = 0,
      } = response.data.metrics || {};
      setMetrics({ precision, accuracy, recall });
      enqueueSnackbar("Метрики получены", { variant: "success" });
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar("Ошибка валидации модели", { variant: "error" });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <section style={{ width: "100%" }}>
      <UIBlock
        type="orange"
        iconSrc={SvgBoxPoint}
        headTxt="Проверка точности модели"
      >
        {metrics.precision === 0 &&
        metrics.accuracy === 0 &&
        metrics.recall === 0 ? (
          <div>Пока нет результатов</div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "12px",
              padding: "16px",
              backgroundColor: "#f9f9fb",
              borderRadius: "8px",
              border: "1px solid #eee",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 500,
                color: "#333",
              }}
            >
              Precision:{" "}
              <span style={{ color: "#1976d2", fontWeight: 600 }}>
                {(metrics.precision * 100).toFixed(1)}%
              </span>
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 500,
                color: "#333",
              }}
            >
              Recall:{" "}
              <span style={{ color: "#d32f2f", fontWeight: 600 }}>
                {(metrics.recall * 100).toFixed(1)}%
              </span>
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 500,
                color: "#333",
              }}
            >
              Accuracy:{" "}
              <span style={{ color: "#388e3c", fontWeight: 600 }}>
                {(metrics.accuracy * 100).toFixed(1)}%
              </span>
            </p>
          </div>
        )}

        <Button
          variant="contained"
          disabled={loading}
          onClick={handleUpload}
          sx={{ mt: 2 }}
          className="white square"
          startIcon={<img src={UploadSvg} />}
        >
          {loading ? "Загрузка..." : "Загрузить тестовые данные"}
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          style={{ display: "none" }}
        />
      </UIBlock>
    </section>
  );
}

export default Query;
