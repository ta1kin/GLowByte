import type { JSX } from "react";

function UINoRisk(): JSX.Element {
  return (
    <div className="no-risk"
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <div
        style={{
          border: "2px solid white",
          borderRadius: "50%",
          width: "100px",
          height: "100px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F2F2F2",
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "20px solid transparent",
            borderRight: "20px solid transparent",
            borderBottom: "30px solid #D0D0D0",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "3.5px",
              right: "-17px",
              width: 0,
              height: 0,
              borderLeft: "17px solid transparent",
              borderRight: "17px solid transparent",
              borderBottom: "25px solid #F2F2F2",
            }}
          >
            <div
              style={{
                color: "#D0D0D0",
                position: "absolute",
                top: "5px",
                left: "-2px",
              }}
            >
              !
            </div>
          </div>
        </div>
      </div>
      <h6>Пока нет результатов</h6>
      <p style={{ textAlign: "center", marginBottom: "10px" }}>
        Заполните форму и нажмите "Рассчитать риск самовозгорания", чтобы
        увидеть результаты
      </p>
    </div>
  );
}

export default UINoRisk;
