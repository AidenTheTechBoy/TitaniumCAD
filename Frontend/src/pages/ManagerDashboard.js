import Config from '../Config';
import Header from './Components/Header';
import React from 'react'
import Select from 'react-select';
import axios from 'axios'

export default class ManagerDashboard extends React.Component {

    stripe = window.Stripe(Config.stripe_public)

    constructor(props) {
        super(props)
        this.state = {
            hasCommunity: false,
            hasSubscription: false,
            planMessage: '',
        }
        if (!localStorage.getItem('manager-cookie')) {
            window.location = '/manager/login'
        }
    }

    async componentDidMount() {
        const communities = await axios.post(Config.api + '/communities/list', {
            cookie: localStorage.getItem('manager-cookie')
        })
        if (communities.data.length > 0) {
            this.setState({
                hasCommunity: true,
                community: communities.data[0],
                name: communities.data[0].name,
                access_code: communities.data[0].access_code,
            })
        }
        

        const subscription = await axios.post(Config.api + '/payments/checkSubscription', {
            cookie: localStorage.getItem('manager-cookie')
        })
        this.setState({
            hasSubscription: subscription.data.has
        })

        if (subscription.data.has) {
            const msg = await axios.post(Config.api + '/payments/getPlan', {
                cookie: localStorage.getItem('manager-cookie')
            })
            this.setState({
                planMessage: msg.data.message
            })
        }
    }

    render() {
        
        if (!localStorage.getItem('manager-cookie')) {
            window.location = '/manager/login'
        }

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

        const purchaseOptions = [
            {label: 'Titanium Starter ($4.99/mo)', value: 'STARTER'},
            {label: 'Titanium Plus ($9.99/mo)', value: 'PLUS'},
            {label: 'Titanium Pro ($19.99/mo)', value: 'PRO'}
        ]

        return (
            <div>
                <Header back='/' message='Titanium Home' logout={true} />
                <div className='m-dashboard-container'>
                    <h1 className='page-header'>Community Manager Dashboard</h1>

                    <div className='m-dashboard-box'>

                        <p className='m-dashboard-message'>{this.state.hasCommunity ? 'Edit Community' : 'Create Community'}</p>
                        <p className='m-dashboard-message-sub'>{this.state.hasCommunity ? `Update your community's essential settings.` : 'Create your own community!'}</p>

                        <div className='database-fields' style={{marginBottom: 40, flexDirection: 'column'}}>
                            {/* Name Field */}
                            <div className='cad-editor-cell m-dashboard-input' style={{flex: 1, marginBottom: 20}}>
                                <div><p>Server Name</p></div>
                                <input type='text' value={this.state.name} onChange={(e) => {
                                    this.setState({name: e.target.value})
                                }}/>
                            </div>

                            {/* Access Code Field */}
                            <div className='cad-editor-cell m-dashboard-input' style={{flex: 1}}>
                                <div><p>Access Code</p></div>
                                <input type='text' value={this.state.access_code} onChange={(e) => {
                                    this.setState({access_code: e.target.value})
                                }}/>
                            </div>
                        </div>

                        <p class='m-dashboard-error'>{this.state.error_message}</p>

                        <div className='m-dashboard-button' style={{marginLeft: '20px', marginRight: '20px', paddingTop: '15px', paddingBottom: '15px', marginBottom: 0, marginTop: '15px'}} onClick={async () => {
                            try {
                                    if (this.state.hasCommunity) {
                                        await axios.post(Config.api + '/communities/edit', { 
                                            'cookie': localStorage.getItem('manager-cookie'),
                                            'community_id': this.state.community.id,
                                            'name': this.state.name,
                                            'access_code': this.state.access_code
                                        })
                                        this.setState({error_message: ''})
                                        Config.toastSuccess('Community settings updated!')
                                        return
                                    }
                                    await axios.post(Config.api + '/communities/create', { 
                                        'cookie': localStorage.getItem('manager-cookie'),
                                        'name': this.state.name,
                                        'access_code': this.state.access_code
                                    })
                                    Config.toastSuccess('Community created! You can login using the access code you created and the same login you use for the manager.', 7000)
                                    this.componentDidMount()
                            }
                            catch (err) {
                                if (err.response.data) {
                                    this.setState({error_message: err.response.data.toUpperCase()})
                                }
                            }
                        }}>{this.state.hasCommunity ? 'Update Community' : 'Create Community'}</div>

                    </div>

                    {
                        this.state.hasSubscription ?
                        (
                            <div className='m-dashboard-pane'>
                                <div style={{display: 'flex', justifyContent: 'center'}}>
                                    <img className='icon-sm' style={{width: 100, paddingRight: 20}} src='/TitaniumCAD.png' alt='Titanium CAD logo.' />
                                    <div className='m-dashboard-pane-col'>
                                        <p className='m-dashboard-pane-header'>Your Subscription</p>
                                        <p className='m-dashboard-pane-subheader'>{this.state.planMessage}</p>
                                        <div style={{display: 'flex'}}>
                                            <div className='m-dashboard-button' style={{flex: 3, marginRight: 5}} onClick={() => this.RedirectManager()}>Manage Subscription</div>
                                            <div className='m-dashboard-button' style={{backgroundColor: '#111015', marginLeft: 5}} onClick={() => window.location = '/pricing'}>View Plans</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                        :
                        (
                            <div className='m-dashboard-pane'>
                                <div style={{display: 'flex', justifyContent: 'center'}}>
                                    <img className='icon-sm' style={{width: 100, paddingRight: 20}} src='/TitaniumCAD.png' alt='Titanium CAD logo.' />
                                    <div className='m-dashboard-pane-col'>
                                        <p className='m-dashboard-pane-header'>Upgrade to Titanium Premium</p>
                                        <p className='m-dashboard-pane-subheader'>Want even more cool features! Titanium Free is awesome but it has nowhere near the amount of features provided in our paid plans!</p>
                                        <Select className='list-select' styles={selectStyle} placeholder='Select the plan for you.' options={purchaseOptions} onChange={(selected) => {
                                            this.setState({'plan_upgrade': selected.value})
                                        }} />
                                        <div style={{display: 'flex'}}>
                                            <div className='m-dashboard-button' style={{flex: 3, marginRight: 5}} onClick={() => this.RedirectPurchase(this.state.plan_upgrade)}>Upgrade</div>
                                            <div className='m-dashboard-button' style={{backgroundColor: '#111015', marginLeft: 5}} onClick={() => window.location = '/pricing'}>View Plans</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                </div>
            </div>
        )
    }

    async RedirectPurchase(pkg) {

        if (!pkg) {
            return
        }

        //Create Session
        let req = await axios.post(Config.api + '/payments/create-checkout', {
            cookie: localStorage.getItem('manager-cookie'),
            package: pkg
        })

        //Get Session ID
        const session_id = req.data.session_id

        //Redirect to Payment Page
        this.stripe.redirectToCheckout({sessionId: session_id})

    }

    async RedirectManager() {
        //Create Session
        let req = await axios.post(Config.api + '/payments/portal', {
            cookie: localStorage.getItem('manager-cookie'),
        })
        window.location = req.data.url
    }

}
