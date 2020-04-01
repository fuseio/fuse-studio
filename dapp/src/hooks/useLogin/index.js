import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { loadModal } from 'actions/ui'
import { LOGIN_MODAL } from 'constants/uiConstants'

const useLogin = () => {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!user.isLoggedIn) {
      dispatch(loadModal(LOGIN_MODAL))
    }
  }, [])
}

export default useLogin
