import React, { useState, useEffect } from "react";
import styles from "./Button.module.css";
import ProductSelector from "./ProductSelector";
import moment from 'moment'


export default function OrderFromControl({ text }) {
  let defaultOrder = {
    operatorId: 0,
    pickupDate: "",
    pickupTime:"",
    clientName: "",
    clientPhone: "",
    isPaid: false,
    advancePaiment: 0,
    orderItems: [],
  };
  let [order, setOrder] = useState(defaultOrder);
  let [products, setProducts] = useState([]);
  let [productsList, setProductsList] = useState([]);
  let [productOptions, setProductOptions] = useState([]);
  let [productSelectorList, setProductSelectorList] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length >= 1) {
      setProductOptions(() => {
        let options = products.map((p) => ({
          value: p.id,
          label: p.name,
          code: p.code,
        }));
        return options;
      });
    }
  }, [products]);

  function fetchProducts() {
    fetch("http://localhost:5257/products")
      .then((response) => response.json())
      .then((data) => setProducts(data));
  }

  let showOrderForm = () => {
    addNewProductSelector();
    dialogRef.current.showModal();
  };

  let dialogRef = React.useRef(null);

  const handleOnSubmit = (event) => {
    event.preventDefault();
    let newOrder = { ...order, orderItems: productsList, pickupDate: moment(order.pickupDate,"DD-MM-YYYY").format() };
    
    setOrder(newOrder);

    //validate order

    let validationResult = validateOrder(newOrder);
    if (!validationResult.isValid) {
      console.log(validationResult.errors);
    } else {
      console.log(newOrder);
      let data = JSON.stringify(newOrder);
      console.log(data);
      fetch("http://localhost:5257/api/orders", {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      resetForm();
    }
  };

  const handleDialogClose = (event) => {
    resetForm();
    dialogRef.current.close();
  };

  const onProductSelectorChange = (selectorValues) => {
    setProductsList((list) => {
      let result = [...list];
      result[selectorValues.index] = {
        productId: selectorValues.productId,
        productAmount: selectorValues.productAmount,
        description: selectorValues.description || "",
        cakeTitle: selectorValues.cakeTitle || "",
        cakeFoto: selectorValues.cakeFoto || "",
      };
      return result;
    });
  };

  const addNewProductSelector = () => {
    setProductSelectorList((list) => {
      console.log(list);
      return [
        ...list,
        <ProductSelector
          options={productOptions}
          onChange={onProductSelectorChange}
          index={list.length}
        />,
      ];
    });
  };

  const resetForm = () => {
    setOrder(defaultOrder);
    setProductsList([]);
    setProductSelectorList([]);
    dialogRef.current.close();
  };

  return (
    <>
      <div className={styles.buttonContainer} onClick={showOrderForm}>
        {text}
      </div>

      <dialog ref={dialogRef} onClose={handleDialogClose}>
        <h1>Нова Поръчка</h1>
        <form method="dialog" onSubmit={handleOnSubmit}>
          <div>
            <input
              value={order.clientName}
              type="text"
              placeholder="Клиент ..."
              name="clientName"
              id="clientName"
              onChange={(evt) => {
                setOrder((order) => ({
                  ...order,
                  clientName: evt.target.value,
                }));
              }}
            />{" "}
            <input
              value={order.pickupDate}
              type="datetime"
              placeholder="За дата ..."
              name="pickupDate"
              id="pickupDate"
              onChange={(evt) => {
                setOrder((order) => ({
                  ...order,
                  pickupDate: evt.target.value,
                }));
              }}
            />{" "}
             <input
              value={order.pickupTime}
              type="text"
              placeholder="Час ..."
              name="pickupTime"
              id="pickupTime"
              onChange={(evt) => {
                setOrder((order) => ({
                  ...order,
                  pickupTime: evt.target.value,
                }));
              }}
            />{" "}
          </div>

          <div>
            <input
              type="tel"
              value={order.clientPhone}
              placeholder="Телефон ..."
              name="clientPhone"
              id="clientPhone"
              onChange={(evt) => {
                setOrder((order) => ({
                  ...order,
                  clientPhone: evt.target.value,
                }));
              }}
            />

            <input
              type="number"
              value={order.advancePaiment}
              name="advance"
              id="advance"
              onChange={(evt) => {
                setOrder((order) => ({
                  ...order,
                  advancePaiment: evt.target.value,
                }));
              }}
            />

            <label>
              Платена?
              <input
                type="checkbox"
                name="isPaid"
                id="isPaid"
                checked={order.isPaid}
                onChange={(evt) => {
                  setOrder((order) => ({
                    ...order,
                    isPaid: evt.target.checked,
                  }));
                }}
              />
            </label>
          </div>

          <div>
            {productSelectorList.map((el, index) => (
              <div key={index}>{el}</div>
            ))}
          </div>
          <input type="button" value="Добави" onClick={addNewProductSelector} />
          <div>
            <input type="button" value="Отказ" onClick={handleDialogClose} />

            <input type="submit" value="Submit" />
          </div>
        </form>
      </dialog>
    </>
  );
}

function validateOrder(order) {
  let validationResult = { isValid: false, errors: [] };

  if (order.clientName === "" || order.clientName.length < 3) {
    validationResult.errors.push("Невалидно име на клиент.");
  }
  if (order.pickupDate === "") {
    validationResult.errors.push("Невалидна дата за получаване");
  }
  const regex = new RegExp('^([01]?[0-9]|2[0-3]):[0-5][0-9]$')
  if(!regex.test(order.pickupTime)){
    validationResult.errors.push("Невалиден час за получаване");
  }
  order.orderItems.forEach((element, index) => {
    if (element.productId === undefined) {
      validationResult.errors.push(
        `Невалидна стойност за продукт номер ${index + 1}`
      );
    }
    if (element.productAmount <= 0) {
      validationResult.errors.push(
        `Невалидна стойност за количество за продукт номер ${index + 1} - ${
          element.productAmount
        }`
      );
    }
  });

  if (validationResult.errors.length === 0) {
    validationResult.isValid = true;
  }
  return validationResult;
}
