import React, { useState, useContext, createContext } from 'react'

export const web3AuthContext = createContext({
  provider: null
})

const useWeb3ProvideAuth = () => {
  const [web3Auth, setWeb3Auth] = useState()
  const signIn = async (provider) => {
    let web3AuthObject
    if (provider) {
      web3AuthObject = { provider }
      setWeb3Auth(web3AuthObject)
      return web3AuthObject
    }
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

export const useWeb3Auth = () => useContext(web3AuthContext)
