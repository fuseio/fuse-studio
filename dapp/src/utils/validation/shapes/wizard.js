import { object, number, string, boolean, mixed } from 'yup'
import isEmpty from 'lodash/isEmpty'

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
  totalSupply: number().when('existingToken', (existingToken, schema) => {
    return existingToken ? schema.notRequired() : schema.required()
  }),
  communityLogo: object().noUnknown(false).shape({
    name: string().normalize(),
    icon: string().normalize()
  }).when('images', {
    is: val => isEmpty(val),
    then: object().noUnknown(false).shape({
      name: string().normalize().required(),
      icon: string().normalize().required()
    }),
    otherwise: object().noUnknown(false).shape({
      name: string().normalize(),
      icon: string().normalize()
    })
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
