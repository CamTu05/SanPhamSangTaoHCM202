import './styles/main.css'
import { Experience } from './core/Experience'

async function start() {
  if ('fonts' in document) {
    await Promise.allSettled([
      document.fonts.load('600 46px "Be Vietnam Pro"'),
      document.fonts.load('400 27px "Be Vietnam Pro"'),
      document.fonts.ready
    ])
  }
  new Experience()
}

void start()
