const GLOBS = require('../models/globals')

const ExceptionMessages = {
  // Google sheet related error messages
  MISSING_HEADERS:          'Document is missing one or more required headers or they are misspelled. ' +
                            'Check that your document contains headers for: ' + 
                            GLOBS.COLUMN_NAMES.toString() + '.',
  MISSING_CONTENT:          'Document is missing content.',
  SHEET_NOT_FOUND:          'Oops! We can’t find the Google Sheet you’ve entered. Can you check the URL?',

  // Quadrant related error messages
  TOO_MANY_QUADRANTS:       'There are more than 4 quadrant names listed in your data. Check the ' +
                            ' quadrant column for errors.',
  WRONG_QUADRANT_NAMES:     'Wrong segment names used in the input data. Make sure that you use only the '+
                            'following ring names: ' + GLOBS.QUADRANT_NAMES.toString(),

  // Ring related error messages
  TOO_MANY_RINGS:           'More than ' + GLOBS.COLUMN_NAMES.length + ' rings defined in sheet!',
  WRONG_RING_NAMES:         'Wrong ring names used in the input data. Make sure that you use only the '+
                            'following ring names: ' + GLOBS.RING_NAMES.toString(),

  // Other
  UNAUTHORIZED: 'UNAUTHORIZED'
}

module.exports = ExceptionMessages
