const block = [ '63a3f39d1bdcce00214d3007', '63b290ab1bdcce00214d3037' ]
let all = [
    '63a3f39d1bdcce00214d3007', '63b290ab1bdcce00214d3037',
    '63c3c3394c91b000212df672', '63da33112c6a7a67441184e4',
    '63da34dd35b803002273369e', '63da967935b80300227336ad',
    '63da968335b80300227336b1', '63db216a6e0854002c79b578',
    '63df7d9f81c96631a02fa4f0', '63df7e7f81c96631a02fa4fa',
    '63df87844ebb401c38a15835', '63dfe70477a851002b7c97e7',
    '63dfe8de77a851002b7c97fa', '63dfeb3d77a851002b7c9836',
    '63e1c13077a851002b7c9b29', '63e1c16d4f009d002b81be80',
    '63e1c1fe4f009d002b81be84', '63e1c2167a3fe94f0cbc0528',
    '63e1c280e351d4673c449165', '63e1c42c22ac6f002b37fb1e',
    '63e1c96f22ac6f002b37fb67', '63e2056499e821002b22e06b',
    '63e466dc2bf933002c2d7f70', '63e4a2592bf933002c2d806c',
    '63e4a3072bf933002c2d806f'
  ]

let rs = []
for (const e of block) {
    console.log(11, e);
    all = all.filter(id => 
        id != e
    )
    console.log(222, all);
}
console.log(888, rs);
// const rs = all.filter(id => 
//     id != '63a3f39d1bdcce00214d3007'
// )
// console.log(55, rs);