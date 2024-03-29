import React, { useEffect, useState, useContext } from "react";
import Select, { createFilter, SingleValue } from "react-select";
import styles from "./ProductSelector.module.css";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import { textFieldStyle } from "./OrderForm";
import SelectorOption from "../../Types/SelectorOptions";
import { ProductSelectorValues } from "./OrderFormHelperFunctions";


export const selectorStyles = {
  control: (styles: any) => ({
    ...styles,

    borderColor: "rgba(0, 0, 0, 0.23);",
    minHeight: "40px",
    flexGrow: "1",
  }),
};

export default function ProductSelector({
  options,
  selectorValues,
}: {
  options: SelectorOption[];
  selectorValues: ProductSelectorValues;
}) {
  let [productId, setProductId] = useState("");
  let [productAmount, setProductAmount] = useState(0);
  let [cakeTitle, setCakeTitle] = useState("");
  let [cakeFoto, setCakeFoto] = useState("");
  let [description, setDescription] = useState("");

  let [showDescription, setShowDescription] = useState(selectorValues.description!=="");
  let [showDescriptionDisabled, setShowDescriptionDisabled] = useState(selectorValues.description!=="");
  
  useEffect(() => {
    if (selectorValues !== undefined) {
      setProductId(selectorValues.productId || "");
      setProductAmount(selectorValues.productAmount);
      setCakeTitle(selectorValues.cakeTitle);
      setCakeFoto(selectorValues.cakeFoto);
      setDescription(selectorValues.description);
    }
  }, [selectorValues]);

  const filterConfig = {
    ignoreCase: true,
    ignoreAccents: true,
    trim: false,
    //React select option has a specific shape. Custom properties are stored in the data object
    stringify: (option:{label:string, value:string, data:any} ) => `${option.label} ${option.data.code}`,
    matchFrom: "any" as const,
  };

  const filterOptions = (
    candidate: { label: string; value: string; data: any },
    input: string
  ) => {
    if (input) {
      //filter by code
      if(input.startsWith(".")){

        let name = candidate.label.toLowerCase().replaceAll(/["“\.-]/g,"");
        let parts = input.slice(1).trim().split(" ");
        for (let part of parts) {
          if (!name.includes(part.toLowerCase())) {
            return false;
          }
        }
        return true;
      }
      else{
        return candidate.data.code.startsWith(input.trim());
       
      }
      
    }
    return true;
  };

  const isCakeCategory = (category: string): boolean => {
    if (category.toLowerCase().includes("торта")) {
      return true;
    }
    return false;
  };

  const handleProductChange=(option:SingleValue<SelectorOption>)=>{
    if (option) {
      setProductId(option.value);
      selectorValues.productId = option.value;
      selectorValues.productCategory = option.category || "";     
    }
  }

  return (
    <div className={styles.selectorContainer} >
      <div className={styles.productRow}>
        <div className={styles.selectWrapper} data-field="productNameField" data-test='ProductSelector-productSelector'>
          <Select  
            value={options.filter(
              (option) => option.value === productId.toString()
            )}
            placeholder="Продукт ..."
            options={options}
            filterOption={filterOptions}
            onChange={handleProductChange}
            styles={selectorStyles}
            required
          />
        </div>
        <div>
          <TextField
            data-test='ProductSelector-amountInput'
            value={productAmount || ""}
            label="Количество"
            sx={{ ...textFieldStyle, width: "100px" }}
            size="small"
            type="number"
            required
            onChange={(evt) => {
              let quantity = parseFloat(evt.target.value);
              if(!Object.is(quantity, NaN)){
                setProductAmount(quantity);
                selectorValues.productAmount = quantity;
              }
              else{
                setProductAmount(0)
                selectorValues.productAmount = 0;
              }
              
            }}
          />
        </div>
        {isCakeCategory(selectorValues.productCategory) && (
          <>
            <TextField
            data-test='ProductSelector-cakeTitleInput'
              value={cakeTitle}
              type="text"
              sx={textFieldStyle}
              label="Надпис за торта"
              size="small"
              onChange={(evt) => {
                setCakeTitle(evt.target.value);
                selectorValues.cakeTitle = evt.target.value;
              }}
            />

            <TextField
              value={cakeFoto}
              data-test='ProductSelector-cakeFotoInput'
              sx={{ ...textFieldStyle, width: "70px" }}
              type="text"
              placeholder="Фото"
              size="small"
              onChange={(evt) => {
                setCakeFoto(evt.target.value);
                selectorValues.cakeFoto = evt.target.value;
              }}
            />
          </>
        )}
        Бележка?{" "}
        <Checkbox
        data-test='ProductSelector-descriptionCheckBox'
          checked={showDescription}
          disabled={showDescriptionDisabled}
          onChange={(evt, checked) => setShowDescription(!showDescription)}
          tabIndex={-1}
        />
      </div>

      {showDescription &&
      <TextField
        data-test='ProductSelector-descriptionInput'
        size="small"
        sx={textFieldStyle}
        value={description}
        type="text"
        placeholder="Забележка..."
        multiline
        onChange={(evt) => {
          setDescription(evt.target.value);
          selectorValues.description = evt.target.value;
          setShowDescriptionDisabled(selectorValues.description!=="");
        }}
      />}
    </div>
  );
}
