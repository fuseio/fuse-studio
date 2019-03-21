
export const isOwner = (token, accountAddress) => {
  if (token && token.owner === accountAddress) {
    return true
  }
  return false
}
