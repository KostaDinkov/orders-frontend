import React from "react";
import styles from "./OrderItem.module.css";
import APIendpoints from "../APIendpoints";
import { Navigate, useNavigate } from "react-router-dom";

const OrderItem = ({ item, order }) => {
  let navigate = useNavigate();
  let handleProgressChange = () => {
    item.isInProgress = !item.isInProgress;
    updateOrder();
  };

  let handleCompleteChange = () => {
    item.isComplete = !item.isComplete;
    
    updateOrder();
  };

  function updateOrder() {
    fetch(APIendpoints.put.orders(order.id), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        navigate(0);
        
      })
      .catch(error=>console.log("Error",error));
  }

  return (
    <dl className={item.isComplete?styles.completed:(item.isInProgress?styles.inProgress:null)}>
      <dt className={styles.itemHeader}>
        <span className={styles.itemName}>{item.product.name} </span>
        <span>{item.productAmount} бр.</span>
        <span>
          <input
            type="checkbox"
            name="isInProgress"
            id="isInProgress"
            defaultChecked={item.isInProgress}
            onChange={handleProgressChange}
          />
        </span>
        <span>
          <input
            type="checkbox"
            name="isComplete"
            id="isComplete"
            defaultChecked={item.isComplete}
            onChange={handleCompleteChange}
          />
        </span>
      </dt>

      <dd>
        {item.description !== "" && <div>Забележка: {item.description}</div>}
        {item.cakeFoto !== "" && <div>Фото: {item.cakeFoto}</div>}
        {item.cakeTitle !== "" && <div>Надпис: {item.cakeTitle}</div>}
      </dd>
    </dl>
  );
};

export default OrderItem;
