import React, { useState, useContext } from "react";
import ProductSelector from "./ProductSelector";
import AppContext from "../appContext";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { bg } from "date-fns/locale";
import { format } from "date-fns";
import Select from "react-select";
import { ordersApi } from "../API/ordersApi.ts";
import { useLoaderData, useNavigate } from "react-router-dom";
import DeleteOrderDialog from "./DeleteOrderDialog";
import styles from "./OrderForm.module.css";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import { UnauthorizedError } from "../system/errors";
import {
  getNewDateWithHours,
  validateOrder,
  getDefaultOrderFormData,
  DefaultSelectorValues,
  productsToOptions,
  getHoursOptions
} from "./OrderFormHelperFunctions.ts";
import { OrdersService } from "../API/ordersApi";

export async function orderFormLoader({ params }) {
  if (!JSON.parse(localStorage.getItem("isLogged"))) {
    throw new UnauthorizedError();
  }
  let isEdit = params.method === "put";
  let date = new Date();
  let order = {};
  if (isEdit) {
    order = await OrdersService.GetOrderAsync(params.id);
    date = new Date(order.pickupDate);
  } else {
    order = getDefaultOrderFormData();
  }
  return {
    order: { ...order, pickupDate: date },
    isEdit,
  };
}

export const textFieldStyle = { backgroundColor: "white", borderRadius: "4px" };

export default function OrderForm() {
  registerLocale("bg", bg);
  const navigate = useNavigate();

  let { isEdit, order } = useLoaderData();
  let { products } = useContext(AppContext); // the products from the DB
  let productOptions = productsToOptions(products); //options for the ProductSelector component, based on products
  let [orderFormData, setOrderFormData] = useState(order); //setting and getting the values for the form inputs
  let [showDeleteDialog, setShowDeleteDialog] = useState(false); // show/hide confirmation dialog on order delete
  let [validationResult, setValidationResult] = useState({
    isValid: true,
    errors: [],
  });
  let [productSelectorList, setProductSelectorList] = useState(
    order.orderItems.map((item) => (
      <ProductSelector options={productOptions} selectorValues={item} />
    ))
  ); // list of ProductSelector components added to the OrderForm

  //-- ADD NEW PRODUCT TO ORDER
  /**
   * Dynamically add an input to the order form for an a new order Item with default values
   *
   */
  function addNewProductSelector() {
    setProductSelectorList((list) => {
      return [
        ...list,
        <ProductSelector
          options={productOptions}
          selectorValues={new DefaultSelectorValues()}
        />,
      ];
    });
  }

  //-- REMOVE PRODUCT FROM ORDER --
  /**
   * Remove an orderItem (productSelector) from the order
   * @param {int} index
   */
  function removeProduct(index) {
    productSelectorList.splice(index, 1);
    setProductSelectorList([...productSelectorList]);
  }

  //-- SUBMIT ORDER --
  async function handleSubmit(event) {
    event.preventDefault();
    let orderItems = productSelectorList.map(
      (selector) => selector.props.selectorValues
    );

    let newOrder = {
      ...orderFormData,
      orderItems: orderItems,
    };

    const newValidationResult = validateOrder(newOrder);
    setValidationResult(newValidationResult);

    if (!newValidationResult.isValid) {
      console.log(newValidationResult.errors);
    } else {
      if (isEdit) {
        await ordersApi.putOrder(newOrder.id, newOrder);
      } else {
        await ordersApi.postOrder(newOrder);
      }
      closeForm();
    }
  }

  function closeForm() {
    navigate("/");
  }

  async function deleteOrder() {
    await ordersApi.deleteOrder(order.id);
    closeForm();
  }

  //-- RETURN HTML --
  return (
    <div className={styles.formContainer}>
      <form>
        <Typography variant="h3">
          {isEdit ? "Редакция на Поръчка" : "Нова Поръчка"}{" "}
          {isEdit && (
            <input
              type="button"
              value="Изтрий"
              onClick={() => setShowDeleteDialog(true)}
            />
          )}
        </Typography>
        <div className={styles.mainInfo}>
          <TextField
            value={orderFormData.clientName}
            sx={textFieldStyle}
            size="small"
            label="Клиент ..."
            onChange={(evt) => {
              setOrderFormData((order) => ({
                ...order,
                clientName: evt.target.value,
              }));
            }}
          />{" "}
          <div style={{ display: "inline-block", width: "fit-content" }}>
            <DatePicker
              selected={orderFormData.pickupDate}
              locale="bg"
              dateFormat="P"
              onChange={(date) =>
                setOrderFormData((order) => ({ ...order, pickupDate: date }))
              }
              customInput={<TextField sx={textFieldStyle} size="small" />}
            />
          </div>
          <Select
            value={getHoursOptions().filter(
              (option) =>
                option.label ===
                format(new Date(orderFormData.pickupDate), "HH:mm")
            )}
            options={getHoursOptions()}
            placeholder="Час ..."
            onChange={(option) => {
              setOrderFormData((order) => ({
                ...order,
                pickupDate: getNewDateWithHours(order.pickupDate, option.value),
              }));
            }}
          />
          <TextField
            size="small"
            type="tel"
            sx={textFieldStyle}
            value={orderFormData.clientPhone}
            label="Телефон"
            onChange={(evt) => {
              setOrderFormData((order) => ({
                ...order,
                clientPhone: evt.target.value,
              }));
            }}
          />
          <TextField
            size="small"
            value={orderFormData.advancePaiment}
            sx={textFieldStyle}
            label="Капаро"
            onChange={(evt) => {
              setOrderFormData((order) => ({
                ...order,
                advancePaiment: evt.target.value,
              }));
            }}
          />
          <label>
            Платена?
            <Checkbox
              size="large"
              color="error"
              checked={orderFormData.isPaid}
              onChange={(evt) => {
                setOrderFormData((order) => ({
                  ...order,
                  isPaid: evt.target.checked,
                }));
              }}
            />
          </label>
        </div>
        <hr />
        <ul>
          {productSelectorList.map((el, index) => (
            <div key={index}>
              <li className={styles.productListItem}>
                <div style={{ flexGrow: "1", maxWidth: "1025px" }}>{el}</div>
                <Button
                  tabIndex={-1}
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => {
                    removeProduct(index);
                  }}
                >
                  X{" "}
                </Button>
              </li>
              <hr />
            </div>
          ))}
        </ul>
        <Button
          variant="outlined"
          onClick={() => {
            addNewProductSelector();
          }}
        >
          Добави продукт
        </Button>
        <div className={styles.submitGroup}>
          <Button variant="contained" onClick={closeForm}>
            Откажи
          </Button>
          <Button variant="contained" onClick={handleSubmit} color="secondary">
            Запази
          </Button>
        </div>
        {!validationResult.isValid && (
          <div>
            <h3>Невалидни стойности на поръчката:</h3>
            <ul>
              {validationResult.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <DeleteOrderDialog
          open={showDeleteDialog}
          setOpen={setShowDeleteDialog}
          onDelete={deleteOrder}
        />
      </form>
    </div>
  );
}


