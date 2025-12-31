const popup = document.getElementById("popup");
const popupContent = document.getElementById("popupContent");
const helpBtn = document.getElementById("helpBtn");

let searchInitialized = false;

async function openSearchPopup() {
	try {
		if (!popupContent.innerHTML.trim()) {
			const response = await fetch("searchbar.html");
			popupContent.innerHTML = await response.text();

			const closeBtn = popupContent.querySelector('#popupClose');
			if (closeBtn) {
				closeBtn.addEventListener('click', closeSearchPopup);
			}

			const searchBtn = popupContent.querySelector('#searchSubmit');
			if (searchBtn) {
				searchBtn.addEventListener('click', () => {
					const searchValue = popupContent.querySelector('#search')?.value;
					if (searchValue) {
						const keywordSpan = document.querySelector('#selectedKeyword');
						if (keywordSpan) {
							keywordSpan.childNodes[0].nodeValue = searchValue + ' ';
						}
					}
					closeSearchPopup();
				});
			}
		}

		popup.classList.remove("hidden");

		if (!searchInitialized) {
			init(); // from app.js
			searchInitialized = true;
		}

	} catch (err) {
		console.error("Failed to load search popup:", err);
	}
}

function closeSearchPopup() {
	popup.classList.add("hidden");
}

helpBtn.addEventListener("click", openSearchPopup);

