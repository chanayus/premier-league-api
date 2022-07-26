const express = require("express")
const cheerio = require("cheerio")
const { default: axios } = require("axios")

const app = express()

const allTeam_url = "https://www.premierleague.com/clubs"

const getSquad = ($) => {
  const squad = []
  const container = $("ul.squadListContainer > li")

  for (let i = 0; i < container.length; i++) {
    squad.push({
      name: $(container[i]).find(".playerCardInfo h4.name").text(),
      image: `https://resources.premierleague.com/premierleague/photos/players/250x250/${$(container[i])
        .find(".squadPlayerHeader img.statCardImg")
        .attr("data-player")}.png`,
      position: $(container[i]).find(".playerCardInfo span.position").text(),
      number: $(container[i]).find(".playerCardInfo span.number").text(),
      nationality: $(container[i]).find(".squadPlayerStats li.nationality .playerCountry").text(),
    })
  }

  return squad
}

const getAllTeam = async ($, allTeamData) => {
  const container = $("main#mainContent ul.dataContainer li")

  for (let i = 0; i < $(container).length; i++) {
    const teamData = {}
    teamData.id = $(container[i]).find("a").attr("href").split("/")[2]
    teamData.name = $(container[i]).find(".indexInfo .nameContainer .clubName").text()
    teamData.stadium = $(container[i]).find(".indexInfo .nameContainer .stadiumName").text()
    const teamId = $(container[i]).find(".indexBadge img.badge-image").attr("src").split("/")[6].split(".")[0]
    teamData.badge = `https://resources.premierleague.com/premierleague/badges/${teamId}.svg`

    allTeamData.push(teamData)
  }
}

// Get Single Team Data Sort by Character

app.get("/team/:id", async (req, res) => {
  try {
    const teamData = []

    const { data } = await axios.get(allTeam_url)
    const $ = await cheerio.load(data)

    getAllTeam($, teamData)

    const responseData = teamData.filter((item, index) => index === req.params.id - 1)

    try {
      const { data: squad } = await axios.get(allTeam_url + `/${responseData[0].id}/club/squad`)
      const $squad = await cheerio.load(squad)
      const eachSquad = await getSquad($squad)
      responseData[0].squad = await eachSquad
    } catch (error) {
      res.send(error)
    }

    res.status(200).send(responseData)
  } catch (error) {
    res.send(error)
  }
})

// Get All Team Data

app.get("/all", async (req, res) => {
  try {
    const allTeamData = []

    const { data } = await axios.get(allTeam_url)
    const $ = await cheerio.load(data)

    getAllTeam($, allTeamData)

    for (const [index, item] of allTeamData.entries()) {
      try {
        const { data: squad } = await axios.get(allTeam_url + `/${item.id}/club/squad`)
        const $squad = await cheerio.load(squad)
        const eachSquad = await getSquad($squad)
        allTeamData[index].squad = await eachSquad
      } catch (error) {
        res.send(error)
      }
    }
    res.status(200).send(allTeamData)
  } catch (error) {
    res.send(error)
  }
})

app.listen(8080, () => {})
