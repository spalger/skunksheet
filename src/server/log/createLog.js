import { format } from 'util'

export const LOG_LEVELS = [
  'error',
  'warn',
  'info',
  'debug',
]

const indent = txt => txt.split('\n').join('\n  ')

export const createLog = (config) => {
  const write = ln => {
    process.stdout.write(`${ln}\n`)
  }

  const print = (level, name, args) => {
    const limit = LOG_LEVELS.indexOf(config('logging.level'))
    if (level <= limit) {
      write(`${name}: ${indent(format(...args))}`)
    }
  }

  return {
    write,
    error: (...args) => print(0, 'error', args),
    warn: (...args) => print(1, 'warn', args),
    info: (...args) => print(2, 'info', args),
    debug: (...args) => print(3, 'debug', args),
  }
}
