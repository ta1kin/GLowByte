// import { UIBlock } from "@/shared/ui/Block";
// import { useRef, useState } from "react";
// import { type JSX } from "react";

// import { useSnackbar } from "notistack";
// import SvgBoxPoint from "@/shared/assets/icons/BoxPoint.svg";
// import styles from "./Params.module.scss";

// import Button from "@mui/material/Button";
// import UploadSvg from "@/shared/assets/icons/upload.svg";
// import axios from 'axios'

// const FILE_LABELS = [
//   { key: "fires", label: "Fires.csv" },
//   { key: "supplies", label: "Supplies.csv" },
//   { key: "temperature", label: "Temperature.csv" },
//   { key: "weather", label: "Weather.csv" },
// ] as const;

// export function Params(): JSX.Element {
//   const { enqueueSnackbar } = useSnackbar();
//   const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

//   const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>(
//     {}
//   );
//   const [load, setLoad] = useState<boolean>(false)

//   const isValidCSV = (name: string) => name.toLowerCase().endsWith(".csv");

//   const handleFileChange = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     key: string
//   ) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (!isValidCSV(file.name)) {
//       enqueueSnackbar("Файл должен иметь расширение .csv", {
//         variant: "error",
//       });
//       e.target.value = "";
//       return;
//     }
//     else {
//       enqueueSnackbar("Начинается отправка файла, подождите немного", {
//         variant: "info",
//       });

//       uploadFile(file)
//     }

//     setSelectedFiles((prev) => ({ ...prev, [key]: file.name }));
//   };

//   const uploadFile = async (file: File) => {
//     const formData = new FormData();
//     formData.append("file", file);

//     const url = 'https://vmestedate.ru/api/data/upload'

//     try {
//       setLoad(true)

//       const response = await axios.post(url, formData, );

//       console.log("Вот ответ на загрузку файла", response)

//       enqueueSnackbar("Файл отправлен", { variant: "success" });
//     } catch(error) {
//       console.log(error)
//       enqueueSnackbar("Ошибка отправки", { variant: "error" });
//     } finally {
//       setLoad(false)
//     }
//   };

//   return (
//     <section style={{ width: "100%" }}>
//       <UIBlock
//         type="violet"
//         iconSrc={SvgBoxPoint}
//         headTxt="Повышение качества модели (загрузка датасетов)"
//       >
//         <div className={styles["block-body"]}>
//           <div className={styles["block-body__ctx"]}>
//             {FILE_LABELS.map(({ key, label }) => (
//               <div key={key}>
//                 <h4>{label}</h4>
//                 <Button
//                   variant="contained"
//                   loadingPosition="start"
//                   loading={load}
//                   disabled={load}
//                   onClick={() => fileRefs.current[key]?.click()}
//                   className="white square"
//                   startIcon={<img src={UploadSvg} />}
//                 >
//                   Загрузить изменения
//                 </Button>
//                 <input
//                   type="file"
//                   ref={(el) => {fileRefs.current[key] = el;}}
//                   onChange={(e) => handleFileChange(e, key)}
//                   accept=".csv"
//                   style={{ display: "none" }}
//                 />
//                 {selectedFiles[key] && (
//                   <p
//                     style={{
//                       fontSize: "12px",
//                       color: "#666",
//                       marginTop: "4px",
//                     }}
//                   >
//                     Загружено: {selectedFiles[key]}
//                   </p>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </UIBlock>
      
//     </section>
//   );
// }

// export default Params;






import { UIBlock } from "@/shared/ui/Block";
import { useRef, useState } from "react";
import type { JSX } from "react";
import { useSnackbar } from "notistack";
import SvgBoxPoint from "@/shared/assets/icons/BoxPoint.svg";
import UploadSvg from "@/shared/assets/icons/upload.svg";
import Button from "@mui/material/Button";
import axios from "axios";
import styles from "./Params.module.scss";

const FILE_LABELS = [
  { key: "fires", label: "Fires.csv" },
  { key: "supplies", label: "Supplies.csv" },
  { key: "temperature", label: "Temperature.csv" },
  { key: "weather", label: "Weather.csv" },
] as const;

const FILE_TYPE_MAP: Record<string, string> = {
  fires: "FIRES",
  supplies: "SUPPLIES",
  temperature: "TEMPERATURE",
  weather: "WEATHER",
};

export function Params(): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>({});
  const [load, setLoad] = useState<boolean>(false);

  const isValidCSV = (name: string): boolean =>
    name.toLowerCase().endsWith(".csv");

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidCSV(file.name)) {
      enqueueSnackbar("Файл должен иметь расширение .csv", {
        variant: "error",
      });
      e.target.value = "";
      return;
    }

    enqueueSnackbar("Начинается отправка файла, подождите немного", {
      variant: "info",
    });

    uploadFile(file, key);
    setSelectedFiles((prev) => ({ ...prev, [key]: file.name }));
  };

  const uploadFile = async (file: File, key: string): Promise<void> => {
    const fileType = FILE_TYPE_MAP[key];
    if (!fileType) {
      enqueueSnackbar("Не удалось определить тип файла", { variant: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType); 

    try {
      setLoad(true);
      const response = await axios.post(
        "https://vmestedate.ru/api/data/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Успешная загрузка:", response.data);
      enqueueSnackbar("Файл успешно отправлен", { variant: "success" });
    } catch (error: any) {
      console.error("Ошибка загрузки:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Неизвестная ошибка при загрузке";
      enqueueSnackbar(`Ошибка: ${message}`, { variant: "error" });
    } finally {
      setLoad(false);
    }
  };

  return (
    <section style={{ width: "100%" }}>
      <UIBlock
        type="violet"
        iconSrc={SvgBoxPoint}
        headTxt="Повышение качества модели (загрузка датасетов)"
      >
        <div className={styles["block-body"]}>
          <div className={styles["block-body__ctx"]}>
            {FILE_LABELS.map(({ key, label }) => (
              <div key={key}>
                <h4>{label}</h4>
                <Button
                  variant="contained"
                  loadingPosition="start"
                  loading={load}
                  disabled={load}
                  onClick={() => fileRefs.current[key]?.click()}
                  className="white square"
                  startIcon={<img src={UploadSvg} alt="upload" />}
                >
                  Загрузить файл
                </Button>
                <input
                  type="file"
                  ref={(el) => {
                    fileRefs.current[key] = el;
                  }}
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