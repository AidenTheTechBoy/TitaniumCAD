import Config from '../Config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import axios from 'axios'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default class ManagerLogin extends React.Component {

    constructor(props) {

        super(props)
        this.state = {
            email: '',
            username: '',
            password: '',
            server_name: '',
            access_message: '',
            register: false,
        }

        this.login = this.login.bind(this)
    }

    async login() {

        if (this.state.register) {
            //Create New Account
            try {
                let req = await axios.post(Config.api + '/register', {
                    email: this.state.email,
                    username: this.state.username,
                    password: this.state.password,
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
            })
            if (req.data) {
                localStorage.setItem('manager-cookie', req.data.cookie)
                localStorage.setItem('manager-expiration', req.data.expiration)
                localStorage.setItem('manager-username', req.data.username)
                window.location.pathname = '/manager/dashboard'
            }
        }
        catch (err) {
            if (err.response.data) {
                Config.toastFailure(err.response.data, 5000)
            }
            
        }
    }

    render() {

        return (
            <div>
                
                <div className="background-image"></div>

                {/* Login Form */}
                <div className='login-form'>

                    <img className='icon-lg' src='/TitaniumCAD.png' alt='Titanium CAD logo.' />

                    <h1 className='login-header'>Titanium Manager Login</h1>

                    {/* Email */}
                    <div className='login-input-group'>
                        <label className='login-input-prompt'>Email:</label>
                        <input autoComplete={this.state.register ? 'off' : 'email'} type='text' name='email' htmlFor='email' className='login-input' onChange={(e) => {
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
                    window.location = '/'
                }}><FontAwesomeIcon className='login-change-community-icon' icon={faArrowLeft} /> Home</button>
            </div>
        )
    }
}
