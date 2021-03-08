import { faArrowLeft, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

export default class Header extends React.Component {
    render() {
        return (
            <div style={{backgroundColor: '#34B3CE', border: 'none', outline: 'none', display: 'flex', justifyContent: 'space-between', alignContent: 'center'}}>
                <a href={this.props.back} style={{display: 'flex', alignItems: 'center', color: 'white', textDecoration: 'none', fontSize: '18px', marginLeft: '10px'}} onClick={this.props.onClick ? this.props.onClick : () => {console.log('test')}}>
                   <FontAwesomeIcon style={{color: 'white', marginLeft: '10px', fontSize: '18px'}} className='list-icon' icon={faArrowLeft} />
                   <p>{this.props.message ? this.props.message : 'Go Back'}</p>
                </a>
                {
                    this.props.logout ?
                    (
                        <div style={{cursor: 'pointer', margin: 5, paddingLeft: 40, paddingRight: 40, backgroundColor: '#b80000', borderRadius: 10}} onClick={() => {
                            localStorage.removeItem('manager-cookie')
                            localStorage.removeItem('cookie')
                            window.location = '/'
                        }}>
                            <p style={{color: 'white', fontSize: '18px', marginTop: 15, marginBottom: 15}}>
                                <FontAwesomeIcon style={{color: 'white', fontSize: '18px', marginRight: 5}} className='list-icon' icon={faSignOutAlt} />
                                Logout
                            </p>
                        </div>
                    ) : null
                }
            </div>
        )
    }
}