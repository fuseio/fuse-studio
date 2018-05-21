// Global utility functions
export const formatAmount = (amount, divisibility) => {
	return Math.round(parseFloat(amount / Math.pow(10, divisibility)))
}

export const formatAmountReal = (amount, divisibility) => {
	return amount * Math.pow(10, divisibility)
}