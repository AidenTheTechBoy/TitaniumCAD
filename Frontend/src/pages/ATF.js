import 'reactjs-popup/dist/index.css';
import 'react-tiny-fab/dist/styles.css';

import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'

import Config from '../Config'
import { Fab } from 'react-tiny-fab';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Header from './Components/Header';
import Popup from 'reactjs-popup';
import React from 'react'
import ReactList from 'react-list';
import Select from 'react-select'
import axios from 'axios'

export default class ATF extends React.Component {
   
    constructor(props) {
        super(props)
        this.state = {
            width: 0,
            height: 0,
            error: '',
            civilians: '',
            weapons: [],
            civilian_id: '',
            wep_name: '',
            wep_registration: ''
        }
    }

    async UpdateData() {
        try {

            //Get Civilians
            let civilians = await axios.post(Config.api + '/civilians/list', {
                'cookie' : localStorage.getItem('cookie'),
                'access_code': localStorage.getItem('access_code'),
            })

            //Add Civilians to State
            let civilianList = []
            for (let i in civilians.data) {
                let civ = civilians.data[i]
                civilianList[i] = { value: civ.id, label: civ.first_name + ' ' + civ.last_name }
            }
            this.setState({civilians: civilianList})

            //Add Weapons to State
            let firearms = await axios.post(Config.api + '/firearms/list', {
                'cookie' : localStorage.getItem('cookie'),
                'access_code': localStorage.getItem('access_code'),
                'civilian_id' : this.state.civilian_id
            })
            this.setState({weapons: firearms.data})
            
        }
        catch (err) {
            //window.location = '/login'
        }
    }

    updateDimensions() {
        if (window.innerWidth > 1440) {
            this.setState({ width: 1440, height: window.innerHeight });
        } else {
            this.setState({ width: window.innerWidth, height: window.innerHeight });
        }
    }

