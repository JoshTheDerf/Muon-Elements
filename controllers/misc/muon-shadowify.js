// TODO: Clean up and document.
(function() {
  var _Shadowify = window.Shadowify || (typeof global !== 'undefined' ? global.Shadowify : null)
  if(!_Shadowify) return

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

  var fileCache = {}

  var processSheet = function(src) {
    var base64id = 'muon-shadowify-'+btoa(src)
    var cachedText = fileCache[src]

    var useElement = null
    if(!document.getElementById(base64id)) {
      useElement = document.createElement('style')
      useElement.id = base64id
      document.head.appendChild(useElement)
    } else {
      useElement = document.getElementById(base64id)
    }
    useElement.innerHTML = cachedText
  }

  var loadSheet = function(src, partial, deep) {
    if(!fileCache[src]) {
      fileCache[src] = true
      makeRequest(src, function(text) {
        // Woo for normalization.
        var path = src
        if(_Shadowify._isRelative(src)) {
          path = _Shadowify._basename(window.location.pathname)+src
        }

        fileCache[src] = _Shadowify(text, partial, deep, path)
        processSheet(src)
      })
    } else {
      processSheet(src)
    }
  }

  Muon('muon-shadowify', {
    onCreated: function() {
      this.src = this.getAttribute('src')
      if(!this.src) return
      this.classPartial = this.getAttribute('class-partial') || 'fa'
      this.useNewDeep = this.hasAttribute('new-deep')

      loadSheet(this.src, this.classPartial, this.useNewDeep)
    },

    onAttributeChanged: function(attr, oldValue, newValue) {
      if(attr === 'src') {
        this.src = newValue
      } else if(attr === 'class-partial') {
        this.classPartial = newValue
      } else if(attr === 'new-deep') {
        this.useNewDeep = newValue
      }
      loadSheet(this.src, this.classPartial, this.useNewDeep)
    },
  })
})()
