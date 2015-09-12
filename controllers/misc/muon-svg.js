// TODO: Clean up and document.
(function() {
  var makeRequest = function(url, callback) {
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = function() {
      // Ready state must be completed, and the status must be 200 or 0 (for file:// urls).
      if(xhr.readyState < 4 || (xhr.status !== 200 && xhr.status !== 0)) return

      callback(xhr.responseText)
    }

    xhr.open('GET', url, true)
    xhr.send('')
  }

  var svgCache = {}

  var appendSVG = function(element, svgText) {
    element.innerHTML = svgText
  }

  var loadSVG = function(element, src) {
    if(!svgCache[src]) {
      svgCache[src] = true

      makeRequest(src, function(text) {
        svgCache[src] = text
        appendSVG(element, text)
      })
    } else {
      // Elements will likely be created before the first load finishes,
      // so observe the cache for the completion of the first load.
      if(svgCache[src] === true) {
        var cacheObserver = function(changes) {
          changes.forEach(function(change) {
            if(change.name === src && typeof change.object[src] === 'string') {
              Object.unobserve(svgCache, cacheObserver)
              appendSVG(element, svgCache[src])
            }
          })
        }
        Object.observe(svgCache, cacheObserver)
      } else {
        appendSVG(element, svgCache[src])
      }
    }
  }

  // Initialize the element.
  Muon('muon-svg', {
    onCreated: function() {
      this.src = this.getAttribute('src')

      if(this.src) {
        loadSVG(this, this.src)
      }

      // Tie attribute and src property changes together. (There's gotta be a better way to do this.)
      Object.observe(this, function(changes) {
        changes.forEach(function(change) {
          if(change.name === 'src') {
            change.object.setAttribute('src', change.object.src)
          }
        })
      })

    },

    onAttrChanged: function(attr, oldValue, newValue) {
      if(attr === 'src') {
        this.src = newValue
      }
      loadSVG(this, this.src)
    },
  })
})()
