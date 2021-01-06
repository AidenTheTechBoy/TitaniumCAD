import { Item, Menu, contextMenu, theme } from 'react-contexify'
import { faBuilding, faCheckCircle, faCog, faEdit, faFire, faLaptop, faPhone, faServer, faSortAmountDown, faTimesCircle, faTrash, faUser, faUsers } from '@fortawesome/free-solid-svg-icons'

import Config from '../Config'
import { Fab } from 'react-tiny-fab'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Header from './Components/Header'
import Popup from 'reactjs-popup'
import React from 'react'
import ReactList from 'react-list'
import axios from 'axios'

export default class Settings extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            pageName: 'Global Settings',
            servers: [],
            members: [],
            codes: []
        }
    }

    componentDidMount() {
        this.UpdateCodes()
        this.UpdateServers()
        this.UpdateGlobal()  
        this.UpdateMembers()    
    }

    //Get Global Settings
    async UpdateGlobal() {
        const community = await axios.post(Config.api + '/settings/get', {
            cookie: localStorage.getItem('cookie'),
            access_code: localStorage.getItem('access_code')
        })

        this.setState({
            global_public: community.data.public,
            global_webhook_main: community.data.webhook_global,
            global_webhook_911: community.data.webhook_calls,
            global_code_available: community.data.code_available,
            global_code_unavailable: community.data.code_unavailable,
            global_code_busy: community.data.code_busy,
            global_code_enroute: community.data.code_enroute,
            global_code_onscene: community.data.code_onscene,
        })
    }

    //Get Servers
    async UpdateServers() {
        const servers = await axios.post(Config.api + '/settings/get-servers', {
            cookie: localStorage.getItem('cookie'),
            access_code: localStorage.getItem('access_code')
        })
        this.setState({servers: servers.data})
    }

    //Get Members
    async UpdateMembers() {
        const members = await axios.post(Config.api + '/settings/get-permissions', {
            cookie: localStorage.getItem('cookie'),
            access_code: localStorage.getItem('access_code')
        })
        this.setState({members: members.data})
    }

    //Get 10-Codes
    async UpdateCodes() {
        const codes = await axios.post(Config.api + '/cad/get-codes', {
            cookie: localStorage.getItem('cookie'),
            access_code: localStorage.getItem('access_code')
        })
        this.setState({codes: codes.data})
    }
    
    render() {

        let pageToRender = null

        switch(this.state.pageName) {
            case '10-Codes Setup':
                pageToRender = this.TenCodes()
                break
            case 'Manage Servers':
                pageToRender=this.ManageServers()
                break
            case 'Manage Members':
                pageToRender=this.ManageMembers()
                break
            default:
                pageToRender = this.GlobalSettings()
                // pageToRender=this.ManageMembers()
        }

        return (
            <div id='main-container'>
                <Header back='/dashboard' />
                <div className='settings-header'>
                    <div onClick={() => this.setState({pageName: 'Global Settings'})}>Global Settings</div>
                    <div onClick={() => this.setState({pageName: 'Manage Servers'})}>Manage Servers</div>
                    <div onClick={() => this.setState({pageName: 'Manage Members'})}>Manage Members</div>
                    <div onClick={() => this.setState({pageName: 'Manage Departments'})}>Manage Departments</div>
                    <div onClick={() => {
                        this.setState({
                            pageName: '10-Codes Setup',
                            editor_code: '',
                            editor_meaning: '',
                        })
                    }}>10-Codes Setup</div>
                </div>
                <h1 className='page-header' style={{marginBottom: 0}}>{this.state.pageName}</h1>
                {pageToRender}

                {/* Permissions Context Menu */}
                <Menu id='permissions' theme={theme.dark}>
                    {this.PermissionField('Manage Settings', 'permission_manage_settings')}
                    {this.PermissionField('Manage Servers', 'permission_manage_servers')}
                    {this.PermissionField('Manage Members', 'permission_manage_members')}
                    {this.PermissionField('Manage Departments', 'permission_manage_departments')}
                    {this.PermissionField('Manage Codes', 'permission_manage_codes')}
                    {this.PermissionField('Civilian', 'permission_civilian')}
                    {this.PermissionField('Police MDT', 'permission_police_mdt')}
                    {this.PermissionField('Fire MDT', 'permission_fire_mdt')}
                    {this.PermissionField('Dispatch', 'permission_dispatch')}
                </Menu>

            </div>
        )
    }

    GlobalSettings() {
        return (
            <div style={{maxWidth: '1000px', margin: '0 auto', paddingTop: 20, paddingBottom: 20}}>
                <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignContent: 'center'}}>
                        <div className='popup-input-container'>
                            <div className='popup-input-prompt' style={{display: 'flex'}}>
                                <p>Public Server</p>
                                <input id='public_checkbox' className='popup-checkbox' type='checkbox' checked={this.state.global_public} onChange={(e) => {
                                    this.setState({global_public: e.target.checked})
                                }}/>
                            </div>
                            <p className='popup-input-prompt-sub'>If this setting is enabled, new members will automatically be given civilian permissions upon creating account. Otherwise, they will require manual approval in order to access normal civilian features such as vehicle and firearm registration.</p>
                        </div>
                    </div>
                    <hr color='#212026' style={{marginTop: 40, marginBottom: 20}} />
                    {this.GlobalField('Discord Global Webhook', 'global_webhook_main')}
                    {this.GlobalField('Discord 911 Webhook', 'global_webhook_911')}
                    <hr color='#212026' style={{marginTop: 40, marginBottom: 20}} />
                    <div className='popup-row'>
                        {this.GlobalField('10-Code for Available', 'global_code_available')}
                        {this.GlobalField('10-Code for Unavailable', 'global_code_unavailable')}
                        {this.GlobalField('10-Code for Busy', 'global_code_busy')}
                    </div>
                    <div className='popup-row'>
                        {this.GlobalField('10-Code for Enroute', 'global_code_enroute')}
                        {this.GlobalField('10-Code for Onscene', 'global_code_onscene')}
                    </div>
                </div>
                <div className='bolo-button' style={{flex: 3, marginLeft: 15, marginRight: 0, marginTop: 20, marginBottom: 70}} onClick={async () => {
                    await axios.post(Config.api + '/settings/set', {
                        cookie: localStorage.getItem('cookie'),
                        access_code: localStorage.getItem('access_code'),
                        public: this.state.global_public,
                        webhook_global: this.state.global_webhook_main,
                        webhook_calls: this.state.global_webhook_911,
                        code_available: this.state.global_code_available,
                        code_unavailable: this.state.global_code_unavailable,
                        code_busy: this.state.global_code_busy,
                        code_enroute: this.state.global_code_enroute,
                        code_onscene: this.state.global_code_onscene
                    })
                    Config.toastSuccess('Global settings updated!')
                    this.UpdateGlobal()
                }}>Save Settings</div>
            </div>
        )    
    }

    GlobalField(prompt, variable_name) {
        return (
            <div className='popup-input-container'>
                <div className='popup-input-prompt'>
                    <p>{prompt}</p>
                </div>
                <input className='popup-input' type='text' style={{fontSize: 15}} value={this.state[variable_name]} onChange={(e) => {
                    this.setState({[variable_name]: e.target.value})
                }}/>
            </div>
        )
    }

    ManageServers() {
        return (
            <div>
                <div className='list-container'>
                    <ReactList
                        itemRenderer={(index, key) => {
                            let server = this.state.servers[key]
                            console.log(server)
                            return (
                                <div key={key} className='list-box'>
                                    <div style={{flex: 1}}>
                                        <p className='list-header'>{server.name}</p>
                                        <p className='list-subheader'>{server.ip}</p>
                                    </div>
                                    
                                    {/* Edit */}
                                    <Popup trigger={<FontAwesomeIcon className='list-icon' icon={faEdit} />} className='my-popup' contentStyle={{padding: '20px', backgroundColor: '#111015', border: 'none', width: this.state.width > 1000 ? null : '90%'}} modal onOpen={() => {
                                        this.setState({
                                            server_name: server.name,
                                            server_ip: server.ip,
                                            server_secret: server.secret
                                        })
                                        document.getElementById('main-container').style.filter = "blur(20px)";
                                    }} onClose={() => {
                                        this.setState({error: null})
                                        document.getElementById('main-container').style.filter = "none";
                                    }}>
                                        {close => (
                                            <div>
                                                <div className='popup-header'>{server.name} ({server.ip}) <FontAwesomeIcon className='list-icon' onClick={async () => {
                                                    if (window.confirm("Are you sure you want to delete this server and all data associated with it?")) {
                                                        await axios.post(Config.api + '/settings/delete-server', {
                                                            'cookie' : localStorage.getItem('cookie'),
                                                            'access_code': localStorage.getItem('access_code'),
                                                            'id': server.id,
                                                        })
                                                        this.UpdateServers()
                                                        Config.toastSuccess('Server deleted.')
                                                        close()
                                                    }
                                                }} style={{marginLeft: '10px', fontSize: '30px'}} icon={faTrash} /></div>
                                                <div className='popup-row-list'>
                                                    <div className='popup-row'>
                                                        {this.PopupField('Server Name', 'server_name', 2)}
                                                        {this.PopupField('Server IP', 'server_ip', 2)}
                                                    </div>
                                                </div>
                                                <p className='popup-error-message'>{this.state.error}</p>
                                                <div className='popup-button-group'>
                                                    <div className='popup-button' style={{backgroundColor: '#34B3CE', flex: 2, marginRight: '5px'}} onClick={async () => {
                                                        try {
                                                            await axios.post(Config.api + '/settings/edit-server', {
                                                                'cookie' : localStorage.getItem('cookie'),
                                                                'access_code': localStorage.getItem('access_code'),
                                                                'id': server.id,
                                                                'name': this.state.server_name,
                                                                'ip': this.state.server_ip
                                                            })
                                                            this.UpdateServers()
                                                            Config.toastSuccess('Server updated.')
                                                            close()
                                                        }
                                                        catch (err) {
                                                            this.setState({error: err.response.data.toUpperCase()})
                                                        }
                                                    }}>Update Server</div>
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
                        length={this.state.servers.length}
                        type='uniform'
                    />
                </div>

                <Popup trigger={<Fab icon={'＋'} mainButtonStyles={{backgroundColor: '#34B3CE'}}/>} contentStyle={{padding: '20px', backgroundColor: '#111015', border: 'none', width: this.state.width > 1000 ? null : '90%'}} modal onOpen={() => {
                    this.setState({
                        server_name: '',
                        server_ip: '',
                        server_secret: ''
                    })
                    document.getElementById('main-container').style.filter = "blur(20px)";
                }} onClose={() => {
                    this.setState({error: null})
                    document.getElementById('main-container').style.filter = "none";
                }}>
                    {close => (
                        <div>
                            <div className='popup-header'>New Server</div>
                            <div className='popup-row-list'>
                                <div className='popup-row'>
                                    {this.PopupField('Server Name', 'server_name', 2)}
                                    {this.PopupField('Server IP', 'server_ip', 2)}
                                </div>
                            </div>
                            <p className='popup-error-message'>{this.state.error}</p>
                            <div className='popup-button-group'>
                                <div className='popup-button' style={{backgroundColor: '#34B3CE', flex: 2, marginRight: '5px'}} onClick={async () => {
                                    try {
                                        await axios.post(Config.api + '/settings/add-server', {
                                            'cookie' : localStorage.getItem('cookie'),
                                            'access_code': localStorage.getItem('access_code'),
                                            'name': this.state.server_name,
                                            'ip': this.state.server_ip
                                        })
                                        this.UpdateServers()
                                        Config.toastSuccess('Server successfully added!')
                                        close()
                                    }
                                    catch (err) {
                                        this.setState({error: err.response.data.toUpperCase()})
                                    }
                                }}>Create Server</div>
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

    ManageMembers() {
        return (
            <div>
                <div className='list-container settings-member-container'>
                    <ReactList
                        itemRenderer={(index, key) => {
                            let member = this.state.members[key]
                            
                            //Permission Tags
                            let tags = []
                            if (member.permission_civilian) {
                                tags[tags.length] = (
                                    <p className='settings-tag' style={{background: '#19d600'}}>
                                        <FontAwesomeIcon className='settings-tag-icon' icon={faUser} />Civilian
                                    </p>
                                )
                            }
                            if (member.permission_police_mdt) {
                                tags[tags.length] = (
                                    <p className='settings-tag' style={{background: '#0373fc'}}>
                                        <FontAwesomeIcon className='settings-tag-icon' icon={faLaptop} />Police MDT
                                    </p>
                                )
                            }
                            if (member.permission_fire_mdt) {
                                tags[tags.length] = (
                                    <p className='settings-tag' style={{background: '#fc0303'}}>
                                        <FontAwesomeIcon className='settings-tag-icon' icon={faFire} />Fire MDT
                                    </p>
                                )
                            }
                            if (member.permission_dispatch) {
                                tags[tags.length] = (
                                    <p className='settings-tag' style={{background: '#6203fc'}}>
                                        <FontAwesomeIcon className='settings-tag-icon' icon={faPhone} />Dispatch
                                    </p>
                                )
                            }
                            if (member.permission_manage_settings) {
                                tags[tags.length] = (
                                    <p className='settings-tag' style={{background: '#34B3CE'}}>
                                        <FontAwesomeIcon className='settings-tag-icon' icon={faCog} />Manage Settings
                                    </p>
                                )
                            }
                            if (member.permission_manage_servers) {
                                tags[tags.length] = (
                                    <p className='settings-tag' style={{background: '#34B3CE'}}>
                                        <FontAwesomeIcon className='settings-tag-icon' icon={faServer} />Manage Servers
                                    </p>
                                )
                            }
                            if (member.permission_manage_members) {
                                tags[tags.length] = (
                                    <p className='settings-tag' style={{background: '#34B3CE'}}>
                                        <FontAwesomeIcon className='settings-tag-icon' icon={faUsers} />Manage Members
                                    </p>
                                )
                            }
                            if (member.permission_manage_departments) {
                                tags[tags.length] = (
                                    <p className='settings-tag' style={{background: '#34B3CE'}}>
                                        <FontAwesomeIcon className='settings-tag-icon' icon={faBuilding} />Manage Departments
                                    </p>
                                )
                            }
                            if (member.permission_manage_codes) {
                                tags[tags.length] = (
                                    <p className='settings-tag' style={{background: '#34B3CE'}}>
                                        <FontAwesomeIcon className='settings-tag-icon' icon={faSortAmountDown} />Manage Codes
                                    </p>
                                )
                            }

                            //No Permission
                            if (tags.length === 0) {
                                tags[tags.length] = (
                                    <div className='settings-tag' style={{background: '#111015'}}>
                                        No permissions!
                                    </div>
                                )
                            }

                            return (
                                <div key={key} className='list-box'>
                                    <div style={{flex: 1}}>
                                        <p className='list-header'>{member.username} <FontAwesomeIcon className='list-icon settings-list-icon' icon={faEdit} onClick={(e) => {
                                            this.setState({
                                                contextMemberID: member.id
                                            })
                                            contextMenu.show({id: 'permissions', event: e})
                                        }} /></p>
                                        <p className='list-subheader'>{member.ip}</p>
                                        <div className='settings-tag-container'>
                                            {tags}
                                        </div>
                                    </div>
                                </div>
                            )
                        }}
                        length={this.state.members.length}
                        type='uniform'
                    />
                </div>
            </div>
        )
    }

    PermissionField(label, permission) {

        let member = null
        let member_index = null
        let icon = null

        for (const i in this.state.members) {
            member = this.state.members[i]
            if (member.id === this.state.contextMemberID) {
                member_index = i
                if (member[permission]) {
                    icon = <FontAwesomeIcon className='settings-context-icon' style={{color: 'green'}} icon={faCheckCircle} />
                    break
                }
                icon = <FontAwesomeIcon className='settings-context-icon' style={{color: 'red'}} icon={faTimesCircle} />
                break
            }
        }

        return <Item onClick={() => this.FlipPermission(member, member_index, permission)}>{icon} {label}</Item>
    }

    async FlipPermission(member, index, permission) {
        try {
            await axios.post(Config.api + '/settings/set-permission', {
                cookie: localStorage.getItem('cookie'),
                access_code: localStorage.getItem('access_code'),
                id: member.id,
                permission: permission,
                enabled: !member[permission]
            })
            let members = this.state.members
            members[index][permission] = !members[index][permission]
            this.setState({
                members: members
            })
        }
        catch (err) {
            if (err.response.data) {
                Config.toastFailure(err.response.data)
            }
        }
    }


    TenCodes() {
        return (
            <div style={{maxWidth: '1000px', margin: '0 auto', paddingTop: 20, paddingBottom: 20}}>
                
                <div className='popup-row' style={{marginBottom: 10}}>
                    {/* Edit Code */}
                    <div className='popup-input-container'>
                        <div className='popup-input-prompt'>
                            <p>Code</p>
                        </div>
                        <input className='popup-input' type='text' style={{fontSize: 15}} value={this.state.editor_code} onChange={(e) => {
                            this.setState({editor_code: e.target.value})
                        }}/>
                    </div>
                    {/* Edit Meaning */}
                    <div className='popup-input-container'>
                        <div className='popup-input-prompt'>
                            <p>Description</p>
                        </div>
                        <input className='popup-input' type='text' style={{fontSize: 15}} value={this.state.editor_meaning} onChange={(e) => {
                            this.setState({editor_meaning: e.target.value})
                        }}/>
                    </div>
                </div>
                <div className='bolo-button' style={{flex: 3, marginLeft: 15, marginRight: 0, marginBottom: 50}} onClick={async () => {
                    try {
                        await axios.post(Config.api + '/settings/add-code', {
                            cookie: localStorage.getItem('cookie'),
                            access_code: localStorage.getItem('access_code'),
                            code: this.state.editor_code,
                            meaning: this.state.editor_meaning
                        })
                        Config.toastSuccess('Code successfully added.')
                        this.UpdateCodes()
                    }
                    catch (err) {
                        if (err.response.data) {
                            Config.toastFailure(err.response.data)
                        }
                    }
                }}>Add Code</div>

                <div className='cad-table'>
                    <div className='cad-table-row'>
                        <div className='cad-table-cell' style={{color: '#34B3CE', flex: 2}}>Code</div>
                        <div className='cad-table-cell' style={{color: '#34B3CE', flex: 3}}>Description</div>
                        <div className='cad-table-cell' style={{color: '#34B3CE', flex: 1}}>Delete Code</div>
                    </div>    
                    <ReactList
                        itemRenderer={(index, key) => {
                            const code = this.state.codes[key]
                            return (
                                <div key={key} className='cad-table-row bolo-row' style={{cursor: 'default'}}>
                                    <div className='cad-table-cell' style={{flex: 2}}>
                                        {code.code}
                                    </div>
                                    <div className='cad-table-cell' style={{flex: 3}}>
                                        {code.meaning}
                                    </div>
                                    <div className='cad-table-cell' style={{flex: 1}}>
                                        <FontAwesomeIcon style={{color: 'red', cursor: 'pointer'}} icon={faTimesCircle} onClick={async () => {
                                            await axios.post(Config.api + '/settings/delete-code', {
                                                cookie: localStorage.getItem('cookie'),
                                                access_code: localStorage.getItem('access_code'),
                                                id: code.id
                                            })
                                            Config.toastSuccess('Code removed.')
                                            this.UpdateCodes()
                                        }} />
                                    </div>
                                </div>
                            )
                        }}
                        length={this.state.codes.length}
                        type='uniform'
                    />
                </div>
            </div>
        )
    }

    PopupField(label, variableName) {
        return (
            <div className='popup-input-container' style={{minWidth: `200px`}}>
                <div className='popup-input-prompt'>
                    <p>{label}</p>
                </div>
                <input className='popup-input' type='text' defaultValue={this.state[variableName]} onChange={(e) => {
                    this.setState({[variableName]: e.target.value})
                }}/>
            </div>
        )
    }

}