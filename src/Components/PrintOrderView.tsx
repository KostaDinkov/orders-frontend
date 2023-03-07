import React from "react";
import styles from "./PrintOrderView.module.css";
import OrderDTO from "../Types/OrderDTO";
import { format } from "date-fns";
import { bg } from "date-fns/locale";

export default function PrintOrderView() {
  let order: OrderDTO = {
    id: 3033,
    advancePaiment: 0,
    operatorId: 0,
    pickupDate: "2023-03-07T12:30",
    createdDate: "2023-02-12T10:00",
    clientName: "Kostadin Dinkov",
    clientPhone: "0889778601",
    isPaid: false,
    status: 0,

    orderItems: [
      {
        productId: 10,
        productName: "Карамелен Десерт",
        productAmount: 10,
        description:
          "С жълта сметана. Орехи и дели карамел.Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur, laborum.",
        isInProgress: false,
        isComplete: false,
        price: 14.0,
        unit: "бр.",
      },
      {
        productName: "10п. Шоколадова торта",
        productId: 15,
        productAmount: 2,
        description:
          "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Earum repudiandae nostrum dignissimos doloremque voluptatem maxime?",
        cakeFoto: "103",
        cakeTitle: "Честит юбилей любима бабо 80г",
        isInProgress: false,
        isComplete: false,
        price: 13.0,
        unit: "бр.",
      },
      
      
      
    ],
  };

  return (
    <div className={styles.pageView}>
      <OrderForPrint order={order} />
      <div className={styles.orderDivider}></div>
      <OrderForPrint order={order} />
    </div>
  );
}

function OrderForPrint({ order }: { order: OrderDTO }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>Сладкарска Работилница Жана ООД</div>
        <div>гр. Ихтиман, ул. Цар Освободител №195, тел. 072483329</div>
      </div>
      <div className={styles.details}>
        <div>
          <div className={styles.orderNumber}>
            ПОРЪЧКА №{order.id} от{" "}
            {format(new Date(order.createdDate), "dd-MM-yyyy")} за:
          </div>
          <div className={styles.orderDate}>
            {format(new Date(order.pickupDate), "EEEE do MMMM yyyy HH:mm", {
              locale: bg,
            })}
            ч.
          </div>
        </div>
        <div>
          <div>Клиент</div>
          <div>{order.clientName}</div>
          <div>{order.clientPhone}</div>
        </div>
      </div>
      <div className={styles.productList}>
        <div className={styles.productRow}>
          <div className={styles.productName}>
            <div>Продукти</div>
          </div>
          <div className={styles.productCount}>
            <div>Кол.</div>
          </div>
          <div className={styles.productPrice}>
            <div>Цена</div>
          </div>
        </div>

        {order.orderItems.map((i, index) => (
          <div className={styles.productRow} key={index + "" + i.productId}>
            <div className={styles.productName}>
              <div className={styles.bigText}>
                {index + 1}. {i.productName}
              </div>
              <div className={styles.productDescription}>{i.description}</div>
              <div className={styles.productDescription}>
                {i.cakeFoto ? (
                  <div>
                    <strong>Фото:</strong>
                    {i.cakeFoto}
                  </div>
                ) : (
                  ""
                )}
              </div>
              <div className={styles.productDescription}>
                {i.cakeTitle ? (
                  <div>
                    <strong>Надпис:</strong>
                    {i.cakeTitle}
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className={styles.productCount}>
              <span>
                {i.productAmount} {i.unit}
              </span>
            </div>
            <div className={styles.productPrice}>
              <span>{toBGN(i.productAmount * i.price)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <Footer order={order} />
      </div>
    </div>
  );
}

function Footer({ order }: { order: OrderDTO }) {
  if (order.isPaid) {
    return (
      <div className={styles.footerRow}>
        <span className={styles.footerInfo}>ПЛАТЕНА</span>
        <span className={styles.footerTotal}>Сума: {getOrderPrice(order)}</span>
      </div>
    );
  } else if (order.advancePaiment > 0) {
    return (
      <div className={styles.footerRow}>
        <span className={styles.footerInfo}>
          Капаро: {toBGN(order.advancePaiment)}
        </span>
        <span className={styles.footerTotal}>
          За доплащане: {toBGN(getOrderPrice(order))}
        </span>
      </div>
    );
  } else {
    return (
      <div className={styles.footerRow}>
        <span></span>
        <span className={styles.footerTotal}>
          За плащане: {getOrderPrice(order)}
        </span>
      </div>
    );
  }
}

function getOrderPrice(order: OrderDTO): number {
  let price = 0;
  for (let item of order.orderItems) {
    price += item.price * item.productAmount;
  }
  if (order.advancePaiment > 0) {
    price = price - order.advancePaiment;
  }
  return price;
}

function toBGN(amount: number): string {
  return amount.toLocaleString("bg-BG", { style: "currency", currency: "BGN" });
}