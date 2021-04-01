import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { SidebarData } from './SidebarData';
import "./Sidebar.css"
import { IconContext } from 'react-icons';

export const Sidebar = () => {
    const [sidebar, setSideBar ] = useState(false)

    const showSideBar = () => setSideBar(!sidebar)

    return (
        <>
        <IconContext.Provider value={{color: '#fff'}}>
            <div className="navbar">
                <Link to="#" className="menu-bars">
                    <FaIcons.FaBars onClick={showSideBar}/>
                </Link>
            </div>
            <div className={sidebar ? 'nav-menu active' : 'nav-menu'}>
                <ul className="nav-menu-items" onClick={showSideBar}>
                    <li className="narbar-toggle">
                        <Link to="#" className="menu-bars">
                            <AiIcons.AiOutlineClose />
                        </Link>
                    </li>
                    {SidebarData.map((item, index) => {
                        return (
                            <li key={index} className={item.cName}>
                                <Link to={item.path}>
                                    {item.icon}
                                    <span>{item.title}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </IconContext.Provider>
        </>
    );
}