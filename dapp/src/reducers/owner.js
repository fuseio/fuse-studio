import * as owner from 'actions/owner'

const initialState = {
  isAdmin: false,
  isOwner: false,
  creatorAddress: undefined,
}


export default (state = initialState, action) => {
  switch (action.type) {
    case owner.DEFAULT:
      return { ...state }
    case owner.OWNERSHIP:
      return {...action.response }}
  }

