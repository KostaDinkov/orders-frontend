import React from 'react';
import styles from './Reports.module.scss';
import { Link, Outlet } from 'react-router-dom';

export default function ReportsPage(){
    return(
        <div className={styles.reportsPageContainer}>
            <div className={styles.sideBar}>
                <ul>
                    <Link to="/reports/priceList">
                        <li>Ценоразпис</li>
                    </Link>
                    <li>Фотокартини</li>
                   
            
                </ul>
            </div>
            <div className={styles.pageContent}>
                <Outlet />
            </div>
        </div>

    )
}