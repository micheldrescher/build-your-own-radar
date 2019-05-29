const _ = {
  map: require('lodash/map'),
  uniqBy: require('lodash/uniqBy'),
  capitalize: require('lodash/capitalize'),
  each: require('lodash/each')
}

const util = require('util')
const GLOBS = require('../models/globals')
const MalformedDataError = require('../../src/exceptions/malformedDataError')
const ExceptionMessages = require('./exceptionMessages')

const ContentValidator = function () {
  var self = {}

  self.verifyHeaders = function (columnNames) {
    // trim whitespaces etc off column names
    columnNames = columnNames.map(function (columnName) {
      return columnName.trim()
    })

    // no empty column names
    if (columnNames.length === 0) {
      throw new MalformedDataError(ExceptionMessages.MISSING_CONTENT)
    }

    // no invalid column names
    _.each(GLOBS.COLUMN_NAMES, function (field) {
      if (columnNames.indexOf(field) === -1) {
        throw new MalformedDataError(ExceptionMessages.MISSING_HEADERS)
      }
    })
  }

  self.verifyContent = function (allBlips) {
    // get a list of unique ring names and test against our required ring names
    // NOTE: There is *some* hardcoding going on here as the literal 'ring' depends on 
    // the definition of the ame of the column to be 'ring'. But this isn't a
    // code beauty contest here - for as long as we document what is hardcoded where, we're fine.
    // Documentation is key. :-)
    var sheetRingNames = _.map(_.uniqBy(allBlips, 'ring'), 'ring')

    // get a list of unique quadrant names and test against our required quadrant names
    // NOTE: Same hardcoding note above for ring names applies here, too
    var sheetQuadrantNames = _.map(_.uniqBy(allBlips, 'quadrant'), 'quadrant')
    console.log("sheet quadrant names = " + sheetQuadrantNames)

    // choke if too many ring names used in the google sheet
    if (sheetRingNames.length > GLOBS.RING_NAMES.length) {
      throw new MalformedDataError(ExceptionMessages.TOO_MANY_RINGS)
    }

    // choke if too many ring names used in the google sheet
    if (sheetQuadrantNames.length > GLOBS.QUADRANT_NAMES.length) {
      throw new MalformedDataError(ExceptionMessages.TOO_MANY_QUADRANTS)
    }

    // choke if we cannot find the required ring names. This allows empty rings.
    _.each(sheetRingNames, function (field) {
      if (GLOBS.RING_NAMES.indexOf(field) === -1) {
        throw new MalformedDataError(ExceptionMessages.WRONG_RING_NAMES)
      }
    })

    // choke if we cannit find the required quadrant names
    _.each(sheetQuadrantNames, function (field) {
      console.log("Checking '" + field + "' against quadrant names --> "+ GLOBS.QUADRANT_NAMES.indexOf(field))
      if (GLOBS.QUADRANT_NAMES.indexOf(field) === -1) {
        throw new MalformedDataError(ExceptionMessages.WRONG_QUADRANT_NAMES)
      }
    })

  }

  return self
}

module.exports = ContentValidator
