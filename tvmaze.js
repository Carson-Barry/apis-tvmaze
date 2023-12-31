"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList")


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {

  const shows = [];

  const res = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);
  for (let pushShow of res.data) {
    shows.push(
      {
        id: pushShow.show.id,
        name: pushShow.show.name,
        summary: pushShow.show.summary,
        image: pushShow.show.image.medium
      }
    );
  }
  return shows;

}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

$showsList.on("click", function(e) {
  if (e.target.type === "submit") {
    searchForEpisodesAndDisplay(e.target.parentElement.parentElement.parentElement.getAttribute("data-show-id"));
  }
})

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  const episodes = [];
  for (let pushEp of res.data) {
    episodes.push(
      {
        id: pushEp.id,
        name: pushEp.name,
        season: pushEp.season,
        number: pushEp.number
      }
    );
  }
  return episodes;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  $episodesArea.show();
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(
      `<li data-episode-id=${episode.id}>
        Season ${episode.season}, Episode ${episode.number}: ${episode.name}
      </li>`);

    $episodesList.append($episode);
  }
}


async function searchForEpisodesAndDisplay(id) {
  populateEpisodes(await getEpisodesOfShow(id));
}