
const searchInput = document.querySelector("#search");
const suggestionContainer = document.querySelector(".suggestions");
const searchContainer = document.querySelector(".search-container");

// Single-file MVC-style structure for demo purposes.

const model = {

	data: [],

	async loadData() {

		console.log("model.LoadData()");
		const response = await fetch("data.json");
		this.data = await response.json();
	},

	getAutocompleteSuggestions() {
		console.log("model.getAutocompleteSuggestions()");
		const suggestionsList = this.data;
		let searchValue = searchInput.value;
		let recommendedList = [];
		if (searchValue.length) {
			recommendedList = suggestionsList.filter(listItems => listItems.tag.includes(searchValue));
		}
		view.showRecommendedList(recommendedList);
	},
};

const view = {

	showRecommendedList(list) {
		console.log("view.showRecommendedList()");
		searchContainer.classList.add("show");

		list.forEach(listItem => {
			const li = document.createElement("li");
			li.textContent = listItem.tag;
			suggestionContainer.appendChild(li);
		})
	},
};

const controller = {
	handleKeyup() {
		console.log("controller.handelKeyop()");
		model.getAutocompleteSuggestions();
	},
};

async function init() {
	console.log("init()");
	await model.loadData();
	searchInput.addEventListener("keyup", controller.handleKeyup);
}

window.onload = init;
