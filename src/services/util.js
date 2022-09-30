import { ethers } from "ethers";

const showBalance = (bigNumber) => {
    return ethers.utils.formatEther(bigNumber)
}
const getBigNumber = (balance) => {
    return ethers.utils.parseEther(Number(balance))
}

export {
    showBalance,
    getBigNumber
}