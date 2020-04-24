console.log('i am here')

function square(tall, name){
    return name + '  regnestykket ditt gir: ' + tall * tall
}

console.log(square(16))

const squareA = tall => tall * tall

console.log(squareA(88))

const fler = (name1, name2) => 'hei ' + name1 + ' og ' + name2

console.log(fler('johan', 'marie'))

setTimeout(()=> document.querySelector('body').style.backgroundColor='orange', 2000)

const tallene = [12, 3, 4, 56, 67, 3, 44, 34, 32]

let body = document.querySelector('body')

tallene.map(tall => {
    let newLi = document.createElement('li')
    newLi.innerHTML = tall
    body.appendChild(newLi)
})

const ordene = ['løver', 'katter', 'elefanter', 'oligarker', 'prinser']

let str = ''
ordene.map( ord => {
    str +=  `<section> Det satt to ${ord} på et bord </section>`
})

body.innerHTML = str