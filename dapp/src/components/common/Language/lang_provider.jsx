import React, { createContext, useState, useContext } from 'react'
const LangContext = createContext()
const SetLangContext = createContext()

function LangProvider({children}) {
  const [lang, setLang] = useState('en');
  return (
    <LangContext.Provider value={lang}>
      <SetLangContext.Provider value={setLang}>
        {children}
      </SetLangContext.Provider>
    </LangContext.Provider>
  )
}

function useLangValue() {
  const context = useContext(LangContext)
  if (context === undefined) {
    throw new Error('useLangValue must be used within a LangProvider')
  }
  return context
}

function useSetLang() {
  const context = useContext(SetLangContext)
  if (context === undefined) {
    throw new Error('useSetLang must be used within a SetLangProvider')
  }
  return context
}

function useLang() {
  return [useLangValue(), useSetLang()]
}

export { LangProvider, useLang, LangContext, SetLangContext }