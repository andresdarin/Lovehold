'use client'

import { motion } from 'framer-motion'

const sources = Array.from({ length: 12 }, (_, i) => `/brand/feathers/feather-${String(i + 1).padStart(2, '0')}.png`)
const positions = ['3%', '45%', '88%', '18%', '62%', '32%', '78%', '8%', '52%', '94%', '24%', '70%', '12%', '40%', '82%', '28%', '58%', '91%', '5%', '36%', '66%', '15%', '48%', '85%']
const durations = [16, 19, 17, 21, 18, 20, 15, 22, 17, 19, 16, 21, 18, 20, 16, 19, 17, 22, 15, 20, 18, 21, 16, 19]
const delays = [0, 1.2, 2.5, 3.8, 5, 6.2, 7.5, 8.8, 10, 11.2, 12.5, 13.8, 15, 16.2, 17.5, 18.8, 2, 4.5, 7, 9.5, 12, 14.5, 6.8, 11.8]
const sways = [20, -22, 18, -25, 24, -18, 22, -20, 19, -24, 21, -19, 23, -21, 18, -26, 20, -18, 24, -22, 19, -23, 21, -20]
const scales = [.85, .9, .8, .95, .75, .9, .85, .9, .8, .95, .85, .9, .8, .95, .85, .9, .75, .9, .85, .8, .95, .85, .9, .8]
const opacities = [.065, .075, .06, .07, .055, .075, .065, .07, .06, .075, .065, .07, .06, .075, .065, .07, .055, .075, .065, .06, .075, .065, .07, .06]
const rotations: [number, number, number][] = [[10, -12, 12], [-15, 10, -14], [18, -15, 16], [-20, 12, -18], [12, -18, 14], [-14, 16, -12], [22, -10, 20], [-18, 20, -15], [15, -14, 12], [-12, 15, -10], [16, -20, 15], [-22, 14, -18], [14, -12, 15], [-16, 18, -12], [20, -10, 16], [-12, 22, -14], [18, -15, 20], [-25, 12, -20], [10, -16, 12], [-14, 10, -12], [16, -18, 14], [-20, 15, -18], [12, -14, 10], [-15, 18, -12]]

export function AuthBackground() {
  return <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
    <div className="absolute inset-0 bg-[#F5F2EC] transition-colors duration-700 dark:bg-[#071A24]" />
    <div className="absolute -top-[20%] left-1/2 h-[600px] w-[90vw] -translate-x-1/2 rounded-full bg-sand/30 blur-3xl dark:bg-navy/20" />
    <div className="absolute inset-0 overflow-hidden">{positions.map((left, index) => <motion.div key={index}
      initial={{ y: '-20vh', x: 0, rotate: rotations[index]?.[0] }} animate={{ y: '120vh', x: [0, sways[index] ?? 20, -(sways[index] ?? 20) * .7, (sways[index] ?? 20) * .5, 0], rotate: rotations[index] }}
      transition={{ duration: durations[index] ?? 18, repeat: Infinity, ease: 'linear', delay: delays[index] ?? 0, x: { duration: (durations[index] ?? 18) * .35, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }, rotate: { duration: (durations[index] ?? 18) * .4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } }}
      style={{ position: 'absolute', left, width: `${80 * (scales[index] ?? .85)}px`, opacity: opacities[index] ?? .065 }} className="pointer-events-none filter dark:brightness-125 dark:invert">
      <img src={sources[index % sources.length] ?? sources[0]} alt="" aria-hidden="true" className="h-auto w-full object-contain" />
    </motion.div>)}</div>
    <div className="absolute inset-0 backdrop-blur-[0.5px]" />
    <div className="absolute inset-0 bg-radial-[ellipse_at_center,_transparent_30%,_#F5F2EC_90%] opacity-70 dark:bg-radial-[ellipse_at_center,_transparent_30%,_#071A24_90%]" />
    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/50" />
  </div>
}
