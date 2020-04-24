import Shakespeare from './data/shakespeare.js' 
let quotes = document.querySelector('#quotes')
let inp =  document.querySelector('#soek')


const showQuotes = (quote, div) => {
    let article = document.createElement('article')
    let p =  document.createElement('p')
    p.innerHTML = quote
    article.appendChild(p)
    div.appendChild(article)
}


const filterQuotes = () =>{
    let filtered = Shakespeare.phrases.filter(
        phrase => phrase.toLowerCase().includes(inp.value)
    )    
    quotes.innerHTML =  ''
    filtered.map( quote => showQuotes(quote, quotes))
      
}
inp.addEventListener('input', filterQuotes)


Shakespeare.phrases.map(quote => showQuotes(quote, quotes))

