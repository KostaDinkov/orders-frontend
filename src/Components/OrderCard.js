import React from "react";
import styles from "./OrderCard.module.css";
import OrderItem from "./OrderItem";
import EditIcon from "@mui/icons-material/Edit";

const OrderCard = ({ order }) => {
  

  const handleOnEditClick = ()=>{
    //open the new order dialog
  }
  return (
    <div className={styles.orderCardContainer}>
      <div className={styles.cardHeader}>
        <span className={styles.pickupTime}>{order.pickupTime}</span>{" "}
        <span>{order.clientName}</span>
        <div className={styles.editIcon}>
          <EditIcon fontSize="small" cursor="pointer" onClick={handleOnEditClick}/>
        </div>
      </div>
      <div className={styles.headerDetails}>
        <span>тел: {order.clientPhone}</span>
        {order.advancePaiment !== 0 && (
          <span
            className={[styles.textBadge, styles.textBadgeYellow].join(" ")}
          >
            Капаро: {order.advancePaiment} лв.
          </span>
        )}
        {order.isPaid === true && (
          <span className={[styles.textBadge, styles.textBadgeRed].join(" ")}>
            ПЛАТЕНА
          </span>
        )}
      </div>
      <ul>
        {order.orderItems.map((item, index) => (
          <OrderItem key={index} item={item} />
        ))}
      </ul>
    </div>
  );
};

export default OrderCard;
