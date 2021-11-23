const urlParams = new URLSearchParams(window.location.search);
const cid = urlParams.get('cid');
const imageUrl = "https://ipfs.infura.io/ipfs/" + cid;

const colors = ['#6a8494', '#75a375', '#8c5851', '#8971b1'];

document.getElementById('main-image').src = imageUrl;

const d = Date.now();
const color = colors[d % 4];
document.getElementById('main-figure').style.backgroundColor = color;
