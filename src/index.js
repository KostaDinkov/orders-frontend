import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import moment from "moment/moment";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import OrderForm, { orderFormLoader } from "./Components/OrderForm";
import Error from "./Components/Error";
import ColumnView, { loader as ordersLoader } from "./Components/ColumnView";
import DayView, { DayViewLoader } from "./Components/DayView";
import LoginForm from "./Components/LoginForm";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import EventHub from "./EventHub";
import PubSub from "pubsub-js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <ColumnView />,
        errorElement: <Error />,
        loader: ordersLoader,
      },
      {
        path: "/orders/:method/:id",
        element: <OrderForm />,
        loader: orderFormLoader,
        errorElement:<Error/>
      },
      {
        path: "/orders/:method/",
        element: <OrderForm />,
        loader: orderFormLoader,
        errorElement:<Error/>
      },
      {
        path: "/orders/forDay/:date",
        element: <DayView />,
        loader: DayViewLoader,
        errorElement:<Error/>
      },
      {
        path: "/login/",
        element: <LoginForm />,
      },
      
    ],
  },
]);

const eventHub = new EventHub();
let token = PubSub.subscribe("SendUpdateOrders", eventHub.sendUpdateOrders);

moment.updateLocale("bg", {
  months: [
    "Януари",
    "Февруари",
    "Март",
    "Април",
    "Май",
    "Юни",
    "Юли",
    "Август",
    "Септември",
    "Октомври",
    "Ноември",
    "Декември",
  ],
});

moment.locale("bg");

const muiTheme = createTheme({
  palette: {
    type: "light",
    primary: {
      main: "#1f5464",
    },
    secondary: {
      main: "#ffb300",
    },
    background: {
      default: "#e1e2e1",
      paper: "#f5f5f6",
    },
  },
});
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={muiTheme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
