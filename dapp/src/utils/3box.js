
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
  return publicFields.reduce((fields, field) =>
    data.hasOwnProperty(field) ? ({ ...fields, [field]: data[field] }) : fields,
  {})
}

export const getPrivateData = (data) => {
  return privateFields.reduce((fields, field) =>
    data.hasOwnProperty(field) ? ({ ...fields, [field]: data[field] }) : fields,
  {})
}

export const separateData = (data) => ({ publicData: getPublicData(data), privateData: getPrivateData(data) })
