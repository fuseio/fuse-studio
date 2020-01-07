import DollarIcon from 'images/dollar_symbol.svg'
import DollarYellowIcon from 'images/dollar_symbol_yellow.svg'
import JoinBonusIcon from 'images/join_bonus.svg'
import JoinBonusYellowIcon from 'images/join_bonus_selected.svg'
import BusinessIcon from 'images/business_list.svg'
import BusinessYellowIcon from 'images/business_list_yellow.svg'

const allPlugins = (isAdmin) => isAdmin ? ({
  businessList: {
    name: 'Business list',
    path: '/merchants',
    url: (match) => `${match}/merchants`,
    icon: BusinessIcon,
    selectedIcon: BusinessYellowIcon
  },
  joinBonus: {
    name: 'Join bonus',
    path: '/bonus',
    url: (match) => `${match}/bonus`,
    icon: JoinBonusIcon,
    selectedIcon: JoinBonusYellowIcon
  },
  onramp: {
    name: 'Fiat on ramp',
    path: '/onramp',
    url: (match) => `${match}/onramp`,
    icon: DollarIcon,
    selectedIcon: DollarYellowIcon
  }
}) : ({
  businessList: {
    name: 'Business list',
    path: '/merchants',
    url: (match) => `${match}/merchants`,
    icon: BusinessIcon,
    selectedIcon: BusinessYellowIcon
  }
})

export default allPlugins
