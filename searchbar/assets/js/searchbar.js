
let searchInput;
let suggestionContainer;
let suggestionWrap;
let searchContainer;
let radioButtons;

const stop_words = new Set([
	// articles
	"the", "this", "that", "these", "those",
	// conjunctions
	"and", "but", "if", "while", "although", "or",
	// prepositions
	"from", "over", "before", "between", "under", "around", "through",
	"with", "about", "into", "after", "for", "of", "on", "in", "to",
	// auxiliary & common verbs
	"is", "are", "was", "were", "be", "been", "being",
	"have", "has", "had", "do", "does", "did",
	"can", "could", "should", "would", "may", "might",
	"will", "shall",
	// pronouns
	"he", "she", "it", "we", "they",
	"him", "her", "us", "them",
	"my", "your", "his", "its", "our", "their",
	// determiners & quantifiers
	"some", "any", "each", "every", "all", "few", "many", "much", "most",
	// adverbs & fillers
	"very", "just", "also", "only", "even", "not", "no", "yes",
	"so", "than", "too", "as"
]);

// Single-file MVC-style structure for demo purposes.

const model = {

	data: [],
	synonyms: [],
	reverseSynonyms: {},

	async loadData() {

		const response = await fetch("/assets/json/data.json");
		this.data = await response.json();
	},

	async loadSynonyms() {

		const response = await fetch("/assets/json/synonyms.json");
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

		const searchValue = helpers.normalize(searchInput.value);

		if (searchValue.length < 3) {
			view.clear();
			return;
		}

		const allTags = this.data.flatMap(item => item.tags);
		const tagCounts = {};

		allTags.forEach(tag => {
			if (helpers.normalize(tag).includes(searchValue)) {
				tagCounts[tag] = (tagCounts[tag] || 0) + 1;
			}
		});

		let filteredTags = Object.entries(tagCounts);
		const tagEntries = Object.entries(tagCounts)
		tagEntries.sort((a, b) => b[1] - a[1]);
		filteredTags = filteredTags.slice(0, 5);

		view.showSuggestions(filteredTags);
	},

	getSynonymsSuggestions() {
	
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

		const searchValue = helpers.normalize(searchInput.value);
		if (!searchValue) {
			view.clear();
			return;
		}

		const wordCounts = {};

		const matchingItems = this.data.filter(item =>
			item.tags.some(tag => helpers.normalize(tag) === searchValue)
		);

		matchingItems.forEach(item => {
			const words = helpers.extractWords(item.text);

			words.forEach(word => {
				if (!stop_words.has(word) && word.length > 2) {
					wordCounts[word] = (wordCounts[word] || 0) + 1;
				}
			});
		});

		const wordEntries = Object.entries(wordCounts);
		const sortedEntries = wordEntries.sort((a, b) => b[1] - a[1]);
		const topEntries = sortedEntries.slice(0, 5);

		view.showSuggestions(topEntries);
	}
};

const view = {

	showSuggestions(list) {

		this.clear();

		if (!list.length) {
			this.clear();
			return;
		} else {
			suggestionWrap.classList.add("show");
		}

		list.forEach(listItem => {
			let value;
			let label;

			if (Array.isArray(listItem)) {
				value = listItem[0];
				label = `${listItem[0]} (${listItem[1]})`;
			} else {
				value = listItem;
				label = listItem;
			}
			const li = document.createElement("li");
			li.textContent = label;
			li.addEventListener("click", () => {
				searchInput.value = value;
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

	searchInput = document.querySelector("#search");
	suggestionContainer = document.querySelector(".suggestions");
	suggestionWrap = document.querySelector(".suggestion-wrap");
	searchContainer = document.querySelector(".search-container");
	radioButtons = document.querySelectorAll('input[name="options"]');

	if (!searchInput) {
		console.error("Search DOM not found");
		return;
	}

	await model.loadData();
	await model.loadSynonyms();

	searchInput.addEventListener("keyup", controller.handleKeyup);

	radioButtons.forEach(radio => {
		radio.addEventListener("change", controller.handleKeyup);
	});
}

//window.onload = init;


