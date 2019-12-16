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
  moonpay: {
    name: 'Moonpay',
    path: '/onramp/moonpay',
    url: (match) => `${match}/onramp/moonpay`,
    icon: DollarIcon,
    selectedIcon: DollarYellowIcon
  },
  ramp: {
    name: 'Ramp',
    path: '/onramp/ramp',
    url: (match) => `${match}/onramp/ramp`,
    icon: DollarIcon,
    selectedIcon: DollarYellowIcon
  },
  coindirect: {
    name: 'Coindirect',
    path: '/onramp/coindirect',
    url: (match) => `${match}/onramp/coindirect`,
    icon: DollarIcon,
    selectedIcon: DollarYellowIcon
  },
  wyre: {
    name: 'Wyre',
    path: '/onramp/wyre',
    url: (match) => `${match}/onramp/wyre`,
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
