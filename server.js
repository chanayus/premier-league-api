const express = require("express")
const cors = require("cors")
const cheerio = require("cheerio")
const { default: axios } = require("axios")

const app = express()

const getSquad = require("./modules/getSquad").getSquad

app.use(cors())

const CLUBS_URL = "https://www.premierleague.com/clubs"

// Get Single Team Data Sort by Character

app.get("/:id", async (req, res) => {
  try {
    const response = []
    const { data } = await axios.get(CLUBS_URL)
    const $ = await cheerio.load(data)
    const container = $("ul.club-list a")

    for (let i = 1; i < $(container).length; i++) {
      const teamId = $(container[i - 1])
        .attr("href")
        .split("/")[2]

      if (`${i}` === req.params.id) {
        const team = await getSquad(teamId)

        response.push({
          id: teamId,
          index: `${i}`,
          name: $(container[i - 1])
            .find(".club-card__name")
            .text(),
          stadium: $(container[i - 1])
            .find(".club-card__stadium")
            .text(),
          badge: $(container[i - 1])
            .find("img.badge-image")
            .attr("src"),
          squad: team,
        })
        break
      }
    }

    res.status(200).send(response)
  } catch (error) {
    res.send(error)
  }
})

// Get All Team Data

app.get("/", async (_, res) => {
  try {
    const response = []

    const { data } = await axios.get(CLUBS_URL)
    const $ = await cheerio.load(data)
    const container = $("ul.club-list a")

    for (let i = 0; i < $(container).length; i++) {
      const teamId = $(container[i]).attr("href").split("/")[2]
      const team = await getSquad(teamId)
      response.push({
        id: teamId,
        index: `${i + 1}`,
        name: $(container[i]).find(".club-card__name").text(),
        stadium: $(container[i]).find(".club-card__stadium").text(),
        badge: $(container[i]).find("img.badge-image").attr("src"),
        squad: team,
      })
    }

    res.status(200).send(response)
  } catch (error) {
    res.send(error)
  }
})

// Get League Table

// app.get("/table", async (req, res) => {
//   try {
//     const allTeamData = []

//     const { data } = await axios.get("https://www.premierleague.com/tables")
//     const $ = await cheerio.load(data)

//     const container = $(".allTablesContainer .tableContainer table tbody tr")

//     for (let i = 0; i < $(container).length; i++) {
//       i % 2 == 0 && console.log($(container[i]).find("td.team span.long").text());
//     }

//     console.log($(container).length);

//     res.status(200).send("asdasd")
//   } catch (error) {
//     res.send(error)
//   }
// })

app.listen(8080, () => {})
