import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import Config from '../Config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import axios from 'axios'

export default class Login extends React.Component {

    constructor(props) {

        super(props)
        this.state = {
            email: '',
            username: '',
            password: '',
            access_code: '',
            server_name: '',
            access_message: '',
            register: false,
        }

        let access_code = localStorage.getItem('access_code')
        if (access_code) {
            this.setState({access_code: access_code})
            this.UpdateCommunityProfile(access_code)
        }


        this.login = this.login.bind(this)
        this.UpdateCommunityProfile = this.UpdateCommunityProfile.bind(this)
    }

    async login() {

        console.log(this.state)
        if (!this.state.access_code) {
            Config.toastFailure('A server access code must be provided!', 5000)
            return
        }

        if (this.state.register) {
            //Create New Account
            try {
                let req = await axios.post(Config.api + '/register', {
                    email: this.state.email,
                    username: this.state.username,
                    password: this.state.password,
                    access_code: this.state.access_code
                })
                if (req.data) {
                    this.setState({register: false})
                }
                Config.toastSuccess('Account created! You can now login!')
            }
            catch (err) {
                if (err.response.data) {
                    Config.toastFailure(err.response.data, 5000)
                }
                
            }
            return
        }

        try {
            let req = await axios.post(Config.api + '/login', {
                email: this.state.email,
                password: this.state.password,
                access_code: this.state.access_code
            })
            if (req.data) {
                localStorage.setItem('cookie', req.data.cookie)
                localStorage.setItem('expiration', req.data.expiration)
                localStorage.setItem('username', req.data.username)
                localStorage.setItem('community_id', req.data.community)
                window.location.pathname = '/dashboard'
            }
        }
        catch (err) {
            if (err.response.data) {
                Config.toastFailure(err.response.data, 5000)
            }
            
        }
    }

    async UpdateCommunityProfile(access_code) {
        try {
            let req = await axios.post(Config.api + '/communities/check', {
                'access_code': access_code || this.state.access_code
            })
            if (req.data[0]) {
                localStorage.setItem('server_name', req.data[0].name)
                localStorage.setItem('access_code', req.data[0].access_code)
                this.setState({
                    server_name: req.data[0].name,
                    access_code: req.data[0].access_code,
                    community_id: req.data[0].id
                })
            } else {
                this.setState({access_message: 'Community could not be found.'})
            }
        }
        catch (err) {
            console.log(err)
            if (err.response && err.response.data) {
                Config.toastFailure(err.response.data, 5000)
            }
            
        }
    }

    render() {
        
        if (!this.state.access_code || !this.state.server_name) {
            return (
                <div>
                    <div className="background-image"></div>
                    <div className='login-form'>
                        <div className='login-access-header'>
                            <div>
                                <h3>ENTER THE ACCESS CODE OF THE COMMUNITY YOU WOULD LIKE TO JOIN</h3>
                                <input type='text' placeholder='' onChange={(e) => {
                                    this.setState({access_code: e.target.value})
                                }}/>
                            </div>

                            <div>
                                <h3 className='login-access-message' style={{fontSize: '20px'}}>{this.state.access_message}</h3>
                                <div onClick={async () => this.UpdateCommunityProfile()}>PROCEED TO LOGIN <FontAwesomeIcon className='login-change-community-icon' icon={faArrowRight} /></div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        
        return (
            <div>
                
                <div className="background-image"></div>

                {/* Login Form */}
                <div className='login-form'>

                    <img className='icon-lg' src={`${Config.api}/static/img/community-${this.state.community_id}.png`} alt='Titanium CAD logo.' />

                    <h1 className='login-header'>{this.state.server_name}</h1>

                    {/* Email */}
                    <div className='login-input-group'>
                        <label className='login-input-prompt'>Email:</label>
                        <input autoComplete={this.state.register ? 'off' : 'on'} type='text' name='email' htmlFor='email' className='login-input' onChange={(e) => {
                            this.setState({email: e.target.value})
                        }}/>
                    </div>

                    {/* Username */}
                    {this.state.register ? (<div className='login-input-group'>
                        <label className='login-input-prompt'>Username:</label>
                        <input autoComplete='off' type='text' name='username' htmlFor='username' className='login-input' onChange={(e) => {
                            this.setState({username: e.target.value})
                        }}/>
                    </div>) : (null)}
                    
                    {/* Password */}
                    <div className='login-input-group'>
                        <label className='login-input-prompt'>Password:</label>
                        <input autoComplete={this.state.register ? 'new-password' : 'current-password'} type='password' name='password' htmlFor='password' className='login-input' onChange={(e) => {
                            this.setState({password: e.target.value})
                        }}/>
                    </div>
    
                    {/* Login/Register */}
                    <div className='login-button' onClick={this.login}>{this.state.register ? 'REGISTER' : 'LOGIN'}</div>
                    <div className='login-register' onClick={() => this.setState({register: !this.state.register})}>OR <b>{this.state.register ? 'LOG IN TO EXISTING ACCOUNT' : 'CREATE AN ACCOUNT'}</b></div>
                </div>
                {/* Forgot Password */}
                <button className='login-change-community' onClick={() => {
                    this.setState({access_code: '', server_name: ''})
                    localStorage.removeItem('access_code')
                }}><FontAwesomeIcon className='login-change-community-icon' icon={faArrowLeft} /> Login to a Different Community</button>
            </div>
        )
    }
}
