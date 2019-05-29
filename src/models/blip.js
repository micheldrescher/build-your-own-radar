const IDEAL_BLIP_WIDTH = 22
const Blip = function (num, name, ring, quadrant, title, type,
                       trl, mrl, performance, min, max, teaser, cwurl) {
  var self

  self = {}

  self.width = IDEAL_BLIP_WIDTH

  self.number      = function () { return num               }
  self.name        = function () { return name              }
  self.ring        = function () { return ring              }
  self.quadrant    = function () { return quadrant    || '' }
  self.title       = function () { return title       || '' }
  self.type        = function () { return type        || '' }
  self.TRL         = function () { return trl         || '' }
  self.MRL         = function () { return mrl         || '' }
  self.performance = function () { return performance || '' }
  self.min         = function () { return min         || '' }
  self.max         = function () { return max         || '' }
  self.teaser      = function () { return teaser      || '' }
  self.cwurl       = function () { return cwurl      || '' }

  return self
}

module.exports = Blip
