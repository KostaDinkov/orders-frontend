import React, { useState, useContext } from "react";
import ProductSelector from "./ProductSelector";
import moment from "moment";
import AppContext from "../appContext";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { bg } from "date-fns/locale";
import Select from "react-select";
import { ordersApi } from "../API/ordersApi";
import { useLoaderData, useNavigate } from "react-router-dom";
import DeleteOrderDialog from "./DeleteOrderDialog";
import styles from "./OrderForm.module.css";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import { UnauthorizedError } from "../system/errors";

export async function orderFormLoader({ params }) {
  if (!JSON.parse(localStorage.getItem("isLogged"))) {
    throw new UnauthorizedError();
  }
  let isEdit = params.method === "put";
  let date = new Date();
  let order = {};
  if (isEdit) {
    order = await ordersApi.getOrder(params.id);
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
          selectorValues={new defaultSelectorValues()}
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
          {isEdit ? "???????????????? ???? ??????????????" : "???????? ??????????????"}{" "}
          {isEdit && (
            <input
              type="button"
              value="????????????"
              onClick={() => setShowDeleteDialog(true)}
            />
          )}
        </Typography>
        <div className={styles.mainInfo}>
          <TextField
            value={orderFormData.clientName}
            sx={textFieldStyle}
            size="small"
            label="???????????? ..."
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
              (option) => option.label === orderFormData.pickupTime
            )}
            options={getHoursOptions()}
            placeholder="?????? ..."
            onChange={(option) => {
              setOrderFormData((order) => ({
                ...order,
                pickupTime: option.value,
              }));
            }}
          />
          <TextField
            size="small"
            type="tel"
            sx={textFieldStyle}
            value={orderFormData.clientPhone}
            label="??????????????"
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
            label="????????????"
            onChange={(evt) => {
              setOrderFormData((order) => ({
                ...order,
                advancePaiment: evt.target.value,
              }));
            }}
          />
          <label>
            ???????????????
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
                  tabIndex="-1"
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
            addNewProductSelector(new defaultSelectorValues());
          }}
        >
          ???????????? ??????????????
        </Button>
        <div className={styles.submitGroup}>
          <Button variant="contained" onClick={closeForm}>
            ????????????
          </Button>
          <Button variant="contained" onClick={handleSubmit} color="secondary">
            ????????????
          </Button>
        </div>
        {!validationResult.isValid && (
          <div>
            <h3>?????????????????? ?????????????????? ???? ??????????????????:</h3>
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

//-- HELPER FUNCTIONS --
function validateOrder(order) {
  let validationResult = { isValid: false, errors: [] };

  if (order.clientName === "" || order.clientName.length < 3) {
    validationResult.errors.push("?????????????????? ?????? ???? ????????????.");
  }
  if (order.pickupDate === "" || !moment(order.pickupDate).isValid()) {
    validationResult.errors.push(
      `?????????????????? ???????? ???? ????????????????????: ${order.pickupDate} `
    );
  } else {
    order.pickupDate = moment(order.pickupDate).format(
      "YYYY-MM-DDT00:00:00.000"
    );
  }
  if (order.advancePaiment === "") order.advancePaiment = 0;

  const regex = new RegExp("^([01]?[0-9]|2[0-3]):[0-5][0-9]$");
  if (!regex.test(order.pickupTime)) {
    validationResult.errors.push("?????????????????? ?????? ???? ????????????????????");
  }

  if (order.orderItems.length === 0) {
    validationResult.errors.push(
      "?????????????????? ???????????? ???? ?????????????? ?????????????? 1 ??????????????"
    );
  }

  order.orderItems.forEach((element, index) => {
    if (element.productId === undefined || element.productId === -1) {
      validationResult.errors.push(
        `?????????????????? ???????????????? ???? ?????????????? ?????????? ${index + 1}`
      );
    }
    if (element.productAmount <= 0) {
      validationResult.errors.push(
        `?????????????????? ???????????????? ???? ???????????????????? ???? ?????????????? ?????????? ${index + 1} - ${
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

function defaultSelectorValues() {
  this.productId = -1;
  this.productAmount = 0;
  this.cakeFoto = "";
  this.cakeTitle = "";
  this.description = "";
}

function productsToOptions(products) {
  if (products.length >= 1) {
    let options = products.map((p) => ({
      value: p.id,
      label: p.name,
      code: p.code,
    }));
    return options;
  }
  return [];
}

function getHoursOptions() {
  let availableHours = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30"
  ];
  let hoursOptions = availableHours.map((hour) => ({
    value: hour,
    label: hour,
  }));
  return hoursOptions;
}

function getDefaultOrderFormData() {
  return {
    operatorId: 0,
    pickupDate: "",
    pickupTime: "",
    clientName: "",
    clientPhone: "",
    isPaid: false,
    advancePaiment: 0,
    orderItems: [],
  };
}
