'use client'

const sources = Array.from({ length: 12 }, (_, i) => `/brand/feathers/feather-${String(i + 1).padStart(2, '0')}.png`)
const positions = ['5%', '48%', '88%', '22%', '65%', '12%', '80%', '35%', '92%', '18%', '58%', '75%']
const durations = [19, 23, 21, 24, 20, 22, 19, 25, 21, 23, 20, 24]
const delays = [0, -5, -11, -16, -3, -8, -13, -18, -2, -7, -12, -17]
const sways = [16, -18, 15, -20, 18, -15, 17, -16, 18, -19, 16, -18]
const scales = [.75, .8, .7, .85, .65, .8, .75, .8, .7, .85, .75, .8]
// Opacidades ultra sutiles (1.8% - 3.2%) para un fondo refinado old-money sin ruido
const opacities = [.022, .028, .02, .03, .018, .028, .024, .028, .02, .032, .024, .026]
const rotations: [number, number, number][] = [[8, -10, 10], [-12, 8, -10], [14, -12, 12], [-16, 10, -14], [10, -14, 10], [-10, 12, -10], [16, -8, 14], [-14, 16, -12], [12, -10, 10], [-10, 12, -8], [14, -16, 12], [-16, 12, -14]]

/**
 * Background animado con plumas cayendo para vistas de autenticación.
 * Implementado con animaciones CSS nativas (@keyframes) aceleradas por GPU
 * para garantizar reproducción continua e ininterrumpida en Safari/iOS PWA sin
 * depender de eventos de scroll o requestAnimationFrame de JS.
 */
export function AuthBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      <style>{`
        @keyframes feather-fall {
          0% {
            transform: translate3d(0, -20vh, 0);
          }
          100% {
            transform: translate3d(0, 120vh, 0);
          }
        }
        @keyframes feather-sway-rotate {
          0% {
            transform: translate3d(0, 0, 0) rotate(var(--rot-0));
          }
          25% {
            transform: translate3d(var(--sway-x), 0, 0) rotate(var(--rot-1));
          }
          50% {
            transform: translate3d(calc(var(--sway-x) * -0.7), 0, 0) rotate(var(--rot-2));
          }
          75% {
            transform: translate3d(calc(var(--sway-x) * 0.5), 0, 0) rotate(var(--rot-1));
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(var(--rot-0));
          }
        }
        .feather-fall-wrapper {
          will-change: transform;
          animation-name: feather-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .feather-sway-inner {
          will-change: transform;
          animation-name: feather-sway-rotate;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
      <div className="absolute inset-0 bg-[#F5F2EC] transition-colors duration-700 dark:bg-[#071A24]" />
      <div className="absolute -top-[20%] left-1/2 h-[600px] w-[90vw] -translate-x-1/2 rounded-full bg-sand/30 blur-3xl dark:bg-navy/20" />
      <div className="absolute inset-0 overflow-hidden">
        {positions.map((left, index) => {
          const dur = durations[index] ?? 18
          const delay = delays[index] ?? 0
          const sway = sways[index] ?? 20
          const rot = rotations[index] ?? [10, -10, 10]
          const scale = scales[index] ?? 0.85
          const opacity = opacities[index] ?? 0.065
          const src = sources[index % sources.length] ?? sources[0]

          return (
            <div
              key={index}
              className="feather-fall-wrapper pointer-events-none absolute"
              style={{
                left,
                top: 0,
                width: `${80 * scale}px`,
                opacity,
                animationDuration: `${dur}s`,
                animationDelay: `${delay}s`,
              }}
            >
              <div
                className="feather-sway-inner filter dark:brightness-125 dark:invert"
                style={{
                  animationDuration: `${dur * 0.4}s`,
                  ['--sway-x' as string]: `${sway}px`,
                  ['--rot-0' as string]: `${rot[0]}deg`,
                  ['--rot-1' as string]: `${rot[1]}deg`,
                  ['--rot-2' as string]: `${rot[2]}deg`,
                }}
              >
                <img
                  src={src}
                  alt=""
                  aria-hidden="true"
                  className="h-auto w-full object-contain"
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="absolute inset-0 backdrop-blur-[0.5px]" />
      <div className="absolute inset-0 bg-radial-[ellipse_at_center,_transparent_30%,_#F5F2EC_90%] opacity-70 dark:bg-radial-[ellipse_at_center,_transparent_30%,_#071A24_90%]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/50" />
    </div>
  )
}
