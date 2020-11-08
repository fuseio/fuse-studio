import { object, number, string, boolean, mixed } from 'yup'

export default object().noUnknown(false).shape({
  isOpen: boolean(),
  email: string().email().required(),
  subscribe: boolean(),
  hasBalance: boolean().oneOf([true]).required(),
  network: mixed().oneOf(['ropsten', 'main']).required(),
  currency: mixed().oneOf(['new', 'existing']).required(),
  communityName: string().normalize().min(3).max(36).required().label('Name'),
  communitySymbol: string().uppercase().normalize().min(2).max(4).required().label('Symbol'),
  description: string().normalize().required().label('Description'),
  customToken: string().when(['existingToken', 'communityType'], {
    is: (existingToken, communityType) => !existingToken.value || !communityType.value,
    then: string(),
    otherwise: string().normalize().required().isAddress()
  }),
  communityType: object().noUnknown(false).shape({
    text: string().normalize(),
    value: string().normalize()
  }),
  existingToken: object().noUnknown(false).shape({
    label: string().normalize(),
    value: string().normalize()
  }),
  totalSupply: number().when(['existingToken', 'customToken'], {
    is: (existingToken, customToken) => (existingToken && existingToken.label && existingToken.value) || customToken,
    then: number(),
    otherwise: number().positive().required()
  }),
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
