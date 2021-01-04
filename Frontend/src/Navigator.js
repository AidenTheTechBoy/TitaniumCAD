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
import Login from "./pages/Login";
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
                        <Login />
                    </Route>
                    <Route path="/dashboard">
                        <Dashboard />
                    </Route>
                    <Route path="/civilians">
                        <Civilians />
                    </Route>
                    <Route path="/dmv">
                        <DMV />
                    </Route>
                    <Route path="/atf">
                        <ATF />
                    </Route>
                    <Route path="/cad">
                        <CAD />
                    </Route>
                    <Route path="/settings">
                        <Settings />
                    </Route>
                    <Route path="/database">
                        <Database />
                    </Route>
                    <Route path="/codes">
                        <Codes />
                    </Route>
                    <Route path="/auth">
                        <h3>Found Cookie: {localStorage.getItem('cookie')}</h3>
                    </Route>
                    <Route path="/manager">
                        <Manager />
                    </Route>
                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
        </Router>
    )
}

function ForceLogin() {
    //No Cookie or Expired
    const cookie_expiration = localStorage.getItem('expiration')
    if (Date.now() > cookie_expiration || !localStorage.getItem('cookie')) {

        //Manager Pages
        if (window.location.pathname.startsWith('/manager')) {
            if (window.location.pathname !== '/manager/login') {
                setTimeout(function () {
                    window.location = '/manager/login'
                }, 1000)
                return true
            }
            return false
        }

        //Normal Pages
        if ( !['/', '/login'].includes(window.location.pathname) ) {
            setTimeout(function () {
                window.location = '/login'
            }, 1000)
            return true
        }
        
    }
    return false
}

//Home Page
function Home() {
  return (
    <div>
      <h1 style={{color: 'white'}}>Welcome to Titanium CAD</h1>
      <a href='/manager/dashboard' style={{display:'block', color: 'white', textDecoration: 'none', backgroundColor: '#00d419', padding: '20px', textAlign: 'center'}}>Open Manager</a>
      <a href='/dashboard' style={{display:'block', color: 'white', textDecoration: 'none', backgroundColor: '#34B3CE', padding: '20px', textAlign: 'center'}}>Open Community Dashboard</a>
    </div>
  )
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
