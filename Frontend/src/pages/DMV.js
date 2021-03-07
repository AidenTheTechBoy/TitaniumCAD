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

export default class DMV extends React.Component {
   
    constructor(props) {
        super(props)
        this.state = {
            width: 0,
            height: 0,
            civilians: '',
            vehicles: [],
            civilian_id: '',
            veh_plate: '',
            veh_color: '',
            veh_make: '',
            veh_model: '',
            veh_year: '',
            veh_registration: '',
            veh_insurance: '',
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

            //Add Vehicles to State
            let vehicles = await axios.post(Config.api + '/dmv/list', {
                'cookie' : localStorage.getItem('cookie'),
                'access_code': localStorage.getItem('access_code'),
                'civilian_id' : this.state.civilian_id
            })
            console.log(vehicles.data)
            this.setState({vehicles: vehicles.data})
            
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
                <h1 className='page-header'>Your Vehicles</h1>            
                <div className='list-container'>

                    <div className='list-box'>
                        <div style={{flex: 1}}>
                            <Select className='list-select' styles={selectStyle} placeholder='Choose a civilian to see their vehicles...' options={this.state.civilians} onChange={(selected) => {
                                this.setState({'civilian_id': selected.value})
                                this.UpdateData()
                            }} />
                        </div>
                    </div>

                    {this.state.vehicles.length > 0 ? 
                    (<ReactList
                        itemRenderer={(index, key) => {
                            let vehicle = this.state.vehicles[index]
                            return (
                                <div key={key} className='list-box'>
                                    <div style={{flex: 1}}>
                                        <p className='list-header'>{vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.plate})</p>
                                        <p className='list-subheader'>Registration: <b>{vehicle.registration}</b></p>
                                        <p className='list-subheader'>Insurance: <b>{vehicle.insurance}</b></p>
                                    </div>

                                    {/* Edit Vehicle */}
                                    <Popup trigger={<FontAwesomeIcon className='list-icon' icon={faEdit} />} className='my-popup' contentStyle={{padding: '20px', backgroundColor: '#111015', border: 'none', width: this.state.width > 1000 ? null : '90%'}} modal onOpen={() => {
                                        this.setState({
                                            veh_plate: vehicle.plate,
                                            veh_color: vehicle.color,
                                            veh_make: vehicle.make,
                                            veh_model: vehicle.model,
                                            veh_year: vehicle.year,
                                            veh_registration: vehicle.registration,
                                            veh_insurance: vehicle.insurance
                                        })
                                        document.getElementById('main-container').style.filter = "blur(20px)";
                                    }} onClose={() => {
                                        document.getElementById('main-container').style.filter = "none";
                                    }}>
                                        {close => (
                                            <div>
                                                <div className='popup-header'>{vehicle.year} {vehicle.make} {vehicle.model} <FontAwesomeIcon className='list-icon' onClick={async () => {
                                                    if (window.confirm("Are you sure you want to delete this vehicle? It can not be restored!")) {
                                                        await axios.post(Config.api + '/dmv/delete', {
                                                            'cookie' : localStorage.getItem('cookie'),
                                                            'access_code': localStorage.getItem('access_code'),
                                                            'civilian_id' : this.state.civilian_id,
                                                            'vehicle_id': vehicle.id,
                                                        })
                                                        Config.toastSuccess('Vehicle registration deleted.')
                                                        this.UpdateData()
                                                        close()
                                                    }
                                                }} style={{marginLeft: '10px', fontSize: '30px'}} icon={faTrash} /></div>
                                                <div className='popup-row-list'>
                                                    <div className='popup-row'>
                                                        {this.PopupField('License Plate', vehicle.plate, 'veh_plate')}
                                                        {this.PopupField('Color', vehicle.color, 'veh_color')}
                                                        {this.PopupField('Make', vehicle.make, 'veh_make')}
                                                        {this.PopupField('Model', vehicle.model, 'veh_model')}
                                                        {this.PopupField('Year', vehicle.year, 'veh_year')}
                                                        {this.PopupField('Registration', vehicle.registration, 'veh_registration', [
                                                            {value: 'VALID', label: 'VALID'},
                                                            {value: 'EXPIRED', label: 'EXPIRED'},
                                                            {value: 'STOLEN', label: 'STOLEN (out of your possession)'},
                                                            {value: 'UNREGISTERED', label: 'UNREGISTERED'},
                                                        ])}
                                                        {this.PopupField('Insurance', vehicle.insurance, 'veh_insurance', [
                                                            {value: 'VALID', label: 'VALID'},
                                                            {value: 'EXPIRED', label: 'EXPIRED'},
                                                            {value: 'UNINSURED', label: 'UNINSURED'},
                                                        ])}
                                                    </div>
                                                </div>
                                                <div className='popup-button-group'>
                                                    <div className='popup-button' style={{backgroundColor: '#34B3CE', flex: 2, marginRight: '5px'}} onClick={async () => {
                                                        try {
                                                            await axios.post(Config.api + '/dmv/edit', {
                                                                'cookie' : localStorage.getItem('cookie'),
                                                                'access_code': localStorage.getItem('access_code'),
                                                                'civilian_id': this.state.civilian_id,
                                                                'vehicle_id': vehicle.id,
                                                                'plate': this.state.veh_plate,
                                                                'color': this.state.veh_color,
                                                                'make': this.state.veh_make,
                                                                'model': this.state.veh_model,
                                                                'year': this.state.veh_year,
                                                                'registration': this.state.veh_registration,
                                                                'insurance': this.state.veh_insurance
                                                            })
                                                            Config.toastSuccess('Vehicle registration successfully edited.')
                                                            this.UpdateData()
                                                            close()
                                                        }
                                                        catch (err) {
                                                            Config.toastFailure(err.response.data)
                                                        }
                                                    }}>Update Vehicle</div>
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
                        length={this.state.vehicles.length}
                        type='uniform'
                    />)
                    :
                    (
                        this.state.civilian_id ? 
                        (<div className='list-box'>
                            <div style={{flex: 1}}>
                                <p className='list-header'>No Registered Vehicles</p>
                                <p className='list-subheader'>Click the plus to add one!</p>
                            </div>
                        </div>) 
                        : 
                        (<div className='list-box'>
                            <div style={{flex: 1}}>
                                <p className='list-header'>No Civilian Selected</p>
                                <p className='list-subheader'>Select a civilian to manage your vehicles!</p>
                            </div>
                        </div>))
                    }
                    
                </div>

                <Popup trigger={this.state.civilian_id ? <Fab icon={'＋'} mainButtonStyles={{backgroundColor: '#34B3CE'}}/> : null} contentStyle={{padding: '20px', backgroundColor: '#111015', border: 'none', width: this.state.width > 1000 ? null : '90%'}} modal onOpen={() => {
                    document.getElementById('main-container').style.filter = "blur(20px)";
                }} onClose={() => {
                    document.getElementById('main-container').style.filter = "none";   
                }}>
                    {close => (
                        <div>
                            <div className='popup-header'>Add Vehicle</div>
                            <div className='popup-row-list'>
                                <div className='popup-row'>
                                    {this.PopupField('License Plate', null, 'veh_plate')}
                                    {this.PopupField('Color', null, 'veh_color')}
                                    {this.PopupField('Make', null, 'veh_make')}
                                    {this.PopupField('Model', null, 'veh_model')}
                                    {this.PopupField('Year', null, 'veh_year')}
                                    {this.PopupField('Registration', null, 'veh_registration', [
                                        {value: 'VALID', label: 'VALID'},
                                        {value: 'EXPIRED', label: 'EXPIRED'},
                                        {value: 'STOLEN', label: 'STOLEN'},
                                        {value: 'UNREGISTERED', label: 'UNREGISTERED'},
                                    ])}
                                    {this.PopupField('Insurance', null, 'veh_insurance', [
                                        {value: 'VALID', label: 'VALID'},
                                        {value: 'EXPIRED', label: 'EXPIRED'},
                                        {value: 'UNINSURED', label: 'UNINSURED'},
                                    ])}
                                </div>
                            </div>
                            <div className='popup-button-group'>
                                <div className='popup-button' style={{backgroundColor: '#34B3CE', flex: 2, marginRight: '5px'}} onClick={async () => {
                                    try {
                                        await axios.post(Config.api + '/dmv/add', {
                                            'cookie' : localStorage.getItem('cookie'),
                                            'access_code': localStorage.getItem('access_code'),
                                            'civilian_id': this.state.civilian_id,
                                            'plate': this.state.veh_plate,
                                            'color': this.state.veh_color,
                                            'make': this.state.veh_make,
                                            'model': this.state.veh_model,
                                            'year': this.state.veh_year,
                                            'registration': this.state.veh_registration,
                                            'insurance': this.state.veh_insurance
                                        })
                                        Config.toastSuccess('Vehicle successfully registered.')
                                        this.UpdateData()
                                        close()
                                    }
                                    catch (err) {
                                        Config.toastFailure(err.response.data)
                                    }
                                }}>Add Vehicle</div>
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
                <input autoComplete='off' className='popup-input' type='text' defaultValue={defaultValue} onChange={(e) => {
                    this.setState({[variableName]: e.target.value})
                }}/>
            </div>
        )
    }

}
