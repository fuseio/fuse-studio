const isArray = require('lodash/isArray')

const logsToEvents = (logs, contract) => {
  if (isArray(logs)) {
    const events = {}

    logs.forEach((log, index) => {
      log = contract.events.allEventsLogDecoder.decode(contract.abiModel, log)

      if (log.event) {
        if (events[log.event]) {
          if (isArray(events[log.event])) {
            events[log.event].push(log)

            return
          }

          events[log.event] = [events[log.event], log]

          return
        }

        events[log.event] = log

        return
      }

      events[index] = log
    })

    return events
  }
}

module.exports = {
  logsToEvents
}
