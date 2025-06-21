import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./Redux/store";
import { ThemeProvider } from "@emotion/react";
import theme from "./pages/Landingpage/theme";
import { getStore, setStore } from "./utils/store";
import SocketProvider from "./utils/SocketProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));

setStore(store);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <SocketProvider>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </SocketProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
