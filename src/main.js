
const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    headers: {
        'content-Type': 'application/json;charset=utf-8',
    },
    params: {
        'api_key': API_KEY,
        'language': 'es',
    },
});

function likedMoviesList(){
    const item = JSON.parse(localStorage.getItem('liked-movies'));
    let movies;
    if(item){
        movies = item;
    }else{
        movies = {};
    }
    return movies
}

function likeMovie(movie) {
  const likedMovies = likedMoviesList();

  console.log(likedMovies);
  if(likedMovies[movie.id]){
    likedMovies[movie.id] = undefined;
  }else{
    likedMovies[movie.id] = movie;
  }
  
  localStorage.setItem('liked-movies', JSON.stringify(likedMovies));
}

const lazyLoader = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        //    console.log(entry.target.setAttribute);
        if (entry.isIntersecting) {
            const url = entry.target.getAttribute('data-img');
            entry.target.setAttribute('src', url);
        }
    })
})

async function getTrendingMoviesPreview() {
    const { data } = await api('trending/movie/day');
    const movies = data.results;
    createMovies(movies, trendingMoviesPreviewList, true);
}

async function getPreviewCategories() {
    const { data } = await api('genre/movie/list');
    const categories = data.genres;
    createCategorias(categories, categoriesPreviewList);
}

async function createCategorias(categories, container) {
    container.innerHTML = '';
    categories.forEach(category => {
        const categoriesContainer = document.createElement('div');
        categoriesContainer.classList.add('category-container');
        const categoryTitle = document.createElement('h3');
        categoryTitle.classList.add('category-title');
        categoryTitle.setAttribute('id', 'id' + category.id);
        categoryTitle.addEventListener('click', () => {
            location.hash = `#category=${category.id}-${category.name}`;
        });
        const categoryText = document.createTextNode(category.name);
        categoryTitle.appendChild(categoryText);
        categoriesContainer.appendChild(categoryTitle);
        container.appendChild(categoriesContainer);
    });
}

async function getMoviesByCategory(id) {
    const { data } = await api('discover/movie', {
        params: {
            with_genres: id,
        },
    });
    const movies = data.results;
    maxPage = data.total_pages
    console.log(maxPage);
    createMovies(movies, genericSection, { lazyLoad: true,})

}

function getPaginantedCategories(id) {
    return async function (){
     
     const pageIsNotMax = page < maxPage;
     const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
     const scroll = (scrollTop + clientHeight) >= (scrollHeight - 15);
     if (scroll && pageIsNotMax) {
         page++;
         const { data } = await api('discover/movie', {
            params: {
                with_genres: id,
                page
            },
        });
        const movies = data.results;
         createMovies(movies, genericSection, { lazyLoad: true, clean: false });
     }
    }
 }

async function getMoviesBySearch(query) {
    const { data } = await api('search/movie', {
        params: {
            query,
        },
    });
    const movies = data.results;
    maxPage = data.total_pages;
    console.log(maxPage)
    createMovies(movies, genericSection)

}

function createMovies(movies, container, { lazyLoad = false, clean = true } = {}) {

    if (clean) {
        container.innerHTML = '';
    }
    movies.forEach(movie => {
        const movieContainer = document.createElement('div');
        movieContainer.classList.add('movie-container');
        
        const movieImg = document.createElement('img');
        movieImg.classList.add('movie-img');
        movieImg.setAttribute('alt', movie.title);
        movieImg.setAttribute(lazyLoad ? 'data-img' : 'src', 'https://image.tmdb.org/t/p/w300' + movie.poster_path);
        movieImg.addEventListener('error', () => {
            movieImg.setAttribute(
                'src',
                'https://static.platzi.com/static/images/error/img404.png')
        });
        movieImg.addEventListener('click', () => {
            console.log(movie.id)
            location.hash = '#movie=' + movie.id;
        })

        const movieBtn = document.createElement('button');
        movieBtn.classList.add('movie-btn');
        likedMoviesList()[movie.id] && movieBtn.classList.add('movie-btn--liked')
        movieBtn.addEventListener('click', () => {
            movieBtn.classList.toggle('movie-btn--liked');
            likeMovie(movie);
            getLikedMovies()
        } );

        if (lazyLoad) {
            lazyLoader.observe(movieImg);
        }

        movieContainer.appendChild(movieImg);
        movieContainer.appendChild(movieBtn);
        container.appendChild(movieContainer);
    });
}


async function getTrendingMovies() {
    const { data } = await api('trending/movie/day');
    const movies = data.results;
    maxPage = data.total_pages;
    createMovies(movies, genericSection, { lazyLoad: true, clean: true });

    // const btnLoad = document.createElement('button');
    // btnLoad.innerText = 'Cargar mas';
    // btnLoad.addEventListener('click', getPaginantedTrendingMovies)
    // genericSection.appendChild(btnLoad);
}


async function getPaginantedTrendingMovies() {

    const pageIsNotMax = page < maxPage;
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    const scroll = (scrollTop + clientHeight) >= (scrollHeight - 15);
    if (scroll && pageIsNotMax) {
        page++;
        const { data } = await api('trending/movie/day', {
            params: {
                page
            }
        });
        const movies = data.results;
        createMovies(movies, genericSection, { lazyLoad: true, clean: false });
    }

    // const btnLoad = document.createElement('button');
    // btnLoad.innerText = 'Cargar mas';
    // btnLoad.addEventListener('click', getPaginantedTrendingMovies)
    // genericSection.appendChild(btnLoad);
}

function getPaginantedSearchMovies(query) {
   return async function (){
    
    const pageIsNotMax = page < maxPage;
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    const scroll = (scrollTop + clientHeight) >= (scrollHeight - 15);
    if (scroll && pageIsNotMax) {
        page++;
        const { data } = await api('search/movie', {
            params: {
                query,
                page
            },
        });
        const movies = data.results;
        createMovies(movies, genericSection, { lazyLoad: true, clean: false });
    }
   }
}

async function getMovieById(id) {
    const { data: movie } = await api('movie/' + id);
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



async function getRelatedMoviesId(id) {
    const { data } = await api(`movie/${id}/recommendations`);
    const relatedMovies = data.results;
    createMovies(relatedMovies, relatedMoviesContainer);
}

function getLikedMovies(movie){
   const likedMovies = likedMoviesList();
   console.log(likedMovies)
   const array = Object.values(likedMovies);

   createMovies(array, likeMoviesList, { lazyLoad: true, clean: true });
}
