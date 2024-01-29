const displayMode = {
  listMode: 'listMode',
  cardMode: 'cardMode'
}

const model = {
  //FIX const BASE_URL = 'https://movie-list.alphacamp.io' 有沒有辦法直接寫進 model 物件中？ => getter
  BASE_URL: 'https://movie-list.alphacamp.io',
  // INDEX_URL: `${this.BASE_URL}/api/v1/movies/`,
  // POSTER_URL: `${this.BASE_URL}/posters/`,
  get INDEX_URL() {
    return `${this.BASE_URL}/api/v1/movies/`
  },
  get POSTER_URL() {
    return `${this.BASE_URL}/posters/`
  },
  //google: ES6 class, constructor
  movies: [], //電影清單
  filteredMovies: [], //搜尋關鍵字清單
  MOVIES_PER_PAGE: 12,
  pageCount: '1',
  dataPanel: document.querySelector('#data-panel'),
  movieList: document.querySelector('#movie-list'),
  searchForm: document.querySelector('#search-form'),
  searchInput: document.querySelector('#search-input'),
  listMode: document.querySelector('#list-mode'),
  cardMode: document.querySelector('#card-mode'),
  paginator: document.querySelector('#paginator'),
  modalTitle: document.querySelector('#movie-modal-title'),
  modalImage: document.querySelector('#movie-modal-image'),
  modalDate: document.querySelector('#movie-modal-date'),
  modalDescription: document.querySelector('#movie-modal-description'),
  getMoviesByPage(page) {
    const data = this.filteredMovies.length ? this.filteredMovies : this.movies
    const startIndex = (page - 1) * model.MOVIES_PER_PAGE
    return data.slice(startIndex, startIndex + model.MOVIES_PER_PAGE)
  },
}

const view = {
  displayMovieCard(data) {
    let rawHTML = ''
    data.forEach((item) => {
      // title, image, id
      rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${model.POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button 
                class="btn btn-primary 
                btn-show-movie" 
                data-bs-toggle="modal" 
                data-bs-target="#movie-modal" 
                data-id="${item.id}"
              >
                More
              </button>
              <button 
                class="btn btn-info btn-add-favorite" 
                data-id="${item.id}"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>`
    })
    model.dataPanel.innerHTML = rawHTML
  },
  displayMovieList(data) {
    let rawHTML = `
    <div id="movie-list">
      <ul class="list-group col-sm-12">`
    data.forEach((item) => {
      rawHTML += `
      <li class="list-group-item">
        <h5 class="card-title">${item.title}</h5>
        <div>
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">
            More
          </button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">
            +
          </button>
        </div>
      </li>`
    })
    model.dataPanel.innerHTML = rawHTML + `</ul>`
  },
  renderPaginator(amount) {
    const numberOfPages = Math.ceil(amount / model.MOVIES_PER_PAGE)
    let rawHTML = ''
    for (let page = 1; page <= numberOfPages; page++) {
      rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    }
    model.paginator.innerHTML = rawHTML
  },
  showMovieModal(id) {
    utility.getAxiosPromise(id) // Why should put "return"? 待了解 Promise chain 的傳遞方式 Ans: 不需要再回傳值（因為此處只為了渲染頁面）的話就不用 return 了
      .then((data) => {
        // console.log(data)
        // insert data into modal ui
        model.modalTitle.innerText = data.title
        model.modalDate.innerText = 'Release date: ' + data.release_date
        model.modalDescription.innerText = data.description
        model.modalImage.innerHTML = `<img src="${model.POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
      })
  },
  addToFavorite(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = model.movies.find((movie) => movie.id === id)

    if (list.some((movie) => movie.id === id)) {
      return alert('此電影已經在收藏清單中！')
    }

    list.push(movie)
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  },
}

const controller = {
  currentDisplayMode: '',
  dispatchRenderMode() {
    switch (this.currentDisplayMode) {
      case displayMode.cardMode:
        view.displayMovieCard(model.getMoviesByPage(model.pageCount))
        break
      case displayMode.listMode:
        view.displayMovieList(model.getMoviesByPage(model.pageCount))
        break
    }
  },
  init() {
    this.generateMovieCard()
    this.setEventListener()
  },
  generateMovieCard() {
    return utility.getAxiosPromise()
      .then((response) => {
        model.movies.push(...response)
        view.displayMovieCard(model.getMoviesByPage(1))
        view.renderPaginator(model.movies.length)
        this.currentDisplayMode = displayMode.cardMode
      })
  },
  setEventListener() {
    // listen to data panel
    model.dataPanel.addEventListener('click', function onPanelClicked(event) {
      if (event.target.matches('.btn-show-movie')) {
        view.showMovieModal(event.target.dataset.id)
      } else if (event.target.matches('.btn-add-favorite')) {
        view.addToFavorite(Number(event.target.dataset.id))
      }
    })
    //listen to search form
    model.searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
      event.preventDefault()
      const keyword = model.searchInput.value.trim().toLowerCase()

      model.filteredMovies = model.movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
      if (model.filteredMovies.length === 0) {
        return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
      }
      // controller.generateMovieCard(model.getMoviesByPage(1))
      controller.dispatchRenderMode()
      view.renderPaginator(model.filteredMovies.length)
    })
    //Listen to switch mode
    model.cardMode.addEventListener('click', function onCardModeClicked() {
      controller.currentDisplayMode = displayMode.cardMode
      console.log(`currentDisplayMode: ${controller.currentDisplayMode}`)
      controller.dispatchRenderMode()
    })
    model.listMode.addEventListener('click', function onListModeClicked() {
      controller.currentDisplayMode = displayMode.listMode
      console.log(`currentDisplayMode: ${controller.currentDisplayMode}`)
      controller.dispatchRenderMode()
    })
    // listen to paginator
    model.paginator.addEventListener('click', function onPaginatorClicked(event) {
      if (event.target.tagName !== 'A') return

      model.pageCount = Number(event.target.dataset.page)
      controller.dispatchRenderMode()
    })
  },
}

const utility = {
  getAxiosPromise(id) {
    let requestURL = id ? `${model.INDEX_URL}/${id}` : model.INDEX_URL
    // send request to show api
    return axios.get(requestURL)
      .then((response) => {
        // 為什麼不能在這邊先push，甚至連只是要 console.log，showModal 也會出問題？ 
        // Ans: 在這邊如果要 console.log(...response.data.results) 的話，在跑 view.showMovieModal() 的時候會 console.log 不出東西，
        // 造成錯誤就會跳到 .catch，不會跑 .then return response.data.results 這行了。
        // 展開運算子的觀念：
        // console.log(...response) response 是一個物件，所以不能展開（陣列or字串才可）
        // console.log(...response.data) 亦然
        // console.log(response.data.results) 是一個陣列，內容為「1」個包含 80 個物件的陣列，可以展開 ...response.data.results
        // console.log(...response.data.results) 是一個陣列，內容為 「80」 陣列，每個陣列包含一個物件（一筆一筆的電影資料）
        return response.data.results
      })
      .catch((err) => console.log(err))
  }
}

controller.init()