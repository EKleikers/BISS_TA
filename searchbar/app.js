
const searchInput = document.querySelector("#search");
const suggestionContainer = document.querySelector(".suggestions");
const suggestionWrap = document.querySelector('.suggestion-wrap');
const searchContainer = document.querySelector(".search-container");

// Single-file MVC-style structure for demo purposes.

const model = {

	data: [],

	async loadData() {

		const response = await fetch("/././data.json");
		this.data = await response.json();
	},

	getAutocompleteSuggestions() {

		const searchValue = helpers.normalize(searchInput.value);
		// start autocomplate after 3rd character in searchbar
		if (searchValue.length < 3) {
			view.clear(); 
			return;
		}
		// flatten all tags
		const allTags = this.data.flatMap(item => item.tags);

		// make unique
		const uniqueTags = [...new Set(allTags)];

		// filter per tag
		let filteredTags = uniqueTags.filter(tag =>
			helpers.normalize(tag).includes(searchValue)
		);

		// sort alphabetically
		filteredTags.sort();

		// limit number list items
		filteredTags = filteredTags.slice(0, 5);

		view.showTagSuggestions(filteredTags);
	}
};

const view = {
	showTagSuggestions(list) {
		console.log("view.showTagSuggestions()");
		this.clear();

		if (!list.length) {
			this.clear();
			return;
		} else {
			suggestionWrap.classList.add("show");
		}

		list.forEach(listItem => {
			const li = document.createElement("li");
			li.textContent = listItem;
			li.addEventListener("click", () => {
				searchInput.value = listItem;
				this.clear();
			});
			suggestionContainer.appendChild(li);
		})
	},

	// empty and hide listitems
	clear() {
		suggestionContainer.innerHTML = "";
		searchContainer.classList.remove("show");
	},
};

const controller = {
	handleKeyup() {
		model.getAutocompleteSuggestions();
	},
};

const helpers = {
	// case & diacritics insensitive
	normalize(str) {
		return str
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "");
	}
};

async function init() {
	console.log("init()");
	await model.loadData();
	searchInput.addEventListener("keyup", controller.handleKeyup);
}

window.onload = init;
