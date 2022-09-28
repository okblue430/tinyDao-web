const { AlphaRouter } = require('@uniswap/smart-order-router')
const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core')
const { ethers, BigNumber } = require('ethers')
const JSBI = require('jsbi')
const { ERC20abi } = require('abis/ERC20')

const V3_SWAP_ROUTER_ADDRESS = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'
const REACT_APP_INFURA_URL_TESTNET = process.env.REACT_APP_INFURA_URL_TESTNET

const chainId = 1

const web3Provider = new ethers.providers.JsonRpcProvider(REACT_APP_INFURA_URL_TESTNET)
const router = new AlphaRouter({ chainId: 1, provider: web3Provider })

const name0 = 'Wrapped Ether'
const symbol0 = 'WETH'
const decimals0 = 18
const address0 = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
// const address0 = '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f'
console.log({address0})
const WETH = new Token(chainId, address0, decimals0, symbol0, name0)

// const name1 = 'Uniswap Token'
// const symbol1 = 'UNI'
// const decimals1 = 18
// const address1 = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'

// const UNI = new Token(chainId, address1, decimals1, symbol1, name1)

export const getWethContract = () => new ethers.Contract(address0, ERC20abi, web3Provider)

export const swapPool = async () => {
  const pool = new Pool(
    USDC,
    WETH,
    3000,
    '1283723400872544054280619964098219',
    '8390320113764730804' ,
    '193868'
  );
  
}

export const getPrice = async (fToken, inputAmount, slippageAmount, deadline, walletAddress) => {
  const percentSlippage = new Percent(slippageAmount, 100)
  const wei = ethers.utils.parseUnits(inputAmount.toString(), decimals0)
  // const currencyAmount = CurrencyAmount.fromRawAmount(WETH, JSBI.BigInt(wei))
  const currencyAmount = CurrencyAmount.fromRawAmount(fToken, JSBI.BigInt(wei))

  const route = await router.route(
    currencyAmount,
    WETH,
    TradeType.EXACT_OUTPUT,
    {
      recipient: walletAddress,
      slippageTolerance: percentSlippage,
      deadline: deadline,
    }
  )

//   const transaction = {
//     data: route.methodParameters.calldata,
//     to: V3_SWAP_ROUTER_ADDRESS,
//     value: BigNumber.from(route.methodParameters.value),
//     from: walletAddress,
//     gasPrice: BigNumber.from(route.gasPriceWei),
//     gasLimit: ethers.utils.hexlify(1000000)
//   }
console.log(route)
  const quoteAmountOut = route ? route.quote.toFixed(18) : null
  const ratio = route ? (quoteAmountOut / inputAmount).toFixed(3) : null
  const fee = route ? ethers.utils.formatEther(route.gasPriceWei) : null

  return [
    // transaction,
    quoteAmountOut,
    fee,
    ratio
  ]
}