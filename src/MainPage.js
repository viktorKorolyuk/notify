import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import { TextField, MuiThemeProvider } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from "@material-ui/core/Typography";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from "@material-ui/core/Grid";
import FormControl from '@material-ui/core/MenuItem';
// import { withMetaMask, PropTypesMetaMaskObject } from "@daisypayments/react-metamask";

import {
  InjectedConnector,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector'
import { UnsupportedChainIdError } from '@web3-react/core'

import * as BN from 'bn.js';

import { isAddress, toContract } from "./Notify";
// import MetaMaskContext from "./metamask";

import './MainPage.css';

import Web3ReactContext from './Web3ReactContext'
import { makeStyles, ThemeProvider, createMuiTheme } from '@material-ui/core';

const injected = new InjectedConnector({
  supportedChainIds: [1, 3]
})

function getErrorMessage(error) {
  if (error.message == 'No Ethereum provider was found on window.ethereum.') {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network. Please switch to Ropsten or Mainnet."
  } else if (error instanceof UserRejectedRequestErrorInjected) {
    return 'Please authorize this website to access your Ethereum account.'
  } else {
    console.error(error)
    return 'An unknown error occurred. Check the console for more details.'
  }
}

class MainPage extends Component {
  state = {
    recipient: '',
    message: '',
    notify: null,
    netError: false
  }



  doNotify = () => {
    const { account: from, library: web3 } = this.context;
    const { recipient, message, notify } = this.state;
    if (!(recipient && message)) alert("Must provide all fields.")
    console.log(this.state.notify)
    // const symbolHex = web3.utils.asciiToHex(symbol);
    // const msgHex = web3.utils.asciiToHex(message);
    notify.methods.notify(recipient, message).send({ from, gas: 150000, value: 0x38d7ea4c68000 });
  }

  handleChange = ({ target: { value, id }}) => {
    this.setState({ [id]: value });
  }

  componentDidMount() {
    // const { web3, accounts, error, awaiting, openMetaMask } = this.props.metamask;
    // console.log('HAVE WEB3: ', !!web3);
    // console.log(web3);
    // console.log('WAITING: ', awaiting)
    // console.log('ACCOUNTS: ', accounts)
    // console.log('ERROR: ', error)
    // console.log("mounted poll")
    // this.timer = setInterval(() => this.poll(), 1000);
    this.requestMM()
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  getContract = async () => {
    const { library: web3, account } = this.context;
    await toContract(web3)
      .then(notify => this.setState({ notify }))
      .catch(err => this.setState({ error: err }));
  }

  requestMM = async () => {
    console.log(this.context)
    if (!this.context.active) {
      return this.context.activate(injected).then(() => this.getContract())
    }
    return this.getContract()
    // const web3ReactContext = getWeb3ReactContext()
    // console.log(web3ReactContext)
    // const { activate, active } = web3ReactContext;
    // if (active) console.log(`active!`)
    // else {
    //   await activate(injected)
    //   console.log(web3ReactContext.library)
    // }
    
    // const { web3, accounts } = this.props.metamask;
    // if (!web3 || !accounts.length) {
    //   console.log("Poll: No results");
    //   return;
    // }
    // console.log("Poll got web3");
    // await toContract(web3)
    //   .then(notify => this.setState({ notify }))
    //   .catch(err => this.setState({ netError: true }));
    
    // clearInterval(this.timer);
  }

  renderMM = () => {
    return <Button variant='contained' color="secondary" onClick={this.requestMM}>Open MetaMask</Button>
  }

  renderNotifyForm = () => {
    const { recipient, message } = this.state;
    const haveFields = (recipient && message);
    const btnColor = (haveFields) ? 'cyan' : 'red';
    const validAddress = recipient && isAddress(recipient)
    const recipientStyle = (recipient && !validAddress) ? {color: 'red'} : {}

    const gridItemStyle = {paddingLeft:0}
    const textFieldStyle = createMuiTheme({
      overrides:{
        MuiInputBase:{
          root:{
            background:"white",
          },
        },
        MuiOutlinedInput:{
          input:{
            fontSize: 18,
            padding: "1rem",
          },
          notchedOutline:{
            border:"1px solid",
            borderColor:"transparent"
          }
        },
      },
      palette:{
        primary:{
          main:"#5ABF90"
        }
      }
    })

    return (
      <MuiThemeProvider theme={textFieldStyle}>
      <Grid
      container
      spacing={2}
      direction="column"
      justify="center"
      className="msg-form"
      wrap={"nowrap"}
      style={{ maxWidth: '100%', margin: 0 }}
      className="form-grid"
    >
    <Grid item  xs={12} style={gridItemStyle}>

      <TextField
        id='recipient'
        placeholder="Sender address" //  or ENS domain
        value={recipient} // Proposal: This value should be populated with the senders address. This way the user can change their web3 address if needed
        onChange={this.handleChange}
        style={{ width: "100%" }}
        inputProps={{ maxLength: 42, style: recipientStyle }}
        variant='outlined'
        disabled={true}
      />

    </Grid>
    <Grid item  xs={12} style={gridItemStyle}>
      <TextField
        id='recipient'
        placeholder="Recipient address" //  or ENS domain
        value={recipient}
        onChange={this.handleChange}
        style={{ width: "100%" }}
        inputProps={{ maxLength: 42, style: recipientStyle }}
        variant='outlined'
        />
      </Grid>
      {/* <Grid item  xs={5}>
        <TextField
          id='symbol'
          placeholder="Message title"
          value={symbol}
          onChange={this.handleChange}
          style={{ width: 500 }}
          inputProps={{maxLength: 32}}
          variant='outlined'
        />
      </Grid> */}
      <Grid item xs={12} style={gridItemStyle}>
        <TextField
          id='message'
          placeholder="Message to send"
          value={message}
          onChange={this.handleChange}
          style={{ width: "100%" }}
          inputProps={{maxLength: 42}}
          variant='outlined'
        />
      </Grid>
      <Grid item xs={12} style={gridItemStyle}>
        <Button
          size='large'
          disabled={!(haveFields && validAddress)}
          onClick={this.doNotify}
          className="submit-button"
          variant="contained"
          color="primary"
        >
          Notify!
        </Button>
      </Grid>
    </Grid>
    </MuiThemeProvider>)
  }

  renderError = () => {
    const error = this.context.error || this.state.error;
    const errorMsg = getErrorMessage(error);
    return <Grid
      container
      spacing={2}
      direction="column"
      alignItems="center"
      justify="center"
      className="msg-form"
      wrap={"nowrap"}
      style={{ maxWidth: '100%', margin: 0 }}
    >
      <Typography variant="h5">Alert</Typography>
      <Typography variant='body1'>
        { errorMsg }
      </Typography>
      {this.renderMM()}
    </Grid>
  }

  render = () => {
    console.log(this.context)
    if (this.context.error) return this.renderError();
    if (this.context.library) return this.renderNotifyForm();
    return <div className="main">Waiting for MetaMask</div>
  }
}

MainPage.contextType = Web3ReactContext;

export default MainPage;