import React, { useState, useEffect } from 'react';
import { useEthereum, useConnect, useAuthCore } from '@particle-network/auth-core-modal';
import { EthereumGoerli } from '@particle-network/chains';
import { AAWrapProvider, SmartAccount } from '@particle-network/aa';
import { ethers } from 'ethers';

import './App.css';

const App = () => {
  const { provider } = useEthereum();
  const { connect, disconnect, connected } = useConnect();
  const { userInfo } = useAuthCore();

  const smartAccount = new SmartAccount(provider, {
    projectId: process.env.REACT_APP_PROJECT_ID,
    clientKey: process.env.REACT_APP_CLIENT_KEY,
    appId: process.env.REACT_APP_APP_ID,
    aaOptions: {
      simple: [{ chainId: EthereumGoerli.id, version: '1.0.0' }]
    }
  });

  const customProvider = new ethers.providers.Web3Provider(new AAWrapProvider(smartAccount), "any");

  const [balance, setBalance] = useState(null);
  

  useEffect(() => {
    if (userInfo) {
      fetchBalance();
    }
  }, [userInfo, smartAccount, customProvider]);

  const fetchBalance = async () => {
    const balanceResponse = await customProvider.getBalance(await smartAccount.getAddress());
    setBalance(ethers.utils.formatEther(balanceResponse));
  };

  const handleLogin = async (authType) => {
    if (!userInfo) {
      const userInfo = await connect({
          socialType: authType,
          chain: EthereumGoerli,
      });
    }
  };

  const handleLogout = async () => {
    await disconnect();
  };

  const executeUserOp = async () => {
    const signer = customProvider.getSigner();
    const tx = {
      to: "0x000000000000000000000000000000000000dEaD",
      value: ethers.utils.parseEther("0.001"),
    };
    const txResponse = await signer.sendTransaction(tx);
    const txReceipt = await txResponse.wait();
    console.log('Transaction hash:', txReceipt.transactionHash);
  };

  return (
      <div className="App">
        {!userInfo ? (
          <div className="login-section">
            <button className="sign-button" onClick={() => handleLogin('google')}>Sign in with Google</button>
            <button className="sign-button" onClick={() => handleLogin('twitter')}>Sign in with Twitter</button>
          </div>
        ) : (
          <div className="profile-card">
            <h2>{userInfo.name}</h2>
            <div className="balance-section">
              <small>{balance} ETH</small>
              <button className="sign-message-button" onClick={executeUserOp}>Execute User Operation</button>
              <button className="disconnect-button" onClick={handleLogout}>Disconnect</button>
            </div>
          </div>
        )}
      </div>
  );
};

export default App;