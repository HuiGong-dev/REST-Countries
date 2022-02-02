const themeSwitch = document.getElementById('head-bar__theme-toggle');
const toggleSwitch = document.getElementById('checkbox');
const currentTheme = localStorage.getItem('theme');
const search = document.getElementById('search');
const matchList = document.getElementById('match-list');
const filter = document.getElementById('filter');
const dropdown__items = document.getElementById('dropdown__items');

filter.addEventListener('click', ()=>{
    if (dropdown__items.style.display === "none"){
        dropdown__items.style.display = "block";
    } else {
        dropdown__items.style.display = "none";

    }
});

// handle theme toggle
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
  
    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
    else {        document.documentElement.setAttribute('data-theme', 'light');
          localStorage.setItem('theme', 'light');
    }    
}

toggleSwitch.addEventListener('change', switchTheme, false);
themeSwitch.addEventListener('click', ()=>{
    toggleSwitch.click();
});

//handle search input autocomplete
// search countries-code.json and filter it

const searchCountries = async searchText => {
    const res = await fetch('/data/countries-code.json');
    const countries = await res.json();
    //get matches to current text input
    let matches = countries.filter(country => {
        const regex = new RegExp(`^${searchText}`, 'gi');
        return country.name.match(regex) ||country.code.match(regex);
    });

    if (searchText.length === 0){
        matches = [];
        matchList.innerHTML = '';
    }

    outputHtml(matches);
}

// show results in HTML
const outputHtml = matches => {
    if(matches.length > 0) {
        const html = matches.map(match => `
        <button class="suggestion" type="submit" name="detailCountry" value="${match.code}">
        ${match.name} (${match.code})
        </button>
        
        `)
        .join('');
        matchList.innerHTML = html;

    }
}

if(search !== null ){
    search.addEventListener('input', () => {
        searchCountries(search.value);
    });
}

// go to main page if no history else go to hisotry 
function handleBackButtonClickEvent(){
    if (history.length < 3){
        location = location.origin;
    } else {
        history.back();
    }
    
}


