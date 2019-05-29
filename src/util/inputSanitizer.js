const sanitizeHtml = require('sanitize-html')
const _ = {
  forOwn: require('lodash/forOwn')
}

const InputSanitizer = function () {
  var relaxedOptions = {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'ul',
      'br', 'p', 'u'],
    allowedAttributes: {
      'a': ['href']
    }
  }

  var restrictedOptions = {
    allowedTags: [],
    allowedAttributes: {},
    textFilter: function (text) {
      return text.replace(/&amp;/, '&')
    }
  }

  function trimWhiteSpaces (blip) {
    var processedBlip = {}
    _.forOwn(blip, function (value, key) {
      processedBlip[key.trim()] = value.trim()
    })
    return processedBlip
  }

  var self = {}
  self.sanitize = function (rawBlip) {
    var blip = trimWhiteSpaces(rawBlip)
    blip.name = sanitizeHtml(blip.name, restrictedOptions)
    blip.ring = sanitizeHtml(blip.ring, restrictedOptions)
    blip.quadrant = sanitizeHtml(blip.quadrant, restrictedOptions)
    blip.title = sanitizeHtml(blip.title, relaxedOptions)
    return blip
  }

  self.sanitizeForProtectedSheet = function (rawBlip, header) {
    var blip = trimWhiteSpaces(rawBlip)

    const titleIndex = header.indexOf('title')
    const nameIndex = header.indexOf('name')
    const quadrantIndex = header.indexOf('quadrant')
    const ringIndex = header.indexOf('ring')

    const title = titleIndex === -1 ? '' : blip[titleIndex]
    const name = nameIndex === -1 ? '' : blip[nameIndex]
    const isNew = isNewIndex === -1 ? '' : blip[isNewIndex]
    const ring = ringIndex === -1 ? '' : blip[ringIndex]
    const quadrant = quadrantIndex === -1 ? '' : blip[quadrantIndex]

    blip.title = sanitizeHtml(title, relaxedOptions)
    blip.name = sanitizeHtml(name, restrictedOptions)
    blip.isNew = sanitizeHtml(isNew, restrictedOptions)
    blip.ring = sanitizeHtml(ring, restrictedOptions)
    blip.quadrant = sanitizeHtml(quadrant, restrictedOptions)

    return blip
  }

  return self
}

module.exports = InputSanitizer
