
export const addUser = (box, data) => {

}

export const publicFields = [
  'firstName',
  'lastName',
  'country',
  'city',
  'account'
]

export const privateFields = [
  'email',
  'mainPhoneNumber',
  'secondPhoneNumber',
  'address'
]

export const getPublicData = (data) => {
  return publicFields.reduce((fields, field) => ({ ...fields, [field]: data[field] }), {})
}

export const getPrivateData = (data) => {
  return privateFields.reduce((fields, field) => ({ ...fields, [field]: data[field] }), {})
}

export const separateData = (data) => ({ publicData: getPublicData(data), privateData: getPrivateData(data) })
