const style = href => {
  const e = document.createElement('link')
  e.href = href
  e.rel = 'stylesheet'
  document.head.appendChild(e)
}

const script = src => {
  const e = document.createElement('script')
  e.src = src
  document.head.appendChild(e)
}

const init = () => {
  style('style.css')
  style('https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.css')
  script('https://api.mapbox.com/mapbox-gl-js/v2.4.1/mapbox-gl.js')
  const map = document.createElement('div')
  map.id = 'map'
  document.body.appendChild(map)
}
init()

const showMap = async (texts) => {
  mapboxgl.accessToken = 
    'pk.eyJ1IjoiaGZ1IiwiYSI6ImlRSGJVUTAifQ.rTx380smyvPc1gUfZv1cmw'
  const map = new mapboxgl.Map({
    container: 'map',
    hash: false,
    style: 'style.json',
    maxZoom: 18.5,
    zoom: 11.53,
    center: [138.7189, 35.1691],
    pitch: 76,
    bearing: -177.2,
    interactive: false
  })
  map.addControl(new mapboxgl.NavigationControl())
  map.addControl(new mapboxgl.ScaleControl({
    maxWidth: 200, unit: 'metric'
  }))

  const updateCameraPosition = (position, altitude, target) => {
    const camera = map.getFreeCameraOptions()
    camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
      position, altitude
    )
    camera.lookAtPoint(target)
    map.setFreeCameraOptions(camera)
  }

  let animationIndex = 0
  let animationTime = 0.0

  map.once('idle', () => {
    const lerp = (a, b, t) => {
      if (Array.isArray(a) && Array.isArray(b)) {
        const result = []
	for (let i = 0; i < Math.min(a.length, b.length); i++)
	  result[i] = a[i] * (1.0 - t) + b[i] * t
	return result
      } else {
	return a * (1.0 - t) + b * t
      }
    }
    const animations = [
      {
        duration: 50000.0,
	animate: (phase) => {
          const start = [134.14, 34.88]
	  const end = [134.02,35.06]
	  const alt = [1000.0, 1000.0]
	  const position = lerp(start, end, phase)
	  const altitude = lerp(alt[0], alt[1], phase)
	  //const target = [135, 35]
	  //const target = lerp(start, end, phase > 0.9 ? phase : phase + 0.08)
	  //updateCameraPosition(position, altitude, target)
	  updateCameraPosition(position, altitude, position)
        }
      }
    ]

    let lastTime = 0.0
    const frame = time => {
      animationIndex %= animations.length
      const current = animations[animationIndex]
      if (animationTime < current.duration) {
        const phase = animationTime / current.duration
	current.animate(phase)
      }
      const elapsed = time - lastTime
      animationTime += elapsed
      lastTime = time
      if (animationTime > current.duration) {
        animationIndex++
	animationTime = 0.0
      }
      window.requestAnimationFrame(frame)
    }
    window.requestAnimationFrame(frame)
  })

  let voice = null
  for(let v of speechSynthesis.getVoices()) {
    console.log(v.name)
    if ([
      'Daniel',
      'Google UK English Male',
      'Microsoft Libby Online (Natural) - English (United Kingdom)'
    ].includes(v.name)) voice = v
  }

  const legend = {
    1: 'water',
    2: 'urban',
    3: 'rice paddy',
    4: 'crop',
    5: 'grassland',
    6: 'deciduous broad-leaved forest, or DBF',
    7: 'deciduous needle-leaved forest, or DNF',
    8: 'evergreen broad-leaved forest, or EBF',
    9: 'evergreen needle-leaved forest, or ENF',
    10: 'bare land',
    11: 'bamboo',
    12: 'solar panel'
  }

  map.on('load', () => {
    map.on('click', 'hrlulc', (e) => {
      let u = new SpeechSynthesisUtterance()
      u.lang = 'en-GB'
      u.text = legend[e.features[0].properties.a]
      if (voice) u.voice = voice
      speechSynthesis.cancel()
      speechSynthesis.speak(u)
    })

  })
}

const main = async () => {
  if (typeof mapboxgl == 'undefined') {
    window.onload = () => {
      showMap()
    }
  } else {
    showMap()
  }
}
main()
