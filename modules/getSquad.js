const cheerio = require("cheerio")
const { default: axios } = require("axios")

const getSquad = async (teamId) => {
  const squad = []
  const { data } = await axios.get(`https://www.premierleague.com/clubs/${teamId}/club/squad`)
  const $ = await cheerio.load(data)
  const container = $("main div.wrapper div.squad-list__position-container")

  for (let i = 0; i < container.length; i++) {
    const position = $(container[i]).find("ul.squad-list__position-list li.stats-card")

    for (let j = 0; j < position.length; j++) {
      squad.push({
        name: `${position.eq(j).find(".stats-card__player-first").text()}${position.eq(j).find(".stats-card__player-last").text()}`,
        image: `https://resources.premierleague.com/premierleague/photos/players/250x250/${position
          .eq(j)
          .find(".stats-card__player-image img")
          .attr("data-player")}.png`,
        position: position.eq(j).find(".stats-card__position-container .stats-card__player-position").text(),
        number: position.eq(j).find(".stats-card__position-container .stats-card__squad-number").text(),
        nationality: position.eq(j).find(".stats-card__player-country").text(),
        nationFlagIcon: position.eq(j).find(".stats-card__flag-icon").attr("src"),
      })
    }
  }

  return squad
}

module.exports.getSquad = getSquad
