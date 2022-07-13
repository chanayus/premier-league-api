const express = require("express");
const cheerio = require("cheerio");
const { default: axios } = require("axios");

const app = express();

const squad_url = "https://www.premierleague.com/clubs/1/Arsenal/squad";
const stadium_url = "https://www.premierleague.com/clubs/1/Arsenal/stadium";

const getSquad = ($, teamData, squad) => {
  const container = $("ul.squadListContainer > li");

  for (let i = 0; i < container.length; i++) {
    squad.push({
      name: $(container[i]).find(".playerCardInfo h4.name").text(),
      image: `https://resources.premierleague.com/premierleague/photos/players/250x250/${$(container[i]).find(".squadPlayerHeader img.statCardImg").attr("data-player")}.png`,
      position: $(container[i]).find(".playerCardInfo span.position").text(),
      number: $(container[i]).find(".playerCardInfo span.number").text(),
      nationality: $(container[i]).find(".squadPlayerStats li.nationality .playerCountry").text(),
    });
  }
  teamData.squad = squad;
};

const getTeamData = ($, teamData) => {
  const heroSection = $("header.clubHero");
  teamData.name = $(heroSection).find(".clubDetails h1").text();
  teamData.logo = `https:${$(heroSection).find(".clubSvg").attr("srcset")}`;
  teamData.website = `https://${$(heroSection).find(".website a").text()}`;
  teamData.stadium = "Emirates Stadium";

  console.log($(heroSection).find("div.clubDetails").html());
};

// const getStadiumData = ($, teamData) => {
//   const container = $(".articleTab");
//   teamData.stadium = {
//     name: $(container).find("p").text(),
//     capacity: "s",
//     address: "",
//   };
// };

app.get("/get", async (req, res) => {
  try {
    const squad = [];
    const teamData = {};
    const { data } = await axios.get(squad_url);
    const { data: stadium } = await axios.get(stadium_url);
    const $ = await cheerio.load(data);
    const $stadium = await cheerio.load(stadium);

    getTeamData($, teamData);
    // getStadiumData($stadium, teamData);
    getSquad($, teamData, squad);

    res.status(200).send(teamData);
  } catch (error) {
    res.send(error);
  }
});

app.listen(8080, () => {});
