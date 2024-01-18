/* global axios alert */ // 註解給 linting 工具，內容（axios, alert...）為全局變數，無需警告
const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const moviesPerPage = 12
const paginator = document.querySelector('#paginator');

const movies = []
let filteredMovies = []
const dataPanel = document.querySelector('#data-panel')

//////////// renderMovieList //
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image, 再取一個 id
    rawHTML += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <!-- footer -->
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movieModal" data-id="${item.id}">
                More
                </button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}
/////////// Modal //
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
    modalDate.innerText = `Release date: ${data.release_date}`
    modalDescription.innerText = data.description
  })
}
/////////// SearchBar //
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
/////////// Add to Favorite //
function addToFavorite(id) {
  // console.log(id)
  const list = JSON.parse(localStorage.getItem('favoriteMovies') || [])
  const movie = movies.find((movie) => movie.id === id)
  // console.log(movie)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}
/////////// pagination //
// fn for render 主頁（第一頁）的資料
function getMoviesByPage(page) {  // get"movies"byPage ? movies : filteredMovies
  const data = filteredMovies.length ? filteredMovies : movies
  // 傳入 page -> 回傳該 page 第幾筆到第幾筆的資料：
  // page 1 = movies 0-11th
  // page 2 = movies 12-23th
  // ...
  const startIndex = (page - 1) * moviesPerPage
  return data.slice(startIndex, startIndex + moviesPerPage)
}
// fn for 編輯下方分頁器
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / moviesPerPage)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" data-page="${page}" href="#">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}
/////////// addEventListener //
// listen to dataPanel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // matches 是選擇器，不是元素裡面的任意字符
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})
// listen to search form
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLocaleLowerCase()

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  if (filteredMovies.length === 0) {
    return alert('沒有符合條件的電影')
  }
  renderMovieList(getMoviesByPage(1))
  renderPaginator(filteredMovies.length)
})
// listen to paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})


// send request to index api
/* 原本想把 axios 包進 renderMovieList 裡面，結果因為 axios 也會 call renderMovieList，結果變成無窮迴圈...
結論是還是要獨立出來，讓 API 取得資料的時候跑一次，渲染一次就好。
ref: https://codepen.io/Jimmy-Hsu-the-solid/pen/WNPOKmQ?editors=0010
CodePen 可以包進去是因為用了另外一個function (注意L5、L6 的 function 不同)，所以不會 call 到同一個函式 */
axios.get(INDEX_URL).then((response) => {
  // Arr 80
  // 1. 迭代器
  // for (const movie of response.data.results)
  // movies.push(movie)
  // 2. 展開運算子 `...`
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
})
  .catch(err => console.log(err))
