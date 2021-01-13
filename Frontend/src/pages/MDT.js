import 'react-contexify/dist/ReactContexify.css'

import { Item, Menu, Separator, Submenu, contextMenu, theme } from "react-contexify";
import { faExternalLinkAlt, faTimes } from '@fortawesome/free-solid-svg-icons'

import Codes from './Codes';
import Config from '../Config'
import Database from './Database';
import Draggable from 'react-draggable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Header from './Components/Header'
import Popout from 'react-popout'
import React from 'react'
import ReactList from 'react-list'
import Select from 'react-select'
import axios from 'axios'

export default class MDT extends React.Component {
   
    constructor(props) {
        super(props)
        this.state = {
            registered: false,
            servers: [],
            units: [],
            calls: [],
            '911': [],
            bolos: [],
            code_picker: [],
        }
    }

    clearCallState() {
        this.setState({
            callID: '',
            callTitle: '',
            callOrigin: '',
            callStatus: '',
            callPriority: '',
            callCode: '',
            callPrimary: '',
            callLocation: '',
            callPostal: '',
        })
        this.laststate = this.state
    }

    async updateData() {
        this.UpdateSelf()
        
        if (!this.state.server_id) {
            return
        }
        //Get Data from API
        let res = await axios.post(Config.api + '/cad/current', {
            'cookie' : localStorage.getItem('cookie'),
            'server_id': this.state.server_id,
        }, {timeout: 5000})

        let codes = []
        for (const i in res.data.codes) {
            const code = res.data.codes[i]
            codes[codes.length] = {label: `${code.code}: ${code.meaning}`, value: code.code}
        }

        this.setState({
            units: res.data.units,
            calls: res.data.calls,
            '911': res.data['911'],
            bolos: res.data.bolos,
            codes: res.data.codes,
            code_picker: codes,
            signal: res.data.signal,
            lastRequestCompletion: Date.now()
        })

    }

    async UpdateSelf() {
        let res = await axios.post(Config.api + '/cad/my-status', {
            'cookie' : localStorage.getItem('cookie'),
            'server_id': this.state.server_id,
        }, {timeout: 5000})
        this.setState({
            'member_id': res.data.member_id,
            'current_call': res.data.current_call,
            'callsign': res.data.callsign,
            'name': res.data.name,
            'location': res.data.location,
            'status': res.data.status
        })
        console.log(res.data)
    }

    componentDidMount() {
        this.updateServers()
        this.clearCallState()
    
        //Manage Timer
        setInterval(() => {
            this.setState({timedate: new Date().toLocaleTimeString()})
        }, 1000)

        //Panic Opacity
        setInterval(() => {
            if (this.state.panicColor === '#b80000') {
                this.setState({panicColor: 'transparent'})
                return
            }
            this.setState({panicColor: '#b80000'})
        }, 600)

        //Get New CAD Data
        setInterval(async () => {
            if (Date.now() - this.state.lastRequestCompletion >  (document.hasFocus ? 4000 : 8000) ) {
                await this.updateData().then(() => {
                    this.state.lastRequestCompletion = Date.now()
                })
            }
        }, 1000)
    }

    async updateServers() {
        let req = await axios.post(Config.api + '/cad/get-servers', {
            cookie: localStorage.getItem('cookie'),
            access_code: localStorage.getItem('access_code')
        })
        let serverTemp = []
        for (let i in req.data) {
            let server = req.data[i]
            serverTemp[serverTemp.length] = {
                label: server.name,
                value: server.id
            }
        }
        this.setState({servers: serverTemp})
    }

    async SelfStatus(status) {
        await axios.post(Config.api + '/cad/self-status', {
            cookie: localStorage.getItem('cookie'),
            access_code: localStorage.getItem('access_code'),
            server_id: this.state.server_id,
            status: status
        })
        this.updateData()
        Config.toastSuccess('Your status has been updated.')
    }

