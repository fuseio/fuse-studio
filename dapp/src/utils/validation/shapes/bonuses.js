import { object, number, boolean } from 'yup'

const bonusOption = object().noUnknown(false).shape({
  isActive: boolean().default(false),
  amount: number().positive()
})

export default object().noUnknown(false).shape({
  joinBonus: bonusOption,
  backupBonus: bonusOption,
  inviteBonus: bonusOption
})
