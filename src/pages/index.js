import { Inter } from "next/font/google";
import { useState } from "react";
import { api } from "@/lib/axios";
import styles from "@/styles/Home.module.css";

import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [file3, setFile3] = useState(null);
  const [isGeneratingFile, setIsGeneratingFile] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGeneratingFile) {
      console.log("emtrou");
      toast.warn(
        "É necessário esperar a geração do ultimo arquivo pra tentar de novo.(ou recarrega a página)",
        {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
      return;
    }
    setIsGeneratingFile(true);

    try {
      const formData = new FormData();
      formData.append("file1", file1);
      formData.append("file2", file2);
      formData.append("file3", file3);
  
      const response = await api.post("/api/merge", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      });
  
      console.log(response);
  
      const blob = new Blob([response.data]); // create a blob from response data
      const url = window.URL.createObjectURL(blob); // create a URL for the blob
  
      // create a link and click it to initiate download
      const link = document.createElement("a");
      link.href = url;
      link.download = "merged.zip";
      document.body.appendChild(link);
      link.click();
  
      // clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch {
      toast.error("Ocorreu um erro ao ler o arquivo, recarrega a página e tenta de novo, se nao der certo, me chama.",{
        position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
      })
    } finally {
      setIsGeneratingFile(false);
    }
  };

  function clearFile(id) {
    switch (id) {
      case "file1":
        setFile1(null);
        break;
      case "file2":
        setFile2(null);
        break;
      case "file3":
        setFile3(null);
        break;
      default:
        break;
    }
    document.getElementById(id).value = "";
  }

  return (
    <div className={styles.main}>
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="file1">
            {file1 ? file1.name : "Escolher arquivo 1"}
          </label>
          <input
            type="file"
            id="file1"
            onChange={(e) => {
              setFile1(e.target.files[0]);
            }}
          />
          {file1 && <button onClick={() => clearFile("file1")}>X</button>}
        </div>
        <div>
          <label htmlFor="file2">
            {file2 ? file2.name : "Escolher arquivo 2"}
          </label>
          <input
            type="file"
            id="file2"
            onChange={(e) => setFile2(e.target.files[0])}
          />
          {file2 && <button onClick={() => clearFile("file2")}>X</button>}
        </div>
        <div>
          <label htmlFor="file3">
            {file3 ? file3.name : "Escolher arquivo 3"}
          </label>
          <input
            type="file"
            id="file3"
            onChange={(e) => setFile3(e.target.files[0])}
          />
          {file3 && <button onClick={() => clearFile("file3")}>X</button>}
        </div>
        <button disabled={!file1 || !file2 || !file3} type="submit">
          {isGeneratingFile ? "Carregando..." : "Gerar novo arquivo"}
        </button>
      </form>
    </div>
  );
}
