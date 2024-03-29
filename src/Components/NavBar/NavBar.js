import React, { useState, useContext } from "react";
import styles from "./NavBar.module.css";
import Button from "@mui/material/Button";
import { Link, useNavigate } from "react-router-dom";
import CalendarModal from "./CalendarModal";
import { formatISO } from "date-fns";
import AppContext from "../../appContext";


const NavBar = () => {
  const {isLogged,setIsLogged} = useContext(AppContext);
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const todayStr = formatISO(new Date(), {representation:"date"});
  
  const navigate = useNavigate();
  
  function handleLogout(){
    localStorage.setItem("isLogged","false");
    localStorage.setItem("token","");
    setIsLogged(false);
    navigate("/");
  }
  return (
    <div className={styles.navBarContainer} >
      <Link to="/">
        <Button className={styles.buttonMain} variant="contained">
          Начало
        </Button>
      </Link>
      <Link to={`/orders/forDay/${todayStr}`}>
        <Button className={styles.buttonMain} variant="contained">
          Днес
        </Button>
      </Link>
      <Button
        className={styles.buttonMain}
        variant="contained"
        onClick={() => {
          setCalendarOpen(true);
        }}
      >
        Избери Дата
      </Button>

      <Link to="/orders/post/">
        <Button
          className={styles.buttonNew}
          variant="contained"
          color="secondary"
          data-test="NavBar-NewOrderBtn"
        >
          Нова Поръчка
        </Button>
      </Link>
      <Link to="/reports">
        <Button
          className={styles.buttonNew}
          variant="contained"
          
          data-test="NavBar-ReportsBtn"
        >
          Справки
        </Button>
      </Link>
      {isLogged ? (
        <Button
          className={styles.buttonNew}
          variant="contained"
          color="primary"
          onClick={handleLogout}
          data-test="NavBar-LogoutBtn"
        >
          Изход
        </Button>
      ) : (
        <Link to="/login/">
          <Button
            className={styles.buttonNew}
            variant="contained"
            color="primary"
            data-test="NavBar-LoginBtn"
          >
            Вход
          </Button>
        </Link>
      )}

      <CalendarModal open={calendarOpen} setOpen={setCalendarOpen} />
    </div>
  );
};

export default NavBar;