    componentDidMount() {
        this.UpdateData()
        this.updateDimensions()
        window.addEventListener("resize", this.updateDimensions.bind(this))
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions.bind(this))
    }

    render() {
        const selectStyle = {
            singleValue: (provided, state) => ({
                ...provided,
                color: 'white'
            }),
            control: (provided, state) => ({
                ...provided,
                backgroundColor: '#212026',
                outline: 'none',
                border: 0,
                boxShadow: 'none',
            }),
            menu: (provided, state) => ({
                ...provided,
                backgroundColor: '#212026',
                outline: 'none',
                border: 'none',
            }),
            option: (provided, { data, isDisabled, isFocused, isSelected }) => ({
                ...provided,
                color: 'white',
                backgroundColor: isSelected ? '#34B3CE' : null,
                '&:hover': {
                    backgroundColor: '#111015'
                }
            }),
        }
        return (
            <div id='main-container'>
                <Header back='/dashboard' />
                <h1 className='page-header'>Your Weapons</h1>            
                <div className='list-container'>

                    <div className='list-box'>
                        <div style={{flex: 1}}>
                            <Select className='list-select' styles={selectStyle} placeholder='Choose a civilian to see their weapons...' options={this.state.civilians} onChange={(selected) => {
                                this.setState({'civilian_id': selected.value})
                                this.UpdateData()
                            }} />
                        </div>
                    </div>

                    {this.state.weapons.length > 0 ? 
                    (<ReactList
                        itemRenderer={(index, key) => {
                            let weapon = this.state.weapons[index]
                            return (
                                <div key={key} className='list-box'>
                                    <div style={{flex: 1}}>
                                        <p className='list-header'>{weapon.name}</p>
                                        <p className='list-subheader'>Registration: <b>{weapon.registration}</b></p>
                                    </div>

                                    {/* Edit Weapon */}
                                    <Popup trigger={<FontAwesomeIcon className='list-icon' icon={faEdit} />} className='my-popup' contentStyle={{padding: '20px', backgroundColor: '#111015', border: 'none', width: this.state.width > 1000 ? null : '90%'}} modal onOpen={() => {
                                        this.setState({
                                            wep_name: weapon.name,
                                            wep_registration: weapon.registration
                                        })
                                        document.getElementById('main-container').style.filter = "blur(20px)";
                                    }} onClose={() => {
                                        this.setState({error: null})
                                        document.getElementById('main-container').style.filter = "none";
                                    }}>
                                        {close => (
                                            <div>
                                                <div className='popup-header'>{weapon.name}<FontAwesomeIcon className='list-icon' onClick={async () => {
                                                    if (window.confirm("Are you sure you want to remove this weapon?")) {
                                                        await axios.post(Config.api + '/firearms/delete', {
                                                            'cookie' : localStorage.getItem('cookie'),
                                                            'access_code': localStorage.getItem('access_code'),
                                                            'civilian_id' : this.state.civilian_id,
                                                            'firearm_id': weapon.id
                                                        })
                                                        this.UpdateData()
                                                        close()
                                                    }
                                                }} style={{marginLeft: '10px', fontSize: '30px'}} icon={faTrash} /></div>
                                                <div className='popup-row-list'>
                                                    <div className='popup-row'>
                                                        {this.PopupField('Weapon Name', weapon.name, 'wep_name')}
                                                        {this.PopupField('Registration', weapon.registration, 'wep_registration', [
                                                            {value: 'VALID', label: 'VALID'},
                                                            {value: 'EXPIRED', label: 'EXPIRED'},
                                                            {value: 'STOLEN', label: 'STOLEN'},
                                                            {value:'UNREGISTERED', label: 'UNREGISTERED'},
                                                        ])}
                                                    </div>
                                                </div>
                                                <p className='popup-error-message'>{this.state.error}</p>
                                                <div className='popup-button-group'>
                                                    <div className='popup-button' style={{backgroundColor: '#34B3CE', flex: 2, marginRight: '5px'}} onClick={async () => {
                                                        try {
                                                            await axios.post(Config.api + '/firearms/edit', {
                                                                'cookie' : localStorage.getItem('cookie'),
                                                                'access_code': localStorage.getItem('access_code'),
                                                                'civilian_id': this.state.civilian_id,
                                                                'firearm_id': weapon.id,
                                                                'name': this.state.wep_name,
                                                                'registration': this.state.wep_registration,
                                                            })
                                                            this.UpdateData()
                                                            close()
                                                        }
                                                        catch (err) {
                                                            this.setState({error: err.response.data.toUpperCase()})
                                                        }
                                                    }}>Update Weapon</div>
                                                    <div className='popup-button' style={{backgroundColor: '#212026', marginLeft: '5px'}} onClick={() => {
                                                        close()
                                                    }}>Cancel</div>
                                                </div>
                                            </div>
                                        )}
                                    </Popup>
                                </div>
                            )
                        }}
                        length={this.state.weapons.length}
                        type='uniform'
                    />)
                    :
                    (
                        this.state.civilian_id ? 
                        (<div className='list-box'>
                            <div style={{flex: 1}}>
                                <p className='list-header'>No Registered Weapons</p>
                                <p className='list-subheader'>Click the plus to add one!</p>
                            </div>
                        </div>) 
                        : 
                        (<div className='list-box'>
                            <div style={{flex: 1}}>
                                <p className='list-header'>No Civilian Selected</p>
                                <p className='list-subheader'>Select a civilian to manage your weapons!</p>
                            </div>
                        </div>))
                    }
                </div>

                <Popup trigger={this.state.civilian_id ? <Fab icon={'＋'} mainButtonStyles={{backgroundColor: '#34B3CE'}}/> : null} contentStyle={{padding: '20px', backgroundColor: '#111015', border: 'none', width: this.state.width > 1000 ? null : '90%'}} modal onOpen={() => {
                    document.getElementById('main-container').style.filter = "blur(20px)";
                }} onClose={() => {
                    this.setState({error: null})
                    document.getElementById('main-container').style.filter = "none";   
                }}>
                    {close => (
                        <div>
                            <div className='popup-header'>Add Weapon</div>
                            <div className='popup-row-list'>
                                <div className='popup-row'>
                                    {this.PopupField('Weapon Name', null, 'wep_name')}
                                    {this.PopupField('Registration', null, 'wep_registration', [
                                        {value: 'VALID', label: 'VALID'},
                                        {value: 'EXPIRED', label: 'EXPIRED'},
                                        {value: 'STOLEN', label: 'STOLEN'},
                                        {value:'UNREGISTERED', label: 'UNREGISTERED'},
                                    ])}
                                </div>
                            </div>
                            <p className='popup-error-message'>{this.state.error}</p>
                            <div className='popup-button-group'>
                                <div className='popup-button' style={{backgroundColor: '#34B3CE', flex: 2, marginRight: '5px'}} onClick={async () => {
                                    try {
                                        await axios.post(Config.api + '/firearms/add', {
                                            'cookie' : localStorage.getItem('cookie'),
                                            'access_code': localStorage.getItem('access_code'),
                                            'civilian_id': this.state.civilian_id,
                                            'name': this.state.wep_name,
                                            'registration': this.state.wep_registration,
                                        })
                                        this.UpdateData()
                                        close()
                                    }
                                    catch (err) {
                                        this.setState({error: err.response.data.toUpperCase()})
                                    }
                                }}>Add Weapon</div>
                                <div className='popup-button' style={{backgroundColor: '#212026', marginLeft: '5px'}} onClick={() => {
                                    close()
                                }}>Cancel</div>
                            </div>
                        </div>
                    )}
                </Popup>
            </div>
        )
    }

    PopupField(label, defaultValue, variableName, pickerArray) {
        if (pickerArray) {
            const customStyle = {
                singleValue: (provided, state) => ({
                    ...provided,
                    color: 'white'
                }),
                control: (provided, state) => ({
                    ...provided,
                    backgroundColor: '#212026',
                    outline: 'none',
                    border: 0,
                    boxShadow: 'none',
                }),
                menu: (provided, state) => ({
                    ...provided,
                    backgroundColor: '#212026',
                    outline: 'none',
                    border: 'none',
                }),
                option: (provided, { data, isDisabled, isFocused, isSelected }) => ({
                    ...provided,
                    color: 'white',
                    backgroundColor: isSelected ? '#34B3CE' : null,
                    '&:hover': {
                        backgroundColor: '#111015'
                    }
                }),
            }
            return (
                <div className='popup-input-container'>
                    <div className='popup-input-prompt'>
                        <p>{label}</p>
                    </div>
                    <Select className='popup-input popup-select' styles={customStyle} placeholder={defaultValue ? defaultValue : 'Select One'} options={pickerArray} onChange={(selected) => {
                        this.setState({[variableName]: selected.value})
                    }} />
                </div>
            )
        }
        return (
            <div className='popup-input-container'>
                <div className='popup-input-prompt'>
                    <p>{label}</p>
                </div>
                <input className='popup-input' type='text' defaultValue={defaultValue} onChange={(e) => {
                    this.setState({[variableName]: e.target.value})
                }}/>
            </div>
        )
    }

}
