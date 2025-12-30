
const searchInput = document.querySelector("#search");
const suggestionContainer = document.querySelector(".suggestions");
const suggestionWrap = document.querySelector('.suggestion-wrap');
const searchContainer = document.querySelector(".search-container");
const radioButtons = document.querySelectorAll('input[name="options"]');



// Single-file MVC-style structure for demo purposes.

const model = {

	data: [],
	synonyms: [],
	reverseSynonyms: {},

	async loadData() {

		console.log("model.LoadData()");
		const response = await fetch("/././data.json");
		this.data = await response.json();
	},

	async loadSynonyms() {

		console.log("model.LoadSynonyms()");
		const response = await fetch("/././synonyms.json");
		this.synonyms = await response.json();

		this.reverseSynonyms = {};
		for (const key in this.synonyms) {
			this.synonyms[key].forEach(syn => {
				if (!this.reverseSynonyms[syn]) this.reverseSynonyms[syn] = [];
				this.reverseSynonyms[syn].push(key);
			});
		}
	},

	getAutocompleteSuggestions() {
		console.log("getAutocompletesSuggestions");

		const searchValue = helpers.normalize(searchInput.value);

		if (searchValue.length < 3) {
			view.clear();
			return;
		}

		const allTags = this.data.flatMap(item => item.tags);
		const uniqueTags = [...new Set(allTags)];

		let filteredTags = uniqueTags.filter(tag =>
			helpers.normalize(tag).includes(searchValue)
		);

		filteredTags.sort();
		filteredTags = filteredTags.slice(0, 5);

		view.showSuggestions(filteredTags);
	},

	getSynonymsSuggestions() {
		console.log("getSynonymsSuggestions");
		const searchValue = helpers.normalize(searchInput.value);
		if (!searchValue) {
			view.clear();
			return;
		}

		// Check direct synonyms first
		const direct = this.synonyms[searchValue] || [];

		// Check reverse lookup
		const reverse = this.reverseSynonyms[searchValue] || [];

		// Merge and deduplicate
		let synonyms = [...new Set([...direct, ...reverse])];

	
		synonyms = synonyms.slice(0, 5);
		view.showSuggestions(synonyms);
	},

	getExtendedSuggestions() {
		console.log("getExtendedSuggestions");
		//view.showExtendedSuggestions(filteredExtentions);
	}
};

const view = {

	showSuggestions(list) {
		console.log("view.showSuggestions()");
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

	clear() {
		suggestionContainer.innerHTML = "";
		searchContainer.classList.remove("show");
	}
};

const controller = {
	handleKeyup() {

		const selectedOption = helpers.getSelectedOption();
		switch (selectedOption) {
			case 'Autocomplete':
				model.getAutocompleteSuggestions();
				break;
			case 'Synonyms':
				model.getSynonymsSuggestions();
				break;
			case 'Extend':
				model.getExtendedSuggestions();
				break;
			default:
				model.getAutocompleteSuggestions();
		}
	},
};

const helpers = {

	normalize(str) {
		return str
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "");
	},

	getSelectedOption() {
		const checked = document.querySelector('input[name="options"]:checked');
		return checked ? checked.value : 'Autocomplete';
	}

	//TODO: add keyboard navigation
};

async function init() {
	console.log("init()");
	await model.loadData();
	await model.loadSynonyms();

	searchInput.addEventListener("keyup", controller.handleKeyup);

	radioButtons.forEach(radio => {
		radio.addEventListener("change", controller.handleKeyup);
	});
}

window.onload = init;


