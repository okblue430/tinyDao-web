import { useState } from 'react'
import { ethers } from "ethers";
import {DonationAbi} from 'abis/Donation'
import { ERC20abi } from 'abis/ERC20';
import { Pool } from '@uniswap/v3-sdk'
import { Token } from '@uniswap/sdk-core'
import IUniswapV3PoolABI from 'abis/IUniswapV3Pool.json'
import { getPrice } from 'services/AlphaRouterService'
import { serializeTransaction } from 'ethers/lib/utils';
// import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
const TargetTokenAddress = process.env.REACT_APP_TARGET_ETH_ADDRESS

export function Donation ({
    addressContract,
    currentAccount,
    symbol,
    decimal,
    tokenName,
    tokenAddress,
    tokenBalance,
    updatedToken = () => {}
}) {
    const [amount, setAmount] = useState(0.0)
    const [address, setAddress] = useState('0xc7ad46e0b8a400bb3c915120d284aafba8fc4735')
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')
    const [act, setAct] = useState(true)
    const [amountOut, setAmountOut] = useState(null)
    const [fee, setFee] = useState(null)
    const [ratio, setRatio] = useState(null)

    const getSwapPrice = async () => {
        setAmountOut(null)
        setFee(null)
        setRatio(null)
        setLoading(true)
        
        const fToken = new Token(4, tokenAddress, decimal, symbol, tokenName)
        const slippageAmount = 2 // 2%
        const deadlineMinutes = 3 // 3 mins
        const swap = await getPrice(
            fToken,
            amount,
            slippageAmount,
            Math.floor(Date.now()/1000 + (deadlineMinutes * 60)),
            currentAccount
        )
        // console.log(swap)
        setAmountOut(swap[0])
        setFee(swap[1])
        setRatio(swap[2])
        setLoading(false)
        return swap
    }

    const approve = async (event) => {
        event.preventDefault()
        // await getPoolInstance()
        setErr('')
        console.log('donate approve', amount)
        if(address === '') {
            alert("please input token address")
            return
        }
        if(isNaN(amount)) {
            alert("please input numeric value")
        }else if(Number(amount) <= 0 || Number(amount) > Number(tokenBalance) ) {
            alert('please input right amount.')
        }else {
            const swap = await getSwapPrice()
            if(!swap[2]) {
                setErr('There is an error to get UniswapV3 pool’s fee')
                return
            }
            // process approve
            setLoading(true)
            // setTimeout(() => setLoading(false), 3000)
            if(!window.ethereum) return    
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const _TOKEN = new ethers.Contract(tokenAddress, ERC20abi);
            const ownToken = _TOKEN.connect(signer);
            // approve token
            try{
                const tx = await ownToken.approve(TargetTokenAddress, amount)
                console.log(tx)
                await tx.wait();
            }catch(error) {
                console.log("approve error", error)
                setErr('There is an error to approve the amount')
            }
            // donate token
            const donation = new ethers.Contract(addressContract, DonationAbi, signer)
            console.log("donation", donation)
            try {
                const eth_amount = ethers.utils.parseEther(amount)
                const convertedAmount = ethers.utils.formatEther(eth_amount)
                console.log("param", ethers.utils.parseEther(amount), convertedAmount)
                const res = await donation.donate(ethers.utils.parseEther(amount), address, act, fee, amountOut)
                console.log({res})
                setAmount(0)
                setAddress('')
            } catch (error) {
                console.log("deposite error", error)            
                setErr('There was some problem to donate, please try again')
            }
            setLoading(false)

        }
    }
    const handleToken = () => {
        setAmountOut(null)
        setFee(null)
        setRatio(null)
        updatedToken(address)
    }
    return (
        <div className="w-full max-w-md border-gray-50 border-t hover:shadow mx-auto mt-10 border-radius-6 mb-4">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8" onSubmit={approve}>
                <p className='text-black text-3xl text-bold mb-3'>Donation <span className='text-sm'>(general)</span></p>
                <div className="flex items-center justify-between">
                    <div className='text-right'>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                            type="text" 
                            placeholder="token address"
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)}
                        ></input>
                    </div>
                    <button 
                        className="w-40 ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
                        type="button"
                        onClick={handleToken}
                    >
                        Get Info
                    </button>
                </div>
                <div>
                    <ul className="pl-4 space-y-1 max-w-md list-disc list-inside text-gray-500 dark:text-gray-400 text-left">
                        <li>
                        Token Balance: {tokenBalance}
                        </li>
                        <li>
                        Name: {tokenName}
                        </li>
                        <li>
                        Symbol: {symbol}
                        </li>
                        <li>
                        Decimal: {decimal}
                        </li>
                    </ul>
                </div>
                {tokenAddress && 
                <div>
                    <div className="flex items-center justify-between">
                        <div className='text-right'>
                            <input className="mt-2 w-60 shadow appearance-none border rounded py-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                placeholder="amount"
                                type="text" 
                                onChange={(e) => setAmount(e.target.value)}
                            ></input>
                        </div>
                        <div className="flex items-center">
                            <input id="act" onChange={(e)=>setAct(e.target.checked)} type="checkbox" defaultChecked value={act} className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
                            <label htmlFor="act" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Wait batch tx</label>
                        </div>
                    </div>
                    {ratio && <div className='mt-4'>
                        <ul className="pl-4 space-y-1 max-w-md list-disc list-inside text-gray-500 dark:text-gray-400 text-left">
                            <li>
                            AmountOut: {amountOut}
                            </li>
                            <li>
                            Fee: {fee}
                            </li>
                            <li>
                            Ratio: {`1 ${symbol} = ${ratio} WETH`}
                            </li>
                        </ul>
                    </div>}
                    <div className='flex justify-center mt-4'>
                        <button className="w-40 ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                            {loading 
                            ? <div role="status">
                                    <svg className="inline mr-2 w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                    </svg>
                                    <span className="sr-only">Loading...</span>
                                </div> 
                            : <div>Donate</div>}
                        </button>
                    </div>
                </div>}
                {}
                {
                    err && <p className="mb-6 text-md font-normal text-red-500 lg:text-xl dark:text-red-400">{err}</p>
                }
            </form>
        </div>
    );
}