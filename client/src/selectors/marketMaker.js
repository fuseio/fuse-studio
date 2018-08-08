export const getQuotePair = (state, props) => {
  const quotePair = state.marketMaker.quotePair
  if (quotePair &&
    quotePair.tokenAddress === props.community.address &&
    quotePair.isBuy === props.isBuy) {
    return quotePair
  }
}
