import 'react-toastify/dist/ReactToastify.css';

import {
    Route,
    BrowserRouter as Router,
    Switch,
    useRouteMatch
} from "react-router-dom";

import ATF from "./pages/ATF";
import CAD from "./pages/CAD";
import Civilians from "./pages/Civilians";
import Codes from './pages/Codes';
import DMV from "./pages/DMV";
import Dashboard from "./pages/Dashboard";
import Database from './pages/Database'
import {Helmet} from "react-helmet";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MDT from './pages/MDT';
import MDashboard from "./pages/ManagerDashboard";
import MLogin from './pages/ManagerLogin'
import React from "react";
import Settings from './pages/Settings';
import { ToastContainer } from 'react-toastify';

//Main Navigator
export default function Navigator() {

    if (ForceLogin()) {
        return (
            <div className="lds-dual-ring"></div>
        )
    }
    
    return (
        <Router>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                <Switch>
                    <Route path="/login">
                        {CreateMeta('Login', '/login')}
                        <Login />
                    </Route>
                    <Route path="/dashboard">
                        {CreateMeta('Dashboard', '/dashboard')}
                        <Dashboard />
                    </Route>
                    <Route path="/civilians">
                    {CreateMeta('Civilian Manager', '/civilians')}
                        <Civilians />
                    </Route>
                    <Route path="/dmv">
                    {CreateMeta('Vehicle Manager', '/dmv')}
                        <DMV />
                    </Route>
                    <Route path="/atf">
                    {CreateMeta('Weapon Manager', '/atf')}
                        <ATF />
                    </Route>
                    <Route path="/cad">
                    {CreateMeta('CAD', '/cad')}
                        <CAD />
                    </Route>
                    <Route path="/mdt">
                        {CreateMeta('MDT', '/mdt')}
                        <MDT />
                    </Route>
                    <Route path="/settings">
                      {CreateMeta('Settings', '/settings')}
                        <Settings />
                    </Route>
                    <Route path="/database">
                      {CreateMeta('Database', '/database')}
                        <Database />
                    </Route>
                    <Route path="/codes">
                      {CreateMeta('10-Codes', '/codes')}
                        <Codes />
                    </Route>
                    <Route path="/manager">
                        {CreateMeta('Titanium Manager', '/manager')}
                        <Manager />
                    </Route>
                    <Route path="/">
                        {/* <Home /> */}
                        <Home/>
                    </Route>
                </Switch>
        </Router>
    )
}

function ForceLogin() {
    
    //Manager Pages
    if (window.location.pathname.startsWith('/manager')) {
        if (!localStorage.getItem('manager-cookie') || localStorage.getItem('manager-expiration') < Date.now()) {
            if (window.location.pathname !== '/manager/login') {
                setTimeout(function () {
                    window.location = '/manager/login'
                }, 1000)
                return true
            }
        }
        return false
    }
    
    //Normal Pages
    if ( !['/', '/login'].includes(window.location.pathname) && ( !localStorage.getItem('cookie') || localStorage.getItem('expiration') < Date.now() )) {
        setTimeout(function () {
            window.location = '/login'
        }, 1000)
        return true
    }

    return false
}

//Manager Pages
function Manager() {
    let { url } = useRouteMatch();
    return (
        <Switch>
            <Route path={`${url}/login`}>
                <MLogin />
            </Route>
            <Route path={`${url}/dashboard`}>
                <MDashboard />
            </Route>
            <Route path={`${url}/success`}>
                <h3 style={{color: 'white'}}>Payment Successful</h3>
            </Route>
            <Route path={`${url}/canceled`}>
                <h3 style={{color: 'white'}}>Payment Canceled</h3>
            </Route>
        </Switch>
    );
}

//Meta Tags
function CreateMeta(title, path) {
    const description = 'TitaniumCAD is a powerful CAD/MDT system for roleplay gaming communities. The system allows for multiple civilians, vehicle/weapon management, and even more!'
    return (
        <Helmet>

            {/* Charset */}
            <meta charset="UTF-8" />

            {/* Normal Meta */}
            <title>{title + ' | Titanium CAD'}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content="CAD, MDT, Roleplay, FiveM, GMod, Civilian, Vehicle, Weapon, Registration, Cheap" />
            <meta name="author" content="Titanium Development" />

            {/* Open Graph Protocol*/}
            <meta property="og:title" content={title + ' | Titanium CAD'} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={`https://www.titaniumcad.com${path}`} />
            <meta property="og:image" content="https://titaniumcad.com/TitaniumCAD.png" />
            <meta property="og:image" content="https://titaniumcad.com/home/assets/img/screenshot-1-cad-system.JPG" />
            
            {/* Viewport */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            
        </Helmet>
    )
}