import React, { Component } from 'react';

import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import Web3 from "web3";
// import MetaMaskContext from "./metamask";
// import { Web3ReactProvider } from '@web3-react/core'
// import Web3ReactContext from './Web3ReactContext'
import MainPage from './MainPage';
import './App.css';
import { Web3ReactProvider } from '@web3-react/core';

function getLibrary(provider, connector) {
  return new Web3(provider) // this will vary according to whether you use e.g. ethers or web3.js
}

export default class App extends Component {
  state = {
    target: ''
  }

  handleChange = ({ target: { value, id }}) => {
    this.setState({ [id]: value });
  }

  render = () => {
    return (
      <div className="main">
        <div className="banner">
        <Typography variant="h3">
          Welcome to Notify
        </Typography>
        <Grid
          container
          spacing={2}
          direction="column"
          alignItems="center"
          justify="center"
          style={{ maxWidth: '100%', margin: 0 }}
        >
          <Grid item>
            <Typography variant="h5" className="banner-msg">
              Just put in the address you want to notify and a message, then hit Notify! and they'll get the notification as a token.
            </Typography>
          </Grid>
        </Grid>
        </div>
        <Web3ReactProvider getLibrary={getLibrary}>
            <MainPage />
        </Web3ReactProvider>
        {/* <MetaMaskContext.Provider immediate>
          <MainPage />
        </MetaMaskContext.Provider> */}
        <div className="footer">
          <Typography variant="h5">
            Interested in using Notify for an application or service?
            <br />
            We'd love to <a target='_blank' href="https://twitter.com/0xNow">hear from you!</a>
          </Typography>
        </div>
      </div>
    );
  }
}
