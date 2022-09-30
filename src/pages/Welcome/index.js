import { useState, useEffect} from 'react'
import { ethers } from "ethers";
import { ReadERC20 } from 'components/organisms/ReadERC20';
import { AddressDonation, AddressERC20 } from 'config';
// import {DonationAbi} from 'abis/Donation'
import { ERC20abi } from 'abis/ERC20';
// import { ChainId } from '@uniswap/sdk'
import { Donation } from 'components/organisms/Donation';
import { AddReferral } from 'components/organisms/AddReferral';
import { DonationEth } from 'components/organisms/DonationEth';
import { DepositToVault } from 'components/organisms/DepositToVault';
import { DepositEthToVault } from 'components/organisms/DepositEthToVault';
import { ClaimDaoToken } from 'components/organisms/ClaimDaoToken';
import { DonationAbi } from 'abis/Donation';

// let window;

export function Welcome() {

  const [balance, setBalance] = useState(null)
  const [currentAccount, setCurrentAccount] = useState(null)
  const [tokenBalance, setTokenBalance] = useState(null)
  const [tokenAddress, setTokenAddress] = useState(null)
  const [tokenName, setTokenName] = useState(null)
  const [symbol, setSymbol] = useState(null)
  const [decimal, setDecimal] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [chainname, setChainName] = useState()
  const [donater, setDonater] = useState(null)
  const [daoTokenAmount, setDaoTokenAmount] = useState(null)

  const getName = async (erc20) => {
    try {
      return await erc20.name();
    } catch (err) {
      return ''
    }
  }
  const getSymbol = async (erc20) => {
    try {
      return await erc20.symbol();
    } catch (err) {
      return ''
    }
  }
  const getDecimal = async (erc20) => {
    try {
      return await erc20.decimals()
    } catch (err) {
      return 0
    }
  }
  const getBalance = async (erc20) => {
    try {
      if(tokenAddress) {
        console.log({tokenAddress})
        const balance = await erc20.balanceOf(currentAccount)
        console.log({balance})
        return ethers.utils.formatEther(balance)
      }
    } catch (err) {
      console.log("get token Balance error", err)
      return 0
    }
  }
  async function queryTokenBalance(provider){
    if( tokenAddress ) {
      const signer = provider.getSigner()
      const erc20 = new ethers.Contract(tokenAddress, ERC20abi, provider)
      Promise.all([ getName(erc20), getSymbol(erc20), getDecimal(erc20), getBalance(erc20)]).then(values => {
        console.log(values)
        setTokenName(values[0])
        setSymbol(values[1])
        setDecimal(values[2])
        setTokenBalance(values[3])
      })
    }
    
    provider.getBalance(currentAccount).then(bc => setBalance(ethers.utils.formatEther(bc)))

    provider.getNetwork().then((result)=>{
      setChainId(result.chainId)
      setChainName(result.name)
    })
    // console.log(`The chainId of mainnet is ${ChainId.MAINNET}.`)
  }

  useEffect(() => {
    if(!currentAccount || !ethers.utils.isAddress(currentAccount)) return
    //client side code
    if(!window.ethereum) return
    
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const donation = new ethers.Contract(AddressDonation, DonationAbi, provider.getSigner())
    queryTokenBalance(provider)
    if(tokenAddress) {
      // const erc20 = new ethers.Contract(tokenAddress, ERC20abi, provider)
      // listen for changes on an Ethereum address
      console.log(`listening for Transfer...`)
  
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      })
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      })
  
      // const fromMe = erc20.filters.Transfer(currentAccount, null)
      // provider.on(fromMe, (from, to, amount, event) => {
      //     console.log('Transfer|sent', { from, to, amount, event })
      //     queryTokenBalance(provider)
      // })
  
      // const toMe = erc20.filters.Transfer(null, currentAccount)
      // provider.on(toMe, (from, to, amount, event) => {
      //     console.log('Transfer|received', { from, to, amount, event })
      //     queryTokenBalance(provider)
      // })
  
      // // remove listener when the component is unmounted
      // return () => {
      //     provider.removeAllListeners(toMe)
      //     provider.removeAllListeners(fromMe)
      // } 
    }
    donation.on("addressWhiteListed", (accounts) => {
      console.log("Event addressWhiteListed", {accounts})
    })
    donation.on("addressWhitelistedAdmin", (accounts) => {
      console.log("Event addressWhitelistedAdmin", {accounts})
    })
    donation.on("Claimed", (donater, daoTokenAmount) => {
      console.log("Event Claimed", {donater, daoTokenAmount})
      setDonater(donater)
      setDaoTokenAmount(daoTokenAmount)
    })
    donation.on("DonationMade", (donater, tokenDonated, amountDonated) => {
      console.log("Event DonationMade", {donater, tokenDonated, amountDonated})
    })
    donation.on("VaultDepositMade", (underlyingToken, amount) => {
      console.log("Event VaultDepositMade", {underlyingToken, amount})
    })
    donation.on("EthVaultDepositMade", (amount) => {
      console.log("Event EthVaultDepositMade", {amount})
    })
  },[currentAccount, tokenAddress])

  const onClickConnect = () => {
    //client side code
    if(!window.ethereum) {
      console.log("please install MetaMask")
      return
    }

    //we can do it using ethers.js
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    // MetaMask requires requesting permission to connect users accounts
    provider.send("eth_requestAccounts", [])
    .then((accounts)=>{
      if(accounts.length>0) setCurrentAccount(accounts[0])
    })
    .catch((e)=>console.log(e))
  }

  const onClickDisconnect = () => {
    console.log("onClickDisConnect")
    setBalance(undefined)
    setCurrentAccount(undefined)
    setTokenBalance(null)
    setSymbol(null)
    setTokenAddress(null)
    setDecimal(null)
    setTokenName(null)
    setChainId(null)
    setChainName(null)
  }

  const updatedToken = (token) => {
    setTokenAddress(token)
  }

  return (
    <div className="container mx-auto m-6 sm:px-16 xl:px-48">
      <h3 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Tiny Dao Dapp</h3>
      <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">local chain with hardhat</p>
      {currentAccount  
        ? <button type="button" className="inline-flex items-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={onClickDisconnect}>
            <svg className='inline mr-2 w-5 h-5' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Account:{currentAccount}
          </button>
        : <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={onClickConnect}>
            Connect MetaMask
          </button>
      }
      {currentAccount  
        ? <div className='flex justify-center flex-col mx-auto'>
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white text-left">Account info</h2>
            <ul className="space-y-1 max-w-md list-disc list-inside text-gray-500 dark:text-gray-400 text-left">
                <li>
                  Chain Info: ChainId {chainId} name {chainname}
                </li>
                <li>
                  ETH Balance of current account: {balance}
                </li>
                <li>
                  Symbol: {symbol}
                </li>
                <li>
                  Decimal: {decimal}
                </li>
            </ul>
            <Donation 
              addressContract={AddressDonation} 
              currentAccount={currentAccount} 
              chainId={chainId} 
              symbol={symbol}
              decimal={decimal}
              tokenName={tokenName}
              tokenAddress={tokenAddress}
              tokenBalance={tokenBalance}
              updatedToken={updatedToken}
            />
            <DonationEth addressContract={AddressDonation} currentAccount={currentAccount} />
            <DepositToVault addressContract={AddressDonation} currentAccount={currentAccount} />
            <DepositEthToVault addressContract={AddressDonation} currentAccount={currentAccount} />
            <ClaimDaoToken addressContract={AddressDonation} currentAccount={currentAccount} donater={donater} daoTokenAmount={daoTokenAmount} />
            <AddReferral addressContract={AddressDonation} currentAccount={currentAccount} />
            {/* <ReadERC20 addressContract={AddressDonation} currentAccount={currentAccount} /> */}
          </div>
        : <></>
      }
    </div>
  );
}
