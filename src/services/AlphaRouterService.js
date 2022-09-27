const { AlphaRouter } = require('@uniswap/smart-order-router')
const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core')
const { ethers, BigNumber } = require('ethers')
const JSBI = require('jsbi')
const { ERC20abi } = require('abis/ERC20')

const V3_SWAP_ROUTER_ADDRESS = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'
const REACT_APP_INFURA_URL_TESTNET = process.env.REACT_APP_INFURA_URL_TESTNET

const chainId = 4

const web3Provider = new ethers.providers.JsonRpcProvider(REACT_APP_INFURA_URL_TESTNET)
const router = new AlphaRouter({ chainId: chainId, provider: web3Provider })

const name0 = 'Wrapped Ether'
const symbol0 = 'WETH'
const decimals0 = 18
const address0 = '0xc778417e063141139fce010982780140aa0cd5ab'
console.log({address0})
const WETH = new Token(chainId, address0, decimals0, symbol0, name0)

export const getWethContract = () => new ethers.Contract(address0, ERC20abi, web3Provider)

export const getPrice = async (fToken, inputAmount, slippageAmount, deadline, walletAddress) => {
  const percentSlippage = new Percent(slippageAmount, 100)
//   const currencyAmount = CurrencyAmount.fromRawAmount(fToken, JSBI.BigInt(inputAmount))
  const wei = ethers.utils.parseUnits(inputAmount.toString(), decimals0)
//   console.log({wei})
  const currencyAmount = CurrencyAmount.fromRawAmount(fToken, JSBI.BigInt(wei))
//   const currencyAmount = CurrencyAmount.fromRawAmount(fToken, inputAmount)

  const route = await router.route(
    inputAmount, //currencyAmount,
    WETH,
    TradeType.EXACT_INPUT,
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
  const quoteAmountOut = route ? route.quote.toFixed(6) : null
  const ratio = route ? (inputAmount / quoteAmountOut).toFixed(3) : null
  const fee = route ? ethers.utils.formatEther(route.gasPriceWei) : null

  return [
    // transaction,
    quoteAmountOut,
    ratio,
    fee
  ]
}