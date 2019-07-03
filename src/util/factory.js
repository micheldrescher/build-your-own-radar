/* eslint no-constant-condition: "off" */

const util = require('util')
const d3 = require('d3')
const Tabletop = require('tabletop')
const _ = {
  map: require('lodash/map'),
  uniqBy: require('lodash/uniqBy'),
  capitalize: require('lodash/capitalize'),
  each: require('lodash/each')
}

const InputSanitizer = require('./inputSanitizer')
const Radar = require('../models/radar')
const Quadrant = require('../models/quadrant')
const Ring = require('../models/ring')
const Blip = require('../models/blip')
const GraphingRadar = require('../graphing/radar')
const QueryParams = require('./queryParamProcessor')
const MalformedDataError = require('../exceptions/malformedDataError')
const SheetNotFoundError = require('../exceptions/sheetNotFoundError')
const ContentValidator = require('./contentValidator')
const Sheet = require('./sheet')
const ExceptionMessages = require('./exceptionMessages')
const GLOBS = require('../models/globals')

const plotRadar = function (title, blips, currentRadarName, alternativeRadars) {
  document.title = title
  d3.selectAll('.loading').remove()
  
  // create static Ring map as per global definition
  var ringMap = {}  // a hash map mapping a ring's name to a Ring instance
  var rings = []    // array of Ring instances - used in the Radar model
  _.each(GLOBS.RING_NAMES, function (ringName, i) {
    var r = new Ring(ringName, i)
    ringMap[ringName] = r
    rings.push(r)
  })

  // create a static quadrant map (segments, actually) as per global definition
  var quadrants = {} // maps quadrant name to Quadrant instance
  _.each(GLOBS.QUADRANT_NAMES, function (name, i) {
    var q = new Quadrant(name, i)
    quadrants[name] = q
  })


  var numIgnored = 0;
  console.dir(quadrants)
  _.each(blips, function (blip) {
    // regard only those blips with valid ring names
    if (!ringMap[blip.ring]) {
      numIgnored++
      console.log("Ignoring blip " + blip.id + " - " + blip.name)
    } else {
      quadrants[blip.quadrant].add(
        new Blip(blip.id, blip.name, ringMap[blip.ring], blip.quadrant, blip.title, blip.type, 
                 blip.TRL, blip.MRL, blip.Performance, blip.Min, blip.Max, blip.teaser, blip.cwurl))
    }
  })
  if (numIgnored > 0) {
    console.log("Ignored a total of " + numIgnored + " entries")
  }

  var radar = new Radar(rings)
  _.each(quadrants, function (quadrant) {
    console.log("Adding quadrant '" + quadrant.name() + "' to the radar.")
    radar.addQuadrant(quadrant)
  })

  if (alternativeRadars !== undefined || true) {
    alternativeRadars.forEach(function (sheetName) {
      radar.addAlternative(sheetName)
    })
  }

  if (currentRadarName !== undefined || true) {
    radar.setCurrentSheet(currentRadarName)
  }

  var size = (window.innerHeight - 25) < 750 ? 750 : window.innerHeight - 25

  new GraphingRadar(size, radar).init().plot()
}

/******************************************************************************
 *                                                                            *
 *                            GOOGLE SPREAD SHEET                             *
 *                                                                            *
 *         Model of a Google sheet and reading in of all of its data.         *
 *                                                                            *
 ******************************************************************************/
