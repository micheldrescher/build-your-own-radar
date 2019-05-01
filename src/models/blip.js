const IDEAL_BLIP_WIDTH = 22
const Blip = function (num, name, ring, quadrant, description,
                       trl, mrl, performance, min, max) {
  var self

  self = {}

  self.width = IDEAL_BLIP_WIDTH

  self.number      = function () { return num               }
  self.name        = function () { return name              }
  self.ring        = function () { return ring              }
  self.quadrant    = function () { return quadrant    || '' }
  self.description = function () { return description || '' }
  self.TRL         = function () { return trl         || '' }
  self.MRL         = function () { return mrl         || '' }
  self.performance = function () { return performance || '' }
  self.min         = function () { return min         || '' }
  self.max         = function () { return max         || '' }

  return self
}

module.exports = Blip
