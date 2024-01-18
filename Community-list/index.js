const URL = "https://user-list.alphacamp.io/api/v1/users";
const dataPanel = document.querySelector("#data-panel");
const userInfo = [];

function renderUserList() {
	function renderUserCard(info) {
		let html = "";
		info.forEach((item) => {
			//forEach 觀念：迭代器會逐 value（在此處是指物件0,1,2...）遍歷，所以給定參數 item 是 value[0~i]的概念。
			// class="card" 的樣式可以有個印象， ="col"、="card"... 樣式各有不同
			// data-id 要綁在所有想要他反應的地方，以這邊來說，img、card-body都要
			html += `
			<div class="card m-2" data-bs-toggle="modal" data-bs-target="#infoModal"> 
					<img src="${item.avatar}" alt="userAvatar" data-id="${item.id}">
					<div class="card-body" data-id="${item.id}">${item.name} ${item.surname}</div>
			</div>
		`;
		});

		dataPanel.innerHTML = html;
	}
	axios.get(URL).then((response) => {
		userInfo.push(...response.data.results); //將資料存進（push）陣列，用...展開陣列
		renderUserCard(userInfo);
	});
}

renderUserList();
////

function renderModalInfo(event) {
	const modalInfoTitle = document.querySelector("#modalInfoTitle");
	const modalInfoAvatar = document.querySelector("#modalInfoAvatar");
	const modalInfoIntro = document.querySelector("#modalInfoIntro");

	const id = Number(event.target.dataset.id);

	axios.get(`${URL}/${id}`).then((response) => {
		const user = response.data;
		modalInfoTitle.innerText = `${user.name} ${user.surname}`;
		modalInfoAvatar.src = `${user.avatar}`;
		modalInfoIntro.innerHTML = `
			<p>Email: ${user.email}</p>
			<p>Gender: ${user.gender}<p>
			<p>Age: ${user.age}</p>
			<p>Region: ${user.region}</p>
			<p>Birthday: ${user.birthday}</p>
		`;
		// console.log(user)}))
	});
}

dataPanel.addEventListener("click", renderModalInfo); 