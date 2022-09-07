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

// let window;

export function Welcome() {

  const [balance, setBalance] = useState(null)
  const [currentAccount, setCurrentAccount] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [chainname, setChainName] = useState()


  async function queryTokenBalance(){
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    provider.getBalance(currentAccount).then((result)=>{
      setBalance(ethers.utils.formatEther(result))
    })
    provider.getNetwork().then((result)=>{
      console.log("network", result)
      setChainId(result.chainId)
      setChainName(result.name)
    })
    // console.log(`The chainId of mainnet is ${ChainId.MAINNET}.`)
  }

  useEffect(() => {
    if(!currentAccount || !ethers.utils.isAddress(currentAccount)) return
    //client side code
    if(!window.ethereum) return
    queryTokenBalance()

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20 = new ethers.Contract(AddressERC20, ERC20abi, provider)
    // listen for changes on an Ethereum address
    console.log(`listening for Transfer...`)

    const fromMe = erc20.filters.Transfer(currentAccount, null)
    provider.on(fromMe, (from, to, amount, event) => {
        console.log('Transfer|sent', { from, to, amount, event })
        queryTokenBalance()
    })

    const toMe = erc20.filters.Transfer(null, currentAccount)
    provider.on(toMe, (from, to, amount, event) => {
        console.log('Transfer|received', { from, to, amount, event })
        queryTokenBalance()
    })

    // remove listener when the component is unmounted
    return () => {
        provider.removeAllListeners(toMe)
        provider.removeAllListeners(fromMe)
    } 
  },[currentAccount])

  const onClickConnect = () => {
    //client side code
    console.log(window.ethereum)
    if(!window.ethereum) {
      console.log("please install MetaMask")
      return
    }
    /*
    //change from window.ethereum.enable() which is deprecated
    //see docs: https://docs.metamask.io/guide/ethereum-provider.html#legacy-methods
    window.ethereum.request({ method: 'eth_requestAccounts' })
    .then((accounts:any)=>{
      if(accounts.length>0) setCurrentAccount(accounts[0])
    })
    .catch('error',console.error)
    */

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
                  ETH Balance of current account: {balance}
                </li>
                <li>
                  Chain Info: ChainId {chainId} name {chainname}
                </li>
            </ul>
            <Donation addressContract={AddressDonation} currentAccount={currentAccount} />
            <DonationEth addressContract={AddressDonation} currentAccount={currentAccount} />
            <DepositToVault addressContract={AddressDonation} currentAccount={currentAccount} />
            <DepositEthToVault addressContract={AddressDonation} currentAccount={currentAccount} />
            <ClaimDaoToken addressContract={AddressDonation} currentAccount={currentAccount} />
            <AddReferral addressContract={AddressDonation} currentAccount={currentAccount} />
            <ReadERC20 addressContract={AddressDonation} currentAccount={currentAccount} />
          </div>
        : <></>
      }
    </div>
  );
}
