
const searchInput = document.querySelector("#search");
const suggestionContainer = document.querySelector(".suggestions");
const suggestionWrap = document.querySelector('.suggestion-wrap');
const searchContainer = document.querySelector(".search-container");
const radioButtons = document.querySelectorAll('input[name="options"]');

const stop_words = new Set([
	"and", "the", "is", "in", "a", "an", "are" ,"to", "of", "on"
]);

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

		const direct = this.synonyms[searchValue] || [];
		const reverse = this.reverseSynonyms[searchValue] || [];
		let synonyms = [...new Set([...direct, ...reverse])];

		synonyms = synonyms.slice(0, 5);
		view.showSuggestions(synonyms);
	},

	getTopWordsSuggestions() {
		console.log("getTopWordsSuggestions");

		const searchValue = helpers.normalize(searchInput.value);
		if (!searchValue) {
			view.clear();
			return;
		}

		const wordCounts = {};

		// Find all items with this tag
		const matchingItems = this.data.filter(item =>
			item.tags.some(tag => helpers.normalize(tag) === searchValue)
		);

		// Extract words from item.text and count frequencies
		matchingItems.forEach(item => {
			const words = helpers.extractWords(item.text);

			words.forEach(word => {
				wordCounts[word] = (wordCounts[word] || 0) + 1;
			});
		});

		// Convert wordCounts into array of [word, count] pairs
		const wordEntries = Object.entries(wordCounts);

		// Sort by frequency 
		wordEntries.sort((a, b) => {
			return b[1] - a[1];
		});

		// Extract the words, discarding counts
		const sortedWords = wordEntries.map(entry => entry[0]);

		// Limit to top 10 
		const topWords = sortedWords.slice(0, 10);

		view.showSuggestions(topWords);
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
			case 'TopWords':
				model.getTopWordsSuggestions();
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

	extractWords(text) {
		return this.normalize(text)
			.replace(/[^\w\s]/g, "")
			.split(/\s+/)
			.filter(word => word.length > 1 && !stop_words.has(word));
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