const GoogleSheet = function (sheetReference, sheetName) {
  var self = {}

  /** 
   * Build an internal representation of the Google sheet for display
   */
  self.build = function () {
    var sheet = new Sheet(sheetReference)
    sheet.validate(function (error) {
      if (!error) {
        // This provides access to all sheets in the given Google Spreadsheet document
        // PRESUME - it's lazy loading, i.e. this is only the Google API layer and data
        //           loading is done later in the actual sheet / Tabletop Model
        Tabletop.init({
          key: sheet.id,
          callback: createBlips
        })
        return
      }

      if (error instanceof SheetNotFoundError) {
        plotErrorMessage(error)
        return
      }
    })

    // create radar blips - one for each data row
    // invoked as a callback from build() via Tabletop tool
    function createBlips (__, tabletop) {
      try {
        // If we have a sheet name, use that. Otherwise use the first found.
        // This allows us to use a stack of sheets within the Google Spreadhseet of 
        // historic tech radars.
        // Function "plotRadar" called later takes care of offering a clickable list of 
        // historic radars
        if (!sheetName) {
          sheetName = tabletop.foundSheetNames[0]
        }
        var columnNames = tabletop.sheets(sheetName).columnNames

        // fetch all rows of the selected sheet
        var all = tabletop.sheets(sheetName).all()
        // create the blips off the pulled data
        var blips = _.map(all, new InputSanitizer().sanitize)

        //validate the content against our requirements
        var contentValidator = new ContentValidator()
        contentValidator.verifyHeaders(columnNames) // that's better!
        contentValidator.verifyContent(blips)


        // ... aaaaand plot the resulting HTML page!
        plotRadar(tabletop.googleSheetName + ' - ' + sheetName, blips, sheetName, tabletop.foundSheetNames)

      } catch (exception) {
        plotErrorMessage(exception)
      }
    }
  }

  self.init = function () {
    plotLoading()
    return self
  }

  return self
}

const DomainName = function (url) {
  var search = /.+:\/\/([^\\/]+)/
  var match = search.exec(decodeURIComponent(url.replace(/\+/g, ' ')))
  return match == null ? null : match[1]
}

/************************************************
 *                                              *
 *     MAIN ENTRY POINT TO TECHNOLOGY RADAR     *
 *                                              *
 * This factory (GoogleSheetInput) does one of  *
 * two things:                                  *
 * 1. If location URL is 'empty', show form to  *
 *    user for providing a URL to a Google sheet*
 *    or a CSV data source                      *
 * 2. If the domain name of the data source URL *
 *    includes 'google.com', presume it is a    *
 *    Google spreadsheet and load it using      *
 *    Tabletops                                 *
 *                                              *
 * Either way, if CSV or Googlesheet, an        *
 * instance of Googlesheet it created and told  *
 * to build itself on the pulled in data.       *
*************************************************/
const GoogleSheetInput = function () {
  var self = {}
  var sheet

  self.build = function () {
    // parse the URL for Google sheetName
    // Examples:
    //    /d/1hWMiKGlrKmmm4cnWWPyuYPFfK_ndaQeyrgLEec6o_PI/edit (first or default)
    //    /d/1hWMiKGlrKmmm4cnWWPyuYPFfK_ndaQeyrgLEec6o_PI/edit&sheetName=Sheet3 // a specific sheet

    // A domain name in the "sheetId" query paramenter (from the built-in form, see below)
    var domainName = DomainName(window.location.search.substring(1))
    
    // Extract query parameters from the location URL. The following are used:
    // sheetId - the id of the Google Spreadsheet document
    // sheetName - the name of the sheet (not its id!) within the spreadsheet document
    //             if undefined, the first is used
    var queryString = window.location.href.match(/sheetId(.*)/)       // test if called via form
    var queryParams = queryString ? QueryParams(queryString[0]) : {}  // sanitised verison of queryString

    // got called as part of the default form
    // ==> load the provided Google sheet
    if (domainName && domainName.endsWith('google.com') && queryParams.sheetId) {
      sheet = GoogleSheet(queryParams.sheetId, queryParams.sheetName)
      sheet.init().build()
      
    // Show the default form
    // TODO remove as we don't need that, or beautify it into a radar overview
    } else {
      var content = d3.select('body')
        .append('div')
        .attr('class', 'input-sheet')
      setDocumentTitle()

      plotLogo(content)

      var bannerText = '<div><h1>Build your own radar</h1><p>Once you\'ve <a href ="https://www.thoughtworks.com/radar/byor">created your Radar</a>, you can use this service' +
        ' to generate an <br />interactive version of your Technology Radar. Not sure how? <a href ="https://www.thoughtworks.com/radar/how-to-byor">Read this first.</a></p></div>'

      plotBanner(content, bannerText)

      plotForm(content)

      plotFooter(content)
    }
  }

  return self
}

