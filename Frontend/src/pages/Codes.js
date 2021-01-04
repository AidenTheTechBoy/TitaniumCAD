import Config from '../Config';
import React from 'react'
import ReactList from 'react-list';
import axios from 'axios'

export default class Codes extends React.Component {

    constructor(props) {
        super(props)
        this.state = { codes: [] }
    }

    async componentDidMount() {
        const codes = await axios.post(Config.api + '/cad/get-codes', {
            cookie: localStorage.getItem('cookie'),
            access_code: localStorage.getItem('access_code')
        })
        this.setState({codes: codes.data})
        console.log(codes.data)
    }

    render() {
        return (
            <div style={{maxWidth: '1000px', margin: '0 auto', paddingTop: 20, paddingBottom: 20}}>
                <ReactList
                    itemRenderer={(index, key) => {
                        const code = this.state.codes[key]
                        return (
                            <div style={{color: 'white', textTransform: 'uppercase', fontSize: 20, textAlign: 'center'}}>{code.code}: {code.meaning}</div>
                        )
                    }}
                    length={this.state.codes.length}
                    type='uniform'
                />
            </div>
        )
    }
}
