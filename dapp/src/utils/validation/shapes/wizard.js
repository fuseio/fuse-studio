import { object, number, string, boolean, mixed } from 'yup'

export default object().noUnknown(false).shape({
  communityName: string().normalize().min(3).max(36).required(),
  communitySymbol: string().uppercase().normalize().min(3).max(4).required(),
  communityType: object().noUnknown(false).shape({
    text: string().normalize().required(),
    value: string().normalize().required()
  }),
  existingToken: object().noUnknown(false).shape({
    label: string().normalize(),
    value: string().normalize()
  }).when('communityType', (communityType, schema) => {
    return communityType && communityType.value === 'existingToken' ? schema.required() : schema.notRequired()
  }),
  totalSupply: number().when('communityType', (communityType, schema) => {
    return communityType && communityType.value === 'existingToken' ? schema.notRequired() : schema.required()
  }),
  communityLogo: object().noUnknown(false).shape({
    name: string().normalize().required(),
    icon: string().normalize().required()
  }).default({}),
  isOpen: boolean().default(true),
  images: object().noUnknown(false).shape({
    croppedImageUrl: string(),
    blob: mixed()
  }).default({
    croppedImageUrl: ''
  }),
  contracts: object().noUnknown(false).shape({
    community: object().noUnknown(false).shape({
      checked: boolean().default(true)
    }),
    bridge: object().noUnknown(false).shape({
      checked: boolean().default(true)
    }),
    transferOwnership: object().noUnknown(false).shape({
      checked: boolean().default(true)
    }),
    funder: object().noUnknown(false).shape({
      checked: boolean().default(true)
    })
  }).default({
    community: {
      checked: true
    },
    bridge: {
      checked: true
    },
    transferOwnership: {
      checked: true
    },
    funder: {
      checked: true
    }
  })
})
