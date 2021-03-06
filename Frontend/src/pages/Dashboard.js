import { faCar, faCog, faDesktop, faFire, faLaptop, faUser } from '@fortawesome/free-solid-svg-icons'

import Config from '../Config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Header from './Components/Header'
import React from 'react'
import axios from 'axios'

export default class Dashboard extends React.Component {
   
    constructor(props) {
        super(props)
        this.state = {
            width: 0,
            height: 0,
            permissions: [],
            timedate: new Date().toLocaleString()
        }
        if (!localStorage.getItem('cookie')) {
            window.location = '/login'
        }
    }

    updateDimensions() {
        if (window.innerWidth > 1440) {
            this.setState({ width: 1440, height: window.innerHeight });
        } else {
            this.setState({ width: window.innerWidth, height: window.innerHeight });
        }
    }

    async componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions.bind(this))
        setInterval(() => {
            this.setState({timedate: new Date().toLocaleString()})
        }, 1000)

        let req = await axios.post(Config.api + '/my-permissions', {
            'cookie' : localStorage.getItem('cookie'),
            'access_code': localStorage.getItem('access_code'),
        })
        this.setState({permissions: req.data})
        
        let req2 = await axios.post(Config.api + '/dashboard', {
            'cookie' : localStorage.getItem('cookie'),
            'access_code': localStorage.getItem('access_code'),
        })
        this.setState({settings: req2.data})

    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions.bind(this))
    }

    render() {
        return (
            <div>
                <Header back='/' message='Home' logout={true} />
                <div className='dashboard-container'>
                    <div className='dashboard-server'>
                        <div style={{display: 'flex', alignContent: 'center', justifyContent: 'center'}}>
                            <img className='icon-lg' src={`${Config.api}/static/img/community-${localStorage.getItem('community_id')}.png`} alt='Server Icon.' />
                            <div style={{marginLeft: '15px', alignSelf: 'center', justifySelf: 'center'}}>
                                <h2 className='header-large'>{localStorage.getItem('server_name')}</h2>
                                <h3 className='dashboard-date'>{this.state.timedate}</h3>
                            </div>
                        </div>
                    </div>
                    <h1 className='page-header' style={{flex: 1, alignSelf: 'center'}}>Welcome to the panel, <br/>{localStorage.getItem('username')}</h1>
                </div>
                
                {
                    this.state.permissions.permission_civilian ?
                    <div id='dash-msg' className='dashboard-message' style={{width: this.state.width > 480 ? (Math.floor(this.state.width / 240) * 240 - 60) : this.state.width - 60 }}>
                        <h3 className='dashboard-message-header'>Server Message</h3>
                        <p className='dashboard-message-body'>{this.state.settings ? this.state.settings.dashboard_message : 'Loading...'}</p>
                    </div>
                    :
                    null
                }

                {
                    this.state.permissions.permission_civilian ?
                    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: '50px'}}>     
                        {this.state.permissions.permission_civilian ? <div className='dashboard-item' onClick={() => window.location = '/civilians'}>
                            <div className='dashboard-icon-container'>
                                <FontAwesomeIcon className='dashboard-icon' icon={faUser} />
                            </div>
                            Civilian Manager
                        </div> : null}

                        {this.state.permissions.permission_civilian ? <div className='dashboard-item' onClick={() => window.location = '/dmv'}>
                            <div className='dashboard-icon-container'>
                                <FontAwesomeIcon className='dashboard-icon' icon={faCar} />
                            </div>
                            Department of Motor Vehicles
                        </div> : null}

                        {this.state.permissions.permission_civilian ? <div className='dashboard-item' onClick={() => window.location = '/atf'}>
                            <div className='dashboard-icon-container'>
                                <FontAwesomeIcon className='dashboard-icon' icon={faFire} />
                            </div>
                            Alcohol Tobacco and Firearms
                        </div> : null}

                        {
                        (this.state.permissions.permission_police_mdt | this.state.permissions.permission_fire_mdt) ?
                        <div className='dashboard-item' onClick={() => window.location = '/mdt'}>
                            <div className='dashboard-icon-container'>
                                <FontAwesomeIcon className='dashboard-icon' icon={faLaptop} />
                            </div>
                            Mobile Data Terminal
                        </div> : null}

                        {this.state.permissions.permission_dispatch ? <div className='dashboard-item' onClick={() => window.location = '/cad'}>
                            <div className='dashboard-icon-container'>
                                <FontAwesomeIcon className='dashboard-icon' icon={faDesktop} />
                            </div>
                            Computer Aided Dispatch
                        </div> : null}

                        {
                        (
                            this.state.permissions.permission_manage_settings |
                            this.state.permissions.permission_manage_servers |
                            this.state.permissions.permission_manage_members |
                            this.state.permissions.permission_manage_departments |
                            this.state.permissions.permission_manage_codes
                        ) ?
                        <div className='dashboard-item' onClick={() => window.location = '/settings'}>
                            <div className='dashboard-icon-container'>
                                <FontAwesomeIcon className='dashboard-icon' icon={faCog} />
                            </div>
                            Manage Server
                        </div> : null}
                    </div>
                    :
                    <div>
                    <div id='dash-msg' className='dashboard-message' style={{width: this.state.width > 480 ? (Math.floor(this.state.width / 240) * 240 - 60) : this.state.width - 60 }}>
                        <h3 className='dashboard-message-header'>No Permissions!</h3>
                        <p className='dashboard-message-body'>
                        You currently do not have any permissions in the CAD.
                        This server is set to private, so you will need to be manually given the civilian permission by a system administrator.
                        Please follow whatever process has been put in place by your community's management team.
                        </p>
                    </div>
                    </div>
                }
                
            </div>
        )
    }

}



/* <div className='dashboard-logout' style={{backgroundColor: 'red'}} onClick={async () => {
        await axios.post(Config.api + '/logout', {
            cookie: localStorage.getItem('cookie')
        })
        localStorage.removeItem('cookie')
        window.location = '/login'
    }}>
        Logout
    </div> */