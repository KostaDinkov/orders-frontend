import React, { useRef, useEffect } from "react";
import { productsApi } from "../../API/ordersApi";
import Typography from "@mui/material/Typography";
import { useLoaderData } from "react-router-dom";
import ProductDTO from "../../Types/ProductDTO";
import ProductCountDialog from "./ProductCountDialog";

export async function loader() {
  let data = await productsApi.getProducts();
  return data;
}

interface ProductsByCategory {
  [category: string]: ProductDTO[];
}

export default function ProductsAccordion() {
  
  let products = useLoaderData() as ProductDTO[];
  
  let productsByCat = products.reduce(function (result, product) {
    (result[product.category] = result[product.category] || []).push(product);
    return result;
  }, {} as ProductsByCategory);
  
  const [dialogOpen, setDialogOpen] = React.useState(false);
  
  const [product, setProduct] = React.useState<ProductDTO|null>(null);

  const [expanded, setExpanded] = React.useState<string | false>(false);

  const [callerElement, setCallerElement] = React.useState<HTMLElement|null>(null);

  useEffect(() => {
    let firstCategory = document.querySelector(
      "div.category"
    ) as HTMLDivElement;
    console.log(firstCategory);
    firstCategory.focus();
  }, []);
  
  const handleDialogOpen = (product:ProductDTO, element:HTMLElement) => {
    setProduct(product);
    setCallerElement(element);
    //TODO set caller element, so that we can return focus to it
    setDialogOpen(true);

  };

  const handleDialogClose = (caller:HTMLElement) => {
    setDialogOpen(false);
    caller.focus();
  };

  const handleKeyDown =
    (category: string, product:ProductDTO|null) => (event: React.KeyboardEvent<HTMLElement>) => {
      let target = event.target as HTMLElement;

      if (event.key === "ArrowLeft") {
        setExpanded(false);
        (target.closest("div.category") as HTMLElement).focus();
      }
      if (event.key === "ArrowRight") {
        setExpanded(category);
      }
      if (event.key === "ArrowDown") {
        target.nextElementSibling &&
          (target.nextElementSibling as HTMLElement).focus();
      }
      if (event.key === "ArrowUp") {
        target.previousElementSibling &&
          (target.previousElementSibling as HTMLElement).focus();
      }
      if(event.key ==="Enter"){
        product && handleDialogOpen(product, event.target as HTMLElement);
      }
    };

  return (
    <div>
      {Object.entries(productsByCat).map((group) => (
        <Category
          key={group[0]}
          isExpanded={expanded === group[0]}
          onKeyDown={handleKeyDown(group[0], null)}
          name={group[0]}
        >
          <div className={"products"}>
            <ul>
              {group[1].map((p) => (
                <li key={p.id} tabIndex={0} onKeyDown={handleKeyDown(group[0], p)}>
                  <Typography>{p.name}</Typography>
                </li>
              ))}
            </ul>
          </div>
        </Category>
      ))}
      {product && callerElement && <ProductCountDialog open = {dialogOpen} handleClose = {handleDialogClose} product={product} caller={callerElement}/>}
    </div>
  );
}

function Category(props: any) {
  let { isExpanded, onChange, onKeyDown, name } = props;

  let prodContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isExpanded) {
      (prodContainer.current?.querySelector("li") as HTMLLIElement).focus();
    }
  },[isExpanded]);

  return (
    <div tabIndex={0} onKeyDown={onKeyDown} className="category">
      <Typography variant="h6">{name}</Typography>
      <div hidden={!isExpanded} ref={prodContainer}>
        {props.children}
      </div>
    </div>
  );
}