    render() {

        //Server Selector Style
        const serverSelectorStyle = {
            singleValue: (provided, state) => ({
                ...provided,
                color: 'white',
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

        if (!this.state.server_id || !this.state.registered) {
            return (
                <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                
                    <Header back='/dashboard' />

                    <div className='login-form'>

                        {/* Server Selector */}
                        <Select className='cad-element mdt-selector' styles={serverSelectorStyle} placeholder='Select Server' options={this.state.servers} onChange={async (selected) => {
                            this.setState({'server_id': selected.value})
                        }} />

                        <h1 className='login-header' style={{marginTop: 40}}>Register New Unit</h1>

                        {/* Callsign */}
                        <div className='login-input-group'>
                            <label className='login-input-prompt'>Callsign:</label>
                            <input type='text' name='callsign' htmlFor='callsign' className='login-input' onChange={(e) => {
                                this.setState({callsign: e.target.value})
                            }}/>
                        </div>

                        {/* Name */}
                        <div className='login-input-group'>
                            <label className='login-input-prompt'>Name:</label>
                            <input type='text' name='name' htmlFor='name' className='login-input' onChange={(e) => {
                                this.setState({name: e.target.value})
                            }}/>
                        </div>

                        {/* In-Game ID */}
                        <div className='login-input-group'>
                            <label className='login-input-prompt'>In-Game ID:</label>
                            <input type='number' name='name' htmlFor='name' className='login-input' onChange={async (e) => {
                                this.setState({ingame_id: e.target.value})
                            }}/>
                        </div>

                        <div className='login-button' onClick={async () => {
                            try {
                                await axios.post(Config.api + '/cad/add-unit', {
                                    cookie: localStorage.getItem('cookie'),
                                    access_code: localStorage.getItem('access_code'),
                                    server_id: this.state.server_id,
                                    ingame_id: this.state.ingame_id,
                                    name: this.state.name,
                                    callsign: this.state.callsign
                                })
                                this.setState({registered: true})
                                Config.toastSuccess('Your unit has been registered in the MDT!', 5000)
                                this.updateData()
                            }
                            catch (err) {
                                console.log(err)
                                if (err.response && err.response.data) {
                                    Config.toastFailure(err.response.data)
                                }
                            }
                        }}>Register</div>

                        <h1 className='login-header' style={{marginTop: 40}}>Login as Existing Unit</h1>

                        <div className='login-button' onClick={async () => {
                            try {
                                let server = await axios.post(Config.api + '/cad/get-unit', {
                                    cookie: localStorage.getItem('cookie'),
                                    access_code: localStorage.getItem('access_code'),
                                })
                                this.setState({server_id: server.data.server_id, registered: true})
                                Config.toastSuccess('An existing unit was found, logging in!', 5000)
                                this.updateData()
                            }
                            catch (err) {
                                console.log(err)
                                if (err.response && err.response.data) {
                                    Config.toastFailure(err.response.data)
                                }
                            }
                        }}>Go To MDT</div>

                    </div>
                </div>
            )
        }

        if (this.state.person_search_popout) {
            return (
                <Popout
                    url='/database?search=person'
                    title='Person Search'
                    onClosing={this.setState({person_search_popout: false})}
                    options={{width: '500px', height: '700px'}}
                />
            )
        }

        if (this.state.vehicle_search_popout) {
            return (
                <Popout
                    url='/database?search=vehicle'
                    title='Vehicle Search'
                    onClosing={this.setState({vehicle_search_popout: false})}
                    options={{width: '500px', height: '700px'}}
                />
            )
        }

        if (this.state.codes_popout) {
            return (
                <Popout
                    url='/codes'
                    title='10 Codes'
                    onClosing={this.setState({codes_popout: false})}
                    options={{width: '500px', height: '700px'}}
                />
            )
        }

        //Put Current Call Into Window
        for (const i in this.state.calls) {
            const call = this.state.calls[i]
            if (call.id === this.state.current_call) {
                if (this.state.callID !== call.id) {
                    this.setState({
                        callID: call.id,
                        callTitle: call.title,
                        callOrigin: call.origin,
                        callStatus: call.status,
                        callPriority: call.priority,
                        callCode: call.code,
                        callPrimary: call.primary,
                        callLocation: call.location,
                        callPostal: call.postal,
                    })
                    break
                }
            }
        }

        let activeColor
        switch (this.state.status) {
            case 'AVAILABLE':
                activeColor = '#00d419'
                break;
            case 'BUSY':
                activeColor = '#f5e500'
                break;
            case 'ENROUTE':
                activeColor = '#f58300'
                break;
            case 'AWAITING CALL STATUS?':
                activeColor = '#9700f5'
                break;
            case 'ONSCENE':
                activeColor = '#9700f5'
                break;
            case 'UNAVAILABLE':
                activeColor = '#fc0f03'
                break;
            case 'PANIC':
                activeColor = this.state.panicColor
                break;
            default:
                activeColor = '#FFFFFF'
        }

        return (
            <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                { this.state.signal ?
                    <div style={{paddingVertical: 3, backgroundColor: this.state.panicColor, opacity: this.state.blinkOpacity}}>
                        <p style={{textAlign: 'center', fontSize: 15, color: 'white'}}>SIGNAL {this.state.signal} IS IN EFFECT</p>
                    </div>
                    :
                    null
                }

                <div className='cad-header'>
                    <div className='cad-element' style={{width: 500}}>
                        <p style={{textTransform: 'uppercase'}}>Location: {this.state.location}</p>
                    </div>
                    <div className='cad-element' style={{flex: 2}}>
                        <p style={{textTransform: 'uppercase', color: activeColor}}>Status: {this.state.status}</p>
                    </div>
                    <div className='cad-element' style={{width: 500}}>
                        <p style={{textTransform: 'uppercase'}}>{this.state.callsign ? `[${this.state.callsign}] ${this.state.name}` : '' }</p>
                    </div>
                </div>
                <div className='cad-toolbar'>
                    <div className='cad-toolbar-button' style={{borderColor: '#00d419'}} onClick={() => this.SelfStatus('AVAILABLE')}>10-8</div>
                    <div className='cad-toolbar-button' style={{borderColor: '#fc0f03'}} onClick={() => this.SelfStatus('UNAVAILABLE')}>10-7</div>
                    <div className='cad-toolbar-button' style={{borderColor: '#f5e500'}} onClick={() => this.SelfStatus('BUSY')}>10-6</div>
                    <div className='cad-toolbar-button' style={{borderColor: '#34B3CE'}} onClick={() => this.SelfStatus('ENROUTE')}>10-97</div>
                    <div className='cad-toolbar-button' style={{borderColor: '#9700f5'}} onClick={() => this.SelfStatus('ONSCENE')}>10-23</div>
                </div>
                <div className='cad-toolbar'>
                    <div className='cad-toolbar-button' onClick={() => this.setState({person_search: true})}>Person Lookup</div>
                    <div className='cad-toolbar-button' onClick={() => this.setState({vehicle_search: true})}>Vehicle Lookup</div>
                    <div className='cad-toolbar-button' onClick={() => this.setState({bolos_popup: !this.state.bolos_popup})}>Bolos</div>
                    <div className='cad-toolbar-button' onClick={() => this.setState({codes_popup: !this.state.codes_popup})}>10-Codes</div>
                    <div className='cad-toolbar-button' style={{borderColor: '#fc0f03'}} onClick={() => window.location = '/dashboard'}>Exit</div>
                </div>
                <div className='cad-window'>
                    <div className='cad-window-column'>
                        {/* CALL EDITOR WINDOW */}
                        <div className='cad-window-row' style={{height: '100%'}}>
                            <div className='cad-window-header-group'>
                                <div className='cad-window-header'>{this.state.current_call ? "CALL INFORMATION" : 'NO ACTIVE CALL'}</div>
                                
                                {this.state.current_call ? <div className='cad-window-header-button-group'>
                                    <div className='cad-window-header-button' style={{backgroundColor: 'red'}} onClick={async () => {
                                        await axios.post(Config.api + '/cad/detach-self', {
                                            cookie: localStorage.getItem('cookie'),
                                            access_code: localStorage.getItem('access_code'),
                                            server_id: this.state.server_id
                                        })
                                        Config.toastSuccess('You have been removed from any active calls!')
                                        this.updateData()
                                    }}>Detach Self From Call</div>
                                </div> : null}
                                
                            </div>
                            
                            {this.state.current_call ? <div>
                                <div className='cad-editor-row'>
                                    {this.GenerateCallField('Call Title', 'callTitle', 1)}
                                </div>
                                <div className='cad-editor-row'>
                                    {this.GenerateCallField('Origin', 'callOrigin', 2)}
                                    {this.GenerateCallField('Status', 'callStatus', 2)}
                                    {this.GenerateCallField('Priority', 'callPriority', 1)}
                                </div>
                                <div className='cad-editor-row'>
                                    {this.GenerateCallField('Code', 'callCode', 1)}
                                    {this.GenerateCallField('Primary Unit', 'callPrimary', 1)}
                                </div>
                                <div className='cad-editor-row'>
                                    {this.GenerateCallField('Location', 'callLocation', 1)}
                                    {this.GenerateCallField('Postal', 'callPostal', 1)}
                                </div>
                            </div> : null}

                        </div>

                        </div>
                    <div className='cad-window-column'>

                        {/* ACTIVE UNITS WINDOW */}
                        <div className='cad-window-row' style={{flex: 3}}>
                            <div className='cad-window-header'>OTHER UNITS</div>
                            <div className='cad-table'>
                                <div className='cad-table-row'>
                                    <div className='cad-table-cell' style={{color: '#34B3CE'}}>Callsign</div>
                                    <div className='cad-table-cell' style={{color: '#34B3CE'}}>Name</div>
                                    <div className='cad-table-cell' style={{color: '#34B3CE'}}>Location</div>
                                    <div className='cad-table-cell' style={{color: '#34B3CE'}}>Status</div>
                                </div>
                                <ReactList
                                    itemRenderer={(index, key) => {

                                        let unit = this.state.units[index]

                                        if (unit.member_id === this.state.member_id) {
                                            return
                                        }

                                        if (unit.current_call && unit.status !== 'ENROUTE' && unit.status !== 'ONSCENE') {
                                            unit.status = 'AWAITING CALL STATUS?'
                                        }

                                        let activeColor
                                        switch (unit.status) {
                                            case 'AVAILABLE':
                                                activeColor = '#00d419'
                                                break;
                                            case 'BUSY':
                                                activeColor = '#f5e500'
                                                break;
                                            case 'ENROUTE':
                                                activeColor = '#f58300'
                                                break;
                                            case 'AWAITING CALL STATUS?':
                                                activeColor = '#9700f5'
                                                break;
                                            case 'ONSCENE':
                                                activeColor = '#9700f5'
                                                break;
                                            case 'UNAVAILABLE':
                                                activeColor = '#fc0f03'
                                                break;
                                            case 'PANIC':
                                                activeColor = this.state.panicColor
                                                break;
                                            default:
                                                activeColor = '#FFFFFF'
                                        }
                                        return (
                                            <div key={key} className='cad-table-row' style={{borderColor: activeColor}} onClick={(e) => {
                                                this.setState({context_unit_id: unit.member_id})
                                                contextMenu.show({id: 'units', event: e})
                                            }}>
                                                <div className='cad-table-cell'>
                                                    {unit.callsign}
                                                </div>
                                                <div className='cad-table-cell'>
                                                    {unit.name}
                                                </div>
                                                <div className='cad-table-cell'>
                                                    {unit.location ? unit.location : '-------------'}
                                                </div>
                                                <div className='cad-table-cell' style={{color: activeColor}}>
                                                    {unit.status}
                                                </div>
                                            </div>
                                        )
                                    }}
                                    length={this.state.units.length}
                                    type='uniform'
                                />
                            </div>
                        </div>

                        {/* 911 CALLS WINDOW */}
                        <div className='cad-window-row' style={{flex: 2}}>
                            <div className='cad-window-header'>911 CALLS</div>
                            <div className='cad-table'>
                                <div className='cad-table-row'>
                                    <div className='cad-table-cell' style={{color: '#34B3CE'}}>Caller</div>
                                    <div className='cad-table-cell' style={{color: '#34B3CE'}}>Details</div>
                                    <div className='cad-table-cell' style={{color: '#34B3CE'}}>Location</div>
                                </div>
                                <ReactList
                                    itemRenderer={(index, key) => {

                                        let call = this.state['911'][index]

                                        let customRowStyle
                                        if (call.id === this.state.callID) {
                                            customRowStyle = {
                                                backgroundColor: '#34B3CE',
                                                borderBottom: '2px solid #34B3CE'
                                            }
                                        }

                                        return (
                                            <div key={key} className='cad-table-row' style={customRowStyle} onClick={async (e) => {
                                                this.setState({context_911_call: call})
                                                contextMenu.show({id: '911', event: e})
                                            }}>
                                                <div className='cad-table-cell'>
                                                    {call.caller}
                                                </div>
                                                <div className='cad-table-cell'>
                                                    {call.details}
                                                </div>
                                                <div className='cad-table-cell'>
                                                    {call.address}
                                                </div>
                                            </div>
                                        )
                                    }}
                                    length={this.state['911'].length}
                                    type='uniform'
                                />
                            </div>
                        </div>
                      
                    </div>
                </div>

                {/* Bolo Context Menu */}
                <Menu id='bolo' theme={theme.dark}>
                    <Item className='context-blue' onClick={async() => {
                        this.setState({bolo_edit: true})
                    }}>Edit Bolo</Item>
                    <Item className='context-red' onClick={async() => {
                        await axios.post(Config.api + '/cad/deletebolo', {
                            cookie: localStorage.getItem('cookie'),
                            access_code: localStorage.getItem('access_code'),
                            server_id: this.state.server_id,
                            bolo_id: this.state.context_bolo_id
                        })
                        this.updateData()
                    }}>Delete Bolo</Item>
                </Menu>

                {/* Bolos */}
                {this.state.bolos_popup ?
                (<Draggable
                    axis="both"
                    handle=".bolo-handle"
                    defaultPosition={{x: 1, y: 1}}
                    position={null}
                    grid={[1, 1]}
                    scale={1}
                >
                    <div className='bolo-container'>
                        <div className="bolo-handle">
                            <p className='bolo-title'>Bolo Manager</p>
                            <p className='bolo-minimize' onClick={() => {this.setState({bolos_popup: false})}}><FontAwesomeIcon icon={faTimes} /></p>
                        </div>
                        { this.state.bolo_edit ?
                            (
                                <div>
                                    <div className='database-fields'>

                                        <div className='cad-editor-cell bolo-input' style={{flex: 2}}>
                                            <div><p>Description</p></div>
                                            <input type='text' value={this.state.bolo_description} onChange={(e) => {
                                                this.setState({bolo_description: e.target.value})
                                            }}/>
                                        </div>

                                        <div className='cad-editor-cell bolo-input'>
                                            <div><p>Plate</p></div>
                                            <input type='text' value={this.state.bolo_plate} onChange={(e) => {
                                                this.setState({bolo_plate: e.target.value})
                                            }}/>
                                        </div>
                                        
                                        <div className='cad-editor-cell bolo-input' style={{flex: 2}}>
                                            <div><p>Charges</p></div>
                                            <input type='text' value={this.state.bolo_charges} onChange={(e) => {
                                                this.setState({bolo_charges: e.target.value})
                                            }}/>
                                        </div>

                                        <div className='cad-editor-cell bolo-input'>
                                            <div><p>Flags</p></div>
                                            <input type='text' value={this.state.bolo_flags} onChange={(e) => {
                                                this.setState({bolo_flags: e.target.value})
                                            }}/>
                                        </div>
                                    </div>
                                    
                                    <div className='cad-table-row bolo-button-row' style={{marginTop: 10}}>
                                        <div className='bolo-button' style={{flex: 3, marginLeft: 15, marginRight: 5}} onClick={async () => {
                                            await axios.post(Config.api + '/cad/bolo', {
                                                cookie: localStorage.getItem('cookie'),
                                                access_code: localStorage.getItem('access_code'),
                                                server_id: this.state.server_id,
                                                bolo_id: this.state.context_bolo_id,
                                                plate: this.state.bolo_plate,
                                                vehicle: this.state.bolo_description,
                                                charges: this.state.bolo_charges,
                                                flags: this.state.bolo_flags
                                            })
                                            this.setState({bolo_edit: false})
                                            this.updateData()
                                        }}>{this.state.context_bolo_id ? 'Update Bolo' : 'Create Bolo'}</div>
                                        <div className='bolo-button' style={{backgroundColor: '#111015', marginRight: 15, marginLeft: 5}} onClick={async () => {
                                            this.setState({bolo_edit: false})
                                            this.setState({
                                                context_bolo_id: '',
                                                bolo_description: '',
                                                bolo_plate: '',
                                                bolo_charges: '',
                                                bolo_flags: ''
                                            })
                                        }}>Cancel</div>
                                    </div>
                                </div>
                            )
                            :
                            (
                                <div className='cad-table'>
                                    <div className='cad-table-row'>
                                        <div className='cad-table-cell' style={{color: '#34B3CE', flex: 2}}>Description</div>
                                        <div className='cad-table-cell' style={{color: '#34B3CE'}}>Plate</div>
                                        <div className='cad-table-cell' style={{color: '#34B3CE', flex: 2}}>Charges</div>
                                        <div className='cad-table-cell' style={{color: '#34B3CE'}}>Flags</div>
                                    </div>
                                    {
                                        this.state.bolos.length > 0 ?
                                        (<ReactList
                                            itemRenderer={(index, key) => {
                                                const bolo = this.state.bolos[key]
                                                return (
                                                    <div key={key} className='cad-table-row bolo-row' onClick={(e) => {
                                                            this.setState({
                                                                context_bolo_id: bolo.id,
                                                                bolo_description: bolo.vehicle,
                                                                bolo_plate: bolo.plate,
                                                                bolo_charges: bolo.charges,
                                                                bolo_flags: bolo.flags
                                                            })
                                                            contextMenu.show({id: 'bolo', event: e})
                                                        }}>
                                                        <div className='cad-table-cell' style={{flex: 2}}>
                                                            {bolo.vehicle}
                                                        </div>
                                                        <div className='cad-table-cell'>
                                                            {bolo.plate}
                                                        </div>
                                                        <div className='cad-table-cell' style={{flex: 2}}>
                                                            {bolo.charges}
                                                        </div>
                                                        <div className='cad-table-cell'>
                                                            {bolo.flags}
                                                        </div>
                                                    </div>
                                                )
                                            }}
                                            length={this.state.bolos.length}
                                            type='uniform'
                                        />)
                                    :
                                        (<div className='cad-table-row bolo-row'>
                                            <div className='cad-table-cell' style={{flex: 2}}>
                                                No bolos found. Press the button below to create one.
                                            </div>
                                        </div>)
                                    }
                                    <div className='cad-table-row bolo-button-row'>
                                        <div className='bolo-button' onClick={() => {
                                            this.setState({context_bolo_id: null, bolo_edit: true})
                                            this.setState({
                                                context_bolo_id: '',
                                                bolo_description: '',
                                                bolo_plate: '',
                                                bolo_charges: '',
                                                bolo_flags: ''
                                            })
                                        }}>New Bolo</div>
                                    </div>
                                </div>
                            )
                        }
                        
                    </div>
                </Draggable>) : null}
                
                {/* Codes */}
                {this.state.codes_popup ?
                (<Draggable
                    axis="both"
                    handle=".code-handle"
                    defaultPosition={{x: 1, y: 1}}
                    position={null}
                    grid={[1, 1]}
                    scale={1}
                >
                    <div className='bolo-container' style={{width: '40%'}}>
                        <div className="bolo-handle code-handle">
                            <p className='bolo-title'>10-Code Reference</p>
                            <div style={{display: 'flex'}}>
                                <p className='bolo-minimize' style={{marginRight: 10}} onClick={() => {
                                    this.setState({codes_popup: false})
                                    this.setState({codes_popout: true})
                                }}> <FontAwesomeIcon icon={faExternalLinkAlt} /> </p>
                                <p className='bolo-minimize' onClick={() => {this.setState({codes_popup: false})}}> <FontAwesomeIcon icon={faTimes} /> </p>
                            </div>
                        </div>
                        <div className='code-container'>
                            <Codes />
                        </div>
                    </div>
                </Draggable>) : null}
                
                {/* Person Lookup */}
                {this.state.person_search ?
                (<Draggable
                    axis="both"
                    handle=".code-handle"
                    defaultPosition={{x: 1, y: 1}}
                    position={null}
                    grid={[1, 1]}
                    scale={1}
                >
                    <div className='bolo-container' style={{width: '40%'}}>
                        <div className="bolo-handle code-handle">
                            <p className='bolo-title'>Person Lookup</p>
                            <div style={{display: 'flex'}}>
                                <p className='bolo-minimize' style={{marginRight: 10}} onClick={() => {
                                    this.setState({person_search: false})
                                    this.setState({person_search_popout: true})
                                }}> <FontAwesomeIcon icon={faExternalLinkAlt} /> </p>
                                <p className='bolo-minimize' onClick={() => {this.setState({person_search: false})}}> <FontAwesomeIcon icon={faTimes} /> </p>
                            </div>
                        </div>
                        <div className='code-container' style={{backgroundColor: '#111015'}}>
                            <Database search='person' />
                        </div>
                    </div>
                </Draggable>) : null}
                

                {/* Vehicle Lookup */}
                {this.state.vehicle_search ?
                (<Draggable
                    axis="both"
                    handle=".code-handle"
                    defaultPosition={{x: 1, y: 1}}
                    position={null}
                    grid={[1, 1]}
                    scale={1}
                >
                    <div className='bolo-container' style={{width: '40%'}}>
                        <div className="bolo-handle code-handle">
                            <p className='bolo-title'>Vehicle Lookup</p>
                            <div style={{display: 'flex'}}>
                                <p className='bolo-minimize' style={{marginRight: 10}} onClick={() => {
                                    this.setState({vehicle_search: false})
                                    this.setState({vehicle_search_popout: true})
                                }}> <FontAwesomeIcon icon={faExternalLinkAlt} /> </p>
                                <p className='bolo-minimize' onClick={() => {this.setState({vehicle_search: false})}}> <FontAwesomeIcon icon={faTimes} /> </p>
                            </div>
                        </div>
                        <div className='code-container' style={{backgroundColor: '#111015'}}>
                            <Database search='vehicle' />
                        </div>
                    </div>
                </Draggable>) : null}
                

            </div>
        )
    }

    async ChangeUnitStatus(status) {
        await axios.post(Config.api + '/cad/unit-status', {
            'cookie' : localStorage.getItem('cookie'),
            'server_id': this.state.server_id,
            'member_id': this.state.context_unit_id,
            'status': status
        })
        this.updateData()
    }

    async RemoveUnit() {
        await axios.post(Config.api + '/cad/remove-unit', {
            'cookie' : localStorage.getItem('cookie'),
            'server_id': this.state.server_id,
            'id': this.state.context_unit_id
        })
        this.updateData()
    }

    GenerateCallField(placeholder, variable, flex) {
        return (
            <div className='cad-editor-cell' style={{flex: flex}}>
                <div>
                    <p>{placeholder}</p>
                </div>
                <input type='text' disabled={true} value={this.state[variable]}/>
            </div>
        )
    }
}