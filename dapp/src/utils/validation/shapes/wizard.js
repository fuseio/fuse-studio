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
  }),
  isOpen: boolean(),
  images: object().noUnknown(false).shape({
    croppedImageUrl: string(),
    blob: mixed()
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
    })
  })
})
