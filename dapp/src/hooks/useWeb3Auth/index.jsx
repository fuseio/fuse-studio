import React, { useState, useContext, createContext } from 'react'
import { getWeb3 } from 'services/web3'

// import Web3 from 'web3'

export const web3AuthContext = createContext({
  provider: null
})

const useWeb3ProvideAuth = () => {
  const [web3Auth, setWeb3Auth] = useState()
  const signIn = async (provider) => {
    let web3AuthObject
    if (provider) {
      // const web3 = new Web3(provider)
      // const accounts = await web3.eth.getAccounts()
      // web3AuthObject = {
      //   provider
      //   // web3,
      //   // accounts
      // }
      // getWeb3(provider)
      web3AuthObject = { provider }
      return web3AuthObject
    }
    setWeb3Auth(web3AuthObject)
  }

  const signOut = () => {
    setWeb3Auth(null)
  }

  return { signIn, web3Auth, signOut }
}

export function Web3ProvideAuth ({ children }) {
  const web3Auth = useWeb3ProvideAuth()
  return <web3AuthContext.Provider value={web3Auth}>{children}</web3AuthContext.Provider>
}

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useWeb3Auth = () => useContext(web3AuthContext)
