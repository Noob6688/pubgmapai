let transitionStartTime = 0
let forceExit = false
const ENTERING_DURATION = 1500
const MAX_KEEP_ALIVE = 10000
const EXIT_DELAY = 200

export function startWormholeTransition() {
  transitionStartTime = Date.now()
  forceExit = false
}

export function endWormholeTransition() {
  forceExit = true
}

export function getPhase(): 'idle' | 'entering' | 'exiting' {
  if (transitionStartTime === 0) return 'idle'
  
  const elapsed = Date.now() - transitionStartTime
  
  if (forceExit && elapsed > ENTERING_DURATION + EXIT_DELAY) {
    if (elapsed > ENTERING_DURATION + EXIT_DELAY + 1200) {
      transitionStartTime = 0
      forceExit = false
      return 'idle'
    }
    return 'exiting'
  }
  
  if (elapsed < ENTERING_DURATION || elapsed < MAX_KEEP_ALIVE) {
    return 'entering'
  }
  
  return 'idle'
}
