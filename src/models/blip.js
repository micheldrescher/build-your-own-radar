const IDEAL_BLIP_WIDTH = 22
const Blip = function (num, name, ring, isNew, topic, description) {
  var self

  self = {}

  self.width = IDEAL_BLIP_WIDTH

  self.name = function () {
    return name
  }

  self.topic = function () {
    return topic || ''
  }

  self.description = function () {
    return description || ''
  }

  self.isNew = function () {
    return isNew
  }

  self.ring = function () {
    return ring
  }

  self.number = function () {
    return num
  }

  return self
}

module.exports = Blip
