const movies = [
{
title:"The Dark Knight",
genre:"Action",
rating:"9.0",
image:"https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
description:"Batman faces Joker in Gotham."
},
{
title:"Avengers Endgame",
genre:"Action",
rating:"8.8",
image:"https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
description:"Marvel heroes unite."
},
{
title:"Interstellar",
genre:"Sci-Fi",
rating:"8.7",
image:"https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
description:"Journey through space and time."
},
{
title:"Inception",
genre:"Sci-Fi",
rating:"8.8",
image:"https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
description:"Dream inside a dream."
},
{
title:"Joker",
genre:"Drama",
rating:"8.5",
image:"https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
description:"Origin of Gotham's villain."
},
{
title:"Avatar",
genre:"Sci-Fi",
rating:"7.9",
image:"https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
description:"A marine explores Pandora."
},
{
title:"John Wick",
genre:"Action",
rating:"8.0",
image:"https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
description:"A retired assassin seeks revenge."
},
{
title:"Titanic",
genre:"Drama",
rating:"7.9",
image:"https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
description:"A tragic love story aboard Titanic."
},
{
title:"Shutter Island",
genre:"Thriller",
rating:"8.2",
image:"https://image.tmdb.org/t/p/w500/4GDy0PHYX3VRXUtwK5ysFbg3kEx.jpg",
description:"A mystery unfolds on an island."
},
{
title:"Gone Girl",
genre:"Thriller",
rating:"8.1",
image:"https://image.tmdb.org/t/p/w500/ts996lKsxvjkO2yiYG0ht4qAicO.jpg",
description:"A missing wife mystery."
},
{
title:"Forrest Gump",
genre:"Drama",
rating:"8.8",
image:"https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
description:"The extraordinary life of Forrest Gump."
},
{
title:"Fight Club",
genre:"Drama",
rating:"8.8",
image:"https://image.tmdb.org/t/p/w500/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg",
description:"An underground fight club changes lives."
},
{
title:"Top Gun Maverick",
genre:"Action",
rating:"8.3",
image:"https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
description:"A legendary pilot returns."
},
{
title:"Parasite",
genre:"Thriller",
rating:"8.5",
image:"https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
description:"A poor family infiltrates a wealthy home."
},
{
title:"Oppenheimer",
genre:"Drama",
rating:"8.5",
image:"https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg",
description:"The story of J. Robert Oppenheimer and the atomic bomb."
},

{
title:"Spider-Man: No Way Home",
genre:"Action",
rating:"8.2",
image:"https://upload.wikimedia.org/wikipedia/en/0/00/Spider-Man_No_Way_Home_poster.jpg",
description:"Spider-Man faces villains from other universes."
},
{
title:"A Quiet Place",
genre:"Thriller",
rating:"7.5",
image:"https://upload.wikimedia.org/wikipedia/en/a/a0/A_Quiet_Place_film_poster.png",
description:"A family survives in silence from deadly creatures."
},

{
title:"Toy Story 4",
genre:"Comedy",
rating:"7.7",
image:"https://upload.wikimedia.org/wikipedia/en/4/4c/Toy_Story_4_poster.jpg",
description:"Woody and friends embark on a new adventure."
},

{
title:"The Super Mario Bros Movie",
genre:"Comedy",
rating:"7.1",
image:"https://upload.wikimedia.org/wikipedia/en/4/44/The_Super_Mario_Bros._Movie_poster.jpg",
description:"Mario and Luigi save the Mushroom Kingdom."
},

{
title:"Dune",
genre:"Sci-Fi",
rating:"8.0",
image:"https://upload.wikimedia.org/wikipedia/en/8/8e/Dune_%282021_film%29.jpg",
description:"A young noble fights for the future of Arrakis."
},
{
title:"La La Land",
genre:"Drama",
rating:"8.0",
image:"https://upload.wikimedia.org/wikipedia/en/a/ab/La_La_Land_%28film%29.png",
description:"A musician and actress chase their dreams in Los Angeles."
},

{
title:"Extraction",
genre:"Action",
rating:"6.8",
image:"https://upload.wikimedia.org/wikipedia/en/8/89/Extraction_%282020_film%29.png",
description:"A mercenary undertakes a dangerous rescue mission."
},

{
title:"Black Panther",
genre:"Action",
rating:"7.3",
image:"https://upload.wikimedia.org/wikipedia/en/d/d6/Black_Panther_%28film%29_poster.jpg",
description:"The king of Wakanda defends his nation."
},

{
title:"Knives Out",
genre:"Thriller",
rating:"7.9",
image:"https://upload.wikimedia.org/wikipedia/en/1/1f/Knives_Out_poster.jpeg",
description:"A detective investigates a mysterious death."
}
];

const movieContainer =
document.getElementById("movieContainer");

function displayMovies(movieList){

movieContainer.innerHTML="";

movieList.forEach(movie=>{

movieContainer.innerHTML += `
<div class="card">

<img src="${movie.image}" alt="">

<div class="card-content">

<h3>${movie.title}</h3>

<p>${movie.description}</p>

<p><b>Genre:</b> ${movie.genre}</p>

<p class="rating">⭐ ${movie.rating}</p>

</div>

</div>
`;
});
}

displayMovies(movies);

function recommend(genre){

const recommendations =
movies.filter(movie => movie.genre === genre);

displayMovies(recommendations);
}

document
.getElementById("search")
.addEventListener("keyup", function(){

const searchValue =
this.value.toLowerCase();

const filtered =
movies.filter(movie =>
movie.title.toLowerCase()
.includes(searchValue)
);

displayMovies(filtered);

});