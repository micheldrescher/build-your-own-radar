const MalformedDataError = require('../exceptions/malformedDataError')
const ExceptionMessages = require('../util/exceptionMessages')
const util = require('util')
const GLOBS = require('../models/globals')

const _ = {
  map: require('lodash/map'),
  uniqBy: require('lodash/uniqBy'),
  sortBy: require('lodash/sortBy')
}

const Radar = function (staticRings) {
  var self, quadrants, addingQuadrant, alternatives, currentSheetName

  addingQuadrant = 0
  quadrants = [ // this list must correspond to the number of quardant names defined in globals.js
    { order: 'first' , startAngle: 0, label: 'Secure Systems'},
    { order: 'second', startAngle: 60, label: 'Verification & Assurance'},
    { order: 'third' , startAngle: 120, label: 'Operational Risk'},
    { order: 'fourth', startAngle: 180, label: 'Identity & Privacy'},
    { order: 'fifth',  startAngle: 240, label: 'Cybersecurity Governance'},
    { order: 'sixth',  startAngle: 300, label: 'Human Aspects'}
  ]
  alternatives = []
  currentSheetName = ''
  self = {}

  self.addAlternative = function (sheetName) {
    alternatives.push(sheetName)
  }

  self.getAlternatives = function () {
    return alternatives
  }

  self.setCurrentSheet = function (sheetName) {
    currentSheetName = sheetName
  }

  self.getCurrentSheet = function () {
    return currentSheetName
  }

  self.addQuadrant = function (quadrant) {
    quadrants[addingQuadrant].quadrant = quadrant
    addingQuadrant++
  }

  function allQuadrants () {
    return _.map(quadrants, 'quadrant')
  }

  function allBlips () {
    return allQuadrants().reduce(function (blips, quadrant) {
      return blips.concat(quadrant.blips())
    }, [])
  }

  // returns a static array of Ring instances
  self.rings = function () {
    return staticRings
  }

  self.quadrants = function () {
    return quadrants
  }

  return self
}

module.exports = Radar