function setDocumentTitle () {
  document.title = 'Build your own Radar'
}

function plotLoading (content) {
  content = d3.select('body')
    .append('div')
    .attr('class', 'loading')
    .append('div')
    .attr('class', 'input-sheet')

  setDocumentTitle()

  plotLogo(content)

  var bannerText = '<h1>Building your radar...</h1><p>Your Technology Radar will be available in just a few seconds</p>'
  plotBanner(content, bannerText)
  plotFooter(content)
}

function plotLogo (content) {
  content.append('div')
    .attr('class', 'input-sheet__logo')
    .html('<a href="https://www.thoughtworks.com"><img src="/images/tw-logo.png" / ></a>')
}

function plotFooter (content) {
  var fc =  content
    .append('div')
    .attr('id', 'footer')
    .append('div')
    .attr('class', 'footer-content')
  fc.append('p').html('Powered by <a href="https://www.cyberwatching.eu/">Cyberwatching.eu</a>. ')
  fc.append('p').html('This software is <a href="https://github.com/micheldrescher/cyberwatching_radar">open source</a> and available for download and self-hosting.')
}

function plotBanner (content, text) {
  content.append('div')
    .attr('class', 'input-sheet__banner')
    .html(text)
}

function plotForm (content) {
  content.append('div')
    .attr('class', 'input-sheet__form')
    .append('p')
    .html('<strong>Enter the URL of your <a href="https://www.thoughtworks.com/radar/how-to-byor" target="_blank">published</a> Google Sheet or CSV file below…</strong>')

  var form = content.select('.input-sheet__form').append('form')
    .attr('method', 'get')

  form.append('input')
    .attr('type', 'text')
    .attr('name', 'sheetId')
    .attr('placeholder', 'e.g. https://docs.google.com/spreadsheets/d/<sheetid> or hosted CSV file')
    .attr('required', '')

  form.append('button')
    .attr('type', 'submit')
    .append('a')
    .attr('class', 'button')
    .text('Build my radar')

  form.append('p').html("<a href='https://www.thoughtworks.com/radar/how-to-byor'>Need help?</a>")
}

function plotErrorMessage (exception) {
  var message = 'Oops! It seems like there are some problems with loading your data. '

  var content = d3.select('body')
    .append('div')
    .attr('class', 'input-sheet')
  setDocumentTitle()

  plotLogo(content)

  var bannerText = '<div><h1>Build your own radar</h1><p>Once you\'ve <a href ="https://www.thoughtworks.com/radar/byor">created your Radar</a>, you can use this service' +
    ' to generate an <br />interactive version of your Technology Radar. Not sure how? <a href ="https://www.thoughtworks.com/radar/how-to-byor">Read this first.</a></p></div>'

  plotBanner(content, bannerText)

  d3.selectAll('.loading').remove()
  message = "Oops! We can't find the Google Sheet you've entered"
  var faqMessage = 'Please check <a href="https://www.thoughtworks.com/radar/how-to-byor">FAQs</a> for possible solutions.'
  if (exception instanceof MalformedDataError) {
    message = message.concat(exception.message)
  } else if (exception instanceof SheetNotFoundError) {
    message = exception.message
  } else {
    console.error(exception)
  }

  const container = content.append('div').attr('class', 'error-container')
  var errorContainer = container.append('div')
    .attr('class', 'error-container__message')
  errorContainer.append('div').append('p')
    .html(message)
  errorContainer.append('div').append('p')
    .html(faqMessage)

  var homePageURL = window.location.protocol + '//' + window.location.hostname
  homePageURL += (window.location.port === '' ? '' : ':' + window.location.port)
  var homePage = '<a href=' + homePageURL + '>GO BACK</a>'

  errorContainer.append('div').append('p')
    .html(homePage)

  plotFooter(content)
}

module.exports = GoogleSheetInput
