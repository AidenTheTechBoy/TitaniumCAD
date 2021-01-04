import Config from '../Config';
import React from 'react'
import ReactList from 'react-list';
import axios from 'axios'

export default class Database extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            person: false,
            person_results: [],
            vehicle_results: [],
        }
    }

    componentDidMount() {
        let params = (new URL(document.location)).searchParams;
        console.log(params)
        console.log(params.get('search'))
        if (params.get('search') === 'person' || this.props.search === 'person') {
            this.setState({person: true})
        }
    }

    render() {
        return (
            <div style={{maxWidth: '1000px', margin: '0 auto', overflowY: 'hidden', paddingBottom: 80}}>

                {/* Page Header */}
                <h1 className='database-header'>{this.state.person ? 'PERSON SEARCH' : 'VEHICLE SEARCH'}</h1>

                {
                    this.state.person ?
                    (<div className='database-fields'>

                        {/* First Name Field */}
                        <div className='cad-editor-cell' style={{flex: 5}}>
                            <div><p>First Name</p></div>
                            <input type='text' value={this.state.first_name} onChange={(e) => {
                                this.setState({first_name: e.target.value})
                            }}/>
                        </div>

                        {/* Last Name Field */}
                        <div className='cad-editor-cell' style={{flex: 5}}>
                            <div><p>Last Name</p></div>
                            <input type='text' value={this.state.last_name} onChange={(e) => {
                                this.setState({last_name: e.target.value})
                            }}/>
                        </div>
                        
                        {/* Date of Birth Field */}
                        <div className='cad-editor-cell' style={{flex: 3}}>
                            <div><p>DOB</p></div>
                            <input type='text' value={this.state.dob} onChange={(e) => {
                                this.setState({dob: e.target.value})
                            }}/>
                        </div>
                    </div>)
                    :
                    (<div>
                        <div className='database-fields'>

                            {/* Make */}
                            <div className='cad-editor-cell' style={{flex: 5}}>
                                <div><p>Make</p></div>
                                <input type='text' value={this.state.make} onChange={(e) => {
                                    this.setState({make: e.target.value})
                                }}/>
                            </div>

                            {/* Model */}
                            <div className='cad-editor-cell' style={{flex: 5}}>
                                <div><p>Model</p></div>
                                <input type='text' value={this.state.model} onChange={(e) => {
                                    this.setState({model: e.target.value})
                                }}/>
                            </div>
                            
                            {/* Year */}
                            <div className='cad-editor-cell' style={{flex: 3}}>
                                <div><p>Year</p></div>
                                <input type='text' value={this.state.year} onChange={(e) => {
                                    this.setState({year: e.target.value})
                                }}/>
                            </div>
                        </div>
                        <div className='database-fields'>
                            {/* Plate */}
                            <div className='cad-editor-cell' style={{flex: 3}}>
                                <div><p>License Plate</p></div>
                                <input type='text' value={this.state.plate} onChange={(e) => {
                                    this.setState({plate: e.target.value})
                                }}/>
                            </div>

                            {/* Color */}
                            <div className='cad-editor-cell' style={{flex: 3}}>
                                <div><p>Color</p></div>
                                <input type='text' value={this.state.color} onChange={(e) => {
                                    this.setState({color: e.target.value})
                                }}/>
                            </div>
                        </div>
                    </div>)
                }

                {/* Search Button */}
                {
                    this.state.person ?
                    (
                        <div className='database-search' onClick={async () => {
                            let req = await axios.post(Config.api + '/cad/lookup-person', {
                                cookie: localStorage.getItem('cookie'),
                                access_code: localStorage.getItem('access_code'),
                                first_name: this.state.first_name,
                                last_name: this.state.last_name,
                                date_of_birth: this.state.dob,
                            })
                            this.setState({person_results: req.data})
                        }}>Search People</div>
                    )
                    :
                    (
                        <div className='database-search' onClick={async () => {
                            let req = await axios.post(Config.api + '/cad/lookup-vehicle', {
                                cookie: localStorage.getItem('cookie'),
                                access_code: localStorage.getItem('access_code'),
                                make: this.state.make,
                                model: this.state.model,
                                year: this.state.year,
                                plate: this.state.plate,
                                color: this.state.color,
                            })
                            this.setState({vehicle_results: req.data})
                        }}>Search Vehicles</div>
                    )
                }
                

                {/* Separator */}
                <hr color='#212026' style={{margin: '20px'}} />

                {/* Search Results */}
                <div>
                    {
                        this.state.person ?
                        (
                        <div style={{height: '100%'}}>
                            <ReactList
                                itemRenderer={(index, key) => {
                                    let person = this.state.person_results[key]
                                    return (
                                        <div key={key} className='database-field'>
                                            <div className='database-field-h'>{person.first_name} {person.last_name}</div>
                                            <div className='database-field-s'>{person.date_of_birth}</div>
                                        </div>
                                    )
                                }}
                                length={this.state.person_results.length}
                                type='uniform'
                            />
                            {
                                this.state.person_results.length < 1 ?
                                (
                                    <div className='database-field'>
                                        <div className='database-field-h'>No results</div>
                                        <div className='database-field-s'>Try entering some information</div>
                                    </div>
                                )
                                : null
                             }
                        </div>
                        )
                        :
                        (
                        <div style={{height: '100%'}}>
                            <ReactList
                                itemRenderer={(index, key) => {
                                    let vehicle = this.state.vehicle_results[key]
                                    return (
                                        <div key={key} className='database-field'>
                                            <div className='database-field-h'>{vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.plate})</div>
                                            <div className='database-field-s'>Registration: <b>{vehicle.registration}</b></div>
                                            <div className='database-field-s'>Insurance: <b>{vehicle.insurance}</b></div>
                                        </div>
                                    )
                                }}
                                length={this.state.vehicle_results.length}
                                type='uniform'
                            />
                            {
                                this.state.vehicle_results.length < 1 ?
                                (
                                    <div className='database-field'>
                                        <div className='database-field-h'>No results</div>
                                        <div className='database-field-s'>Try entering some information</div>
                                    </div>
                                )
                                : null
                             }
                        </div>
                        )
                    }
                </div>
                
            </div>
        )
    }
}
