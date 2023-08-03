const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    headers: {
        'content-Type': 'application/json;charset=utf-8',
    },
    params:{
        'api_key': API_KEY,
        'language': 'es',
    },
});

async function getTrendingMoviesPreview(){
    const {data} = await api('trending/movie/day');
    const movies = data.results;
    createMovies(movies, trendingMoviesPreviewList);
}

async function getPreviewCategories(){
    const {data} = await api('genre/movie/list');
    const categories = data.genres;
    createCategorias(categories, categoriesPreviewList);
}

async function createCategorias(categories, container){
  container.innerHTML = '';
  categories.forEach(category => {
    const categoriesContainer = document.createElement('div');
    categoriesContainer.classList.add('category-container');
    const categoryTitle = document.createElement('h3');
    categoryTitle.classList.add('category-title');
    categoryTitle.setAttribute('id', 'id' +  category.id);
    categoryTitle.addEventListener('click', () =>{
        location.hash = `#category=${category.id}-${category.name}`;
    });
    const categoryText = document.createTextNode(category.name);
    categoryTitle.appendChild(categoryText);
    categoriesContainer.appendChild(categoryTitle);
    container.appendChild(categoriesContainer);
});
}

async function getMoviesByCategory(id){
    const {data} = await api('discover/movie', {
        params:{
            with_genres: id,
        },
    });
    const movies = data.results;
    console.log(movies);
    createMovies(movies, genericSection)
   
}

async function getMoviesBySearch(query){
    const {data} = await api('search/movie', {
        params:{
            query,
        },
    });
    const movies = data.results;
    console.log(movies);
    createMovies(movies, genericSection)
   
}

function createMovies(movies, container){
    container.innerHTML = '';
    movies.forEach(movie => {
        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container');
        movieContainer.addEventListener('click', () => {
            console.log(movie.id)
            location.hash =  '#movie=' + movie.id;
        })
        const movieImg = document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title);
        movieImg.setAttribute('src', 'https://image.tmdb.org/t/p/w300' + movie.poster_path);
        movieContainer.appendChild(movieImg);
        container.appendChild(movieContainer);
    });
}

createCategorias


async function getTrendingMovies(){
    const {data} = await api('trending/movie/day');
    const movies = data.results;
    createMovies(movies, genericSection);
}

async function getMovieById(id){
    const {data: movie} = await api('movie/' + id);
    console.log(movie)
    const movieImg = 'https://image.tmdb.org/t/p/w300' + movie.poster_path;
    headerSection.style.background = `
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.35) 19.27%,
      rgba(0, 0, 0, 0) 29.17%
    ),
    url(${movieImg})
  `;
    console.log(movieImg)

    movieDetailTitle.textContent = movie.title;
    movieDetailDescription.textContent = movie.overview;
    movieDetailScore.textContent = movie.vote_average;

    createCategorias(movie.genres, movieDetailCategoriesList);
    getRelatedMoviesId(id);
}


async function getRelatedMoviesId(id){
   const {data} = await api(`movie/${id }/recommendations`);
   const relatedMovies = data.results;

   createMovies(relatedMovies, relatedMoviesContainer);
}
