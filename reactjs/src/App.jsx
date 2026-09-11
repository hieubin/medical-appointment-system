import { useEffect, useState } from "react";
import { api } from "./api/axios";

export default function App() {
  const [status, setStatus] = useState("Đang kiểm tra API...");

  useEffect(() => {
    api
      .get("/health")
      .then((res) => {
        const data = res.data.data;
        setStatus(`${data.service} · database ${data.database}`);
      })
      .catch((err) => {
        setStatus(err.response?.data?.message || "Không gọi được API.");
      });
  }, []);

  return (
    <main>
      <h1>Medical Appointment</h1>
      <p>{status}</p>
    </main>
  );
}
