import { object, number, string, boolean, mixed } from 'yup'

export default object().noUnknown(false).shape({
  email: string().email().required(),
  subscribe: boolean(),
  communityName: string().normalize().min(3).max(36).required(),
  communitySymbol: string().uppercase().normalize().min(3).max(4).required(),
  communityType: object().noUnknown(false).shape({
    text: string().normalize(),
    value: string().normalize()
  }),
  existingToken: object().noUnknown(false).shape({
    label: string().normalize(),
    value: string().normalize()
  }),
  totalSupply: number().when('existingToken', {
    is: existingToken => existingToken && existingToken.label && existingToken.value,
    then: number(),
    otherwise: number().required()
  }),
  isOpen: boolean(),
  images: object().noUnknown(false).shape({
    defaultOne: object().noUnknown(false).shape({
      blob: mixed(),
      croppedImageUrl: string()
    }),
    defaultTwo: object().noUnknown(false).shape({
      blob: mixed(),
      croppedImageUrl: string()
    }).nullable(),
    custom: object().noUnknown().shape({
      croppedImageUrl: string(),
      blob: mixed()
    }),
    chosen: string().required()
  }),
  coverPhoto: object().noUnknown(false).shape({
    blob: mixed(),
    croppedImageUrl: string()
  }),
  contracts: object().noUnknown(false).shape({
    community: object().noUnknown(false).shape({
      checked: boolean()
    }),
    bridge: object().noUnknown(false).shape({
      checked: boolean()
    }),
    transferOwnership: object().noUnknown(false).shape({
      checked: boolean()
    }),
    funder: object().noUnknown(false).shape({
      checked: boolean()
    }),
    email: object().noUnknown(false).shape({
      checked: boolean()
    })
  }),
  plugins: object().noUnknown(false).shape({
    businessList: object().noUnknown(false).shape({
      isActive: boolean()
    }),
    joinBonus: object().noUnknown(false).shape({
      isActive: boolean()
    }),
    onramp: object().noUnknown(false).shape({
      isActive: boolean()
    })
  })
})
