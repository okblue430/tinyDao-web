import { useState } from 'react'
import { ethers } from "ethers";
import {DonationAbi} from 'abis/Donation'
import { showBalance } from 'services/util';

export function ClaimDaoToken ({
    addressContract,
    currentAccount,
    donater,
    daoTokenAmount
}) {
    const [loading, setLoading] = useState(false)

    const send = async (event) => {
        event.preventDefault()
        setLoading(true)
        if(!window.ethereum) return    
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const donation = new ethers.Contract(addressContract, DonationAbi, signer)
        try {
            const res = await donation.claimDaoTokens()
            console.log({res})
        } catch (error) {
            console.log("deposite error", error)            
            alert('There was some problem, please try again')
        }
        setLoading(false)
    }
    return (
        <div className="w-full max-w-md border-gray-50 border-t hover:shadow mx-auto mt-10 border-radius-6 mb-4">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8" onSubmit={send}>
                <p className='text-black text-3xl text-bold mb-3'>Claim Dao Tokens</p>
                <div className="flex items-center justify-center">
                    <button className="w-40 ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                        {loading 
                        ? <div role="status">
                                <svg className="inline mr-2 w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                </svg>
                                <span className="sr-only">Loading...</span>
                            </div> 
                        : <div>Claim</div>}
                    </button>
                </div>
                {donater && 
                <div className='my-6'>
                    <div className="flex items-center justify-between">
                        <p className='w-40 text-left text-black text-xs text-bold mb-3'>Donater : </p>
                        <p className='text-black text-xs text-bold mb-3'>{donater}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className='w-40 text-left text-black text-xs text-bold mb-3'>Dao Token Amount : </p>
                        <p className='text-black text-xs text-bold mb-3'>{showBalance(daoTokenAmount)}</p>
                    </div>
                </div>}
            </form>
        </div>
    );
}