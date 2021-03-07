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
import axios from 'axios'

export default class Civilians extends React.Component {
   
    constructor(props) {
        super(props)
        this.state = {
            width: 0,
            height: 0,
            civilians: [],
            civ_first_name: '',
            civ_last_name: '',
            civ_middle_initial: '',
            civ_date_of_birth: '',
            civ_place_of_residence: '',
            civ_zip_code: '',
            civ_occupation: '',
            civ_height: '',
            civ_weight: '',
            civ_hair_color: '',
            civ_eye_color: '',
            civ_license_type: '',
            civ_license_expiration: '',
            civ_license_status: '',
        }
    }

    async UpdateData() {
        try {
            let req = await axios.post(Config.api + '/civilians/list', {
                'cookie' : localStorage.getItem('cookie'),
                'access_code': localStorage.getItem('access_code'),
            })
            this.setState({civilians: req.data})
        }
        catch (err) {
            window.location ='/login'
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
        return (
            <div id='main-container'>
                <Header back='/dashboard' />
                <h1 className='page-header'>Your Civilians</h1>            
                <div className='list-container'>
                    {this.state.civilians.length > 0 ? 
                    (<ReactList
                        itemRenderer={(index, key) => {
                            let civilian = this.state.civilians[index]
                            return (
                                <div key={key} className='list-box'>
                                    <div style={{flex: 1}}>
                                        <p className='list-header'>{civilian.first_name} {civilian.last_name}</p>
                                        <p className='list-subheader'>{civilian.date_of_birth}</p>
                                    </div>

                                    {/* Edit Civilian */}
                                    <Popup trigger={<FontAwesomeIcon className='list-icon' icon={faEdit} />} className='my-popup' contentStyle={{padding: '20px', backgroundColor: '#111015', border: 'none', width: this.state.width > 1000 ? null : '90%'}} modal onOpen={() => {
                                        this.setState({
                                            civ_first_name: civilian.first_name,
                                            civ_last_name: civilian.last_name,
                                            civ_middle_initial: civilian.middle_initial,
                                            civ_date_of_birth: civilian.date_of_birth,
                                            civ_place_of_residence: civilian.place_of_residence,
                                            civ_zip_code: civilian.zip_code,
                                            civ_occupation: civilian.occupation,
                                            civ_height: civilian.height,
                                            civ_weight: civilian.weight,
                                            civ_hair_color: civilian.hair_color,
                                            civ_eye_color: civilian.eye_color,
                                            civ_license_type: civilian.license_type,
                                            civ_license_expiration: civilian.license_expiration,
                                            civ_license_status: civilian.license_status,
                                        })
                                        document.getElementById('main-container').style.filter = "blur(20px)";
                                    }} onClose={() => {
                                        document.getElementById('main-container').style.filter = "none";
                                    }}>
                                        {close => (
                                            <div>
                                                <div className='popup-header'>{civilian.first_name} {civilian.last_name} <FontAwesomeIcon className='list-icon' onClick={async () => {
                                                    if (window.confirm("Are you sure you want to delete this civilian and all other items registered to them?")) {
                                                        await axios.post(Config.api + '/civilians/delete', {
                                                            'cookie' : localStorage.getItem('cookie'),
                                                            'access_code': localStorage.getItem('access_code'),
                                                            'civilian_id': civilian.id,
                                                        })
                                                        Config.toastSuccess('Civilian deleted.')
                                                        this.UpdateData()
                                                        close()
                                                    }
                                                }} style={{marginLeft: '10px', fontSize: '30px'}} icon={faTrash} /></div>
                                                <div className='popup-row-list'>
                                                    <div className='popup-row'>
                                                        {this.PopupField('First Name', civilian.first_name, 'civ_first_name', 2)}
                                                        {this.PopupField('Last Name', civilian.last_name, 'civ_last_name', 2)}
                                                        {this.PopupField('M.I.', civilian.middle_initial, 'civ_middle_initial', 0.5)}
                                                        {this.PopupField('Date of Birth', civilian.date_of_birth, 'civ_date_of_birth')}
                                                        {this.PopupField('Place of Residence', civilian.place_of_residence, 'civ_place_of_residence', 3)}
                                                        {this.PopupField('Zip/Postal Code', civilian.zip_code, 'civ_zip_code')}
                                                        {this.PopupField('Occupation', civilian.occupation, 'civ_occupation', 2)}
                                                        {this.PopupField('Height', civilian.height, 'civ_height')}
                                                        {this.PopupField('Weight', civilian.weight, 'civ_weight')}
                                                        {this.PopupField('Hair Color', civilian.hair_color, 'civ_hair_color')}
                                                        {this.PopupField('Eye Color', civilian.eye_color, 'civ_eye_color')}
                                                    </div>
                                                    <div className='popup-header'>License</div>
                                                    <div className='popup-row'>
                                                        {this.PopupField('License Type', civilian.license_type, 'civ_license_type')}
                                                        {this.PopupField('License Expiration', civilian.license_expiration, 'civ_license_expiration')}
                                                        {this.PopupField('License Status', civilian.license_status, 'civ_license_status')}
                                                    </div>
                                                </div>
                                                <div className='popup-button-group'>
                                                    <div className='popup-button' style={{backgroundColor: '#34B3CE', flex: 2, marginRight: '5px'}} onClick={async () => {
                                                        try {
                                                            await axios.post(Config.api + '/civilians/edit', {
                                                                'cookie' : localStorage.getItem('cookie'),
                                                                'access_code': localStorage.getItem('access_code'),
                                                                'civilian_id': civilian.id,
                                                                'first_name': this.state.civ_first_name,
                                                                'last_name': this.state.civ_last_name,
                                                                'middle_initial': this.state.civ_middle_initial,
                                                                'date_of_birth': this.state.civ_date_of_birth,
                                                                'place_of_residence': this.state.civ_place_of_residence,
                                                                'zip_code': this.state.civ_zip_code,
                                                                'occupation': this.state.civ_occupation,
                                                                'height': this.state.civ_height,
                                                                'weight': this.state.civ_weight,
                                                                'hair_color': this.state.civ_hair_color,
                                                                'eye_color': this.state.civ_eye_color,
                                                                'license_type': this.state.civ_license_type,
                                                                'license_expiration': this.state.civ_license_expiration,
                                                                'license_status': this.state.civ_license_status,
                                                            })
                                                            Config.toastSuccess('Civilian successfully edited.')
                                                            this.UpdateData()
                                                            close()
                                                        }
                                                        catch (err) {
                                                            Config.toastFailure(err.response.data)
                                                        }
                                                    }}>Save Civilian</div>
                                                    <div className='popup-button' style={{backgroundColor: '#212026', marginLeft: '5px'}} onClick={() => {
                                                        close()
                                                    }}>Cancel</div>
                                                </div>
                                                {/* <div className='popup-button' style={{backgroundColor: '#e01710', marginTop: '10px'}} onClick={async () => {}}>Delete Civilian</div> */}
                                            </div>
                                        )}
                                    </Popup>
                                </div>
                            )
                        }}
                        length={this.state.civilians.length}
                        type='uniform'
                    />)
                    :
                    (<div className='list-box'>
                        <div style={{flex: 1}}>
                            <p className='list-header'>No Registered Civilians</p>
                            <p className='list-subheader'>Click the plus to create one!</p>
                        </div>
                    </div>)
                    }
                    
                </div>

                <Popup trigger={<Fab icon={'＋'} mainButtonStyles={{backgroundColor: '#34B3CE'}}/>} contentStyle={{padding: '20px', backgroundColor: '#111015', border: 'none', width: this.state.width > 1000 ? null : '90%'}} modal onOpen={() => {
                    this.setState({
                        civ_first_name: '',
                        civ_last_name: '',
                        civ_middle_initial: '',
                        civ_date_of_birth: '',
                        civ_place_of_residence: '',
                        civ_zip_code: '',
                        civ_occupation: '',
                        civ_height: '',
                        civ_weight: '',
                        civ_hair_color: '',
                        civ_eye_color: '',
                        civ_license_type: '',
                        civ_license_expiration: '',
                        civ_license_status: '',
                    })
                    document.getElementById('main-container').style.filter = "blur(20px)";
                }} onClose={() => {
                    document.getElementById('main-container').style.filter = "none";
                }}>
                    {close => (
                        <div>
                            <div className='popup-header'>New Civilian</div>
                            <div className='popup-row-list'>
                                <div className='popup-row'>
                                    {this.PopupField('First Name', null, 'civ_first_name', 2)}
                                    {this.PopupField('Last Name', null, 'civ_last_name', 2)}
                                    {this.PopupField('M.I.', null, 'civ_middle_initial', 0.5)}
                                    {this.PopupField('Date of Birth', null, 'civ_date_of_birth')}
                                    {this.PopupField('Place of Residence', null, 'civ_place_of_residence', 3)}
                                    {this.PopupField('Zip/Postal Code', null, 'civ_zip_code')}
                                    {this.PopupField('Occupation', null, 'civ_occupation', 2)}
                                    {this.PopupField('Height', null, 'civ_height')}
                                    {this.PopupField('Weight', null, 'civ_weight')}
                                    {this.PopupField('Hair Color', null, 'civ_hair_color')}
                                    {this.PopupField('Eye Color', null, 'civ_eye_color')}           
                                </div>
                                <div className='popup-header'>License</div>
                                <div className='popup-row'>
                                    {this.PopupField('License Type', null, 'civ_license_type')}
                                    {this.PopupField('License Expiration', null, 'civ_license_expiration')}
                                    {this.PopupField('License Status', null, 'civ_license_status')}
                                </div>
                            </div>
                            <div className='popup-button-group'>
                                <div className='popup-button' style={{backgroundColor: '#34B3CE', flex: 2, marginRight: '5px'}} onClick={async () => {
                                    try {
                                        await axios.post(Config.api + '/civilians/add', {
                                            'cookie' : localStorage.getItem('cookie'),
                                            'access_code': localStorage.getItem('access_code'),
                                            'first_name': this.state.civ_first_name,
                                            'last_name': this.state.civ_last_name,
                                            'middle_initial': this.state.civ_middle_initial,
                                            'date_of_birth': this.state.civ_date_of_birth,
                                            'place_of_residence': this.state.civ_place_of_residence,
                                            'zip_code': this.state.civ_zip_code,
                                            'occupation': this.state.civ_occupation,
                                            'height': this.state.civ_height,
                                            'weight': this.state.civ_weight,
                                            'hair_color': this.state.civ_hair_color,
                                            'eye_color': this.state.civ_eye_color,
                                            'license_type': this.state.civ_license_type,
                                            'license_expiration': this.state.civ_license_expiration,
                                            'license_status': this.state.civ_license_status,
                                        })
                                        Config.toastSuccess('Civilian successfully created!')
                                        this.UpdateData()
                                        close()
                                    }
                                    catch (err) {
                                        Config.toastFailure(err.response.data)
                                    }
                                }}>Create Character</div>
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

    PopupField(label, defaultValue, variableName, minWidth = 1) {
        console.log(200*minWidth)
        return (
            <div className='popup-input-container' style={{minWidth: `${200*minWidth}px`}}>
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
