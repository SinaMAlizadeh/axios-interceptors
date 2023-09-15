import "./App.css";
import { useEffect } from "react";
import axiosInstance from "./services/axsiox";

function App() {
  useEffect(() => {
    axiosInstance
      .get("/api/data")
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
        // Handle errors, including token refresh errors
      });
  }, []);

  return <></>;
}

export default App;
