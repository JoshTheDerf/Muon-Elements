(function() {
  var recalculateProperties = function(element) {
    var leftIcon = element.getAttribute('left-icon')
    var rightIcon = element.getAttribute('right-icon')
    var mainIcon = element.getAttribute('main-icon')
    var fill = element.getAttribute('fill')
    var _ = element.shadowRoot

    if(leftIcon) _.getElementById('leftIcon').className = leftIcon
    if(rightIcon) _.getElementById('rightIcon').className = rightIcon
    if(mainIcon) _.getElementById('mainIcon').className = mainIcon
    if(fill) element.style.flex = fill
  }

  Muon('muon-button', {
    onCreated: function() {
      recalculateProperties(this)
    },
    onAttributeChanged: function() {
      recalculateProperties(this)
    },
  })
})()
