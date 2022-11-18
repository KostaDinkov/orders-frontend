import { useEffect, useState } from "react";
import DayColumn from "./Components/DayColumn";
import "./App.css";
import NavBar from "./Components/NavBar";
import AppContext,{defaultOrderFormData} from "./appContext";
import OrderForm from "./Components/OrderForm";

function App() {
  let [data, setData] = useState([]);
  let [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  let [orderFormData, setOrderFormData] = useState(defaultOrderFormData);

  useEffect(() => {
    fetchData();
  }, []);

  function fetchData() {
    fetch("http://localhost:5257/api/orders")
      .then((response) => response.json())
      .then((data) => setData(data));
  }

  return (
    <div className="App">
      <AppContext.Provider value={{ isOrderFormOpen, setIsOrderFormOpen, orderFormData, setOrderFormData }}>
        <OrderForm />
        <NavBar />
        <div className="daysContainer">
          {data.map((group, index) => (
            <DayColumn key={index} data={group}></DayColumn>
          ))}
        </div>
      </AppContext.Provider>
    </div>
  );
}

export default App;
